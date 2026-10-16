import * as SunCalc from 'suncalc'
import climate from '@/data/generated/climate.json'
import { ZONES } from '@/data/zones'
import { PLACES } from '@/data/places'
import type { Day, Visit, WeatherZoneId } from '@/data/types'

export type ZoneForecast = {
  /** 'YYYY-MM-DD' → 該日 0–23 時 */
  hourly: Record<string, { temp: number[]; rain: number[]; code: number[] }>
  daily: Record<string, { max: number; min: number; rain: number; code: number }>
}
export type Forecast = { fetchedAt: string; zones: Partial<Record<WeatherZoneId, ZoneForecast>> }

export type WeatherSegment = {
  zone: WeatherZoneId
  name: string
  elevation: number
  /** 'HH:mm' 預計在那裡的時間 */
  time: string
  period: string
  temp: number
  code?: number
}

export type DayWeather = {
  source: 'forecast' | 'climate'
  segments: WeatherSegment[]
  high: number
  low: number
  /** 降雨機率（預報）或歷年下雨天數比例（同期） */
  rain: number
  code?: number
  sunrise: string
  sunset: string
  advice: string[]
}

type Climate = { years: number[]; zones: Record<WeatherZoneId, { hourly: number[]; max: number; min: number; rainChance: number }> }
const CLIMATE = climate as Climate

const hourOf = (t: string) => Number(t.slice(0, 2))

function period(t: string) {
  const h = hourOf(t)
  if (h < 11) return '上午'
  if (h < 13) return '中午'
  if (h < 17) return '下午'
  return '晚上'
}

/** 依造訪順序整理出這天經過的天氣區域，同一區連續出現只留第一次 */
function zoneVisits(day: Day) {
  const visits: readonly Visit[] = day.visits
  const out: { zone: WeatherZoneId; time: string }[] = []
  // 第一站若是前一晚的飯店（出發點），就跳過，天氣從第一個景點算起
  const startIdx = day.n > 1 && PLACES[visits[0].place].kind === 'hotel' ? 1 : 0
  for (const [i, v] of visits.entries()) {
    if (i < startIdx) continue
    // 碼頭只是轉乘點、商店只是順路買東西，不列入天氣
    if (v.alt || PLACES[v.place].kind === 'port' || PLACES[v.place].kind === 'shop') continue
    // 晚上的行程結束後回住處只是去睡覺，不另列一段
    const last = i === visits.length - 1
    if (last && i > 0 && PLACES[v.place].kind === 'hotel' && hourOf(visits[i - 1].time) >= 17) continue
    // 回到早上出發的同一間飯店（中途睡午覺、傍晚回來），都不另列一段
    if (i > 0 && startIdx === 1 && v.place === visits[0].place) continue
    const zone = PLACES[v.place].zone
    if (out.at(-1)?.zone !== zone) out.push({ zone, time: v.time })
  }
  return out
}

/** 今晚住的地方（當天最後一站） */
const nightZone = (day: Day) => PLACES[day.visits.at(-1)!.place].zone

export function dayWeather(day: Day, forecast?: Forecast): DayWeather {
  const visits = zoneVisits(day)
  const night = nightZone(day)
  const zf = (z: WeatherZoneId) => forecast?.zones[z]
  const hasForecast = visits.every((v) => zf(v.zone)?.hourly[day.date]) && !!zf(night)?.daily[day.date]

  const segments: WeatherSegment[] = visits.map(({ zone, time }) => {
    const z = ZONES[zone]
    const h = hourOf(time)
    const f = hasForecast ? zf(zone)!.hourly[day.date] : undefined
    return {
      zone,
      name: z.name,
      elevation: z.elevation,
      time,
      period: period(time),
      temp: Math.round(f ? f.temp[h] : CLIMATE.zones[zone].hourly[h]),
      code: f?.code[h],
    }
  })

  const zonesToday = [...new Set([...visits.map((v) => v.zone), night])]
  let high: number, low: number, rain: number, code: number | undefined
  if (hasForecast) {
    const ds = zonesToday.map((z) => zf(z)!.daily[day.date]).filter(Boolean)
    high = Math.max(...ds.map((d) => d.max))
    low = Math.min(...ds.map((d) => d.min))
    rain = Math.max(...ds.map((d) => d.rain))
    code = Math.max(...ds.map((d) => d.code))
  } else {
    const cs = zonesToday.map((z) => CLIMATE.zones[z])
    high = Math.max(...cs.map((c) => c.max))
    low = Math.min(...cs.map((c) => c.min))
    rain = Math.round(cs.reduce((s, c) => s + c.rainChance, 0) / cs.length)
  }

  const center = ZONES[visits[0]?.zone ?? night].coord
  const sun = SunCalc.getTimes(new Date(`${day.date}T12:00:00+09:00`), center[1], center[0])

  return {
    source: hasForecast ? 'forecast' : 'climate',
    segments,
    high: Math.round(high),
    low: Math.round(low),
    rain,
    code,
    sunrise: jstTime(sun.sunrise),
    sunset: jstTime(sun.sunset),
    advice: clothingAdvice(segments, Math.round(low), rain, hasForecast),
  }
}

function clothingAdvice(segments: WeatherSegment[], low: number, rain: number, isForecast: boolean) {
  const out: string[] = []
  const coldest = segments.reduce((a, b) => (b.temp < a.temp ? b : a))
  const warmest = segments.reduce((a, b) => (b.temp > a.temp ? b : a))

  if (low <= 5) out.push('今天會很冷，請準備大外套')
  else if (low <= 10) out.push('早晚偏冷，厚外套加一件保暖內衣')
  else if (low <= 14) out.push('長袖加一件外套，早晚可以再加背心')
  else out.push('白天長袖就舒服，帶一件薄外套備用')

  if (warmest.temp - coldest.temp >= 5 && coldest.zone !== warmest.zone) {
    const hi = coldest.elevation >= 400 ? '海拔高，' : ''
    // 直接講兩地的溫度，比「暖約 N 度」好懂；依造訪先後換句話說
    out.push(
      segments.indexOf(coldest) < segments.indexOf(warmest)
        ? `${coldest.period}的${coldest.name}${hi}只有 ${coldest.temp} 度左右，${warmest.period}的${warmest.name}約 ${warmest.temp} 度，外套穿脫方便就好`
        : `${warmest.period}的${warmest.name}約 ${warmest.temp} 度，${coldest.period}到${coldest.name}${hi}只剩 ${coldest.temp} 度左右，出發前先把外套放在手邊`,
    )
  } else {
    out.push('早晚溫差大，用「洋蔥式」穿法，熱了脫、冷了加')
  }

  if (isForecast ? rain >= 50 : rain >= 40) out.push('有機會下雨，帶把折疊傘')
  return out
}

const jstFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false })
const jstTime = (d: Date | null) => (d && !isNaN(d.getTime()) ? jstFmt.format(d) : '--:--')

/** WMO 天氣代碼 → 中文 */
export function weatherLabel(code?: number) {
  if (code == null) return undefined
  if (code === 0) return '晴'
  if (code <= 2) return '晴時多雲'
  if (code === 3) return '陰'
  if (code <= 48) return '起霧'
  if (code <= 57) return '毛毛雨'
  if (code <= 67) return '雨'
  if (code <= 77) return '雪'
  if (code <= 82) return '陣雨'
  return '雷雨'
}

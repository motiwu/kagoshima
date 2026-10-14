import 'server-only'
import { cacheLife } from 'next/cache'
import { ZONES } from '@/data/zones'
import { TRIP } from '@/data/itinerary'
import type { WeatherZoneId } from '@/data/types'
import type { Forecast, ZoneForecast } from './weather'

/** Open-Meteo 最多預報 16 天 */
const HORIZON_DAYS = 15
const REVALIDATE_SECONDS = 3 * 60 * 60

type OpenMeteoResponse = {
  hourly: { time: string[]; temperature_2m: number[]; precipitation_probability: number[]; weather_code: number[] }
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: number[]
    weather_code: number[]
  }
}

const jstDate = (d: Date) => new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 10)
const addDays = (date: string, n: number) => jstDate(new Date(Date.parse(`${date}T00:00:00+09:00`) + n * 86400_000))

/** 旅程日期進入預報範圍後才抓；還太早就回傳 undefined，改用歷年同期 */
export async function getForecast(): Promise<Forecast | undefined> {
  'use cache'
  cacheLife({ stale: REVALIDATE_SECONDS, revalidate: REVALIDATE_SECONDS, expire: 24 * 60 * 60 })

  const now = new Date()
  const today = jstDate(now)
  const start = today > TRIP.start ? today : TRIP.start
  const lastAvailable = addDays(today, HORIZON_DAYS)
  const end = lastAvailable < TRIP.end ? lastAvailable : TRIP.end
  if (start > end) return undefined

  const zones = Object.values(ZONES)
  const params = new URLSearchParams({
    latitude: zones.map((z) => z.coord[1]).join(','),
    longitude: zones.map((z) => z.coord[0]).join(','),
    elevation: zones.map((z) => z.elevation).join(','),
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code',
    timezone: 'Asia/Tokyo',
    start_date: start,
    end_date: end,
  })

  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
    if (!res.ok) return undefined
    const data = (await res.json()) as OpenMeteoResponse[]
    const out: Forecast = { fetchedAt: now.toISOString(), zones: {} }
    data.forEach((d, i) => {
      const zf: ZoneForecast = { hourly: {}, daily: {} }
      d.daily.time.forEach((date, j) => {
        zf.daily[date] = {
          max: d.daily.temperature_2m_max[j],
          min: d.daily.temperature_2m_min[j],
          rain: d.daily.precipitation_probability_max[j] ?? 0,
          code: d.daily.weather_code[j],
        }
        const from = j * 24
        zf.hourly[date] = {
          temp: d.hourly.temperature_2m.slice(from, from + 24),
          rain: d.hourly.precipitation_probability.slice(from, from + 24),
          code: d.hourly.weather_code.slice(from, from + 24),
        }
      })
      out.zones[zones[i].id as WeatherZoneId] = zf
    })
    return out
  } catch {
    return undefined
  }
}

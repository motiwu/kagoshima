/**
 * 用 OSRM 計算每天各路段的行車路線與時間，結果存進 routes.json，網站執行時不再呼叫 API。
 * 執行：pnpm tsx scripts/routes.mts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { DAYS } from '../src/data/itinerary'
import { PLACES } from '../src/data/places'
import type { Visit } from '../src/data/types'

// OSRM 在日本的短程（市區紅綠燈、山路）偏樂觀，長程走高速公路則已偏保守，只對短程放慢
const slowdown = (km: number) => (km > 40 ? 1 : 1.2)
// 不是自己開車的路段
const SPECIAL: Record<string, { mode: 'car' | 'bus' | 'ferry' | 'walk'; minutes: number; straight?: boolean }> = {
  // 機場利木津巴士到熊本車站約 55 分
  'kmj-airport>kumamoto-station': { mode: 'bus', minutes: 55 },
  // 白川口走到飯店，實際 5 分鐘內
  'kumamoto-station>via-inn-kumamoto': { mode: 'walk', minutes: 5 },
  // 櫻島渡輪約 15 分，路線畫直線
  'kagoshima-port>sakurajima-port': { mode: 'ferry', minutes: 15, straight: true },
  'sakurajima-port>kagoshima-port': { mode: 'ferry', minutes: 15, straight: true },
  // 依實際規劃指定的車程
  'aoi-aso-shrine>paak-obi': { mode: 'car', minutes: 100 },
  'paak-obi>nikoniko-shop': { mode: 'car', minutes: 15 },
  'nikoniko-shop>udo-jingu': { mode: 'car', minutes: 15 },
  'udo-jingu>michinoeki-phoenix': { mode: 'car', minutes: 30 },
  'aoshima-shrine>sekinoo': { mode: 'car', minutes: 60 },
  'tenmonkan>stay-shigetomi': { mode: 'car', minutes: 30 },
  // 仙巖園到熊本機場一帶約 2 小時 30 分
  'sengan-en>techno-park': { mode: 'car', minutes: 150 },
}

type OsrmResponse = {
  code: string
  routes: { duration: number; distance: number; geometry: { coordinates: [number, number][] } }[]
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const straightKm = ([lng1, lat1]: readonly number[], [lng2, lat2]: readonly number[]) => {
  const rad = Math.PI / 180
  const x = (lng2 - lng1) * rad * Math.cos(((lat1 + lat2) / 2) * rad)
  const y = (lat2 - lat1) * rad
  return Math.hypot(x, y) * 6371
}
const simplify = (line: [number, number][], step = 3) =>
  line.filter((_, i) => i % step === 0 || i === line.length - 1).map(([x, y]) => [+x.toFixed(5), +y.toFixed(5)])

type Mode = 'car' | 'walk' | 'bus' | 'ferry'
const out: Record<number, { legs: { from: string; to: string; mode: Mode; minutes: number; exact?: boolean; km: number; line: number[][] }[] }> = {}

for (const day of DAYS) {
  const visits: readonly Visit[] = day.visits
  const route = visits.filter((v) => !v.alt)
  const legs: (typeof out)[number]['legs'] = []
  for (let i = 1; i < route.length; i++) {
    const a = PLACES[route[i - 1].place]
    const b = PLACES[route[i].place]
    if (a.id === b.id) continue
    const special = SPECIAL[`${a.id}>${b.id}`]
    if (special?.straight) {
      legs.push({ from: a.id, to: b.id, mode: special.mode, minutes: special.minutes, exact: true, km: 0, line: [[...a.coord], [...b.coord]] })
      console.log(`D${day.n} ${a.nameZh} → ${b.nameZh}: ${special.mode} ${special.minutes} 分`)
      continue
    }
    // 直線 1.2 公里內當作散步，用步行路線（不然開車路線會為了單行道繞一大圈）
    const walk = special?.mode === 'walk' || (special == null && straightKm(a.coord, b.coord) < 1.2)
    const base = walk ? 'https://routing.openstreetmap.de/routed-foot' : 'https://router.project-osrm.org'
    const url = `${base}/route/v1/driving/${a.coord.join(',')};${b.coord.join(',')}?overview=full&geometries=geojson`
    const res = await fetch(url, { headers: { 'User-Agent': 'kagoshima-2026 trip site (build script)' } })
    const data = (await res.json()) as OsrmResponse
    if (data.code !== 'Ok') throw new Error(`${a.id} → ${b.id}: ${data.code}`)
    const r = data.routes[0]
    const km = r.distance / 1000
    legs.push({
      from: a.id,
      to: b.id,
      mode: special?.mode ?? (walk ? 'walk' : 'car'),
      // 指定的時間照原樣顯示，不再進位
      ...(special ? { exact: true } : {}),
      // 長輩步行抓時速 3.5 公里
      minutes: special?.minutes ?? (walk ? Math.round((km / 3.5) * 60) : Math.round((r.duration / 60) * slowdown(km))),
      km: Math.round(km * 10) / 10,
      line: simplify(r.geometry.coordinates, walk ? 1 : 3),
    })
    console.log(`D${day.n} ${a.nameZh} → ${b.nameZh}: ${legs.at(-1)!.minutes} 分 / ${legs.at(-1)!.km} km`)
    await sleep(1100)
  }
  out[day.n] = { legs }
}

mkdirSync('src/data/generated', { recursive: true })
writeFileSync('src/data/generated/routes.json', JSON.stringify(out) + '\n')
console.log('wrote src/data/generated/routes.json')

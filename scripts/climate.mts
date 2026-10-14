/**
 * 用 Open-Meteo 歷史資料，算出每個天氣區域「過去 10 年 11/19–11/26」的平均天氣。
 * 執行：pnpm tsx scripts/climate.mts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { ZONES } from '../src/data/zones'

const YEARS = Array.from({ length: 10 }, (_, i) => 2016 + i)
const zones = Object.values(ZONES)

type ArchiveResponse = {
  hourly: { time: string[]; temperature_2m: (number | null)[] }
  daily: {
    time: string[]
    temperature_2m_max: (number | null)[]
    temperature_2m_min: (number | null)[]
    precipitation_sum: (number | null)[]
  }
}

const acc = Object.fromEntries(
  zones.map((z) => [
    z.id,
    { hourSum: Array<number>(24).fill(0), hourN: Array<number>(24).fill(0), max: [] as number[], min: [] as number[], wet: 0, days: 0 },
  ]),
)

for (const year of YEARS) {
  const params = new URLSearchParams({
    latitude: zones.map((z) => z.coord[1]).join(','),
    longitude: zones.map((z) => z.coord[0]).join(','),
    elevation: zones.map((z) => z.elevation).join(','),
    start_date: `${year}-11-19`,
    end_date: `${year}-11-26`,
    hourly: 'temperature_2m',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone: 'Asia/Tokyo',
  })
  const res = await fetch(`https://archive-api.open-meteo.com/v1/archive?${params}`)
  if (!res.ok) throw new Error(`${year}: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as ArchiveResponse[]
  data.forEach((d, i) => {
    const a = acc[zones[i].id]
    d.hourly.time.forEach((t, j) => {
      const v = d.hourly.temperature_2m[j]
      if (v == null) return
      const h = Number(t.slice(11, 13))
      a.hourSum[h] += v
      a.hourN[h] += 1
    })
    d.daily.time.forEach((_, j) => {
      const mx = d.daily.temperature_2m_max[j]
      const mn = d.daily.temperature_2m_min[j]
      const p = d.daily.precipitation_sum[j]
      if (mx != null) a.max.push(mx)
      if (mn != null) a.min.push(mn)
      if (p != null) {
        a.days += 1
        if (p >= 1) a.wet += 1
      }
    })
  })
  console.log(`✓ ${year}`)
}

const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length
const round1 = (x: number) => Math.round(x * 10) / 10

const out = Object.fromEntries(
  Object.entries(acc).map(([id, a]) => [
    id,
    {
      hourly: a.hourSum.map((s, h) => round1(s / a.hourN[h])),
      max: round1(mean(a.max)),
      min: round1(mean(a.min)),
      rainChance: Math.round((a.wet / a.days) * 100),
    },
  ]),
)

mkdirSync('src/data/generated', { recursive: true })
writeFileSync(
  'src/data/generated/climate.json',
  JSON.stringify({ years: [YEARS[0], YEARS.at(-1)], zones: out }, null, 2) + '\n',
)
console.log('wrote src/data/generated/climate.json')

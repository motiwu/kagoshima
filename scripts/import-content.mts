/**
 * 把研究資料與照片匯入網站：
 *   pnpm tsx scripts/import-content.mts <stops.json> <images 資料夾>
 * 產生 src/data/places.json、src/data/generated/photos.json，照片複製到 public/images/spots/
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [stopsPath, imagesDir] = process.argv.slice(2)

type Research = {
  nameZh: string
  nameJa: string
  lat: number
  lng: number
  summary: string
  detail: string
  walking?: 1 | 2 | 3
  walkingNote?: string
  checkIn?: string
  checkOut?: string
  bath?: string
  etiquette?: string[]
  perks?: string[]
  breakfast?: string
  official?: string
}

if (stopsPath) {
  const r = JSON.parse(readFileSync(stopsPath, 'utf8')) as { stops: Record<string, Research>; hotels: Record<string, Research> }
  const all = { ...r.stops, ...r.hotels }
  const out = Object.fromEntries(
    Object.entries(all).map(([id, s]) => {
      const { lat, lng, ...rest } = s
      const keep = Object.fromEntries(
        Object.entries(rest).filter(([k]) =>
          ['nameZh', 'nameJa', 'summary', 'detail', 'walking', 'walkingNote', 'checkIn', 'checkOut', 'bath', 'etiquette', 'perks', 'breakfast', 'official'].includes(k),
        ),
      )
      return [id, { ...keep, coord: [+lng.toFixed(5), +lat.toFixed(5)] }]
    }),
  )
  writeFileSync('src/data/places.json', JSON.stringify(out, null, 2) + '\n')
  console.log(`places.json: ${Object.keys(out).length} 筆`)
}

if (imagesDir && existsSync(join(imagesDir, 'credits.json'))) {
  type Credit = { author: string; license: string; source: string; width: number; height: number; alt: string }
  const credits = JSON.parse(readFileSync(join(imagesDir, 'credits.json'), 'utf8')) as Record<string, Credit>
  mkdirSync('public/images/spots', { recursive: true })
  const photos: Record<string, object[]> = {}
  for (const file of readdirSync(imagesDir).filter((f) => f.endsWith('.jpg')).sort()) {
    const c = credits[file]
    if (!c) {
      console.warn(`略過（沒有授權資訊）：${file}`)
      continue
    }
    const id = file.replace(/-\d+\.jpg$/, '')
    copyFileSync(join(imagesDir, file), join('public/images/spots', file))
    ;(photos[id] ??= []).push({
      src: `/images/spots/${file}`,
      width: c.width,
      height: c.height,
      alt: c.alt,
      author: c.author,
      license: c.license,
      source: c.source,
    })
  }
  writeFileSync('src/data/generated/photos.json', JSON.stringify(photos, null, 2) + '\n')
  console.log(`photos.json: ${Object.keys(photos).length} 個地點，${Object.values(photos).flat().length} 張`)
}

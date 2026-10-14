/**
 * 產生兩張靜態地圖的 SVG 路徑：
 *   area.json      台灣本島（等面積）疊在南九州上
 *   overview.json  八天路線總覽
 *
 * 資料：Natural Earth 10m admin-1（.cache/ne_admin1.geojson）
 * 執行：pnpm tsx scripts/geo.mts   （需先跑 scripts/routes.mts）
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import polygonClipping from 'polygon-clipping'
import { geoAzimuthalEqualArea, geoPath, geoArea, type GeoProjection } from 'd3-geo'
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position, LineString } from 'geojson'
import { DAYS } from '../src/data/itinerary'
import { PLACES } from '../src/data/places'

const KYUSHU = ['Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Ōita', 'Oita', 'Miyazaki', 'Kagoshima']
const TRIP_PREFS = ['Kumamoto', 'Miyazaki', 'Kagoshima']
const NEIGHBOURS = ['Yamaguchi', 'Ehime', 'Kōchi', 'Kochi', 'Hiroshima', 'Shimane']

type Props = { adm0_a3: string; name: string; name_en?: string }
const ne = JSON.parse(readFileSync('.cache/ne_admin1.geojson', 'utf8')) as FeatureCollection<Polygon | MultiPolygon, Props>

// d3 的球面多邊形要求外環順時針，和 GeoJSON 標準相反；面積超過半個地球就代表方向反了
const fixWinding = (p: Position[][]): Position[][] =>
  geoArea({ type: 'Polygon', coordinates: p }) > 2 * Math.PI ? p.map((r) => [...r].reverse()) : p

const polysOf = (f: Feature<Polygon | MultiPolygon>): Position[][][] =>
  (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).map(fixWinding)

const STERADIAN_TO_KM2 = 6371.0088 ** 2
const polyAreaKm2 = (p: Position[][]) => geoArea({ type: 'Polygon', coordinates: p }) * STERADIAN_TO_KM2

const mp = (polys: Position[][][]): Feature<MultiPolygon> => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'MultiPolygon', coordinates: polys },
})

const byName = (names: string[]) =>
  ne.features.filter((f) => f.properties.adm0_a3 === 'JPN' && names.includes(f.properties.name))

const kyushuOther = mp(byName(KYUSHU.filter((n) => !TRIP_PREFS.includes(n))).flatMap(polysOf))
const neighbours = mp(byName(NEIGHBOURS).flatMap(polysOf))
const tripPrefs = byName(TRIP_PREFS).map((f) => ({ name: f.properties.name, feature: mp(polysOf(f)) }))
if (tripPrefs.length !== 3) throw new Error(`找不到三個縣：${tripPrefs.map((p) => p.name)}`)

// 台灣本島：去掉澎湖、綠島、蘭嶼等離島（面積 < 500 km²）
// 各縣市合併成一個外框，才不會畫出縣市界線
const [firstTw, ...restTw] = ne.features
  .filter((f) => f.properties.adm0_a3 === 'TWN')
  .flatMap(polysOf) as polygonClipping.Polygon[]
const taiwanUnion = polygonClipping.union(firstTw, ...restTw) as Position[][][]
const taiwanPolys = taiwanUnion.map(fixWinding).filter((p) => {
  const [lng] = p[0][0]
  return lng > 119.9 && polyAreaKm2(p) > 500
})
const taiwanKm2 = taiwanPolys.reduce((s, p) => s + polyAreaKm2(p), 0)
const tripKm2 = tripPrefs.reduce((s, p) => s + polysOf(p.feature).reduce((t, q) => t + polyAreaKm2(q), 0), 0)

// ── 在球面上把台灣「搬」到南九州：繞 a×b 軸旋轉，形狀與面積都不變 ──
type V3 = [number, number, number]
const rad = Math.PI / 180
const toV = ([lng, lat]: Position): V3 => [Math.cos(lat * rad) * Math.cos(lng * rad), Math.cos(lat * rad) * Math.sin(lng * rad), Math.sin(lat * rad)]
const toLL = ([x, y, z]: V3): Position => [Math.atan2(y, x) / rad, Math.asin(z) / rad]
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const norm = (a: V3): V3 => {
  const l = Math.hypot(...a)
  return [a[0] / l, a[1] / l, a[2] / l]
}
function rotator(from: Position, to: Position) {
  const a = toV(from)
  const b = toV(to)
  const k = norm(cross(a, b))
  const th = Math.acos(Math.min(1, dot(a, b)))
  const c = Math.cos(th)
  const s = Math.sin(th)
  return (p: Position): Position => {
    const v = toV(p)
    const kxv = cross(k, v)
    const kdv = dot(k, v)
    return toLL([0, 1, 2].map((i) => v[i] * c + kxv[i] * s + k[i] * kdv * (1 - c)) as V3)
  }
}

const TAIWAN_CENTER: Position = [120.97, 23.7]
const TARGET: Position = [130.95, 32.1]
const moveTw = rotator(TAIWAN_CENTER, TARGET)
const taiwanMoved = mp(taiwanPolys.map((poly) => poly.map((ring) => ring.map(moveTw))))

const TW_CITIES = [
  { name: '台北', coord: [121.5654, 25.033] },
  { name: '台中', coord: [120.6736, 24.1477] },
  { name: '高雄', coord: [120.3014, 22.6273] },
] as const
const KY_CITIES = [
  { name: '熊本', coord: [130.7417, 32.7898] },
  { name: '宮崎', coord: [131.4239, 31.9077] },
  { name: '鹿兒島', coord: [130.5571, 31.5966] },
] as const

const R = 6371.0088
const distKm = (a: Position, b: Position) => Math.acos(Math.min(1, dot(toV(a), toV(b)))) * R

// ── 路線（scripts/routes.mts 產生）──
type Routes = Record<string, { legs: { from: string; to: string; minutes: number; km: number; line: Position[] }[] }>
const routes: Routes = existsSync('src/data/generated/routes.json')
  ? JSON.parse(readFileSync('src/data/generated/routes.json', 'utf8'))
  : {}
const dayLine = (n: number): Feature<LineString> => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: (routes[n]?.legs ?? []).flatMap((l) => l.line) },
})
const totalKm = Object.values(routes).reduce((s, r) => s + r.legs.reduce((t, l) => t + l.km, 0), 0)

// ── 實際慢慢玩的範圍：熊本一帶只是進出九州的路過點，不算在內 ──
const PASSING_ZONES = new Set(['kumamoto', 'hitoyoshi'])
const tripPoints = [...new Set(DAYS.flatMap((d) => d.visits.map((v) => v.place)))]
  .map((id) => PLACES[id])
  .filter((p) => !PASSING_ZONES.has(p.zone))
  .map((p): Position => [...p.coord])

function convexHull(points: Position[]): Position[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const turn = (o: Position, a: Position, b: Position) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const half = (list: Position[]) =>
    list.reduce<Position[]>((h, p) => {
      while (h.length >= 2 && turn(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop()
      h.push(p)
      return h
    }, [])
  const lower = half(pts)
  const upper = half([...pts].reverse())
  const ring = [...lower.slice(0, -1), ...upper.slice(0, -1)]
  return [...ring, ring[0]]
}
const tripHull = fixWinding([convexHull(tripPoints)])
const tripHullKm2 = polyAreaKm2(tripHull)

// ── 投影與輸出 ──
function makeProjection(bounds: [Position, Position], width: number, height: number) {
  const [[w, s], [e, n]] = bounds
  const center: Position = [(w + e) / 2, (s + n) / 2]
  const box: Feature<Polygon> = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: fixWinding([[[w, s], [e, s], [e, n], [w, n], [w, s]]]) },
  }
  return geoAzimuthalEqualArea()
    .rotate([-center[0], -center[1]])
    .fitSize([width, height], box)
    .clipExtent([[0, 0], [width, height]])
}
const round = (s: string | null) => (s ?? '').replace(/\d+\.\d+/g, (m) => (+m).toFixed(1))
const pt = (proj: GeoProjection, c: Position) => {
  const p = proj(c as [number, number])!
  return [+p[0].toFixed(1), +p[1].toFixed(1)] as const
}

// 1) 面積比較：需要把整個台灣框進來
{
  const W = 600
  const H = 840
  const proj = makeProjection([[129.0, 29.45], [132.9, 33.95]], W, H)
  const path = geoPath(proj)
  const out = {
    width: W,
    height: H,
    neighbours: round(path(neighbours)),
    kyushuOther: round(path(kyushuOther)),
    prefs: tripPrefs.map((p) => ({ name: p.name, d: round(path(p.feature)) })),
    taiwan: round(path(taiwanMoved)),
    route: round(path({ type: 'FeatureCollection', features: DAYS.map((d) => dayLine(d.n)) })),
    tripArea: round(path({ type: 'Polygon', coordinates: tripHull })),
    twCities: TW_CITIES.map((c) => ({ name: c.name, xy: pt(proj, moveTw([...c.coord])) })),
    kyCities: KY_CITIES.map((c) => ({ name: c.name, xy: pt(proj, [...c.coord]) })),
    stats: {
      taiwanKm2: Math.round(taiwanKm2),
      tripPrefsKm2: Math.round(tripKm2),
      tripAreaKm2: Math.round(tripHullKm2),
      kumamotoToKagoshimaKm: Math.round(distKm(KY_CITIES[0].coord as unknown as Position, KY_CITIES[2].coord as unknown as Position)),
      taipeiToTaichungKm: Math.round(distKm(TW_CITIES[0].coord as unknown as Position, TW_CITIES[1].coord as unknown as Position)),
      taipeiToKaohsiungKm: Math.round(distKm(TW_CITIES[0].coord as unknown as Position, TW_CITIES[2].coord as unknown as Position)),
      totalDriveKm: Math.round(totalKm),
    },
  }
  writeFileSync('src/data/generated/area.json', JSON.stringify(out) + '\n')
  console.log('area stats', out.stats)
}

// 2) 八天路線總覽：只框行程範圍
{
  const W = 600
  const H = 720
  const proj = makeProjection([[130.25, 31.3], [131.6, 32.95]], W, H)
  const path = geoPath(proj)
  const hotels = [...new Set(DAYS.flatMap((d) => d.visits.map((v) => v.place)))]
    .map((id) => PLACES[id])
    .filter((p) => p.kind === 'hotel' || p.kind === 'airport')
  const out = {
    width: W,
    height: H,
    land: round(path(mp([...polysOf(kyushuOther), ...tripPrefs.flatMap((p) => polysOf(p.feature))]))),
    prefLines: tripPrefs.map((p) => round(path(p.feature))),
    days: DAYS.map((d) => {
      const line = dayLine(d.n)
      const mid = line.geometry.coordinates[Math.floor(line.geometry.coordinates.length / 2)]
      return { n: d.n, color: d.color, d: round(path(line)), mid: mid ? pt(proj, mid) : null }
    }),
    places: hotels.map((p) => ({ id: p.id, name: p.nameZh, kind: p.kind, xy: pt(proj, [...p.coord]) })),
  }
  writeFileSync('src/data/generated/overview.json', JSON.stringify(out) + '\n')
  console.log('wrote overview.json')
}

/**
 * 以 OpenFreeMap positron 為底，改成網站的和紙色系，輸出 public/map-style.json。
 * 執行：pnpm tsx scripts/map-style.mts
 */
import { writeFileSync } from 'node:fs'

type Layer = {
  id: string
  type: string
  paint?: Record<string, unknown>
  layout?: Record<string, unknown>
  [k: string]: unknown
}
type Style = { layers: Layer[]; [k: string]: unknown }

const style = (await (await fetch('https://tiles.openfreemap.org/styles/positron')).json()) as Style

const DROP = [/^highway-name/, /shield/, /^waterway_line_label/, /^label_country/, /^building$/, /^aeroway/, /^railway_.*dashline/]

const COLORS: Record<string, Record<string, string>> = {
  background: { 'background-color': '#f3efe7' },
  park: { 'fill-color': '#e7e6d8' },
  water: { 'fill-color': '#cfdce1' },
  landcover_wood: { 'fill-color': '#e3e2d3' },
  landuse_residential: { 'fill-color': '#eee8dd' },
  waterway: { 'line-color': '#c3d3d9' },
  highway_major_casing: { 'line-color': '#ddd3c2' },
  highway_motorway_casing: { 'line-color': '#d7c9b1' },
  highway_motorway_bridge_casing: { 'line-color': '#d7c9b1' },
  highway_minor: { 'line-color': '#e9e3d8' },
  boundary_3: { 'line-color': '#c9bca6' },
  boundary_2: { 'line-color': '#b5a68c' },
}

// 地名只顯示日文原名（漢字長輩大多看得懂），不顯示羅馬拼音
const NAME = ['coalesce', ['get', 'name:ja'], ['get', 'name']]

style.layers = style.layers
  .filter((l) => !DROP.some((re) => re.test(l.id)))
  .map((l) => {
    const paint = { ...l.paint, ...COLORS[l.id] }
    const layout = { ...l.layout }
    if (l.type === 'symbol' && layout['text-field']) {
      layout['text-field'] = NAME
      layout['text-letter-spacing'] = 0.1
      paint['text-color'] = l.id.startsWith('water') ? '#6b8794' : '#5c5246'
      paint['text-halo-color'] = '#f6f3ec'
      paint['text-halo-width'] = 1.4
    }
    return { ...l, paint, layout }
  })

writeFileSync('public/map-style.json', JSON.stringify(style))
console.log(`wrote public/map-style.json (${style.layers.length} layers)`)

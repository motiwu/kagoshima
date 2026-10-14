'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Map, { Layer, Marker, Source, type MapRef } from 'react-map-gl/maplibre'
import { setWorkerUrl } from 'maplibre-gl'
import type { FeatureCollection, LineString } from 'geojson'
import { DAYS } from '@/data/itinerary'
import { PLACES } from '@/data/places'
import { ROUTES } from '@/data/routes'
import type { Visit } from '@/data/types'
import { stopNumbers } from '@/lib/stops'

// 打包後 MapLibre 推算不出 worker 路徑，改用 public/ 底下的複本（pnpm copy-worker）
setWorkerUrl('/maplibre-gl-worker.mjs')

type Props = {
  activeDay: number
  activeStop: number | null
  onSelectStop: (day: number, index: number) => void
}

const ALL_ROUTES: FeatureCollection<LineString, { n: number; mode: string }> = {
  type: 'FeatureCollection',
  features: DAYS.flatMap((d) =>
    (ROUTES[d.n]?.legs ?? []).map((l) => ({
      type: 'Feature' as const,
      properties: { n: d.n, mode: l.mode },
      geometry: { type: 'LineString' as const, coordinates: l.line },
    })),
  ),
}

/** 同一天重複出現的地點（例如中午回飯店）只畫一個點 */
function dayMarkers(n: number) {
  const visits: readonly Visit[] = DAYS[n - 1].visits
  const numbers = stopNumbers(n)
  const seen = new Set<string>()
  const out: { index: number; id: string; order?: number }[] = []
  visits.forEach((v, index) => {
    if (seen.has(v.place)) return
    seen.add(v.place)
    out.push({ index, id: v.place, order: numbers.get(v.place) })
  })
  return out
}

type Bounds = [[number, number], [number, number]]

function bbox(pts: readonly (readonly [number, number])[]): Bounds {
  const lngs = pts.map((p) => p[0])
  const lats = pts.map((p) => p[1])
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ]
}

const boundsOf = (n: number) => bbox(DAYS[n - 1].visits.map((v) => PLACES[v.place].coord))

// 上方留空間給標籤，右側留給飯店名稱
const PADDING = { top: 36, bottom: 28, left: 32, right: 80 }

/** 地圖標籤空間小，飯店用短名稱 */
const SHORT_NAME: Record<string, string> = {
  'via-inn-kumamoto': 'Via Inn Prime 熊本',
  'paak-obi': 'PAAK HOTEL',
  'kirishima-kokusai': '霧島國際飯店',
  'stay-shigetomi': '宿 重富',
  'kagoshima-port': '鹿兒島港',
  'sakurajima-port': '櫻島港',
}

/**
 * 版權標示在收到圖磚的版權資料時才會自動展開（時間點不固定），
 * 第一次展開時就收起來，只留 ⓘ，點了還是能展開。
 */
function collapseAttributionOnce(container: HTMLElement) {
  const el = container.querySelector('.maplibregl-ctrl-attrib')
  if (!el) return
  const collapse = () => el.classList.remove('maplibregl-compact-show')
  if (el.classList.contains('maplibregl-compact-show')) return collapse()
  const observer = new MutationObserver(() => {
    if (!el.classList.contains('maplibregl-compact-show')) return
    collapse()
    observer.disconnect()
  })
  observer.observe(el, { attributes: true, attributeFilter: ['class'] })
}

const LOCALE = {
  'CooperativeGesturesHandler.MobileHelpText': '用兩根手指移動地圖',
  'CooperativeGesturesHandler.WindowsHelpText': '按住 Ctrl 並滾動滑鼠來縮放地圖',
  'CooperativeGesturesHandler.MacHelpText': '按住 ⌘ 並滾動滑鼠來縮放地圖',
}

export default function TripMap({ activeDay, activeStop, onSelectStop }: Props) {
  const mapRef = useRef<MapRef>(null)
  const [loaded, setLoaded] = useState(false)
  const day = DAYS[activeDay - 1]
  const markers = useMemo(() => dayMarkers(activeDay), [activeDay])
  const activePlace = activeStop != null ? DAYS[activeDay - 1].visits[activeStop]?.place : undefined

  // 換天、或捲到當天標題時：顯示整天的範圍
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded || activeStop != null) return
    map.fitBounds(boundsOf(activeDay), { padding: PADDING, maxZoom: 13, duration: 1200 })
  }, [activeDay, activeStop, loaded])

  // 捲到某一站：顯示「這一站和下一站」，看得出接下來往哪裡去
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded || activeStop == null) return
    const visits = DAYS[activeDay - 1].visits
    const around = visits.slice(activeStop, activeStop + 2).map((v) => PLACES[v.place].coord)
    map.fitBounds(bbox(around), { padding: PADDING, maxZoom: 13, duration: 900 })
  }, [activeDay, activeStop, loaded])

  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

  return (
    <Map
      ref={mapRef}
      mapStyle="/map-style.json"
      initialViewState={{ bounds: boundsOf(activeDay), fitBoundsOptions: { padding: 40 } }}
      style={{ width: '100%', height: '100%' }}
      cooperativeGestures={coarse}
      locale={LOCALE}
      attributionControl={{ compact: true }}
      dragRotate={false}
      pitchWithRotate={false}
      touchPitch={false}
      onLoad={(e) => {
        collapseAttributionOnce(e.target.getContainer())
        setLoaded(true)
      }}
    >
      <Source id="routes" type="geojson" data={ALL_ROUTES}>
        <Layer
          id="routes-other"
          type="line"
          filter={['!=', ['get', 'n'], activeDay]}
          paint={{ 'line-color': '#a59a88', 'line-width': 2, 'line-opacity': 0.45, 'line-dasharray': [2, 2] }}
          layout={{ 'line-join': 'round', 'line-cap': 'round' }}
        />
        <Layer
          id="routes-active-casing"
          type="line"
          filter={['all', ['==', ['get', 'n'], activeDay], ['!=', ['get', 'mode'], 'ferry']]}
          paint={{ 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.9 }}
          layout={{ 'line-join': 'round', 'line-cap': 'round' }}
        />
        <Layer
          id="routes-active"
          type="line"
          filter={['all', ['==', ['get', 'n'], activeDay], ['!=', ['get', 'mode'], 'ferry']]}
          paint={{ 'line-color': day.color, 'line-width': 4.5 }}
          layout={{ 'line-join': 'round', 'line-cap': 'round' }}
        />
        {/* 渡輪：海上的虛線 */}
        <Layer
          id="routes-ferry"
          type="line"
          filter={['all', ['==', ['get', 'n'], activeDay], ['==', ['get', 'mode'], 'ferry']]}
          paint={{ 'line-color': '#052032', 'line-width': 3, 'line-dasharray': [2, 2.5] }}
          layout={{ 'line-cap': 'round' }}
        />
      </Source>

      {markers.map((m) => {
        const place = PLACES[m.id]
        const active = m.id === activePlace
        const isHotel = place.kind === 'hotel'
        const isPort = place.kind === 'port'
        return (
          <Marker
            key={`${activeDay}-${m.id}`}
            longitude={place.coord[0]}
            latitude={place.coord[1]}
            anchor="center"
            style={{ zIndex: active ? 3 : isHotel ? 2 : 1 }}
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              onSelectStop(activeDay, m.index)
            }}
          >
            <button type="button" className="group relative flex items-center" aria-label={place.nameZh}>
              <span
                className="flex items-center justify-center rounded-full border-2 border-white font-latin font-semibold text-white shadow-md transition-transform duration-300"
                style={{
                  background: isHotel || isPort ? 'var(--navy)' : day.color,
                  width: active ? 34 : 26,
                  height: active ? 34 : 26,
                  fontSize: active ? 18 : 15,
                }}
              >
                {isHotel ? '宿' : isPort ? '港' : m.order}
              </span>
              {(active || isHotel || isPort || place.kind === 'airport') && (
                <span
                  className={`absolute left-full ml-1.5 rounded-full px-2.5 py-0.5 text-[14px] whitespace-nowrap shadow-sm ${
                    active ? 'bg-navy text-white' : 'bg-white/95 text-navy'
                  }`}
                >
                  {SHORT_NAME[place.id] ?? place.nameZh}
                </span>
              )}
            </button>
          </Marker>
        )
      })}
    </Map>
  )
}

import overview from '@/data/generated/overview.json'
import { DAYS } from '@/data/itinerary'
import { nichime, pad2, shortDate } from '@/lib/format'
import { SectionTitle } from './SectionTitle'

type XY = readonly [number, number]
type Overview = {
  width: number
  height: number
  land: string
  prefLines: string[]
  days: { n: number; color: string; d: string; mid: XY | null }[]
  places: { id: string; name: string; kind: string; xy: XY }[]
}
const O = overview as unknown as Overview

// 總覽圖只標地名，飯店全名太長；左右位置避免和路線重疊
const LABELS: Record<string, { text: string; side: 'left' | 'right' | 'below' }> = {
  'kmj-airport': { text: '熊本機場', side: 'right' },
  'via-inn-kumamoto': { text: '熊本市', side: 'left' },
  'paak-obi': { text: '飫肥', side: 'left' },
  'kirishima-kokusai': { text: '霧島溫泉', side: 'below' },
  'stay-shigetomi': { text: '重富', side: 'left' },
}

export function Overview() {
  return (
    <section id="overview" className="bg-paper-deep/60 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-10">
        <SectionTitle ja="八日間の道のり">
          八天的路線
        </SectionTitle>

        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
          <svg viewBox={`0 0 ${O.width} ${O.height}`} className="h-auto w-full rounded-xl bg-[#e3eaec]" role="img" aria-label="八天路線總覽地圖">
            <path d={O.land} fill="#efeae0" />
            {O.prefLines.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#fff" strokeWidth={1.5} />
            ))}
            {O.days.map((d) => (
              <path key={d.n} d={d.d} fill="none" stroke={d.color} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" opacity={0.9} />
            ))}
            {O.places.map((p) => {
              const label = LABELS[p.id] ?? { text: p.name, side: 'right' }
              const left = label.side === 'left'
              const below = label.side === 'below'
              return (
                <g key={p.id} transform={`translate(${p.xy[0]} ${p.xy[1]})`}>
                  <circle r={9} fill="#fff" stroke="var(--navy)" strokeWidth={3} />
                  <text
                    x={below ? 0 : left ? -16 : 16}
                    y={below ? 40 : 9}
                    textAnchor={below ? 'middle' : left ? 'end' : 'start'}
                    className="fill-navy font-serif text-[27px] font-semibold"
                    paintOrder="stroke"
                    stroke="#f6f3ec"
                    strokeWidth={6}
                  >
                    {label.text}
                  </text>
                </g>
              )
            })}
            {O.days.map(
              (d) =>
                d.mid && (
                  <a key={d.n} href={`#day-${d.n}`}>
                    <circle cx={d.mid[0]} cy={d.mid[1]} r={21} fill={d.color} stroke="#fff" strokeWidth={3} />
                    <text x={d.mid[0]} y={d.mid[1] + 9} textAnchor="middle" className="fill-white font-latin text-[27px] font-semibold">
                      {d.n}
                    </text>
                  </a>
                ),
            )}
          </svg>

          <ol className="divide-y divide-line border-y border-line">
            {DAYS.map((d) => (
              <li key={d.n}>
                <a href={`#day-${d.n}`} className="flex items-center gap-4 py-4 active:bg-bronze-wash">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-full font-latin text-xl font-semibold text-white"
                    style={{ background: d.color }}
                  >
                    {pad2(d.n)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] text-ink-faint">
                      {shortDate(d.date)}（{d.weekday}）・{nichime(d.n)}
                    </span>
                    <span className="block font-serif text-[19px] font-semibold tracking-[0.08em] text-ink">{d.title}</span>
                  </span>
                  <span aria-hidden className="text-bronze">→</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

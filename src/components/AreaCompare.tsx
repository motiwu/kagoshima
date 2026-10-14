'use client'

import { useState } from 'react'
import area from '@/data/generated/area.json'
import { SectionTitle } from './SectionTitle'

type XY = readonly [number, number]
type Area = {
  width: number
  height: number
  neighbours: string
  kyushuOther: string
  prefs: { name: string; d: string }[]
  taiwan: string
  route: string
  tripArea: string
  twCities: { name: string; xy: XY }[]
  kyCities: { name: string; xy: XY }[]
  stats: {
    taiwanKm2: number
    tripPrefsKm2: number
    tripAreaKm2: number
    kumamotoToKagoshimaKm: number
    taipeiToTaichungKm: number
    taipeiToKaohsiungKm: number
    totalDriveKm: number
  }
}
const A = area as unknown as Area

/** 四捨五入到百位，加千分位：35940 → 35,900 */
const hundreds = (km2: number) => (Math.round(km2 / 100) * 100).toLocaleString('en-US')

const NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
/** 0.13 → 「八分之一」 */
const fractionText = (r: number) => `${NUM[Math.min(10, Math.round(1 / r))]}分之一`

export function AreaCompare() {
  const [showTaiwan, setShowTaiwan] = useState(true)
  const s = A.stats

  return (
    <section id="area" className="mx-auto max-w-5xl px-5 py-24 sm:px-10 sm:py-32">
      <SectionTitle ja="台湾と比べると">
        這趟會走多大範圍？
      </SectionTitle>

      <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:items-center">
        <figure className="relative overflow-hidden rounded-xl bg-[#e3eaec] shadow-[0_1px_0_var(--line)]">
          <svg viewBox={`0 0 ${A.width} ${A.height}`} className="block h-auto w-full" role="img" aria-label="台灣本島疊在南九州上的面積比較圖">
            <path d={A.neighbours} fill="#ece7dc" />
            <path d={A.kyushuOther} fill="#ece7dc" stroke="#fff" strokeWidth={1} />
            {A.prefs.map((p) => (
              <path key={p.name} d={p.d} fill="#ece7dc" stroke="#fff" strokeWidth={1} />
            ))}
            <path d={A.route} fill="none" stroke="var(--navy)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" opacity={0.75} />

            <g
              className="transition-opacity duration-700"
              style={{ opacity: showTaiwan ? 1 : 0 }}
              aria-hidden={!showTaiwan}
            >
              <path d={A.taiwan} fill="var(--vermilion)" fillOpacity={0.22} stroke="var(--vermilion)" strokeWidth={1.6} strokeDasharray="5 4" />
              {A.twCities.map((c) => (
                <g key={c.name} transform={`translate(${c.xy[0]} ${c.xy[1]})`}>
                  <circle r={7} fill="var(--vermilion)" stroke="#fff" strokeWidth={2} />
                  <text x={-13} y={9} textAnchor="end" className="fill-vermilion font-serif text-[28px] font-semibold" paintOrder="stroke" stroke="#f6f3ec" strokeWidth={5}>
                    {c.name}
                  </text>
                </g>
              ))}
            </g>

            {/* 實際慢慢玩的範圍，放在台灣上層才看得清楚 */}
            <path d={A.tripArea} fill="var(--bronze)" fillOpacity={0.55} stroke="var(--bronze-deep)" strokeWidth={2.5} strokeLinejoin="round" />
            <path d={A.route} fill="none" stroke="var(--navy)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" opacity={0.5} />

            {A.kyCities.map((c) => (
              <g key={c.name} transform={`translate(${c.xy[0]} ${c.xy[1]})`}>
                <rect x={-7} y={-7} width={14} height={14} fill="var(--navy)" stroke="#fff" strokeWidth={2} />
                <text x={14} y={9} className="fill-navy font-serif text-[28px] font-semibold" paintOrder="stroke" stroke="#f6f3ec" strokeWidth={5}>
                  {c.name}
                </text>
              </g>
            ))}
          </svg>

          <button
            type="button"
            onClick={() => setShowTaiwan((v) => !v)}
            className="absolute top-3 right-3 rounded-full border border-vermilion/40 bg-white/90 px-4 py-2 text-[15px] text-vermilion shadow-sm backdrop-blur active:scale-95"
          >
            {showTaiwan ? '拿掉台灣' : '疊上台灣'}
          </button>

          <figcaption className="flex flex-wrap gap-x-5 gap-y-1 border-t border-line bg-white/70 px-4 py-3 text-[14px] text-ink-soft">
            <Legend swatch="bg-vermilion/30 border border-dashed border-vermilion">台灣本島</Legend>
            <Legend swatch="bg-bronze/60 border border-bronze-deep">這八天慢慢玩的範圍</Legend>
            <Legend swatch="h-[3px] bg-navy/75">這趟的路線</Legend>
          </figcaption>
        </figure>

        <div className="space-y-8">
          <p className="text-ink-soft">
            把台灣本島用<strong className="font-medium text-ink">一樣的比例</strong>
            搬過來比一比。這八天真正慢慢玩的，只有圖上這一小塊：大約是
            <mark className="marker">台灣的{fractionText(s.tripAreaKm2 / s.taiwanKm2)}</mark>，差不多一個花蓮縣那麼大。
          </p>
          <p className="text-ink-soft">路程不算短，但大部分的住處都連住兩晚，不需要天天收行李。</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-7">
            <Stat label="台灣本島面積" value={hundreds(s.taiwanKm2)} unit="km²" />
            <Stat label="這八天慢慢玩的範圍" value={hundreds(s.tripAreaKm2)} unit="km²" />
          </dl>
        </div>
      </div>
    </section>
  )
}

function Legend({ swatch, children }: { swatch: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-3 w-5 rounded-[2px] ${swatch}`} />
      {children}
    </span>
  )
}

function Stat({ label, value, unit, note }: { label: string; value: string; unit: string; note?: string }) {
  return (
    <div className="border-t border-line pt-3">
      <dt className="text-[15px] text-ink-soft">{label}</dt>
      <dd className="mt-1">
        <span className="font-latin text-[2.6rem] leading-none font-medium text-bronze-deep">{value}</span>
        <span className="ml-1.5 text-[15px] text-ink-soft">{unit}</span>
        {note && <span className="mt-1.5 block text-[15px] leading-relaxed text-ink-soft">{note}</span>}
      </dd>
    </div>
  )
}

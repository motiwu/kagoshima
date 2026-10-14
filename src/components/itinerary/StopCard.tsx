import Image from 'next/image'
import { BedDouble, Car, Footprints, Bus, ChevronRight, Ship } from 'lucide-react'
import { PLACES } from '@/data/places'
import { photosOf } from '@/data/photos'
import type { Leg, LegMode } from '@/data/routes'
import type { Visit } from '@/data/types'
import { friendlyMinutes } from '@/lib/format'
import { cn } from 'cn'

export function WalkingDots({ level }: { level: 1 | 2 | 3 }) {
  const text = { 1: '平坦好走', 2: '有些坡道階梯', 3: '需要爬坡' }[level]
  return (
    <span className="inline-flex items-center gap-1.5 text-[14px] text-ink-soft">
      <Footprints className="size-4 text-bronze" strokeWidth={1.5} aria-hidden />
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn('size-2 rounded-full', i <= level ? 'bg-bronze' : 'bg-line')} />
        ))}
      </span>
      {text}
    </span>
  )
}

type CardProps = {
  visit: Visit
  order: number
  color: string
  active: boolean
  isLast: boolean
  onOpen: () => void
}

export function StopCard({ visit, order, color, active, isLast, onOpen }: CardProps) {
  const place = PLACES[visit.place]
  const cover = photosOf(place.id)[0]
  const isHotel = place.kind === 'hotel'
  const isPort = place.kind === 'port'

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group relative block w-full overflow-hidden rounded-xl border bg-card text-left shadow-[0_1px_2px_rgb(43_43_43/0.04)] transition-[border-color,box-shadow] duration-300',
        active ? 'border-bronze/70 shadow-[0_6px_24px_-12px_rgb(137_118_88/0.6)]' : 'border-line',
      )}
    >
      {cover && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper-deep">
          <Image src={cover.src} alt={cover.alt} fill sizes="(min-width: 768px) 480px, 100vw" className="object-cover transition-transform duration-700 group-active:scale-[1.02]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <span className="absolute bottom-2.5 left-3 rounded-full bg-black/35 px-3 py-0.5 text-[13px] text-white backdrop-blur-sm">
            點開看照片
          </span>
        </div>
      )}

      <div className="flex gap-3.5 p-4">
        <span
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full font-latin text-lg font-semibold text-white"
          style={{ background: isHotel || isPort ? 'var(--navy)' : color }}
        >
          {isHotel ? <BedDouble className="size-[18px]" strokeWidth={1.75} /> : isPort ? <Ship className="size-[18px]" strokeWidth={1.75} /> : order}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5">
            {visit.label && <span className="font-latin text-xl font-semibold text-bronze-deep">{visit.label}</span>}
            {isHotel && isLast && <span className="text-[14px] text-bronze-deep">今晚住這裡</span>}
          </div>
          <h4 className="text-[1.3rem] leading-snug tracking-[0.08em] text-ink">{place.nameZh}</h4>
          <p className="font-serif text-[14px] tracking-[0.12em] text-ink-faint">{place.nameJa}</p>
          {visit.note && <p className="mt-2 text-[16px] font-medium text-bronze-deep">{visit.note}</p>}
          <p className="mt-1.5 text-[17px] leading-[1.8] text-ink-soft">{place.summary}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            {place.walking ? <WalkingDots level={place.walking} /> : <span />}
            <ChevronRight className="size-5 shrink-0 text-bronze transition-transform group-active:translate-x-0.5" aria-hidden />
          </div>
        </div>
      </div>
    </button>
  )
}

/** 從飯店出發、中途回飯店、碼頭這類簡短的一行 */
export function CompactRow({ visit, onOpen }: { visit: Visit; onOpen: () => void }) {
  const place = PLACES[visit.place]
  const Icon = place.kind === 'port' ? Ship : BedDouble
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-xl border border-dashed border-line bg-card/60 px-4 py-3 text-left"
    >
      <Icon className="size-5 shrink-0 text-navy" strokeWidth={1.5} aria-hidden />
      <span className="min-w-0 flex-1 text-[16px]">
        {visit.label && <span className="mr-2 font-latin text-lg font-semibold text-bronze-deep">{visit.label}</span>}
        <span className="text-ink">{place.nameZh}</span>
        {visit.note && <span className="text-ink-soft">・{visit.note}</span>}
      </span>
      <ChevronRight className="size-5 shrink-0 text-bronze" aria-hidden />
    </button>
  )
}

/** 卡片之間的移動資訊；用「車上休息」的語氣，不強調時間長 */
export function Connector({ leg, or }: { leg?: Leg; or?: boolean }) {
  if (or) {
    return (
      <div className="flex items-center gap-3 py-1 pl-[1.1rem] text-[15px] text-ink-faint">
        <span className="h-px w-6 bg-line" />或<span className="h-px flex-1 bg-line" />
      </div>
    )
  }
  if (!leg) return <div className="ml-[1.1rem] h-6 border-l border-dashed border-line" />

  const { icon: Icon, verb, step } = MODE[leg.mode]
  return (
    <div className="ml-[1.1rem] flex gap-4 border-l border-dashed border-bronze/50 py-3 pl-5 text-[15px] text-ink-soft">
      <span className="flex flex-wrap items-center gap-x-2">
        <Icon className="size-4 text-bronze" strokeWidth={1.5} aria-hidden />
        {verb}約 {friendlyMinutes(leg.minutes, leg.exact ? 1 : step)}
        {leg.mode === 'ferry' && <span className="text-ink-faint">・可以到甲板看櫻島</span>}
        {leg.mode === 'car' && leg.minutes > 80 && <span className="text-ink-faint">・途中會停下來休息、上洗手間</span>}
      </span>
    </div>
  )
}

const MODE: Record<LegMode, { icon: typeof Car; verb: string; step: number }> = {
  car: { icon: Car, verb: '坐車', step: 10 },
  walk: { icon: Footprints, verb: '散步', step: 5 },
  bus: { icon: Bus, verb: '搭巴士', step: 5 },
  ferry: { icon: Ship, verb: '搭渡輪', step: 5 },
}

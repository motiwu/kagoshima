import {
  ArrowRight,
  Ban,
  Bath,
  BatteryCharging,
  BookUser,
  Briefcase,
  Coins,
  Droplets,
  Flame,
  Footprints,
  Luggage,
  Pill,
  QrCode,
  Shirt,
  ShowerHead,
  WashingMachine,
  Wine,
  type LucideIcon,
} from 'lucide-react'
import { FLIGHTS, MEETING, PREP_GROUPS, type PrepIcon } from '@/data/prep'
import { SectionTitle } from './SectionTitle'

const ICONS: Record<PrepIcon, LucideIcon> = {
  'carry-on': Briefcase,
  checked: Luggage,
  laundry: WashingMachine,
  liquid: Droplets,
  lighter: Flame,
  battery: BatteryCharging,
  passport: BookUser,
  pill: Pill,
  toiletries: ShowerHead,
  shoes: Footprints,
  coat: Shirt,
  yen: Coins,
  qr: QrCode,
  meat: Ban,
  alcohol: Wine,
  onsen: Bath,
}

export function Prep() {
  return (
    <section id="prep" className="mx-auto max-w-5xl px-5 py-24 sm:px-10 sm:py-32">
      <SectionTitle ja="旅の準備">行前須知</SectionTitle>

      {/* 集合資訊：最重要，放最大 */}
      <div className="mt-10 overflow-hidden rounded-xl bg-navy text-white">
        {/* 左右兩欄：小標一列、大字一列；大字用文字基線對齊，數字和漢字的底才會切齊 */}
        <div className="relative grid grid-cols-2 items-baseline gap-y-2 px-2 pt-6 pb-6">
          <span className="absolute inset-y-6 left-1/2 w-px bg-white/15" aria-hidden />
          <p className="px-4 font-serif text-[15px] tracking-[0.3em] text-white/70">集合時間</p>
          <p className="px-4 font-serif text-[15px] tracking-[0.3em] text-white/70">集合地點</p>
          <p className="px-4 font-latin text-[2.6rem] leading-none font-semibold">{MEETING.time}</p>
          {/* 漢字的字框會伸到基線下方，往上提一點，底部才會和數字切齊 */}
          <p className="relative -top-[0.1em] px-4 font-serif text-[1.75rem] leading-none font-semibold tracking-[0.12em]">
            {MEETING.place}
          </p>
        </div>

        {/* 航班：去回程各一列 */}
        <ul className="divide-y divide-white/15 border-t border-white/15 px-6">
          {FLIGHTS.map((f) => (
            <li key={f.no} className="py-4">
              <p className="flex items-baseline gap-3 text-[15px] text-white/70">
                <span className="font-serif tracking-[0.3em]">{f.label}</span>
                <span>{f.date}</span>
                <span className="ml-auto">
                  星宇航空 <span className="font-latin text-[17px] tracking-wider">{f.no}</span>
                </span>
              </p>
              <p className="mt-1.5 flex items-baseline gap-2 font-serif text-[1.2rem] font-semibold tracking-[0.12em]">
                {f.from}
                <b className="font-latin text-[1.5rem] font-medium tracking-normal">{f.depart}</b>
                <ArrowRight className="mx-1 size-4 self-center text-white/60" strokeWidth={1.5} aria-label="到" />
                {f.to}
                <b className="font-latin text-[1.5rem] font-medium tracking-normal">{f.arrive}</b>
              </p>
            </li>
          ))}
        </ul>
        <p className="px-6 pb-4 text-[14px] text-white/60">時間都是當地時間</p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {PREP_GROUPS.map((g) => (
          <div key={g.title} className="rounded-xl border border-line bg-card px-5 py-5">
            <h3 className="flex items-baseline gap-3 text-[1.2rem] text-navy">
              {g.title}
              <span className="font-serif text-[13px] font-normal tracking-[0.25em] text-ink-faint">{g.ja}</span>
            </h3>
            <ul className="mt-3 divide-y divide-line/70">
              {g.items.map((it) => {
                const Icon = ICONS[it.icon]
                return (
                  <li key={it.title} className="flex gap-3.5 py-3">
                    {/* 外框和標題一樣高（1 行），圖示就會跟標題文字垂直置中 */}
                    <span className="flex h-[1.9em] shrink-0 items-center">
                      <Icon
                        className={`size-5 ${it.icon === 'meat' ? 'text-vermilion' : 'text-bronze'}`}
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </span>
                    <div>
                      <p className="font-medium text-ink">{it.title}</p>
                      {it.text && <p className="text-[16px] leading-relaxed whitespace-pre-line text-ink-soft">{it.text}</p>}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

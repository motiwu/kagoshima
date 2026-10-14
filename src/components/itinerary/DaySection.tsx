import { ShoppingBasket } from 'lucide-react'
import { PLACES } from '@/data/places'
import { legBetween } from '@/data/routes'
import type { Day, Visit } from '@/data/types'
import type { DayWeather } from '@/lib/weather'
import { shortDate } from '@/lib/format'
import { stopNumbers } from '@/lib/stops'
import { WeatherCard } from './WeatherCard'
import { CompactRow, Connector, StopCard } from './StopCard'

type Props = {
  day: Day
  weather: DayWeather
  activeStop: number | null
  isToday: boolean
  onOpenPlace: (id: string) => void
}

export function DaySection({ day, weather, activeStop, isToday, onOpenPlace }: Props) {
  const visits: readonly Visit[] = day.visits
  const numbers = stopNumbers(day.n)

  return (
    <section id={`day-${day.n}`} data-day={day.n} className="scroll-mt-(--sticky-offset) pt-14 pb-10">
      <header>
        <p className="flex items-baseline gap-1.5 font-serif text-[17px] tracking-[0.2em] text-bronze">
          <span className="font-latin text-[2.6rem] leading-none font-medium tracking-normal" style={{ color: day.color }}>
            {day.n}
          </span>
          日目
          <span aria-hidden className="mx-1.5 inline-block h-[1.05em] w-px translate-y-[0.15em] bg-bronze/50" />
          <span className="font-semibold text-ink">{day.theme}</span>
        </p>
        <p className="mt-3 text-[17px] text-ink-soft">
          <span className="font-latin text-2xl font-semibold text-ink">{shortDate(day.date)}</span>（{day.weekday}）
        </p>
        <h3 className="mt-1 text-[1.45rem] text-navy">{day.title}</h3>
        {isToday && (
          <span className="mt-2 inline-block rounded-full bg-vermilion px-3 py-0.5 text-[14px] tracking-[0.15em] text-white">今天</span>
        )}
      </header>

      <div className="mt-6">
        <WeatherCard w={weather} advice={!day.noAdvice} />
      </div>

      <ol className="mt-8">
        {visits.map((v, i) => {
          const place = PLACES[v.place]
          const isLast = i === visits.length - 1
          // 第一次到碼頭用完整卡片介紹渡輪，其餘碼頭和中途的飯店用簡短一行
          const firstPort = place.kind === 'port' && visits.findIndex((x) => x.place === v.place) === i && place.id === 'kagoshima-port'
          const compact = (place.kind === 'hotel' && !isLast) || (place.kind === 'port' && !firstPort)
          const prev = visits.slice(0, i).findLast((p) => !p.alt)
          const connector =
            i === 0 ? null
            : v.alt ? <Connector or />
            : prev && prev.place !== v.place ? <Connector leg={legBetween(day.n, prev.place, v.place)} />
            : <Connector />
          // 同一地點出現兩次時（例如碼頭），備註放在最後一次之後
          const isLastVisitHere = visits.findLastIndex((x) => x.place === v.place) === i
          const extra = isLastVisitHere ? day.extras?.find((e) => e.after === v.place) : undefined

          return (
            <li key={`${v.place}-${i}`}>
              {connector}
              <div data-stop={i} data-day={day.n} className="scroll-mt-[calc(var(--sticky-offset)+1rem)]">
                {compact ? (
                  <CompactRow visit={v} onOpen={() => onOpenPlace(v.place)} />
                ) : (
                  <StopCard
                    visit={v}
                    order={numbers.get(v.place) ?? 0}
                    color={day.color}
                    active={activeStop === i}
                    isLast={isLast}
                    onOpen={() => onOpenPlace(v.place)}
                  />
                )}
              </div>
              {extra && (
                <p className="mt-3 ml-[1.1rem] flex items-center gap-2.5 border-l border-dashed border-bronze/50 py-2 pl-5 text-[16px] text-ink-soft">
                  <ShoppingBasket className="size-[18px] shrink-0 text-bronze" strokeWidth={1.5} aria-hidden />
                  {extra.text}
                </p>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

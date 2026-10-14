'use client'

import { useEffect, useRef } from 'react'
import { DAYS } from '@/data/itinerary'
import { shortDate } from '@/lib/format'
import { cn } from 'cn'

type Props = {
  activeDay: number
  today: string | null
  onSelect: (n: number) => void
}

export function DayBar({ activeDay, today, onSelect }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  // 目前這天的按鈕保持在可見範圍內
  useEffect(() => {
    // 只捲動日期列本身；用 scrollIntoView 會打斷頁面正在進行的平滑捲動
    const list = listRef.current
    const el = list?.querySelector<HTMLElement>(`[data-n="${activeDay}"]`)
    if (!list || !el) return
    list.scrollTo({ left: el.offsetLeft - (list.clientWidth - el.clientWidth) / 2, behavior: 'smooth' })
  }, [activeDay])

  return (
    <nav aria-label="切換日期" className="h-(--day-bar-h) border-b border-line bg-paper/92 backdrop-blur-md">
      <div ref={listRef} className="no-scrollbar flex h-full items-center gap-1.5 overflow-x-auto px-3 sm:justify-center">
        {DAYS.map((d) => {
          const active = d.n === activeDay
          const isToday = d.date === today
          return (
            <button
              key={d.n}
              type="button"
              data-n={d.n}
              onClick={() => onSelect(d.n)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'relative flex h-12 min-w-[3.6rem] shrink-0 flex-col items-center justify-center rounded-lg px-2 leading-tight transition-colors duration-300',
                active ? 'text-white' : 'text-ink-soft',
              )}
              style={active ? { background: d.color } : undefined}
            >
              <span className="font-latin text-[19px] font-semibold">{shortDate(d.date)}</span>
              <span className={cn('text-[12px]', active ? 'text-white/85' : 'text-ink-faint')}>{d.weekday}</span>
              {isToday && <span className="absolute top-1 right-1 size-2 rounded-full bg-vermilion ring-2 ring-paper" aria-label="今天" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DAYS, TRIP } from '@/data/itinerary'
import type { DayWeather } from '@/lib/weather'
import { jstToday } from '@/lib/format'
import { useJstToday } from '@/lib/useJstToday'
import { DayBar } from './DayBar'
import { DaySection } from './DaySection'
import { PlaceDrawer } from './PlaceDrawer'

const TripMap = dynamic(() => import('./TripMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-paper-deep" />,
})

export function Itinerary({ weather }: { weather: DayWeather[] }) {
  const [activeDay, setActiveDay] = useState(1)
  const [activeStop, setActiveStop] = useState<number | null>(null)
  const [openPlace, setOpenPlace] = useState<string | null>(null)
  const today = useJstToday()
  const sectionRef = useRef<HTMLElement>(null)
  const probeRef = useRef<HTMLDivElement>(null)

  // 今日模式：旅程期間打開網站，直接捲到今天
  useEffect(() => {
    const t = jstToday()
    if (location.hash || t < TRIP.start || t > TRIP.end) return
    const day = DAYS.find((d) => d.date === t)
    if (day) document.getElementById(`day-${day.n}`)?.scrollIntoView({ behavior: 'instant' })
  }, [])

  // 依捲動位置判斷目前在哪一天、哪一站
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const offset = probeRef.current?.offsetHeight ?? 0
      const line = offset + 48
      const days = sectionRef.current?.querySelectorAll<HTMLElement>('section[data-day]') ?? []
      let day = 1
      days.forEach((el) => {
        if (el.getBoundingClientRect().top <= line) day = Number(el.dataset.day)
      })
      const stopLine = offset + (window.innerHeight - offset) * 0.4
      let stop: number | null = null
      sectionRef.current?.querySelectorAll<HTMLElement>(`[data-day="${day}"][data-stop]`).forEach((el) => {
        if (el.getBoundingClientRect().top <= stopLine) stop = Number(el.dataset.stop)
      })
      setActiveDay(day)
      setActiveStop(stop)

      const inItinerary = (sectionRef.current?.getBoundingClientRect().top ?? 1) <= 0
      const hash = inItinerary ? `#day-${day}` : ''
      if (location.hash !== hash) history.replaceState(null, '', hash || location.pathname)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  const goToDay = useCallback((n: number) => {
    document.getElementById(`day-${n}`)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const goToStop = useCallback((n: number, index: number) => {
    sectionRef.current
      ?.querySelector(`[data-day="${n}"][data-stop="${index}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <section id="itinerary" ref={sectionRef} className="relative pb-24">
      {/* 量測 --sticky-offset 的實際像素 */}
      <div ref={probeRef} aria-hidden className="pointer-events-none invisible absolute h-(--sticky-offset) w-px" />

      <div className="sticky top-0 z-40">
        <DayBar activeDay={activeDay} today={today} onSelect={goToDay} />
      </div>

      <div className="mx-auto max-w-6xl md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10 md:px-8">
        <div className="sticky top-(--day-bar-h) z-30 h-(--map-h) border-b border-line md:order-2 md:h-[calc(100svh-var(--day-bar-h))] md:border-0 md:py-5">
          <div className="h-full overflow-hidden bg-paper-deep md:rounded-xl md:border md:border-line">
            <TripMap activeDay={activeDay} activeStop={activeStop} onSelectStop={goToStop} />
          </div>
        </div>

        <div className="px-5 md:order-1 md:px-0">
          {DAYS.map((d, i) => (
            <DaySection
              key={d.n}
              day={d}
              weather={weather[i]}
              activeStop={d.n === activeDay ? activeStop : null}
              isToday={d.date === today}
              onOpenPlace={setOpenPlace}
            />
          ))}
        </div>
      </div>

      <PlaceDrawer placeId={openPlace} onClose={() => setOpenPlace(null)} />
    </section>
  )
}

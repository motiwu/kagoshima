'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { DAYS } from '@/data/itinerary'
import { PLACES } from '@/data/places'
import { photosOf } from '@/data/photos'
import type { Hotel } from '@/data/types'
import { shortDate } from '@/lib/format'
import { AmenityTags, PlaceDrawer } from './itinerary/PlaceDrawer'
import { SectionTitle } from './SectionTitle'

/** 由每天的最後一站整理出住宿與入住日期 */
const STAYS = DAYS.slice(0, -1).reduce<{ id: string; dates: string[] }[]>((acc, d) => {
  const id = d.visits.at(-1)!.place
  const last = acc.at(-1)
  if (last?.id === id) last.dates.push(d.date)
  else acc.push({ id, dates: [d.date] })
  return acc
}, [])

export function Hotels() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <section id="hotels" className="mx-auto max-w-5xl px-5 py-24 sm:px-10 sm:py-32">
      <SectionTitle ja="今宵の宿">
        住宿與溫泉
      </SectionTitle>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {STAYS.map(({ id, dates }) => {
          const hotel = PLACES[id] as Hotel
          const cover = photosOf(id)[0]
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => setOpen(id)}
                className="group block h-full w-full overflow-hidden rounded-xl border border-line bg-card text-left"
              >
                {cover && (
                  <div className="relative aspect-[16/10] bg-paper-deep">
                    <Image src={cover.src} alt={cover.alt} fill sizes="(min-width: 640px) 480px, 100vw" className="object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <p className="text-[15px] text-bronze-deep">
                    <span className="font-latin text-xl font-semibold">{dates.map(shortDate).join('・')}</span>
                    <span className="ml-2">住 {dates.length} 晚</span>
                  </p>
                  <h3 className="mt-1 text-[1.3rem] tracking-[0.08em] text-ink">{hotel.nameZh}</h3>
                  <p className="font-serif text-[14px] tracking-[0.12em] text-ink-faint">{hotel.nameJa}</p>
                  <p className="mt-2 text-[17px] leading-[1.8] text-ink-soft">{hotel.summary}</p>
                  {hotel.amenities && (
                    <div className="mt-3">
                      <AmenityTags items={hotel.amenities} />
                    </div>
                  )}
                  <p className="mt-3 flex items-center justify-end gap-1 text-[15px] text-bronze-deep">
                    設施說明
                    <ChevronRight className="size-4" />
                  </p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <PlaceDrawer placeId={open} onClose={() => setOpen(null)} />
    </section>
  )
}

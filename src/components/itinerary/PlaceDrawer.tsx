'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { BedDouble, Clock, Coffee, ExternalLink, Sparkles, UtensilsCrossed, WashingMachine, X } from 'lucide-react'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer'
import { PLACES } from '@/data/places'
import { photosOf } from '@/data/photos'
import type { Hotel, Photo } from '@/data/types'
import { cn } from 'cn'
import { WalkingDots } from './StopCard'

type Props = { placeId: string | null; onClose: () => void }

export function PlaceDrawer({ placeId, onClose }: Props) {
  // 關閉動畫期間保留內容，不要瞬間清空
  const [shownId, setShownId] = useState(placeId)
  if (placeId && placeId !== shownId) setShownId(placeId)
  const place = shownId ? PLACES[shownId] : null
  const photos = shownId ? photosOf(shownId) : []
  const [lightbox, setLightbox] = useState<number | null>(null)

  return (
    <Drawer open={!!placeId} onOpenChange={(open) => !open && onClose()} showSwipeHandle>
      <DrawerContent className="mx-auto max-w-2xl bg-paper md:rounded-t-2xl">
        {place && (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(2rem,env(safe-area-inset-bottom))]">
            {photos.length > 0 && <Gallery key={place.id} photos={photos} onZoom={setLightbox} />}

            <div className="px-5 pt-5 sm:px-8">
              <DrawerTitle className="font-serif text-[1.6rem] font-semibold tracking-[0.1em] text-navy">{place.nameZh}</DrawerTitle>
              <DrawerDescription className="font-serif text-[15px] tracking-[0.15em] text-ink-faint">{place.nameJa}</DrawerDescription>

              {place.walking && (
                <div className="mt-4 rounded-lg bg-bronze-wash px-4 py-3">
                  <WalkingDots level={place.walking} />
                  {place.walkingNote && <p className="mt-1 text-[16px] leading-relaxed text-ink-soft">{place.walkingNote}</p>}
                </div>
              )}

              <div className="mt-5 space-y-4 text-[17px] leading-[1.95] text-ink">
                {place.detail.split(/\n\n+/).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>

              {place.kind === 'hotel' && <HotelInfo hotel={place as Hotel} />}

              {photos.length > 0 && (
                <ul className="mt-8 space-y-0.5 border-t border-line pt-3 text-[11px] leading-snug tracking-normal text-ink-faint">
                  {photos.map((p, i) => (
                    <li key={p.src}>
                      照片 {i + 1}：{p.author}／
                      <a href={p.source} target="_blank" rel="noreferrer" className="underline">
                        {p.license}
                      </a>
                      {p.source.includes('wikimedia.org') && '（Wikimedia Commons）'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        <DrawerClose
          aria-label="關閉"
          className="absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
        >
          <X className="size-5" />
        </DrawerClose>
        <Lightbox photos={photos} start={lightbox} onClose={() => setLightbox(null)} />
      </DrawerContent>
    </Drawer>
  )
}

function Gallery({ photos, onZoom }: { photos: Photo[]; onZoom: (i: number) => void }) {
  const [index, setIndex] = useState(0)
  return (
    <div className="relative">
      <div
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
        className="no-scrollbar flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto bg-paper-deep sm:aspect-[16/10]"
      >
        {photos.map((p, i) => (
          <button key={p.src} type="button" onClick={() => onZoom(i)} className="relative h-full w-full shrink-0 snap-center" aria-label={`放大照片：${p.alt}`}>
            <Image src={p.src} alt={p.alt} fill sizes="(min-width: 672px) 672px, 100vw" className="object-cover" priority={i === 0} />
          </button>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {photos.map((p, i) => (
            <span key={p.src} className={cn('h-1.5 rounded-full bg-white shadow transition-all', i === index ? 'w-5' : 'w-1.5 opacity-60')} />
          ))}
        </div>
      )}
      <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-black/40 px-3 py-0.5 text-[13px] text-white backdrop-blur">
        {photos.length > 1 ? `左右滑動・${index + 1} / ${photos.length}` : '點一下放大'}
      </span>
    </div>
  )
}

/** 全螢幕看照片；巢狀在 Drawer 裡，點擊才不會被當成「點外面」而關掉 Drawer */
function Lightbox({ photos, start, onClose }: { photos: Photo[]; start: number | null; onClose: () => void }) {
  // Popup 在 Portal 掛上後才存在，用 callback ref 在那一刻捲到點選的照片
  const scrollToStart = (el: HTMLDivElement | null) => {
    if (el && start != null) el.scrollLeft = start * el.clientWidth
  }

  return (
    <Dialog.Root open={start != null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Popup className="fixed inset-0 z-[100] bg-black outline-none" aria-label="照片">
          <div ref={scrollToStart} className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto">
            {photos.map((p) => (
              <figure key={p.src} className="relative flex h-full w-full shrink-0 snap-center items-center justify-center">
                <Image src={p.src} alt={p.alt} fill sizes="100vw" className="object-contain" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 px-5 pt-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-[15px] text-white/90">
                  {p.alt}
                </figcaption>
              </figure>
            ))}
          </div>
          <Dialog.Close
            aria-label="關閉照片"
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"
          >
            <X className="size-6" />
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function HotelInfo({ hotel }: { hotel: Hotel }) {
  return (
    <div className="mt-8 space-y-6">
      <InfoBlock icon={Clock} title="入住・退房">
        入住 {hotel.checkIn}　退房 {hotel.checkOut}
      </InfoBlock>
      {hotel.amenities && hotel.amenities.length > 0 && (
        <InfoBlock icon={WashingMachine} title="設施">
          <AmenityTags items={hotel.amenities} />
        </InfoBlock>
      )}
      {hotel.bath && (
        <InfoBlock icon={BedDouble} title="泡湯">
          <ul className="list-disc space-y-1 pl-5">
            {hotel.bath.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </InfoBlock>
      )}
      {hotel.etiquette.length > 0 && (
        <InfoBlock icon={Sparkles} title={hotel.bath ? '泡湯小提醒' : '小提醒'}>
          <ul className="list-disc space-y-1 pl-5">
            {hotel.etiquette.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </InfoBlock>
      )}
      {hotel.perks.length > 0 && (
        <InfoBlock icon={Coffee} title="可以免費使用">
          <ul className="list-disc space-y-1 pl-5">
            {hotel.perks.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </InfoBlock>
      )}
      {hotel.breakfast && (
        <InfoBlock icon={UtensilsCrossed} title="朝食">
          {hotel.breakfast}
        </InfoBlock>
      )}
      <a href={hotel.official} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[16px] text-bronze-deep underline underline-offset-4">
        飯店官網 <ExternalLink className="size-4" />
      </a>
    </div>
  )
}

function InfoBlock({ icon: Icon, title, children }: { icon: typeof Clock; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h5 className="flex items-center gap-2 font-serif text-[17px] font-semibold tracking-[0.12em] text-navy">
        <Icon className="size-[18px] text-bronze" strokeWidth={1.5} aria-hidden />
        {title}
      </h5>
      <div className="mt-1.5 text-[17px] leading-[1.85] text-ink-soft">{children}</div>
    </div>
  )
}

export function AmenityTags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((a) => (
        <li key={a} className="rounded-full border border-bronze/40 bg-bronze-wash px-3 py-0.5 text-[15px] text-bronze-deep">
          {a}
        </li>
      ))}
    </ul>
  )
}

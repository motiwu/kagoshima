import Image from 'next/image'
import { photosOf } from '@/data/photos'
import { Countdown } from './Countdown'

/** 直書的短詩：霜月的風、溫泉之鄉與火山、神話之路 */
const POEM = ['霜月の風に誘われて', '湯けむりの里と　火の山へ', '神話の道をゆく　八日間']

export function Hero() {
  const cover = photosOf('hero')[0] ?? photosOf('kyushu-hero')[0]

  return (
    <header className="relative isolate flex min-h-svh flex-col overflow-hidden bg-navy text-white">
      {cover && (
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover opacity-80"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/55 via-navy/10 to-navy/85" />

      {/* 直書標題：由右往左讀 */}
      <div className="flex flex-1 justify-end gap-5 px-6 pt-[max(3.5rem,env(safe-area-inset-top))] sm:gap-8 sm:px-14">
        <div className="vertical flex flex-col gap-3 pt-24 font-serif text-[13px] leading-[2.1] tracking-[0.3em] text-white/90 [text-shadow:0_1px_3px_rgb(5_32_50/0.9),0_0_14px_rgb(5_32_50/0.6)] sm:text-[15px]">
          {POEM.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="mr-2 text-white/60">二〇二六年　霜月十九日より</p>
        </div>

        <h1 className="vertical relative m-0 font-serif font-semibold leading-[1.35] tracking-[0.18em] [text-shadow:0_2px_18px_rgb(5_32_50/0.45)]">
          <span className="inline-block ml-3 text-[1.65rem] tracking-[0.4em] text-white/90 sm:text-3xl">南九州</span>
          <br />
          <span className="text-[2.75rem] sm:text-6xl">山の兄妹の旅</span>
        </h1>
      </div>

      <div className="flex items-end justify-between gap-6 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-14">
        <div>
          <p className="font-serif text-[15px] tracking-[0.25em] text-white/80">家族みんなで、九州へ</p>
          <p className="mt-1 font-latin text-[2rem] font-medium tracking-[0.06em] whitespace-nowrap sm:text-5xl">
            2026.11.19 <span className="text-white/60">—</span> 11.26
          </p>
          <Countdown className="mt-2 text-[17px] tracking-[0.12em] text-white/90" />
        </div>
        <a
          href="#prep"
          className="vertical flex items-center gap-3 font-serif text-sm tracking-[0.4em] text-white/85"
        >
          旅のしおり
          <span className="block h-12 w-px animate-pulse bg-white/70" />
        </a>
      </div>

      {cover && (
        <p className="absolute right-3 bottom-1 text-[10px] tracking-normal text-white/45">
          照片：{cover.author}／{cover.license}
        </p>
      )}
    </header>
  )
}

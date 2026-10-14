import { Hero } from '@/components/Hero'
import { Prep } from '@/components/Prep'
import { AreaCompare } from '@/components/AreaCompare'
import { Overview } from '@/components/Overview'
import { Hotels } from '@/components/Hotels'
import { SectionTitle } from '@/components/SectionTitle'
import { Itinerary } from '@/components/itinerary/Itinerary'
import { DAYS, TRIP } from '@/data/itinerary'
import { getForecast } from '@/lib/forecast'
import { dayWeather } from '@/lib/weather'

export default async function Home() {
  const forecast = await getForecast()
  const weather = DAYS.map((d) => dayWeather(d, forecast))

  return (
    <main>
      <Hero />
      <Prep />
      <AreaCompare />
      <Overview />
      <Hotels />

      <div className="mx-auto max-w-5xl px-5 pt-8 pb-10 sm:px-10">
        <SectionTitle ja="旅の日程">
          每日行程
        </SectionTitle>
      </div>
      <Itinerary weather={weather} />

      <footer className="bg-navy px-6 py-16 text-center text-white/80">
        <p className="font-serif text-xl tracking-[0.3em] text-white">{TRIP.title}</p>
        <p className="mt-2 font-serif text-[15px] tracking-[0.3em]">よい旅を。</p>
        <p className="mx-auto mt-8 max-w-md text-[12px] leading-relaxed tracking-normal text-white/50">
          天氣資料：Open-Meteo．地圖：OpenFreeMap © OpenStreetMap contributors．行政區界：Natural Earth．照片：Wikimedia Commons、住宿房源照片（作者標示於景點介紹）
        </p>
      </footer>
    </main>
  )
}

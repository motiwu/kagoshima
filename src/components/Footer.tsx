import { TRIP } from '@/data/itinerary'

export function Footer() {
  return (
    <footer className="bg-navy px-6 py-16 text-center text-white/80">
      <p className="font-serif text-xl tracking-[0.3em] text-white">{TRIP.title}</p>
      <p className="mt-2 font-serif text-[15px] tracking-[0.3em]">よい旅を。</p>
      <p className="mx-auto mt-8 max-w-md text-[12px] leading-relaxed tracking-normal text-white/50">
        天氣資料：Open-Meteo．地圖：OpenFreeMap © OpenStreetMap contributors．行政區界：Natural Earth．照片：Wikimedia Commons、住宿房源照片（作者標示於景點介紹）
      </p>
    </footer>
  )
}

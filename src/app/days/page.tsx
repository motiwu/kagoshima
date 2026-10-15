import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FloatingLink } from '@/components/FloatingLink';
import { Footer } from '@/components/Footer';
import { SectionTitle } from '@/components/SectionTitle';
import { Itinerary } from '@/components/itinerary/Itinerary';
import { DAYS, TRIP } from '@/data/itinerary';
import { getForecast } from '@/lib/forecast';
import { dayWeather } from '@/lib/weather';

export const metadata: Metadata = { title: `每日行程｜${TRIP.title}` };

// 回首頁的行前須知；從 LINE 直接點連結進來時沒有上一頁，一定要有
function BackLink() {
  return (
    <Link
      href="/#prep"
      className="inline-flex items-center gap-1.5 font-serif text-[17px] tracking-[0.15em] text-bronze-deep"
    >
      <ArrowLeft className="size-[18px]" strokeWidth={1.5} aria-hidden />
      旅の準備
    </Link>
  );
}

export default async function DaysPage() {
  const forecast = await getForecast();
  const weather = DAYS.map((d) => dayWeather(d, forecast));

  return (
    <main>
      <div className="mx-auto max-w-5xl px-5 pt-16 pb-10 sm:px-10">
        <SectionTitle ja="旅の日程">每日行程</SectionTitle>
      </div>
      <Itinerary weather={weather} />

      <div className="flex justify-center pb-16">
        <BackLink />
      </div>
      <Footer />
      <FloatingLink href="/#prep" label="旅の準備" direction="back" />
    </main>
  );
}

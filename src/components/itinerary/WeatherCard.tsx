import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, Snowflake, Sun, Sunrise, Sunset, Shirt } from 'lucide-react'
import { weatherLabel, type DayWeather } from '@/lib/weather'

function WeatherIcon({ code, className }: { code?: number; className?: string }) {
  if (code == null) return null
  const Icon =
    code === 0 ? Sun
    : code <= 2 ? CloudSun
    : code === 3 ? Cloud
    : code <= 48 ? CloudFog
    : code <= 57 ? CloudDrizzle
    : code <= 67 ? CloudRain
    : code <= 77 ? Snowflake
    : code <= 82 ? CloudRain
    : CloudLightning
  return <Icon className={className} strokeWidth={1.5} aria-label={weatherLabel(code)} />
}

export function WeatherCard({ w, advice = true }: { w: DayWeather; advice?: boolean }) {
  const isForecast = w.source === 'forecast'
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-bronze-wash px-4 py-2.5 text-[14px] text-ink-soft">
        <span>{isForecast ? '天氣預報' : '往年同期・近 10 年平均'}</span>
        <span className="flex shrink-0 items-center gap-3 font-latin text-[17px]">
          <span className="inline-flex items-center gap-1">
            <Sunrise className="size-4 text-bronze" strokeWidth={1.5} aria-label="日出" />
            {w.sunrise}
          </span>
          <span className="inline-flex items-center gap-1">
            <Sunset className="size-4 text-bronze" strokeWidth={1.5} aria-label="日落" />
            {w.sunset}
          </span>
        </span>
      </div>

      <ul className="divide-y divide-line/60 px-4">
        {w.segments.map((s) => (
          <li key={`${s.zone}-${s.time}`} className="flex items-center gap-3 py-2.5">
            <span className="w-11 shrink-0 text-[15px] text-ink-faint">{s.period}</span>
            <span className="min-w-0 flex-1">
              <span className="font-serif font-semibold tracking-[0.08em]">{s.name}</span>
              {s.elevation >= 400 && <span className="ml-2 text-[14px] text-ink-faint">海拔 {s.elevation} m</span>}
            </span>
            <WeatherIcon code={s.code} className="size-5 text-bronze" />
            <span className="w-12 text-right font-latin text-[1.6rem] leading-none font-medium text-navy">{s.temp}°</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[15px] text-ink-soft">
        <span>
          最高 <b className="font-latin text-lg font-semibold text-vermilion">{w.high}°</b>
        </span>
        <span>
          最低 <b className="font-latin text-lg font-semibold text-[#3E6E8E]">{w.low}°</b>
        </span>
        <span className="ml-auto">
          {/* 日本氣象用語，台灣人看得懂 */}
          降水確率 {w.rain}%
        </span>
      </div>

      {advice && (
        <div className="flex gap-3 bg-paper px-4 py-3">
          <span className="flex h-[1.625rem] shrink-0 items-center">
            <Shirt className="size-5 text-bronze" strokeWidth={1.5} aria-hidden />
          </span>
          <ul className="space-y-1 text-[16px] leading-relaxed">
            {w.advice.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

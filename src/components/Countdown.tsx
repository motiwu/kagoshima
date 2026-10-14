'use client'

import { TRIP } from '@/data/itinerary'
import { useJstToday } from '@/lib/useJstToday'

function status(today: string) {
  const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400_000)
  if (today < TRIP.start) return `距離出發還有 ${days(today, TRIP.start)} 天`
  if (today > TRIP.end) return '旅程圓滿結束，辛苦了'
  return `旅途第 ${days(TRIP.start, today) + 1} 天`
}

/** 依日本時間顯示倒數；伺服器端不渲染，避免快取的 HTML 顯示過期天數 */
export function Countdown({ className }: { className?: string }) {
  const today = useJstToday()
  const text = today && status(today)
  return <p className={className}>{text ?? ' '}</p>
}

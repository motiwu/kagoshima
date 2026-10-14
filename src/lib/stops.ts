import { DAYS } from '@/data/itinerary'
import { PLACES } from '@/data/places'
import type { Visit } from '@/data/types'

/** 當天景點的編號（飯店、碼頭不編號，重複造訪沿用第一次的號碼），地圖和卡片共用 */
export function stopNumbers(n: number) {
  const out = new Map<string, number>()
  for (const v of DAYS[n - 1].visits as readonly Visit[]) {
    const kind = PLACES[v.place].kind
    if (kind === 'hotel' || kind === 'port' || out.has(v.place)) continue
    out.set(v.place, out.size + 1)
  }
  return out
}

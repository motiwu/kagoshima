/** 無條件進位到 step 分鐘，並寫成「1 小時 20 分」 */
export function friendlyMinutes(min: number, step = 10) {
  const m = Math.max(step, Math.ceil(min / step) * step)
  const h = Math.floor(m / 60)
  const r = m % 60
  if (!h) return `${r} 分鐘`
  return r ? `${h} 小時 ${r} 分` : `${h} 小時`
}

/** 'YYYY-MM-DD' → '11/19' */
export const shortDate = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`

/** 日本時間的今天 'YYYY-MM-DD' */
export const jstToday = (now = new Date()) => new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10)

/** 1 → 1日目（台灣人看得懂的日式寫法） */
export const nichime = (n: number) => `${n}日目`

export const pad2 = (n: number) => String(n).padStart(2, '0')

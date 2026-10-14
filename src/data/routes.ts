import routes from './generated/routes.json'

export type LegMode = 'car' | 'walk' | 'bus' | 'ferry'
export type Leg = {
  from: string
  to: string
  mode: LegMode
  minutes: number
  /** 手動指定的時間，照原樣顯示不進位 */
  exact?: boolean
  km: number
  line: [number, number][]
}

export const ROUTES = routes as unknown as Record<number, { legs: Leg[] } | undefined>

export const legBetween = (day: number, from: string, to: string) =>
  ROUTES[day]?.legs.find((l) => l.from === from && l.to === to)

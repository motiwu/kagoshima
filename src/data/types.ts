export type LngLat = readonly [lng: number, lat: number]

export type StopKind = 'airport' | 'station' | 'port' | 'hotel' | 'sight' | 'food' | 'shop'

export type WeatherZoneId =
  | 'kumamoto'
  | 'hitoyoshi'
  | 'obi'
  | 'toimisaki'
  | 'nichinan'
  | 'miyakonojo'
  | 'kirishima-onsen'
  | 'ebino'
  | 'kirishima-jingu'
  | 'sakurajima'
  | 'aira'
  | 'chiran'
  | 'kagoshima'

export type WeatherZone = {
  id: WeatherZoneId
  name: string
  coord: LngLat
  /** 公尺；天氣 API 會依海拔修正氣溫 */
  elevation: number
}

export type Photo = {
  src: string
  width: number
  height: number
  alt: string
  author: string
  license: string
  source: string
}

export type Place = {
  id: string
  kind: StopKind
  nameZh: string
  nameJa: string
  coord: LngLat
  zone: WeatherZoneId
  summary: string
  /** 段落以空行分隔 */
  detail: string
  /** 1 平坦好走、2 有些坡或階梯、3 需要爬坡 */
  walking?: 1 | 2 | 3
  walkingNote?: string
}

export type Hotel = Place & {
  kind: 'hotel'
  checkIn: string
  checkOut: string
  /** 泡湯資訊，條列；沒有溫泉或大浴場就不寫 */
  bath?: string[]
  etiquette: string[]
  perks: string[]
  breakfast?: string
  official: string
  /** 設施標籤，例如大浴場、廚房、洗烘衣機 */
  amenities?: string[]
}

export type Visit = {
  place: string
  /** 'HH:mm'，預計抵達的大約時間，用來挑選該時段的氣溫 */
  time: string
  /** 顯示在卡片上的時間文字；沒有就不顯示 */
  label?: string
  note?: string
  /** 與上一站二選一：不畫路線、不算車程 */
  alt?: boolean
}

export type Day = {
  n: number
  /** 'YYYY-MM-DD'（日本時間） */
  date: string
  weekday: string
  title: string
  /** 當日主題（台灣人猜得到意思的日文） */
  theme: string
  color: string
  visits: Visit[]
  /** 不顯示穿著建議（例如抵達日只是從機場到飯店） */
  noAdvice?: boolean
  /** 不對應地點的備註，例如「超市採買，晚上自己煮」 */
  extras?: { after: string; text: string }[]
}

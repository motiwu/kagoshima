import content from './places.json'
import type { Hotel, Place, StopKind, WeatherZoneId } from './types'

/** 分類與天氣區域由我們指定；名稱、座標、介紹等內容放在 places.json */
const META = {
  'kmj-airport': { kind: 'airport', zone: 'kumamoto' },
  'kumamoto-station': { kind: 'station', zone: 'kumamoto' },
  'via-inn-kumamoto': { kind: 'hotel', zone: 'kumamoto' },
  suizenji: { kind: 'sight', zone: 'kumamoto' },
  'aoi-aso-shrine': { kind: 'sight', zone: 'hitoyoshi' },
  'paak-obi': { kind: 'hotel', zone: 'obi' },
  'obi-castle': { kind: 'sight', zone: 'obi' },
  'hattori-tei': { kind: 'food', zone: 'obi' },
  'kian-ichino': { kind: 'food', zone: 'obi' },
  toimisaki: { kind: 'sight', zone: 'toimisaki' },
  'nikoniko-shop': { kind: 'shop', zone: 'obi' },
  'udo-jingu': { kind: 'sight', zone: 'nichinan' },
  'michinoeki-phoenix': { kind: 'sight', zone: 'nichinan' },
  'aoshima-shrine': { kind: 'sight', zone: 'nichinan' },
  sekinoo: { kind: 'sight', zone: 'miyakonojo' },
  'kirishima-kokusai': { kind: 'hotel', zone: 'kirishima-onsen' },
  onamiike: { kind: 'sight', zone: 'ebino' },
  'ebino-kogen': { kind: 'sight', zone: 'ebino' },
  'shinwa-no-sato': { kind: 'sight', zone: 'kirishima-jingu' },
  'kirishima-jingu': { kind: 'sight', zone: 'kirishima-jingu' },
  'takachiho-farm': { kind: 'sight', zone: 'kirishima-jingu' },
  'touge-chaya': { kind: 'food', zone: 'kirishima-jingu' },
  'kagoshima-port': { kind: 'port', zone: 'kagoshima' },
  'sakurajima-port': { kind: 'port', zone: 'sakurajima' },
  yunohira: { kind: 'sight', zone: 'sakurajima' },
  akamizu: { kind: 'sight', zone: 'sakurajima' },
  arimura: { kind: 'sight', zone: 'sakurajima' },
  'kurokami-torii': { kind: 'sight', zone: 'sakurajima' },
  'stay-shigetomi': { kind: 'hotel', zone: 'aira' },
  'chiran-peace': { kind: 'sight', zone: 'chiran' },
  'tanokami-kitchen': { kind: 'food', zone: 'chiran' },
  'iwaya-park': { kind: 'sight', zone: 'chiran' },
  shiroyama: { kind: 'sight', zone: 'kagoshima' },
  tenmonkan: { kind: 'food', zone: 'kagoshima' },
  'sengan-en': { kind: 'sight', zone: 'kagoshima' },
  'techno-park': { kind: 'sight', zone: 'kumamoto' },
} as const satisfies Record<string, { kind: StopKind; zone: WeatherZoneId }>

export type PlaceId = keyof typeof META

type Content = Omit<Place, 'id' | 'kind' | 'zone'> & Partial<Omit<Hotel, keyof Place>>
const CONTENT = content as unknown as Record<PlaceId, Content>

export const PLACES = Object.fromEntries(
  (Object.keys(META) as PlaceId[]).map((id) => [id, { id, ...META[id], ...CONTENT[id] } as Place | Hotel]),
) as Record<string, Place | Hotel>

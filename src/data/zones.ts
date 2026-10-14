import type { WeatherZone, WeatherZoneId } from './types'

export const ZONES = {
  kumamoto: { id: 'kumamoto', name: '熊本市', coord: [130.71, 32.79], elevation: 20 },
  hitoyoshi: { id: 'hitoyoshi', name: '人吉', coord: [130.76, 32.21], elevation: 110 },
  obi: { id: 'obi', name: '飫肥', coord: [131.35, 31.63], elevation: 20 },
  toimisaki: { id: 'toimisaki', name: '都井岬', coord: [131.346, 31.367], elevation: 245 },
  nichinan: { id: 'nichinan', name: '日南海岸', coord: [131.46, 31.74], elevation: 10 },
  miyakonojo: { id: 'miyakonojo', name: '關之尾', coord: [130.988, 31.761], elevation: 165 },
  'kirishima-onsen': { id: 'kirishima-onsen', name: '霧島溫泉鄉', coord: [130.828, 31.894], elevation: 600 },
  ebino: { id: 'ebino', name: '蝦野高原', coord: [130.843, 31.946], elevation: 1180 },
  'kirishima-jingu': { id: 'kirishima-jingu', name: '霧島神宮', coord: [130.871, 31.858], elevation: 460 },
  sakurajima: { id: 'sakurajima', name: '櫻島', coord: [130.66, 31.58], elevation: 100 },
  aira: { id: 'aira', name: '重富', coord: [130.62, 31.72], elevation: 10 },
  chiran: { id: 'chiran', name: '知覽', coord: [130.44, 31.38], elevation: 150 },
  kagoshima: { id: 'kagoshima', name: '鹿兒島市', coord: [130.55, 31.59], elevation: 20 },
} as const satisfies Record<WeatherZoneId, WeatherZone>

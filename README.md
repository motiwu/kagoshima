# 南九州・山地兄妹巨嬰團

帶長輩到南九州自由行（2026/11/19–11/26）的行程網站，以 iPhone／iPad 為主要裝置。

## 開發

```bash
pnpm install
pnpm dev        # 會先把 MapLibre worker 複製到 public/
```

## 改行程

- 行程、時間、備註：`src/data/itinerary.ts`
- 地點名稱、座標、介紹、飯店資訊：`src/data/places.json`（分類與天氣區域在 `src/data/places.ts`）
- 天氣區域與海拔：`src/data/zones.ts`

改了地點或行程順序後，重新產生路線與地圖：

```bash
pnpm data:routes   # OSRM 計算各路段車程（約 1 秒一段）
pnpm data:geo      # 面積比較圖與八天總覽圖（需要 .cache/ne_admin1.geojson）
```

`.cache/ne_admin1.geojson` 來自 Natural Earth：
`https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson`

其他資料腳本：

| 指令 | 產生 |
| --- | --- |
| `pnpm data:climate` | `src/data/generated/climate.json`，各區域近 10 年 11/19–26 的平均天氣 |
| `pnpm data:map-style` | `public/map-style.json`，和紙色系的地圖樣式 |
| `pnpm tsx scripts/import-content.mts <stops.json> <images/>` | 匯入景點介紹與照片 |

## 天氣

出發前 16 天以外顯示「往年同期」；進入預報範圍後，伺服器每 3 小時向 Open-Meteo 抓一次預報（`src/lib/forecast.ts`）。

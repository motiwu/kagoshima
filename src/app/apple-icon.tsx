import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** 加入主畫面的圖示：夕陽與櫻島的剪影 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#052032', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 92, top: 38, width: 52, height: 52, borderRadius: 26, background: '#b5523b' }} />
        <svg width="180" height="180" viewBox="0 0 64 64" style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d="M0 52 L20 30 Q25 25 30 30 L37 38 L43 33 Q46 31 49 34 L64 52 Z" fill="#faf8f4" />
          <path d="M0 52 H64" stroke="#897658" strokeWidth="1.5" />
        </svg>
      </div>
    ),
    size,
  )
}

import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Noto_Serif_TC } from 'next/font/google';
import { TRIP } from '@/data/itinerary';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

// 只在沒有ヒラギノ明朝的裝置才會用到，不需要預先載入
const notoSerif = Noto_Serif_TC({
  weight: ['500', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
  preload: false,
});

const description = `${TRIP.subtitle}｜2026.11.19 – 11.26`;

export const metadata: Metadata = {
  title: TRIP.title,
  description,
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    siteName: '南九州・山の兄妹の旅',
    title: '南九州・山の兄妹の旅',
    description,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: false, follow: false },
  appleWebApp: { title: '南九州', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#faf8f4',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-Hant-TW"
      className={`${cormorant.variable} ${notoSerif.variable}`}
    >
      <body className="washi min-h-dvh">{children}</body>
    </html>
  );
}

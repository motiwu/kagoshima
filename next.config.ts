import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // 開發時用 iPhone 透過區網 IP 連線測試；只影響 next dev
  allowedDevOrigins: ["192.168.*.*"],
  partialPrefetching: true,
  // 不讓搜尋引擎收錄：<meta robots> 只管網頁，照片等檔案要靠這個標頭
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noimageindex" }] }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

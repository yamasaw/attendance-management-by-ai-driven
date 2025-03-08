import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// 開発環境でのCloudflareバインディングの初期化
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    serverMinification: false,
  },
  images: {
    unoptimized: true, // Cloudflareでの最適化を無効化
  },
  typescript: {
    // TypeScriptの型チェックを無効化
    ignoreBuildErrors: true,
  },
};

export default nextConfig; 
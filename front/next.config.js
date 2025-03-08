/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true, // Cloudflareでの最適化を無効化
  },
  // Cloudflareでは完全なSSR機能が制限されるため、アプリ全体でEdgeランタイムを使用
  experimental: {
    runtime: 'edge',
  },
};

module.exports = nextConfig; 
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.saraminbanner.co.kr' },
      { protocol: 'https', hostname: 'www2.saraminbanner.co.kr' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'static.toss.im' }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // ✅ 캐시 문제 해결: 개발 환경 최적화
  experimental: {
    // 서버 액션 활성화 (Next.js 15 권장)
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
};

export default nextConfig;

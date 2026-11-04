import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    // Showreels and brand files change name when they change, so browsers can keep them for a long time.
    const longCache = [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }];
    return [
      { source: '/media/:path*', headers: longCache },
      { source: '/brand/:path*', headers: longCache },
    ];
  },
};

export default nextConfig;

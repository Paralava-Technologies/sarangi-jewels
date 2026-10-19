import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const apiPort = process.env.API_PORT || '3001';

const nextConfig: NextConfig = {
  // Only enable standalone output when explicitly building for Docker
  output: process.env.NEXT_STANDALONE === 'true' ? 'standalone' : undefined,

  transpilePackages: ['@sarangi/api-client', '@sarangi/shared-types', '@sarangi/ui-tokens'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'http',  hostname: 'localhost',   port: '9000' },
      { protocol: 'http',  hostname: 'localhost',   port: '3001' },
      { protocol: 'http',  hostname: 'localhost',   port: '3007' },
      { protocol: 'http',  hostname: 'localhost',   port: '4000' },
      { protocol: 'http',  hostname: 'localhost',   port: '3000' },
      // Production MinIO / S3 CDN
      { protocol: 'https', hostname: 'media.sarangijewels.com' },
      { protocol: 'https', hostname: 's3.noeve.store' },
      { protocol: 'https', hostname: 'sarangi-api.noevecreations.com' },
      { protocol: 'https', hostname: 'sarangi-api.noeve.store' },
    ],
  },
  async headers() {
    if (!isProd) return [];
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/public/:path*',
        destination: `http://localhost:${apiPort}/public/:path*`,
      },
    ];
  },
};

export default nextConfig;


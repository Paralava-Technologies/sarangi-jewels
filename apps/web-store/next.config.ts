import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Required for Docker multi-stage standalone build
  output: isProd ? 'standalone' : undefined,

  transpilePackages: ['@noeve/api-client', '@noeve/shared-types', '@noeve/ui-tokens'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'http',  hostname: 'localhost',   port: '9000' },
      { protocol: 'http',  hostname: 'localhost',   port: '3001' },
      { protocol: 'http',  hostname: 'localhost',   port: '4000' },
      { protocol: 'http',  hostname: 'localhost',   port: '3000' },
      // Production MinIO / S3 CDN
      { protocol: 'https', hostname: 'media.sarangijewels.com' },
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
        destination: 'http://localhost:3001/public/:path*',
      },
    ];
  },
};

export default nextConfig;


import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Required for Docker multi-stage standalone build
  output: isProd ? 'standalone' : undefined,

  transpilePackages: ['@sarangi/api-client', '@sarangi/shared-types', '@sarangi/ui-tokens'],
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
};

export default nextConfig;

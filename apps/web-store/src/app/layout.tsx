import type { Metadata } from 'next';
import { CartProvider } from '@/components/cart/cart-provider';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import './globals.css';
import React from 'react';

export const metadata: Metadata = {
  title: 'Sarangi Jewels — Considered Fashion, Beauty & Lifestyle',
  description: 'Sarangi Jewels — fewer pieces, finer ones. Considered apparel, beauty and lifestyle objects designed to outlast the season.',
  keywords: 'luxury, fashion, beauty, lifestyle, apparel, jewelry, sarangi jewels, sarangijewels.com',
  openGraph: {
    title: 'Sarangi Jewels — Considered Fashion, Beauty & Lifestyle',
    description: 'Sarangi Jewels — fewer pieces, finer ones. Considered apparel, beauty and lifestyle objects designed to outlast the season.',
    url: 'https://sarangijewels.com',
    siteName: 'Sarangi Jewels',
    images: [
      {
        url: 'https://sarangijewels.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Sarangi Jewels Store',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sarangi Jewels — Considered Fashion, Beauty & Lifestyle',
    description: 'Sarangi Jewels — fewer pieces, finer ones. Considered apparel, beauty and lifestyle objects designed to outlast the season.',
    images: ['https://sarangijewels.com/images/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({ children }: { children: any }): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <NextTopLoader color="var(--oxblood)" showSpinner={false} height={4} />
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}

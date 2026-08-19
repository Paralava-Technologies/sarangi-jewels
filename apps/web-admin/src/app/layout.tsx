import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sarangi Jewels Admin',
  description: 'Manage orders, products, and fulfillment',
};

import React from 'react';

export default function RootLayout({ children }: any): React.JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

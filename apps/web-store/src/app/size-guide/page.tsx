import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Size Guide | SARANGI',
  description: 'Size Guide for SARANGI apparel.',
};

export default function SizeGuidePage() {
  return (
    <main className="wrap pb-20">
      <div className="page-head">
        <div className="eyebrow">Support</div>
        <h1>Size Guide</h1>
      </div>
      <div className="max-w-3xl">
        <p className="text-[rgba(33,29,25,0.78)] mb-4">
          Find your perfect fit. Our apparel is designed with a relaxed, modern silhouette. 
        </p>
        <p className="text-[rgba(33,29,25,0.78)] mb-4">
          Detailed sizing charts and measurement guides will be available here soon. For specific product inquiries, please refer to the &quot;Fit &amp; Sizing&quot; tab on the product detail page.
        </p>
      </div>
    </main>
  );
}

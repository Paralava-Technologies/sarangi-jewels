import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Sarangi Jewels | NOEVE',
  description: 'About the NOEVE brand.',
};

export default function AboutPage() {
  return (
    <main className="wrap pb-20">
      <div className="page-head">
        <div className="eyebrow">Studio</div>
        <h1>About Sarangi Jewels</h1>
      </div>
      <div className="max-w-3xl">
        <p className="text-[rgba(33,29,25,0.78)] mb-4">
          We don&apos;t chase seasons. We build the pieces that outlast them. NOEVE is a design studio focused on considered fashion, beauty, and lifestyle.
        </p>
        <p className="text-[rgba(33,29,25,0.78)] mb-4">
          Born from a desire for fewer, finer things, NOEVE curates collections for the woman who buys once and buys well. Our garments are cut to move and built to keep, using premium materials like silk, wool, and linen.
        </p>
      </div>
    </main>
  );
}

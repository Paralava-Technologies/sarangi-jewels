import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mission | SARANGI',
  description: 'The Mission of SARANGI.',
};

export default function MissionPage() {
  return (
    <main className="wrap pb-20">
      <div className="page-head">
        <div className="eyebrow">Studio</div>
        <h1>Our Mission</h1>
      </div>
      <div className="max-w-3xl">
        <p className="text-[rgba(33,29,25,0.78)] mb-4">
          Our mission is to craft exceptionally well-made apparel, beauty, and lifestyle products that simplify daily life and elevate the everyday experience.
        </p>
        <p className="text-[rgba(33,29,25,0.78)] mb-4">
          We are committed to transparent sourcing, thoughtful design, and uncompromising quality. We believe in doing less, but doing it significantly better.
        </p>
      </div>
    </main>
  );
}

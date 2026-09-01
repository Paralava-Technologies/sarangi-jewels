import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sustainability | SARANGI',
  description: 'Sustainability practices at SARANGI.',
};

export default function SustainabilityPage() {
  return (
    <main className="wrap pb-20">
      <div className="page-head">
        <div className="eyebrow">Studio</div>
        <h1>Sustainability</h1>
      </div>
      <div className="max-w-3xl">
        <p className="text-[rgba(33,29,25,0.78)] mb-4">
          Sustainability is woven into the fabric of SARANGI. By creating fewer pieces of finer quality, we inherently reject the fast fashion cycle.
        </p>
        <p className="text-[rgba(33,29,25,0.78)] mb-4">
          We source natural, biodegradable materials whenever possible and work with manufacturing partners who share our commitment to ethical labor practices and environmental responsibility.
        </p>
      </div>
    </main>
  );
}

import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gift Cards | SARANGI',
  description: 'Purchase SARANGI gift cards.',
};

export default function GiftCardsPage() {
  return (
    <main className="wrap pb-20">
      <div className="page-head">
        <div className="eyebrow">Shop</div>
        <h1>Gift Cards</h1>
      </div>
      <div className="max-w-3xl">
        <p className="text-[rgba(33,29,25,0.78)] mb-4">
          SARANGI gift cards are the perfect gift for someone who appreciates considered fashion, beauty, and lifestyle. Our gift cards are delivered by email and contain instructions to redeem them at checkout.
        </p>
        <p className="text-[rgba(33,29,25,0.78)] mb-4">
          Coming soon.
        </p>
      </div>
    </main>
  );
}

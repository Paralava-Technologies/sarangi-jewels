import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers | SARANGI',
  description: 'Careers at SARANGI.',
};

export default function CareersPage() {
  return (
    <main className="wrap pb-20">
      <div className="page-head">
        <div className="eyebrow">Studio</div>
        <h1>Careers</h1>
      </div>
      <div className="max-w-3xl">
        <p className="text-[rgba(33,29,25,0.78)] mb-4">
          Join the team building the future of considered luxury. We are always looking for passionate, detail-oriented individuals to join our studio.
        </p>
        <p className="text-[rgba(33,29,25,0.78)] mb-4">
          Currently, there are no open positions. Please check back later or send your portfolio to careers@sarangijewels.com.
        </p>
      </div>
    </main>
  );
}

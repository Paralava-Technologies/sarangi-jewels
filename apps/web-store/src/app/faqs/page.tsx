import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQs | SARANGI',
  description: 'Frequently Asked Questions about SARANGI.',
};

export default function FAQsPage() {
  return (
    <main className="wrap pb-20">
      <div className="page-head">
        <div className="eyebrow">Support</div>
        <h1>FAQs</h1>
      </div>
      <div className="max-w-3xl">
        <h3 className="font-display text-xl mb-2">When will my order ship?</h3>
        <p className="text-[rgba(33,29,25,0.78)] mb-6">
          Orders are typically processed and shipped within 1-2 business days. You will receive a tracking link via email once your order has been dispatched.
        </p>
        
        <h3 className="font-display text-xl mb-2">Do you ship internationally?</h3>
        <p className="text-[rgba(33,29,25,0.78)] mb-6">
          Currently, we ship within India. We are working on expanding our logistics to support international shipping in the near future.
        </p>
        
        <h3 className="font-display text-xl mb-2">What is your return policy?</h3>
        <p className="text-[rgba(33,29,25,0.78)] mb-6">
          We accept returns within 30 days of delivery for unworn, unwashed items in their original condition. For more details, please visit our Returns Policy page.
        </p>
      </div>
    </main>
  );
}

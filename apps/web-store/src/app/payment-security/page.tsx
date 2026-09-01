import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Security | SARANGI',
  description: 'Information regarding secure payments at SARANGI store.',
};

export default function PaymentSecurityPage() {
  return (
    <main className="wrap pb-20">
      <div className="page-head">
        <div className="eyebrow">Trust & Safety</div>
        <h1>Payment Security</h1>
      </div>

      <div className="max-w-3xl">
        <section className="mb-10">
          <p className="text-[rgba(33,29,25,0.78)] mb-6 text-lg">
            At SARANGI, your trust and security are our highest priorities. We employ industry-leading standards to ensure that your shopping experience is safe and your personal information is protected.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">100% Secure Transactions</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            All transactions on SARANGI are processed through a secure payment gateway. We use 256-bit Secure Sockets Layer (SSL) encryption to protect your personal and payment details during the checkout process.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">Payment Methods</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            We accept all major credit and debit cards, Net Banking, UPI, and select digital wallets. All our payment partners are PCI-DSS compliant, ensuring the highest level of security for your financial data.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">No Storage of Card Details</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            SARANGI does not store your complete credit card information on our servers. When you choose to save a card for faster checkout, it is tokenized and securely stored by our certified payment gateway partners.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">Fraud Prevention</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            We utilize advanced fraud detection systems to monitor transactions for suspicious activity. You may occasionally be asked to verify your identity to protect your account from unauthorized use.
          </p>
        </section>
      </div>
    </main>
  );
}

import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return Policy | SARANGI',
  description: 'Returns and exchange policy for SARANGI apparel, beauty, and lifestyle products.',
};

export default function ReturnPolicyPage() {
  return (
    <main className="wrap pb-20">
      <div className="page-head">
        <div className="eyebrow">Customer Care</div>
        <h1>Return Policy</h1>
      </div>

      <div className="max-w-3xl">
        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">Our Commitment</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            At SARANGI, we curate considered fashion, beauty, and lifestyle pieces designed to outlast the season. If a piece isn&apos;t quite right for you, our returns policy ensures a seamless experience. 
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">14-Day Return Window</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            You have 14 days from the date of delivery to initiate a return or exchange for eligible items. 
          </p>
          <ul className="list-disc pl-5 text-[rgba(33,29,25,0.78)] space-y-2">
            <li><strong>Apparel:</strong> Must be unworn, unwashed, and have all original tags attached.</li>
            <li><strong>Beauty:</strong> Products must be unopened and in their original packaging for hygiene reasons.</li>
            <li><strong>Lifestyle:</strong> Items must be returned in perfect condition with original packaging.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">Non-Returnable Items</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            Certain items cannot be returned due to hygiene or personalized nature:
          </p>
          <ul className="list-disc pl-5 text-[rgba(33,29,25,0.78)] space-y-2">
            <li>Intimates, swimwear, and pierced jewelry.</li>
            <li>Opened beauty or skincare products.</li>
            <li>Customized or made-to-order pieces.</li>
            <li>Items marked as &quot;Final Sale&quot;.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">How to Initiate a Return</h2>
          <ol className="list-decimal pl-5 text-[rgba(33,29,25,0.78)] space-y-2">
            <li>Log into your SARANGI account and navigate to &quot;Order Status&quot;.</li>
            <li>Select the items you wish to return and state the reason.</li>
            <li>Pack the items securely in their original packaging.</li>
            <li>Our courier partner will pick up the package within 2-3 business days.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-4">Refunds</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            Once your return is received and inspected by our studio, your refund will be processed within 5-7 business days. The credit will automatically be applied to your original method of payment.
          </p>
        </section>
      </div>
    </main>
  );
}

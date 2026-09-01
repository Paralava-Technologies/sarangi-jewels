import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | SARANGI',
  description: 'Terms and conditions for using the SARANGI web store.',
};

export default function TermsOfUsePage() {
  return (
    <main className="wrap pb-20">
      <div className="page-head">
        <div className="eyebrow">Legal</div>
        <h1>Terms of Use</h1>
      </div>

      <div className="max-w-3xl">
        <section className="mb-10">
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            Welcome to SARANGI. By accessing or using our website, you agree to comply with and be bound by the following Terms of Use. Please read them carefully.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">1. General</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            The platform is operated by SARANGI, a complete ladies&apos; store offering premium apparel, beauty, and lifestyle products. The terms &quot;we&quot;, &quot;us&quot;, and &quot;our&quot; refer to SARANGI.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">2. Product Accuracy</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            We have made every effort to display as accurately as possible the colors and images of our products. However, we cannot guarantee that your computer monitor&apos;s display of any color will be accurate. All descriptions of products or product pricing are subject to change at any time without notice.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">3. User Conduct</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service without express written permission by us.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">4. Intellectual Property</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            All content included on this site, such as text, graphics, logos, images, and software, is the property of SARANGI or its content suppliers and protected by international copyright laws.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-4">5. Modifications to the Service</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the Service.
          </p>
        </section>
      </div>
    </main>
  );
}

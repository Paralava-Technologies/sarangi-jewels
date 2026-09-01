import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | SARANGI',
  description: 'Privacy Policy for the SARANGI online store.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="wrap pb-20">
      <div className="page-head">
        <div className="eyebrow">Legal</div>
        <h1>Privacy Policy</h1>
      </div>

      <div className="max-w-3xl">
        <section className="mb-10">
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            SARANGI respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">Data We Collect</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-5 text-[rgba(33,29,25,0.78)] space-y-2">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Financial Data:</strong> includes payment card details (processed securely via our partners).</li>
            <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">How We Use Your Data</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-5 text-[rgba(33,29,25,0.78)] space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you (processing your orders).</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">Data Security</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
          </p>
        </section>
      </div>
    </main>
  );
}

import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'E-Waste Compliance | SARANGI',
  description: 'E-Waste compliance and disposal guidelines for SARANGI lifestyle products.',
};

export default function EWasteCompliancePage() {
  return (
    <main className="wrap pb-20">
      <div className="page-head">
        <div className="eyebrow">Sustainability</div>
        <h1>E-Waste Compliance</h1>
      </div>

      <div className="max-w-3xl">
        <section className="mb-10">
          <p className="text-[rgba(33,29,25,0.78)] mb-4 text-lg">
            As a brand committed to considered lifestyle and sustainability, SARANGI takes its environmental responsibilities seriously.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">Our Commitment</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            In accordance with E-waste (Management) Rules, SARANGI ensures the environmentally sound management of all electrical and electronic equipment (EEE) sold on our platform, including lifestyle accessories, beauty tools, and smart wearables.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">What is E-Waste?</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            E-waste refers to old, end-of-life or discarded electronic appliances. Improper disposal of e-waste can harm the environment and human health due to the toxic materials they may contain.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">How to Dispose of E-Waste</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            We urge our customers not to dispose of electronic products in regular municipal waste bins. Look for the &quot;crossed-out wheeled bin&quot; symbol on the product or packaging, which indicates it should not be treated as normal household waste.
          </p>
          <ul className="list-disc pl-5 text-[rgba(33,29,25,0.78)] space-y-2">
            <li>Drop off the product at an authorized e-waste collection center.</li>
            <li>Contact our support team for guidance on recycling SARANGI electronic products.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-4">Contact Us</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            For more information on e-waste collection and recycling, please contact our support desk at <a href="mailto:sustainability@sarangijewels.com" className="underline">sustainability@sarangijewels.com</a>.
          </p>
        </section>
      </div>
    </main>
  );
}

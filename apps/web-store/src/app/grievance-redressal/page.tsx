import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grievance Redressal | NOEVE',
  description: 'Grievance Redressal Mechanism for NOEVE store.',
};

export default function GrievanceRedressalPage() {
  return (
    <main className="wrap pb-20">
      <div className="page-head">
        <div className="eyebrow">Customer Care</div>
        <h1>Grievance Redressal</h1>
      </div>

      <div className="max-w-3xl">
        <section className="mb-10">
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            At NOEVE, we believe in providing a premium experience not just in our products, but in our service. If your experience has fallen short of expectations, our Grievance Redressal Mechanism is here to help resolve your concerns promptly and fairly.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">Level 1: Customer Support</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            Your first point of contact for any concerns regarding your order, products, or experience should be our dedicated Customer Care team.
          </p>
          <ul className="text-[rgba(33,29,25,0.78)] space-y-2 mb-4">
            <li><strong>Email:</strong> support@sarangijewels.com</li>
            <li><strong>Response Time:</strong> Within 24-48 business hours.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">Level 2: Grievance Officer</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            If your query remains unresolved after contacting Level 1 support, or if you are dissatisfied with the resolution provided, you may escalate the matter to our Grievance Officer. 
          </p>
          <div className="bg-cream border border-[rgba(33,29,25,0.1)] p-6 mt-4">
            <h3 className="font-mono text-sm uppercase tracking-widest text-champagne mb-2">Grievance Officer Details</h3>
            <p className="text-[rgba(33,29,25,0.78)] mb-1"><strong>Name:</strong> Ms. N. Sharma</p>
            <p className="text-[rgba(33,29,25,0.78)] mb-1"><strong>Email:</strong> grievance@sarangijewels.com</p>
            <p className="text-[rgba(33,29,25,0.78)] text-sm mt-4">
              *Please include your order number and previous ticket ID when escalating your issue.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-4">Resolution Timeline</h2>
          <p className="text-[rgba(33,29,25,0.78)] mb-4">
            We aim to resolve all grievances within a maximum of 30 days from the date of receipt, in accordance with applicable consumer protection guidelines.
          </p>
        </section>
      </div>
    </main>
  );
}

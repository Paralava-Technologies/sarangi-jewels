import React from 'react';
import type { Metadata } from 'next';
import { SJPageBanner, SJSectionHead } from '@/components/atomic/SJHomeComponents';
import { SJProductCard } from '@/components/atomic/SJProductCard';
import { MakeupBookingForm } from '@/components/MakeupBookingForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Makeup Kits & Artist Booking — Sarangi Jewels',
};

import { getMakeupPackages } from '@/lib/api';

export default async function MakeupPage() {
  const packages = await getMakeupPackages();
  const activePackages = packages.filter((pkg) => pkg.isActive);

  return (
    <>
      <SJPageBanner 
        crumbs="Home / Rentals / Makeup" 
        title="Makeup Kits & Artist Booking" 
        desc="Complete the look — in studio or at your doorstep" 
      />

      <section className="section">
        <div className="container">
          <SJSectionHead eyebrow="Choose A Service" title="Makeup For Every Occasion" />
          <div className="product-grid">
            {activePackages.length === 0 ? (
              <p className="text-neutral-500 col-span-full text-center">No packages available at the moment.</p>
            ) : (
              activePackages.map((pkg) => (
                <SJProductCard 
                  key={pkg.id}
                  product={{
                    id: pkg.id,
                    slug: pkg.slug,
                    name: pkg.title,
                    basePriceCents: pkg.priceCents,
                    currency: pkg.currency,
                    material: null,
                    purity: null,
                    gemstone: null,
                    weightGrams: null,
                    careInstructions: null,
                    images: pkg.imageUrl ? [{ id: '1', url: pkg.imageUrl, alt: pkg.title }] : [],
                    variants: [],
                    description: pkg.description,
                  }} 
                  glyph="💄" 
                  href={`/makeup/${pkg.slug}`}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ maxWidth: '760px' }}>
          <SJSectionHead eyebrow="Book An Artist" title="Reserve Your Session" />
          <MakeupBookingForm />
        </div>
      </section>

      <section className="section section-dark">
        <div className="container" style={{ textAlign: 'center', maxWidth: '640px' }}>
          <p className="eyebrow" style={{ color: 'var(--gold-light)' }}>Pair It With</p>
          <h2 style={{ color: 'var(--ivory)', fontSize: '2rem', margin: '14px 0 16px' }}>Bridal Jewellery &amp; Dance Costumes</h2>
          <p style={{ color: 'var(--ivory-deep)', marginBottom: '30px' }}>Book your makeup session alongside a rented bridal set or dance costume and have the full look arrive together.</p>
          <div className="hero-ctas">
            <Link href="/rentals#bridal" className="btn btn-ghost-light">Browse Bridal Sets</Link>
            <Link href="/shop" className="btn btn-ghost-light">Browse Dance Costumes</Link>
          </div>
        </div>
      </section>
    </>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import { SJPageBanner, SJSectionHead } from '@/components/atomic/SJHomeComponents';

export const metadata: Metadata = {
  title: 'Our Story — Sarangi Jewels',
  description: 'Where Tradition Meets Timeless Grace.',
};

export default function AboutPage() {
  return (
    <>
      <SJPageBanner crumbs="Home / Our Story" title="Where Tradition Meets Timeless Grace" />

      <section className="section">
        <div className="container story">
          <div className="story-media frame"></div>
          <div>
            <p className="eyebrow">Est. Kochi</p>
            <h2>A Family Counter That Became A Trusted Wardrobe</h2>
            <p>Sarangi began as a small jewellery counter on MG Road, Kochi, built on temple-inspired kemp work and a reputation for honesty in every setting. Neighbours came not only to buy their daughter&apos;s wedding set, but to borrow a piece for a single function — a habit that grew into our rental wardrobe.</p>
            <p>Today Sarangi is both: a fine and imitation jewellery boutique for pieces you&apos;ll pass down, and a rental house for bridal sets, classical dance costumes and bridal makeup — because not every grand occasion needs a permanent purchase.</p>
            <div className="stat-row">
              <div className="stat"><h3>15+</h3><span>Years In Kochi</span></div>
              <div className="stat"><h3>4,200+</h3><span>Pieces In Rotation</span></div>
              <div className="stat"><h3>9,800+</h3><span>Happy Occasions</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SJSectionHead eyebrow="What Guides Us" title="Our Promise" />
          <div className="cat-grid">
            <div className="cat-card"><div className="cat-icon">&#10003;</div><h4>Nickel-Free Base</h4><span>Skin-safe on every piece</span></div>
            <div className="cat-card"><div className="cat-icon">&#128736;</div><h4>Inspected In-House</h4><span>Before every sale &amp; rental</span></div>
            <div className="cat-card"><div className="cat-icon">&#128230;</div><h4>Sanitised Returns</h4><span>Every rental professionally cleaned</span></div>
            <div className="cat-card"><div className="cat-icon">&#9829;</div><h4>Honest Pricing</h4><span>No hidden rental fees</span></div>
          </div>
        </div>
      </section>
    </>
  );
}

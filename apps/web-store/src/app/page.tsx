import { ProductGrid } from '@/components/store/product-grid';
import { getCategories, getProducts } from '@/lib/api';
import { NewsletterForm } from '@/components/store/newsletter-form';
import Link from 'next/link';
import React from 'react';

export default async function HomePage(): Promise<React.JSX.Element> {
  const [, products] = await Promise.all([getCategories(), getProducts()]);
  const featured = products.slice(0, 8);

  return (
    <>
      <div className="wrap">
        {/* Hero */}
        <section className="hero">
          <div>
            <span className="tag">New Season</span>
            <h1 className="hero__title">Fewer pieces.<br/>Finer <em>ones.</em></h1>
            <p className="hero__sub">Considered apparel, beauty and home objects — for the woman who buys once, and buys well.</p>
            <div className="hero__ctas">
              <Link href="#edit" className="btn btn--primary">Shop The Edit</Link>
              <Link href="#pillars" className="btn btn--outline">Explore Categories</Link>
            </div>
          </div>
          <div className="hero__art">
            <span className="tag tag--two">No. 026 — Drop One</span>
            <svg viewBox="0 0 560 660" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="fold1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#DCD3C2"/><stop offset="100%" stopColor="#B89B6E"/></linearGradient>
                <linearGradient id="fold2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F6F1E8"/><stop offset="100%" stopColor="#DCD3C2"/></linearGradient>
                <linearGradient id="fold3" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#6B2230"/><stop offset="100%" stopColor="#8a3744"/></linearGradient>
              </defs>
              <path d="M60 40 C200 10, 380 90, 420 230 C460 370, 320 420, 260 540 C220 620, 140 640, 90 600 C30 555, 80 470, 150 420 C230 365, 250 280, 190 210 C130 140, 20 120, 60 40 Z" fill="url(#fold1)"/>
              <path d="M340 20 C440 60, 520 180, 480 300 C440 420, 320 400, 300 500 C285 575, 360 620, 440 600 L520 640 L540 80 Z" fill="url(#fold2)" opacity="0.9"/>
              <path d="M120 480 C160 440, 230 450, 250 510 C268 565, 210 610, 160 600 C112 590, 90 515, 120 480 Z" fill="url(#fold3)"/>
            </svg>
          </div>
        </section>

        {/* Pillars */}
        <section className="pillars" id="pillars">
          <div className="section-head">
            <h2>Three worlds, one edit</h2>
            <p className="eyebrow">Apparel · Beauty · Lifestyle</p>
          </div>
          <div className="pillars__grid">
            <div className="pillar pillar--apparel">
              <span className="pillar__tag tag">Apparel</span>
              <h3 className="pillar__title">Cut to move,<br/>built to keep.</h3>
              <p className="pillar__desc">Silk, wool and linen pieces made for daily wear, not one season.</p>
              <Link href="/shop?category=apparel" className="pillar__link">Shop Apparel <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
            </div>
            <div className="pillar pillar--beauty">
              <span className="pillar__tag tag">Beauty</span>
              <h3 className="pillar__title">Skincare that<br/>does less, better.</h3>
              <p className="pillar__desc">Short formulas, fewer steps, results you can actually see.</p>
              <Link href="/shop?category=beauty" className="pillar__link">Shop Beauty <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
            </div>
            <div className="pillar pillar--lifestyle">
              <span className="pillar__tag tag">Lifestyle</span>
              <h3 className="pillar__title">Objects worth<br/>living with.</h3>
              <p className="pillar__desc">Ceramics, candles and small things that earn their shelf space.</p>
              <Link href="/shop?category=lifestyle" className="pillar__link">Shop Lifestyle <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
            </div>
          </div>
        </section>

        {/* Product edit */}
        <section className="edit" id="edit">
          <div className="section-head">
            <h2>The current edit</h2>
            <p className="eyebrow">Five pieces, right now</p>
          </div>
          <ProductGrid products={featured} />
        </section>
      </div>

      {/* Testimonials */}
      <section className="testimonials wrap">
        <div className="section-head">
          <h2>Loved, in their words</h2>
          <p className="eyebrow">From verified buyers</p>
        </div>
        <div className="testimonials__grid">
          <div className="testimonial">
            <span className="testimonial__stars">★★★★★</span>
            <p className="testimonial__quote">I bought one shirt to test the brand. I now own four — the fabric only gets better with washing.</p>
            <div className="testimonial__byline">
              <span className="testimonial__name">Maren K. — Copenhagen, DK</span>
              <span className="tag">Verified Buyer</span>
            </div>
          </div>
          <div className="testimonial">
            <span className="testimonial__stars">★★★★★</span>
            <p className="testimonial__quote">The repair serum cleared up texture I&apos;d been fighting for two years, in about six weeks.</p>
            <div className="testimonial__byline">
              <span className="testimonial__name">Priya S. — London, UK</span>
              <span className="tag">Verified Buyer</span>
            </div>
          </div>
          <div className="testimonial">
            <span className="testimonial__stars">★★★★☆</span>
            <p className="testimonial__quote">Everything arrives wrapped like it matters. The wrap coat alone earns the price tag.</p>
            <div className="testimonial__byline">
              <span className="testimonial__name">Helena O. — New York, US</span>
              <span className="tag">Verified Buyer</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="quote">
        <div className="wrap">
          <div className="quote__hairline" />
          <p className="quote__text">We don&apos;t chase seasons. We build the pieces that outlast them.</p>
          <p className="quote__byline">— The Sarangi Jewels Studio</p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter" id="newsletter">
        <div className="wrap">
          <span className="eyebrow">Stay Close</span>
          <h2>Join the list</h2>
          <p>First access to new drops, early entry to sales, and a short note from the studio — once a month, never more.</p>
          <NewsletterForm />
          <p className="newsletter__fine">By joining, you agree to receive marketing emails. Unsubscribe anytime.</p>
        </div>
      </section>
    </>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';

export function SJSplitCard({ type = "buy", tag, title, desc, link, linkText }: any) {
  return (
    <Link href={link} className={`split-card ${type}`}>
      <span className="tag">{tag}</span>
      <h2>{title}</h2>
      <p>{desc}</p>
      <span className="btn btn-ghost-light">{linkText}</span>
    </Link>
  );
}

export function SJCatCard({ href, icon, title, subtitle }: any) {
  return (
    <Link href={href} className="cat-card">
      <div className="cat-icon">{icon}</div>
      <h4>{title}</h4>
      <span>{subtitle}</span>
    </Link>
  );
}

export function SJTestiCard({ stars = "★★★★★", quote, who }: any) {
  return (
    <div className="testi-card">
      <div className="stars">{stars}</div>
      <p>{quote}</p>
      <div className="who">{who}</div>
    </div>
  );
}

export function SJRentStep({ num, title, desc }: any) {
  return (
    <div className="rent-step">
      <div className="num">{num}</div>
      <h4 style={{ color: 'var(--ivory)' }}>{title}</h4>
      <p style={{ color: 'var(--ivory-deep)', fontSize: '.85rem' }}>{desc}</p>
    </div>
  );
}

export function SJStat({ num, text }: any) {
  return (
    <div className="stat">
      <h3>{num}</h3>
      <span>{text}</span>
    </div>
  );
}

export function SJSectionHead({ eyebrow, title, desc }: any) {
  return (
    <div className="section-head">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {desc && <p>{desc}</p>}
    </div>
  );
}

export function SJNewsletter() {
  return (
    <section className="news">
      <p className="eyebrow" style={{ color: 'var(--gold-light)' }}>Stay In The Circle</p>
      <h2>Get first access to new arrivals &amp; rental drops</h2>
      <p>One email a week. No spam, only sparkle.</p>
      <form className="news-form" onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="Your email address" />
        <button type="submit">Subscribe</button>
      </form>
    </section>
  );
}

export function SJJewelDrip() {
  return (
    <div className="jewel-drip">
      <svg viewBox="0 0 220 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 2 Q110 26 220 2" stroke="#c9993d" strokeWidth="1"/>
        <circle cx="40" cy="14" r="3" fill="#c9993d"/>
        <circle cx="80" cy="22" r="3.5" fill="#c9993d"/>
        <circle cx="110" cy="25" r="4" fill="#e7c77e"/>
        <circle cx="140" cy="22" r="3.5" fill="#c9993d"/>
        <circle cx="180" cy="14" r="3" fill="#c9993d"/>
      </svg>
    </div>
  );
}

export function SJTrustStrip() {
  return (
    <div className="trust-strip">
      <div className="trust-track">
        <span>Handcrafted Detailing</span><span>•</span><span>Nickel-Free &amp; Skin Safe</span><span>•</span><span>Free Store Trial In Kochi</span><span>•</span><span>Secure Rental Deposit</span><span>•</span><span>7-Day Easy Exchange</span><span>•</span>
        <span>Handcrafted Detailing</span><span>•</span><span>Nickel-Free &amp; Skin Safe</span><span>•</span><span>Free Store Trial In Kochi</span><span>•</span><span>Secure Rental Deposit</span><span>•</span><span>7-Day Easy Exchange</span><span>•</span>
      </div>
    </div>
  );
}

export function SJPageBanner({ crumbs, title, desc }: any) {
  return (
    <div className="page-banner">
      <div className="container">
        {crumbs && <span className="crumbs">{crumbs}</span>}
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
    </div>
  );
}

export function SJAccordionItem({ summary, open, children }: any) {
  return (
    <details className="accordion-item" open={open}>
      <summary>{summary}</summary>
      <div style={{ marginTop: '10px' }}>
        {children}
      </div>
    </details>
  );
}

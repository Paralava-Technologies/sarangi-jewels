'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const slides = [
  {
    tone: 'tone-wine',
    caption: '01 / 04 — Bridal Collection',
    eyebrow: "Kochi's House of Heirlooms",
    title: <>Adorn every story <em>in gold</em>, borrow every occasion <em>in grace</em></>,
    sub: "Sarangi curates fine ornaments and bridal jewellery for those who wish to own a legacy — and rents exquisite sets, dance costumes and makeup for those who wish to shine, just for a day.",
    btn1: { text: "Shop Fine Jewellery", href: "/shop" },
    btn2: { text: "Rent For An Occasion", href: "/rentals" },
    divider: "WHERE TRADITION MEETS TIMELESS GRACE"
  },
  {
    tone: 'tone-peacock',
    caption: '02 / 04 — Dance & Performance',
    eyebrow: "For The Arangetram & Beyond",
    title: <>Classical costumes <em>and jewellery</em>, rented as one complete look</>,
    sub: "Bharatanatyam, Mohiniyattam, Kathak and Kuchipudi sets — costume, temple jewellery and hair accessories, delivered ready for the stage.",
    btn1: { text: "Browse Dance Costumes", href: "/shop?category=dance" },
    btn2: { text: "Add Stage Makeup", href: "/makeup" },
    divider: "EVERY DETAIL, TAKEN CARE OF"
  },
  {
    tone: 'tone-ink',
    caption: '03 / 04 — New Arrivals',
    eyebrow: "Fresh From The Atelier",
    title: <>This season&apos;s <em>kemp & temple</em> pieces have just landed</>,
    sub: "Handcrafted in antique gold-tone finish, inspired by carvings from Kerala's temple architecture — nickel-free and made to be worn often.",
    btn1: { text: "Shop New Arrivals", href: "/shop" },
    btn2: { text: "Shop Bridal Sets", href: "/shop?category=bridal" },
    divider: "HANDCRAFTED IN KOCHI"
  },
  {
    tone: 'tone-wine',
    caption: '04 / 04 — Complete The Look',
    eyebrow: "Makeup & Styling",
    title: <>Book the <em>jewellery, the outfit</em> and the artist — all in one place</>,
    sub: "Bridal and party makeup sessions, in-store or at your doorstep, paired seamlessly with your rented or purchased pieces.",
    btn1: { text: "Book A Makeup Session", href: "/makeup" },
    btn2: { text: "See All Rentals", href: "/rentals" },
    divider: "WHERE TRADITION MEETS TIMELESS GRACE"
  }
];

export function SJHomeHero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const go = (dir: number) => {
    setCurrent(c => (c + dir + slides.length) % slides.length);
  };

  return (
    <header className="hero-carousel" id="heroCarousel">
      {slides.map((s, i) => (
        <div key={i} className={`hero-slide ${s.tone} ${i === current ? 'is-active' : ''}`}>
          <span className="hero-slide-caption">{s.caption}</span>
          <div className="hero-inner">
            <p className="eyebrow">{s.eyebrow}</p>
            <h1>{s.title}</h1>
            <p className="sub">{s.sub}</p>
            <div className="hero-ctas">
              <Link href={s.btn1.href} className="btn btn-gold">{s.btn1.text}</Link>
              <Link href={s.btn2.href} className="btn btn-ghost-light">{s.btn2.text}</Link>
            </div>
            <div className="hero-divider">
              <span className="line"></span>{s.divider}<span className="line"></span>
            </div>
          </div>
        </div>
      ))}

      <button className="hero-arrow prev" aria-label="Previous slide" onClick={() => go(-1)}>&#10094;</button>
      <button className="hero-arrow next" aria-label="Next slide" onClick={() => go(1)}>&#10095;</button>

      <div className="hero-indicators">
        {slides.map((_, i) => (
          <button key={i} className={i === current ? 'is-active' : ''} aria-label={`Go to slide ${i+1}`} onClick={() => setCurrent(i)}></button>
        ))}
      </div>
    </header>
  );
}

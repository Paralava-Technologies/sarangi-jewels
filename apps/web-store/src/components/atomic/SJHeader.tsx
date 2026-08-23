'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SJCartBadge } from '@/components/atomic/SJCartBadge';
import { isLoggedIn, logout } from '@/lib/auth';

const NAV_ITEMS = [
  { key: "shop", label: "Shop", href: "/shop" },
  { key: "bridal-jewellery", label: "Bridal Jewellery", href: "/shop?category=bridal" },
  { key: "rentals", label: "Rentals", href: "/rentals" },
  { key: "dance-costumes", label: "Dance Costumes", href: "/shop?category=dance" },
  { key: "makeup", label: "Makeup", href: "/makeup" },
  { key: "about", label: "Our Story", href: "/about" }
];

export function SJHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    setLoggedIn(isLoggedIn());
  }, []);

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            <img src="/assets/sarangi-logo-mark.png" alt="Sarangi Jewels" />
            <span className="wordmark">
              Sarangi
              <small>Jewels For Sale &amp; Rent</small>
            </span>
          </Link>
          <ul className="nav-links">
            {NAV_ITEMS.map(item => (
              <li key={item.key}>
                <Link 
                  href={item.href} 
                  className={pathname === item.href || (pathname === '/' && item.key === 'shop') ? 'active' : ''}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button 
                title="Search" 
                onClick={() => {
                  const el = document.getElementById('global-search-bar');
                  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                }} 
                className="relative inline-flex h-5 w-5 items-center justify-center transition-colors hover:text-[var(--gold-light)]"
                style={{ color: 'var(--ivory-deep)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              <div id="global-search-bar" style={{ 
                display: 'none', 
                position: 'absolute', 
                top: 'calc(100% + 15px)', 
                right: '0', 
                background: '#ffffff', 
                padding: '1rem', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)', 
                border: '1px solid var(--line)', 
                borderRadius: '4px',
                zIndex: 1000 
              }}>
                <form action="/shop" method="GET" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    name="q" 
                    placeholder="Search products..." 
                    style={{ padding: '0.6rem 1rem', borderRadius: '4px', border: '1px solid var(--bone)', width: '220px', fontSize: '0.9rem', outline: 'none', background: '#fafafa', color: '#211d19' }} 
                    autoFocus
                  />
                  <button type="submit" className="btn btn-gold" style={{ padding: '0.6rem 1rem' }}>Search</button>
                </form>
              </div>
            </div>
            <Link 
              href="/account" 
              title="Account"
              className="relative inline-flex h-5 w-5 items-center justify-center transition-colors hover:text-[var(--gold-light)]"
              style={{ color: 'var(--ivory-deep)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <Link 
              href="/account?tab=wishlist" 
              title="Wishlist"
              className="relative inline-flex h-5 w-5 items-center justify-center transition-colors hover:text-[var(--gold-light)]"
              style={{ color: 'var(--ivory-deep)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>
            <div title="Bag" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <SJCartBadge />
            </div>
            <button 
              className={`nav-burger ${mobileOpen ? 'is-open' : ''}`} 
              title="Menu" 
              aria-label="Open menu" 
              aria-expanded={mobileOpen} 
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-nav ${mobileOpen ? 'is-open' : ''}`} id="mobileNav">
        <ul className="nav-links">
          {NAV_ITEMS.map(item => (
            <li key={item.key}>
              <Link href={item.href} onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mobile-nav-actions">
          <Link href="/account" onClick={() => setMobileOpen(false)}>&#128100; My Account</Link>
          <Link href="/cart" onClick={() => setMobileOpen(false)}>&#128092; My Bag</Link>
          <Link href="/orders" onClick={() => setMobileOpen(false)}>&#128269; Track Order</Link>
          <Link href="/support" onClick={() => setMobileOpen(false)}>&#128172; Support</Link>
        </div>
      </div>
    </>
  );
}

export function SJMinimalHeader() {
  return (
    <nav className="nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80px' }}>
      <Link href="/" className="nav-brand" style={{ textDecoration: 'none' }}>
        <img src="/assets/sarangi-logo-mark.png" alt="Sarangi Jewels" style={{ height: '40px' }} />
      </Link>
    </nav>
  );
}

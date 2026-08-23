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
          <div className="nav-actions">
            <button title="Search">&#128269;</button>
            <Link href="/account" title="Account">
              <button>&#128100;</button>
            </Link>
            <Link href="/wishlist" title="Wishlist">
              <button>&#9825;</button>
            </Link>
            <div title="Bag" style={{ position: 'relative', display: 'inline-flex', marginLeft: '10px', alignItems: 'center' }}>
              <SJCartBadge />
            </div>
            {mounted && loggedIn && (
              <button 
                title="Logout" 
                onClick={() => { logout(); window.location.href = '/'; }}
                style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#c9993d' }}
              >
                Logout
              </button>
            )}
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

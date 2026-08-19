import React from 'react';
import Link from 'next/link';
import { getSettings } from '@/lib/api';

const shopLinks = [
  { href: '/#pillars', label: 'Apparel' },
  { href: '/#pillars', label: 'Beauty' },
  { href: '/#pillars', label: 'Lifestyle' },
  { href: '/gift-cards', label: 'Gift Cards' },
];
const supportLinks = [
  { href: '/account', label: 'Order Status' },
  { href: '/return-policy', label: 'Returns Policy' },
  { href: '/size-guide', label: 'Size Guide' },
  { href: '/grievance-redressal', label: 'Grievance Redressal' },
  { href: '/faqs', label: 'FAQs' },
];
const studioLinks = [
  { href: '/about', label: 'About Sarangi Jewels' },
  { href: '/vision', label: 'Vision' },
  { href: '/mission', label: 'Mission' },
  { href: '/sustainability', label: 'Sustainability' },
  { href: '/careers', label: 'Careers' },
];

export async function SiteFooter() {
  const settings = await getSettings();

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <Link href="/" className="nav__logo" style={{ color: 'var(--cream)', display: 'flex', alignItems: 'center' }}>
              <img src="/images/logo.png" alt={settings?.storeName || 'NOEVE'} style={{ height: '56px', width: 'auto', filter: 'invert(1) brightness(2)' }} />
            </Link>
            <p className="footer__tagline">
              Considered fashion, beauty and lifestyle, made to outlast the season.
            </p>
            {settings?.supportPhone && (
              <p className="footer__tagline" style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.85rem' }}>
                Phone: {settings.supportPhone}
              </p>
            )}
            {settings?.supportEmail && (
              <p className="footer__tagline" style={{ marginTop: '0.2rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                Email: {settings.supportEmail}
              </p>
            )}
            <div className="footer__social">
              {settings?.instagramLink && (
                <a href={settings.instagramLink} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.2" cy="6.8" r="1"/>
                  </svg>
                </a>
              )}
              {settings?.facebookLink && (
                <a href={settings.facebookLink} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.81l.53-4H14V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}
              {settings?.whatsappNumber && (
                <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.74.45 3.37 1.22 4.79L2 22l5.37-1.16A9.92 9.92 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18.2c-1.52 0-2.95-.39-4.21-1.07l-3.32.72.73-3.21A8.2 8.2 0 0 1 3.8 12c0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.2 8.2zm4.18-5.74c-.23-.11-1.35-.67-1.56-.74-.21-.08-.36-.11-.52.11-.15.23-.59.74-.72.89-.13.15-.26.17-.49.06a6.2 6.2 0 0 1-2.98-1.85c-.34-.4-.57-.89-.78-1.36-.14-.3-.02-.46.1-.57.11-.11.23-.28.35-.41.11-.14.15-.23.23-.39.08-.15.04-.28-.02-.39-.06-.11-.52-1.25-.71-1.71-.19-.45-.38-.39-.52-.4-.13-.01-.28-.01-.43-.01-.15 0-.4.06-.61.28-.21.23-.81.79-.81 1.93 0 1.14.83 2.24.95 2.4.11.15 1.63 2.49 3.96 3.49.55.24.99.38 1.33.49.56.18 1.07.15 1.47.09.45-.06 1.35-.55 1.54-1.08.19-.53.19-.99.13-1.08-.06-.09-.23-.15-.46-.26z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div className="footer__col">
            <h4>Shop</h4>
            <ul>
              {shopLinks.map((l) => (
                <li key={l.label}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h4>Support</h4>
            <ul>
              {supportLinks.map((l) => (
                <li key={l.label}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h4>Studio</h4>
            <ul>
              {studioLinks.map((l) => (
                <li key={l.label}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} {settings?.storeName || 'NOEVE'}. All rights reserved. — www.sarangijewels.com</p>
          <div className="footer__legal">
            <Link href="/payment-security">Payment Security</Link>
            <Link href="/e-waste-compliance">E-Waste</Link>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

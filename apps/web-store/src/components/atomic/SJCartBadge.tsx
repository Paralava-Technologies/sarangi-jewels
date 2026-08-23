'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart/cart-provider';

export function SJCartBadge(): React.JSX.Element {
  const { cart } = useCart();
  const count = cart.itemCount;

  return (
    <Link
      href="/cart"
      aria-label="Your bag"
      className="relative inline-flex h-5 w-5 items-center justify-center transition-colors hover:text-[var(--gold-light)]"
      style={{ color: 'var(--ivory-deep)' }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span
          className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full text-[0.6rem] font-semibold leading-none"
          style={{ background: 'var(--oxblood)', color: 'var(--cream)' }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

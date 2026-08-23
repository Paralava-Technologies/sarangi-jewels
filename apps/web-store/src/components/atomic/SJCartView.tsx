'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/components/cart/cart-provider';

export function SJCartView(): React.JSX.Element {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const [updating, setUpdating] = useState<string | null>(null);

  if (loading) {
    return <p className="py-12 text-center text-neutral-500">Loading your bag…</p>;
  }

  if (cart.lines.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent-light/50 text-2xl">
          ✦
        </div>
        <p className="mt-6 font-medium text-ink">Your bag is empty</p>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">
          Discover pendants, fine jewellery, and care accessories from our collection.
        </p>
        <Link
          href="/shop"
          className="btn btn--outline mt-8"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const handleQty = async (lineId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(lineId);
    try {
      await updateQuantity(lineId, quantity);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-3">
      <ul className="space-y-4 lg:col-span-2">
        {cart.lines.map((line) => (
          <li
            key={line.id}
            className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <Link
              href={`/shop/${line.productSlug}`}
              className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-accent-light/40"
            >
              {line.imageUrl ? (
                <Image src={line.imageUrl} alt={line.productName} fill className="object-cover" />
              ) : null}
            </Link>
            <div className="flex flex-1 flex-col">
              <Link
                href={`/shop/${line.productSlug}`}
                className="font-serif italic text-lg hover:opacity-80"
              >
                {line.productName}
              </Link>
              <p className="text-xs text-neutral-500">{line.sku}</p>
              <p className="mt-1 font-semibold">
                {formatPrice(line.unitPriceCents, line.currency)}
                {line.isRental && <span className="ml-1 text-xs font-normal text-neutral-500">/ day</span>}
              </p>
              {line.isRental && (
                <div className="mt-2 text-xs text-brand-primary bg-brand-accent-light/20 p-2 rounded">
                  <p className="font-semibold mb-1">Rental Booking</p>
                  <p>Dates: {line.rentStartDate ? new Date(line.rentStartDate).toLocaleDateString() : 'TBD'} – {line.rentEndDate ? new Date(line.rentEndDate).toLocaleDateString() : 'TBD'}</p>
                  {!!line.depositCents && line.depositCents > 0 && (
                    <p>Deposit: {formatPrice(line.depositCents, line.currency)}</p>
                  )}
                </div>
              )}
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={updating === line.id || line.quantity <= 1}
                    onClick={() => handleQty(line.id, line.quantity - 1)}
                    className="h-8 w-8 rounded-full border border-brand-accent/40 text-sm hover:border-brand-accent disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
                  <button
                    type="button"
                    disabled={updating === line.id}
                    onClick={() => handleQty(line.id, line.quantity + 1)}
                    className="h-8 w-8 rounded-full border border-brand-accent/40 text-sm hover:border-brand-accent disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(line.id)}
                  className="text-xs text-neutral-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-600">Subtotal ({cart.itemCount} items)</dt>
            <dd className="font-semibold">{formatPrice(cart.subtotalCents, cart.currency)}</dd>
          </div>
          {!!cart.depositCents && cart.depositCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-neutral-600">Security Deposit (Refundable)</dt>
              <dd className="font-semibold text-brand-primary">{formatPrice(cart.depositCents, cart.currency)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-neutral-600">Shipping</dt>
            <dd className="text-neutral-500">Calculated at checkout</dd>
          </div>
        </dl>
        <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-base font-semibold">
          <span>Estimated total</span>
          <span>{formatPrice(cart.subtotalCents + (cart.depositCents || 0), cart.currency)}</span>
        </div>
        <Link
          href={cart.lines.length > 0 ? '/checkout' : '/shop'}
          className="btn btn--primary mt-6 w-full"
        >
          Proceed to checkout
        </Link>
        <p className="mt-3 text-center text-xs text-neutral-500">Sign in required at checkout</p>
      </aside>
    </div>
  );
}

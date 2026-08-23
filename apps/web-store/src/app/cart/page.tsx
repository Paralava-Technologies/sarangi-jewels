'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart/cart-provider';
import { SJCartRow } from '@/components/atomic/SJCartRow';
import { formatPrice } from '@/lib/format';
import { SJPageBanner } from '@/components/atomic/SJHomeComponents';
import { isLoggedIn } from '@/lib/auth';

interface StoreSettings {
  shippingThresholdCents: number;
  shippingRateCents: number;
  codAllowed?: boolean;
}

export default function CartPage(): React.JSX.Element {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    import('@/lib/api').then(({ apiClient }) => {
      apiClient.store.getSettings().then(res => setSettings(res.data)).catch(console.error);
    });
    setUserLoggedIn(isLoggedIn());
  }, []);

  if (loading || !settings || !cart) return <div className="wrap"><p style={{padding:'5rem 0',textAlign:'center',color:'rgba(33,29,25,.55)'}}>Loading your bag…</p></div>;

  const subtotal = cart.subtotalCents;
  const shipping = (cart.lines.length === 0 || subtotal >= settings.shippingThresholdCents) ? 0 : settings.shippingRateCents;
  const total = subtotal + shipping;

  return (
    <>
      <SJPageBanner crumbs="Home / My Bag" title="My Bag" />

      <section className="section">
        <div className="container grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-11 items-start">
          <div>
            {cart.lines.length === 0 ? (
              <div className="card-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h3 style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', marginBottom: '1rem' }}>Your bag is empty</h3>
                <p style={{ color: 'rgba(33,29,25,.6)', marginBottom: '2rem' }}>Pieces you add will show up here.</p>
                <Link href="/shop" className="btn btn-gold">Continue Shopping</Link>
              </div>
            ) : (
              <>
                <p className="eyebrow" style={{ marginBottom: '10px' }}>To Buy</p>
                <div className="card-panel">
                  {cart.lines.map((line) => (
                    <SJCartRow 
                      key={line.id}
                      id={line.id}
                      imageUrl={line.imageUrl || undefined}
                      productName={line.productName}
                      sku={line.sku}
                      quantity={line.quantity}
                      formattedPrice={formatPrice(line.unitPriceCents * line.quantity, line.currency)}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </>
            )}

            <div style={{ marginTop: '26px' }}>
              <Link href="/shop" className="btn">← Continue Shopping</Link>
            </div>
          </div>

          <div className="cart-summary">
            <h4>Order Summary</h4>
            <div className="summary-line"><span>Purchase Subtotal</span><span>{formatPrice(subtotal, cart.currency)}</span></div>
            <div className="summary-line"><span>Delivery</span><span>{subtotal === 0 ? '—' : shipping === 0 ? 'Free' : formatPrice(shipping, cart.currency)}</span></div>
            <div className="promo-row">
              <input type="text" placeholder="Promo code" />
              <button>Apply</button>
            </div>
            <div className="summary-line total">
              <span>Total Payable Now</span>
              <span>{formatPrice(total, cart.currency)}</span>
            </div>
            <p style={{ fontSize: '.72rem', color: '#8a7a6a', margin: '10px 0 20px', lineHeight: 1.6 }}>
              Free shipping automatically applied over {formatPrice(settings.shippingThresholdCents, cart.currency)}
            </p>
            <Link href={cart.lines.length > 0 ? '/checkout' : '/shop'} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', display: 'flex', textAlign: 'center' }}>
              Proceed to Checkout
            </Link>
            {!userLoggedIn && (
              <div style={{ textAlign: 'center', marginTop: '14px' }}>
                <Link href="/login" style={{ fontSize: '.78rem', color: 'var(--wine)', borderBottom: '1px solid var(--gold)' }}>
                  Sign in for faster checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

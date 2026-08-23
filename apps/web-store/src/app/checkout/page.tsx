'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/cart-provider';
import { isLoggedIn } from '@/lib/auth';
import { formatPrice } from '@/lib/format';
import { placeOrder, validatePromotion } from '@/lib/orders';
import { clearCart } from '@/lib/cart';
import { apiClient } from '@/lib/api';

import { fetchAddresses, type Address } from '@/lib/addresses';
import { SJPageBanner } from '@/components/atomic/SJHomeComponents';
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage(): React.JSX.Element {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { cart, loading, refresh } = useCart();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountCents: number } | null>(
    null,
  );
  const [promoError, setPromoError] = useState<string | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Address & Gift States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isGift, setIsGift] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Mock payment modal states
  const [showMockModal, setShowMockModal] = useState(false);
  const [paymentSession, setPaymentSession] = useState<any>(null);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  
  const [paymentFailedOrder, setPaymentFailedOrder] = useState<any>(null);

  const [codAllowed, setCodAllowed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [user, setUser] = useState<any>(null);

  const [rentalDeliveryAllowed, setRentalDeliveryAllowed] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<'ONLINE_DELIVERY' | 'STORE_PICKUP'>('ONLINE_DELIVERY');

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/account?redirect=/checkout');
    } else {
      fetchAddresses()
        .then((addrs) => {
          setAddresses(addrs);
          const defaultAddr = addrs.find((a) => a.isDefault);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
        })
        .catch(console.error);

      apiClient.store.getSettings?.().then((res: any) => {
          setCodAllowed(res.data?.codAllowed || false);
          const allowRentalDelivery = res.data?.rentalDeliveryAllowed ?? true;
          setRentalDeliveryAllowed(allowRentalDelivery);
          if (!allowRentalDelivery) {
            setDeliveryMethod('STORE_PICKUP');
          }
      }).catch(console.error);

      // Fetch User Profile to check verification status
      import('@/lib/auth').then(({ authHeaders }) => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1'}/store/user/me`, { headers: authHeaders() })
          .then(res => res.json())
          .then(res => setUser(res.data))
      ).catch(console.error);
    }
  }, [router]);

  const taxCents = cart?.taxCents || 0;
  const shippingCents = deliveryMethod === 'STORE_PICKUP' ? 0 : (cart?.shippingCents || 0);
  const discountCents = appliedPromo ? appliedPromo.discountCents : 0;
  const totalCents = cart
    ? Math.max(0, (cart?.subtotalCents || 0) + shippingCents + taxCents + (cart?.depositCents || 0) - discountCents)
    : 0;

  const handleApplyPromo = async () => {
    if (!promoCode || !cart) return;
    setValidatingPromo(true);
    setPromoError(null);
    try {
      const data = await validatePromotion(promoCode, cart.subtotalCents);
      setAppliedPromo(data);
    } catch (err: any) {
      setPromoError(err.message || 'Invalid promotion code');
      setAppliedPromo(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const computeMinDeliveryDays = (pincode: string | undefined) => {
    if (!pincode) return 5;
    const firstDigit = pincode.charAt(0);
    return ['1', '2', '3', '4'].includes(firstDigit) ? 3 : 5;
  };
  const minDeliveryDays = computeMinDeliveryDays(selectedAddress?.postalCode);
  const minDateObj = new Date();
  minDateObj.setDate(minDateObj.getDate() + minDeliveryDays);
  const minDateString = minDateObj.toISOString().split('T')[0];

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && deliveryMethod !== 'STORE_PICKUP') {
      setError('Please select a shipping address.');
      return;
    }
    if (isGift && deliveryDate && deliveryDate < minDateString) {
      setError(
        `Based on your pincode (${selectedAddress?.postalCode}), the earliest delivery date is ${minDateObj.toLocaleDateString()}. Please select a valid date.`,
      );
      return;
    }
    setError(null);
    setSubmitting(true);

    let finalNote = note;
    if (isGift) {
      finalNote = `[GIFT ORDER] ${note ? `- ${note}` : ''}\nPreferred Date: ${deliveryDate || 'Any'}\nPreferred Time: ${deliveryTime || 'Any'}`;
    }

    if (selectedAddress) {
      const addressString = `Shipping Address:\n${selectedAddress.name}\n${selectedAddress.streetLine1}${selectedAddress.streetLine2 ? `, ${selectedAddress.streetLine2}` : ''}\n${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.postalCode}\n${selectedAddress.country}\nPhone: ${selectedAddress.phone}`;
      finalNote = finalNote ? `${finalNote}\n\n${addressString}` : addressString;
    }

    try {
      // 1. Create order (returns Order in PENDING_PAYMENT status)
      const order = await placeOrder(
        finalNote || undefined,
        appliedPromo?.code,
        appliedPromo?.discountCents,
        deliveryMethod
      );
      setCurrentOrder(order);

      if (paymentMethod === 'COD') {
        try {
          await apiClient.store.changeToCod(order.id);
          await clearCart();
          await refresh();
          setSuccess(order.orderNumber);
        } catch (err: any) {
          setError(err?.message || 'Failed to convert to COD');
        }
        setSubmitting(false);
        return;
      }

      // 2. Create Payment Session on API
      const sessionRes = await apiClient.store.createPaymentSession({ orderId: order.id });
      const session = sessionRes.data;
      setPaymentSession(session);

      if (session.isMock) {
        // Show mock simulation modal
        setShowMockModal(true);
      } else {
        // Load Razorpay and process payment
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error(
            'Failed to load Razorpay checkout script. Please check your internet connection.',
          );
        }

        const options = {
          key: session.keyId,
          amount: session.amount,
          currency: session.currency,
          name: 'Sarangi Jewels',
          description: `Order ${order.orderNumber}`,
          order_id: session.providerOrderId,
          handler: async function (response: any) {
            try {
              setSubmitting(true);
              await apiClient.store.verifyPayment({
                orderId: order.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              await clearCart();
              await refresh();
              setSuccess(order.orderNumber);
            } catch (err: any) {
              setError(err?.message || 'Payment signature verification failed');
            } finally {
              setSubmitting(false);
            }
          },
          prefill: {
            name: '',
            email: '',
          },
          theme: {
            color: '#6B2230', // Oxblood primary
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              setPaymentFailedOrder(order);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place order');
      setSubmitting(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!currentOrder || !paymentSession) return;
    setError(null);
    setSubmitting(true);
    setShowMockModal(false);

    try {
      await apiClient.store.verifyPayment({
        orderId: currentOrder.id,
        razorpayOrderId: paymentSession.providerOrderId,
        razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        razorpaySignature: 'mock_signature_verified',
      });
      await clearCart();
      await refresh();
      setSuccess(currentOrder.orderNumber);
    } catch (err: any) {
      setError(err?.message || 'Verification of mock payment failed');
      setPaymentFailedOrder(currentOrder);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertToCod = async () => {
    if (!paymentFailedOrder) return;
    setSubmitting(true);
    try {
      await apiClient.store.changeToCod(paymentFailedOrder.id);
      await clearCart();
      await refresh();
      setSuccess(paymentFailedOrder.orderNumber);
      setPaymentFailedOrder(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to convert to COD');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <section className="section">
        <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
          <p style={{ color: 'rgba(33,29,25,0.5)' }}>Loading checkout…</p>
        </div>
      </section>
    );
  }

  if (!isLoggedIn()) {
    return <></>;
  }

  if (success) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="card-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'var(--ivory-deep)', color: 'var(--peacock)', marginBottom: '1.5rem' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '32px', height: '32px' }}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '2rem', marginBottom: '1rem' }}>Order confirmed</h2>
            <p style={{ color: 'rgba(33,29,25,.7)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Thank you for your purchase. Your order <strong>{success}</strong> has been placed and
              payment has been processed successfully.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/account" className="btn btn-gold">
                View orders
              </Link>
              <Link href="/shop" className="btn">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="card-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '2rem', marginBottom: '1rem' }}>Your bag is empty</h2>
            <p style={{ color: 'rgba(33,29,25,.7)', marginBottom: '2rem' }}>Add items before checking out.</p>
            <Link href="/shop" className="btn btn-gold">
              Browse collection
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (paymentFailedOrder) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="card-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'var(--ivory-deep)', color: '#a3372f', marginBottom: '1.5rem' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '32px', height: '32px' }}>
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '2rem', marginBottom: '1rem' }}>Payment Incomplete</h2>
            <p style={{ color: 'rgba(33,29,25,.7)', lineHeight: 1.6 }}>
              The payment for your order <strong>{paymentFailedOrder.orderNumber}</strong> was not completed.
            </p>
            <p style={{ marginTop: '1rem', color: 'rgba(33,29,25,.7)', marginBottom: '2.5rem' }}>
              Would you like to convert this order to Cash on Delivery?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {codAllowed && (
                <button onClick={handleConvertToCod} disabled={submitting} className="btn btn-gold">
                  {submitting ? 'Converting...' : 'Yes, Change to COD'}
                </button>
              )}
              <Link href="/account" className="btn">
                No, View My Orders
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <SJPageBanner crumbs="Home / Your Bag / Checkout" title="Complete your order" desc="Verify your items and proceed with secure payment." />

      <section className="section">
        <div className="container grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-11 items-start">
          <div>
            {/* Order Details form fields */}
            <div className="card-panel">
            {cart?.lines.some((l: any) => l.isRental) && (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--ivory-deep)', border: '1px solid var(--line)' }}>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontFamily: 'var(--display)' }}>Delivery Option</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: rentalDeliveryAllowed ? 'pointer' : 'not-allowed', opacity: rentalDeliveryAllowed ? 1 : 0.6 }}>
                     <input 
                       type="radio" 
                       name="deliveryMethod"
                       value="ONLINE_DELIVERY" 
                       checked={deliveryMethod === 'ONLINE_DELIVERY'} 
                       onChange={() => setDeliveryMethod('ONLINE_DELIVERY')}
                       disabled={!rentalDeliveryAllowed}
                     />
                     Online Delivery {rentalDeliveryAllowed ? '' : '(Currently Unavailable for Rentals)'}
                   </label>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                     <input 
                       type="radio" 
                       name="deliveryMethod"
                       value="STORE_PICKUP" 
                       checked={deliveryMethod === 'STORE_PICKUP'} 
                       onChange={() => setDeliveryMethod('STORE_PICKUP')}
                     />
                     Store Pickup (Free)
                   </label>
                </div>
              </div>
            )}

            {deliveryMethod !== 'STORE_PICKUP' ? (
              <>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', marginBottom: '1rem' }}>
                  Shipping Details
                </h2>
                <p style={{ fontSize: '.88rem', color: 'rgba(33,29,25,.65)', marginBottom: '1.5rem' }}>
                  Select a shipping address below or add a new one in your account.
                </p>

            <div className="flex flex-col gap-4 mb-8">
              {addresses.length === 0 ? (
                <div style={{ padding: '1.5rem', border: '1px dashed var(--line)', textAlign: 'center' }}>
                  <p style={{ fontSize: '.9rem', marginBottom: '1rem' }}>
                    No shipping addresses found.
                  </p>
                  <Link
                    href="/account?tab=addresses&new=1&redirect=checkout"
                    className="btn"
                  >
                    Add Address
                  </Link>
                </div>
              ) : (
                addresses.map((addr) => (
                  <label
                    key={addr.id}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      border: `1px solid ${selectedAddressId === addr.id ? 'var(--gold)' : 'var(--line)'}`,
                      cursor: 'pointer',
                      background: selectedAddressId === addr.id ? 'var(--ivory)' : 'var(--white)',
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      style={{ marginTop: '0.2rem' }}
                    />
                    <div style={{ fontSize: '.9rem', lineHeight: 1.4 }}>
                      <p style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>
                        {addr.name}{' '}
                        {addr.isDefault && (
                          <span className="pill" style={{ marginLeft: '0.5rem', background: 'var(--gold-light)', color: 'var(--wine-deep)' }}>
                            Default
                          </span>
                        )}
                      </p>
                      <p style={{ color: 'rgba(36,16,8,.8)' }}>
                        {addr.streetLine1}
                        {addr.streetLine2 ? `, ${addr.streetLine2}` : ''}
                      </p>
                      <p style={{ color: 'rgba(36,16,8,.8)' }}>
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p style={{ color: 'rgba(36,16,8,.8)' }}>{addr.country}</p>
                      <p style={{ color: 'rgba(36,16,8,.8)', marginTop: '0.25rem' }}>
                        Phone: {addr.phone}
                      </p>
                    </div>
                  </label>
                ))
              )}
              {addresses.length > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <Link
                    href="/account?tab=addresses&new=1&redirect=checkout"
                    style={{ fontSize: '.85rem', textDecoration: 'underline', color: 'var(--wine)' }}
                  >
                    + Add a new address
                  </Link>
                </div>
              )}
            </div>
            </>
            ) : (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', marginBottom: '1rem' }}>Store Pickup</h2>
                <p style={{ fontSize: '.88rem', color: 'rgba(33,29,25,.65)', marginBottom: '1.5rem' }}>
                  Your items will be ready for pickup at our physical store. We will contact you once the order is ready.
                </p>
              </div>
            )}

            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--ivory-deep)', border: '1px solid var(--line)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                Deliver as a Gift
              </label>

              {isGift && (
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="field-row">
                    <div className="field">
                      <label>Preferred Delivery Date</label>
                      <input
                        type="date"
                        min={minDateString}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                      />
                      {selectedAddress && (
                        <p style={{ fontSize: '.75rem', color: 'rgba(36,16,8,.6)', marginTop: '.4rem', lineHeight: 1.3 }}>
                          Based on your pincode ({selectedAddress.postalCode}), the earliest
                          delivery is <strong>{minDateObj.toLocaleDateString()}</strong>.
                        </p>
                      )}
                    </div>
                    <div className="field">
                      <label>Preferred Time</label>
                      <input
                        type="time"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label>Gift Message</label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Write a special message for the recipient…"
                    />
                  </div>
                </div>
              )}
            </div>

            {!isGift && (
              <div className="field">
                <label htmlFor="note">Order note (optional)</label>
                <textarea
                  id="note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Gift message, delivery instructions…"
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="cart-summary">
          <h4>Order Summary</h4>
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--line)', paddingBottom: '1rem' }}>
            {cart.lines.map((line) => (
              <div key={line.id} style={{ padding: '8px 0' }}>
                <div className="summary-line" style={{ padding: 0 }}>
                  <span>
                    {line.productName}{' '}
                    <span style={{ fontSize: '.76rem', color: '#8a7a6a' }}>
                      × {line.quantity}
                    </span>
                  </span>
                  <span style={{ fontWeight: 500 }}>
                    {formatPrice(line.lineTotalCents, line.currency)}
                  </span>
                </div>
                {line.isRental && (
                  <div style={{ fontSize: '.75rem', color: '#6b5a4d', marginTop: '4px' }}>
                    <div>Rental: {line.rentStartDate ? new Date(line.rentStartDate).toLocaleDateString() : 'TBD'} – {line.rentEndDate ? new Date(line.rentEndDate).toLocaleDateString() : 'TBD'}</div>
                    {!!line.depositCents && line.depositCents > 0 && (
                      <div style={{ color: 'var(--brand-primary)' }}>Deposit: {formatPrice(line.depositCents, line.currency)}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="summary-line">
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotalCents, cart.currency)}</span>
          </div>
          <div className="summary-line">
            <span>Shipping</span>
            <span>{shippingCents === 0 ? 'Free' : formatPrice(shippingCents, cart.currency)}</span>
          </div>
          <div className="summary-line">
            <span>Taxes & Fees</span>
            <span>{formatPrice(taxCents, cart.currency)}</span>
          </div>
          {!!cart.depositCents && cart.depositCents > 0 && (
            <div className="summary-line">
              <span>Security Deposit</span>
              <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{formatPrice(cart.depositCents, cart.currency)}</span>
            </div>
          )}

          {(cart?.cgstCents || cart?.sgstCents || cart?.igstCents) ? (
            <div style={{ fontSize: '.75rem', color: '#6b5a4d', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--line)' }}>
              {cart?.igstCents ? (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>IGST</span>
                  <span>{formatPrice(cart.igstCents, cart.currency)}</span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>CGST</span>
                    <span>{formatPrice(cart.cgstCents || 0, cart.currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>SGST</span>
                    <span>{formatPrice(cart.sgstCents || 0, cart.currency)}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ borderBottom: '1px solid var(--line)', marginBottom: '1rem' }} />
          )}

          {appliedPromo && (
            <div className="summary-line" style={{ color: 'var(--wine)' }}>
              <span>Discount ({appliedPromo.code})</span>
              <span>-{formatPrice(appliedPromo.discountCents, cart.currency)}</span>
            </div>
          )}

          <div className="promo-row">
            <input
              type="text"
              placeholder="Promo Code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              disabled={!!appliedPromo}
            />
            {!appliedPromo ? (
              <button type="button" onClick={handleApplyPromo} disabled={validatingPromo || !promoCode}>
                {validatingPromo ? '...' : 'Apply'}
              </button>
            ) : (
              <button type="button" onClick={() => { setAppliedPromo(null); setPromoCode(''); }} style={{ background: 'var(--wine)', borderColor: 'var(--wine)' }}>
                Remove
              </button>
            )}
          </div>
          {promoError && (
            <p style={{ fontSize: '.75rem', color: '#a3372f', marginTop: '-10px', marginBottom: '10px' }}>
              {promoError}
            </p>
          )}

          <div className="summary-line total">
            <span>Total Payable Now</span>
            <span>{formatPrice(totalCents, cart.currency)}</span>
          </div>

          {error && (
            <p style={{ fontSize: '.76rem', color: '#a3372f', marginBottom: '1rem' }}>
              {error}
            </p>
          )}

          {cart?.lines.some(l => l.isRental) && user && user.idVerificationStatus !== 'VERIFIED' && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: '4px', color: '#e65100', fontSize: '.8rem' }}>
              <strong>Notice:</strong> You have a rental item in your cart, but your ID is not verified. 
              You can complete your checkout now, but your order will not be processed or shipped until you upload a valid ID in your <Link href="/account?tab=verification" style={{ textDecoration: 'underline' }}>Account Portal</Link>.
            </div>
          )}

          <div style={{ margin: '20px 0' }}>
            <h4 style={{ fontSize: '.9rem', marginBottom: '.5rem', fontFamily: 'var(--display)' }}>Payment Method</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.85rem' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                />
                Online Payment (Razorpay)
              </label>
              {codAllowed && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.85rem' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  Cash on Delivery
                </label>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handlePlaceOrder}
            className="btn btn-gold"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {submitting ? 'Processing…' : paymentMethod === 'COD' ? 'Place Order' : 'Place Order & Pay'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <Link href="/cart" style={{ fontSize: '.78rem', color: 'var(--wine)', borderBottom: '1px solid var(--gold)' }}>
              ← Return to bag
            </Link>
          </div>
        </div>
      </div>
      </section>

      {/* Mock Sandbox Payment Modal */}
      {showMockModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(33, 29, 25, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="card-panel" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
            <span
              style={{
                fontSize: '2.5rem',
                color: 'var(--wine)',
                display: 'block',
                marginBottom: '1rem',
              }}
            >
              💳
            </span>
            <h3
              style={{
                fontFamily: 'var(--display)',
                fontSize: '1.8rem',
                color: 'var(--wine-deep)',
                marginBottom: '0.8rem',
              }}
            >
              Sarangi Jewels Sandbox Payment
            </h3>
            <p
              style={{
                fontSize: '0.92rem',
                color: 'rgba(33,29,25,0.7)',
                lineHeight: 1.5,
                marginBottom: '2rem',
              }}
            >
              You are running in development mode without active Razorpay keys. Click below to
              simulate a successful transaction for order{' '}
              <strong>{currentOrder?.orderNumber}</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <button
                type="button"
                onClick={handleSimulatePaymentSuccess}
                className="btn btn-gold"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Simulate Successful Payment
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMockModal(false);
                  setSubmitting(false);
                  setPaymentFailedOrder(currentOrder);
                }}
                className="btn"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Failed / Conversion Modal */}
      {paymentFailedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(33, 29, 25, 0.5)',
          }}
        >
          <div className="card-panel" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <h3>Payment Discontinued</h3>
            <p style={{ margin: '1rem 0' }}>Would you like to switch this order to Cash on Delivery?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => handleConvertToCod()} className="btn btn-gold">
                Switch to COD
              </button>
              <button onClick={() => setPaymentFailedOrder(null)} className="btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

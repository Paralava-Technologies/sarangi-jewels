'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/cart-provider';
import { isLoggedIn } from '@/lib/auth';
import { formatPrice } from '@/lib/format';
import { placeOrder, validatePromotion } from '@/lib/orders';
import { apiClient } from '@/lib/api';

import { fetchAddresses, type Address } from '@/lib/addresses';

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
      }).catch(console.error);
    }
  }, [router]);

  const taxCents = cart?.taxCents || 0;
  const shippingCents = cart?.shippingCents || 0;
  const discountCents = appliedPromo ? appliedPromo.discountCents : 0;
  const totalCents = cart
    ? Math.max(0, (cart?.totalCents || 0) - discountCents)
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
    if (!selectedAddressId) {
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
      );
      setCurrentOrder(order);

      if (paymentMethod === 'COD') {
        try {
          await apiClient.store.changeToCod(order.id);
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
      <div className="wrap" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <p style={{ color: 'rgba(33,29,25,0.5)' }}>Loading checkout…</p>
      </div>
    );
  }

  if (!isLoggedIn()) {
    return <></>;
  }

  if (success) {
    return (
      <div className="wrap" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="auth__success is-visible">
          <div className="auth__success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2>Order confirmed</h2>
          <p>
            Thank you for your purchase. Your order <strong>{success}</strong> has been placed and
            payment has been processed successfully.
          </p>
          <div className="auth__success-actions">
            <Link href="/account" className="btn btn--primary">
              View orders
            </Link>
            <Link href="/shop" className="btn btn--outline">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="wrap" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="auth__success is-visible">
          <h2>Your bag is empty</h2>
          <p>Add items before checking out.</p>
          <div className="auth__success-actions">
            <Link href="/shop" className="btn btn--primary">
              Browse collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentFailedOrder) {
    return (
      <div className="wrap" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="auth__success is-visible">
          <div className="auth__success-icon" style={{ borderColor: 'var(--oxblood)', color: 'var(--oxblood)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2>Payment Incomplete</h2>
          <p>
            The payment for your order <strong>{paymentFailedOrder.orderNumber}</strong> was not completed.
          </p>
          <p style={{ marginTop: '1rem', color: 'rgba(33,29,25,.7)' }}>
            Would you like to convert this order to Cash on Delivery?
          </p>
          <div className="auth__success-actions" style={{ marginTop: '2rem' }}>
            {codAllowed && (
              <button onClick={handleConvertToCod} disabled={submitting} className="btn btn--primary">
                {submitting ? 'Converting...' : 'Yes, Change to COD'}
              </button>
            )}
            <Link href="/account" className="btn btn--outline">
              No, View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/cart">Your Bag</Link>
        <span>/</span>
        <span style={{ color: 'var(--ink)' }}>Checkout</span>
      </nav>

      {/* Page Head */}
      <div className="page-head">
        <p className="eyebrow">Secure Checkout</p>
        <h1>Complete your order</h1>
        <p className="sub">Verify your items and proceed with secure payment.</p>
      </div>

      <div className="cart-layout">
        <div>
          {/* Order Details form fields */}
          <div
            className="section-card"
            style={{
              background: 'var(--cream)',
              border: '1px solid rgba(33,29,25,.1)',
              borderRadius: '2px',
              padding: '2rem',
            }}
          >
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.6rem', marginBottom: '1rem' }}>
              Shipping Details
            </h2>
            <p style={{ fontSize: '.88rem', color: 'rgba(33,29,25,.65)', marginBottom: '1.5rem' }}>
              Select a shipping address below or add a new one in your account.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              {addresses.length === 0 ? (
                <div
                  style={{
                    padding: '1.5rem',
                    border: '1px dashed rgba(33,29,25,.2)',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: '.9rem', marginBottom: '1rem' }}>
                    No shipping addresses found.
                  </p>
                  <Link
                    href="/account?tab=addresses&new=1&redirect=checkout"
                    className="btn btn--outline"
                    style={{ display: 'inline-block' }}
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
                      border: `1px solid ${selectedAddressId === addr.id ? 'var(--brand-primary)' : 'rgba(33,29,25,.1)'}`,
                      borderRadius: '2px',
                      cursor: 'pointer',
                      background: selectedAddressId === addr.id ? 'var(--cream)' : 'transparent',
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
                          <span
                            style={{
                              fontSize: '.7rem',
                              padding: '0.1rem 0.4rem',
                              background: 'var(--brand-accent)',
                              color: 'var(--brand-primary)',
                              borderRadius: '2px',
                              marginLeft: '0.5rem',
                            }}
                          >
                            Default
                          </span>
                        )}
                      </p>
                      <p style={{ color: 'rgba(33,29,25,.8)' }}>
                        {addr.streetLine1}
                        {addr.streetLine2 ? `, ${addr.streetLine2}` : ''}
                      </p>
                      <p style={{ color: 'rgba(33,29,25,.8)' }}>
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p style={{ color: 'rgba(33,29,25,.8)' }}>{addr.country}</p>
                      <p style={{ color: 'rgba(33,29,25,.8)', marginTop: '0.25rem' }}>
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
                    style={{ fontSize: '.85rem', textDecoration: 'underline' }}
                  >
                    + Add a new address
                  </Link>
                </div>
              )}
            </div>

            <div
              style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                background: 'rgba(33,29,25,.03)',
                border: '1px solid rgba(33,29,25,.1)',
                borderRadius: '2px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                Deliver as a Gift
              </label>

              {isGift && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-field">
                      <label>Preferred Delivery Date</label>
                      <input
                        type="date"
                        min={minDateString}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          border: '1px solid rgba(33,29,25,.2)',
                        }}
                      />
                      {selectedAddress && (
                        <p
                          style={{
                            fontSize: '.75rem',
                            color: 'rgba(33,29,25,.6)',
                            marginTop: '.4rem',
                            lineHeight: 1.3,
                          }}
                        >
                          Based on your pincode ({selectedAddress.postalCode}), the earliest
                          delivery is <strong>{minDateObj.toLocaleDateString()}</strong>.
                        </p>
                      )}
                    </div>
                    <div className="form-field">
                      <label>Preferred Time</label>
                      <input
                        type="time"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          border: '1px solid rgba(33,29,25,.2)',
                        }}
                      />
                    </div>
                  </div>
                  <div className="form-field" style={{ margin: 0 }}>
                    <label>Gift Message</label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Write a special message for the recipient…"
                      style={{
                        width: '100%',
                        border: '1px solid rgba(33,29,25,.25)',
                        background: 'transparent',
                        padding: '.85em 1em',
                        fontSize: '.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {!isGift && (
              <div className="form-field">
                <label htmlFor="note">Order note (optional)</label>
                <textarea
                  id="note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Gift message, delivery instructions…"
                  style={{
                    width: '100%',
                    border: '1px solid rgba(33,29,25,.25)',
                    background: 'transparent',
                    padding: '.85em 1em',
                    fontSize: '.95rem',
                    color: 'var(--ink)',
                    outline: 'none',
                    borderRadius: '1px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <aside className="summary">
          <h3>Order summary</h3>
          <div className="summary__items" style={{ marginBottom: '1.5rem' }}>
            {cart.lines.map((line) => (
              <div
                key={line.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '.85rem',
                  padding: '.6rem 0',
                  borderBottom: '1px solid rgba(33,29,25,.1)',
                }}
              >
                <span style={{ color: 'rgba(33,29,25,.8)' }}>
                  {line.productName}{' '}
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '.76rem' }}>
                    × {line.quantity}
                  </span>
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 500 }}>
                  {formatPrice(line.lineTotalCents, line.currency)}
                </span>
              </div>
            ))}
          </div>

          <div
            className="summary__row"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '.85rem',
              marginBottom: '.5rem',
              color: 'rgba(33,29,25,.8)',
            }}
          >
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotalCents, cart.currency)}</span>
          </div>
          <div
            className="summary__row"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '.85rem',
              marginBottom: '.5rem',
              color: 'rgba(33,29,25,.8)',
            }}
          >
            <span>Shipping</span>
            <span>{shippingCents === 0 ? 'Free' : formatPrice(shippingCents, cart.currency)}</span>
          </div>
          <div
            className="summary__row"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '.85rem',
              marginBottom: '.5rem',
              color: 'rgba(33,29,25,.8)',
            }}
          >
            <span>Taxes & Fees</span>
            <span>{formatPrice(taxCents, cart.currency)}</span>
          </div>

          {(cart?.cgstCents || cart?.sgstCents || cart?.igstCents) ? (
            <div
              style={{
                fontSize: '.75rem',
                color: 'rgba(33,29,25,.6)',
                paddingBottom: '1rem',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(33,29,25,.1)',
              }}
            >
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
            <div style={{ borderBottom: '1px solid rgba(33,29,25,.1)', marginBottom: '1rem' }} />
          )}

          {appliedPromo && (
            <div
              className="summary__row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '.85rem',
                marginBottom: '1rem',
                color: 'var(--brand-primary)',
              }}
            >
              <span>Discount ({appliedPromo.code})</span>
              <span>-{formatPrice(appliedPromo.discountCents, cart.currency)}</span>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={!!appliedPromo}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.8rem',
                  border: '1px solid rgba(33,29,25,.2)',
                  borderRadius: '1px',
                  outline: 'none',
                }}
              />
              {!appliedPromo ? (
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={validatingPromo || !promoCode}
                  style={{
                    padding: '0 1rem',
                    background: 'var(--ink)',
                    color: 'white',
                    borderRadius: '1px',
                  }}
                >
                  {validatingPromo ? '...' : 'Apply'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAppliedPromo(null);
                    setPromoCode('');
                  }}
                  style={{
                    padding: '0 1rem',
                    background: 'var(--oxblood)',
                    color: 'white',
                    borderRadius: '1px',
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            {promoError && (
              <p style={{ fontSize: '.75rem', color: 'var(--oxblood)', marginTop: '0.4rem' }}>
                {promoError}
              </p>
            )}
          </div>

          <div
            className="summary__row summary__row--total"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 600,
              fontSize: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <span>Total</span>
            <span>{formatPrice(totalCents, cart.currency)}</span>
          </div>

          {error && (
            <p style={{ fontSize: '.76rem', color: 'var(--oxblood)', marginBottom: '1rem' }}>
              {error}
            </p>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
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
            className="btn btn--primary"
            style={{
              width: '100%',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {submitting ? (
              <>
                <svg
                  className="spinner"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: 'spin 1s linear infinite' }}
                >
                  <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" />
                </svg>{' '}
                Processing…
              </>
            ) : paymentMethod === 'COD' ? (
              'Place Order'
            ) : (
              'Place Order & Pay'
            )}
          </button>

          <Link
            href="/cart"
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: '1.2rem',
              fontSize: '.8rem',
              textDecoration: 'underline',
            }}
          >
            ← Back to bag
          </Link>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </aside>
      </div>

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
          <div
            style={{
              background: 'var(--cream)',
              border: '1px solid rgba(33, 29, 25, 0.15)',
              borderRadius: '2px',
              padding: '2.5rem',
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 12px 36px rgba(33, 29, 25, 0.15)',
            }}
          >
            <span
              style={{
                fontSize: '2.5rem',
                color: 'var(--oxblood)',
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
                color: 'var(--oxblood)',
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
                className="btn btn--primary"
                style={{ width: '100%' }}
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
                className="btn btn--outline"
                style={{ width: '100%' }}
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
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '2px',
              maxWidth: '400px',
              textAlign: 'center',
            }}
          >
            <h3>Payment Discontinued</h3>
            <p style={{ margin: '1rem 0' }}>Would you like to switch this order to Cash on Delivery?</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleConvertToCod()} className="btn btn--primary">
                Switch to COD
              </button>
              <button onClick={() => setPaymentFailedOrder(null)} className="btn btn--outline">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

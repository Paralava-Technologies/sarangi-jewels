'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isLoggedIn, loginStore, logout } from '@/lib/auth';
import { fetchMyOrders, downloadInvoice, type Order } from '@/lib/orders';
import { formatPrice } from '@/lib/format';
import { fetchWishlist, removeFromWishlist, type WishlistItem } from '@/lib/wishlist';
import { fetchAddresses, addAddress, updateAddress, deleteAddress, type Address } from '@/lib/addresses';
import { useCart } from '@/components/cart/cart-provider';
import { useRouter } from 'next/navigation';

export function AccountPanel(): React.JSX.Element {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState<'orders'|'profile'|'wishlist'|'addresses'|'inbox'>('orders');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState<Partial<Address> | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [openOrder, setOpenOrder] = useState<string|null>(null);
  const [inbox, setInbox] = useState<any[]>([]);
  const [inboxForm, setInboxForm] = useState(false);
  const [inboxSubject, setInboxSubject] = useState('');
  const [inboxMessage, setInboxMessage] = useState('');
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [refreshingTicket, setRefreshingTicket] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [changingToCod, setChangingToCod] = useState<string | null>(null);
  const [payingOrder, setPayingOrder] = useState<string | null>(null);
  const router = useRouter();
  const { addItem } = useCart();

  const handleBuyAgain = async (order: Order) => {
    setAddingToCart(order.id);
    try {
      for (const line of order.lines) {
        if (line.productId) {
          await addItem(line.productId, line.variantId || undefined, line.quantity);
        }
      }
      router.push('/cart');
    } catch (err) {
      alert('Could not add some items to cart.');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleNeedHelp = (order: Order) => {
    setTab('inbox');
    setInboxForm(true);
    setInboxSubject(`Question about Order #${order.orderNumber}`);
    setInboxMessage(`Hi Sarangi Jewels Support,\n\nI need help with my order ${order.orderNumber} placed on ${new Date(order.createdAt).toLocaleDateString()}.\n\n`);
  };

  useEffect(() => { 
    setLoggedIn(isLoggedIn()); 
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      if (search.get('tab') === 'addresses') {
        setTab('addresses');
        if (search.get('new') === '1') {
          setAddressForm({ country: 'India' });
        }
      }
    }
  }, []);
  useEffect(() => {
    if (!loggedIn) return;
    fetchOrders();
    fetchWishlistData();
    fetchAddressesData();
    fetchInbox();
    fetchProfile();
  }, [loggedIn]);

  const fetchProfile = () => import('@/lib/auth').then(({ authHeaders }) => fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1'}/store/user/me`, { headers: authHeaders() }).then(res => res.json()).then(res => setUser(res.data)).catch(() => {}));
  const fetchOrders = () => fetchMyOrders().then(setOrders).catch(() => setOrders([]));
  const fetchSettings = () => import('@/lib/api').then(({ apiClient }) => apiClient.store.getSettings().then(res => setSettings(res.data)).catch(() => {}));
  const fetchWishlistData = () => fetchWishlist().then(setWishlist).catch(() => setWishlist([]));
  const fetchAddressesData = () => fetchAddresses().then(setAddresses).catch(() => setAddresses([]));
  const fetchInbox = () => import('@/lib/api').then(({ apiClient }) => apiClient.store.getMySupportTickets().then(res => setInbox(res.data || res || [])).catch(() => setInbox([])));

  useEffect(() => {
    if (loggedIn && tab === 'wishlist') fetchWishlistData();
    if (loggedIn && tab === 'addresses') fetchAddressesData();
    if (loggedIn && tab === 'inbox') fetchInbox();
    if (loggedIn) fetchSettings();
  }, [loggedIn, tab]);

  const handleReinitiatePayment = async (order: Order) => {
    setPayingOrder(order.id);
    try {
      const { apiClient } = await import('@/lib/api');
      const sessionRes = await apiClient.store.createPaymentSession({ orderId: order.id });
      const session = sessionRes.data;

      if (session.isMock) {
        await apiClient.store.verifyPayment({
          orderId: order.id,
          razorpayOrderId: session.providerOrderId,
          razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          razorpaySignature: 'mock_signature_verified',
        });
        await fetchOrders();
        alert('Payment completed successfully!');
        setPayingOrder(null);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: session.keyId,
          amount: session.amount,
          currency: session.currency,
          name: 'Sarangi Jewels',
          description: `Order ${order.orderNumber}`,
          order_id: session.providerOrderId,
          handler: async function (response: any) {
            try {
              await apiClient.store.verifyPayment({
                orderId: order.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              await fetchOrders();
              alert('Payment completed successfully!');
            } catch (err: any) {
              alert(err?.message || 'Payment verification failed');
            } finally {
              setPayingOrder(null);
            }
          },
          prefill: {
            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '',
            email: user?.email || '',
          },
          theme: { color: '#6B2230' },
          modal: {
            ondismiss: function () {
              setPayingOrder(null);
            },
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        alert('Failed to load Razorpay script.');
        setPayingOrder(null);
      };
      document.body.appendChild(script);
    } catch (err: any) {
      alert(err?.message || 'Could not initiate payment');
      setPayingOrder(null);
    }
  };

  const handleChangeToCOD = async (orderId: string) => {
    setChangingToCod(orderId);
    try {
      const { apiClient } = await import('@/lib/api');
      await apiClient.store.changeToCod(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(err?.message || 'Could not change to COD');
    } finally {
      setChangingToCod(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try { await loginStore(email, password); setLoggedIn(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'Sign in failed.'); }
    finally { setLoading(false); }
  };

  const toggleOrder = (id: string) => setOpenOrder(openOrder === id ? null : id);

  if (!loggedIn) {
    return (
      <div className="wrap">
        <nav className="breadcrumb"><Link href="/">Home</Link><span>/</span><span style={{color:'var(--ink)'}}>Sign In</span></nav>
        <section className="auth">
          <div className="auth__visual">
            <svg className="bg-art" viewBox="0 0 560 660" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="af1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#DCD3C2"/><stop offset="100%" stopColor="#B89B6E"/></linearGradient></defs>
              <path d="M60 40 C200 10, 380 90, 420 230 C460 370, 320 420, 260 540 C220 620, 140 640, 90 600 C30 555, 80 470, 150 420 C230 365, 250 280, 190 210 C130 140, 20 120, 60 40 Z" fill="url(#af1)"/>
            </svg>
            <div className="auth__visual-top"><span className="tag">Member Access</span></div>
            <div><div className="auth__visual-hairline"/><h2>&quot;We don&apos;t chase seasons. We build the pieces that outlast them.&quot;</h2><span className="quote-byline">— The Sarangi Jewels Studio</span></div>
          </div>
          <div className="auth__form-card">
            <p className="eyebrow">Welcome Back</p>
            <h1>Sign in</h1>
            <p className="sub">Access your orders, saved details and early drop access.</p>
            <form onSubmit={handleLogin}>
              <div className="form-field"><label>Email Address</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div>
              <div className="form-field"><label>Password</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></div>
              {error && <p style={{fontSize:'.76rem',color:'var(--oxblood)',marginBottom:'1rem'}}>{error}</p>}
              <button type="submit" disabled={loading} className="btn btn--primary" style={{width:'100%'}}>{loading ? 'Signing in…' : 'Sign In'}</button>
            </form>
            <div className="auth__divider">or</div>
            <Link href="/" className="btn btn--outline" style={{width:'100%'}}>Continue as Guest</Link>
            <p className="auth__switch">New to Sarangi Jewels? <Link href="/register">Create an account</Link></p>
            <p style={{textAlign:'center',marginTop:'.5rem',fontSize:'.72rem',color:'rgba(33,29,25,.4)'}}>Demo: customer@noeve.local / Customer123!</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <nav className="breadcrumb"><Link href="/">Home</Link><span>/</span><span style={{color:'var(--ink)'}}>{tab === 'orders' ? 'Your Orders' : tab === 'profile' ? 'Account Details' : 'Wishlist'}</span></nav>
      <div className="page-head" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:'1rem'}}>
        <div>
          <p className="eyebrow">Account</p>
          <h1>{tab === 'orders' ? 'Your Orders' : tab === 'profile' ? 'Account Details' : 'Wishlist'}</h1>
        </div>
        <button onClick={() => { logout(); setLoggedIn(false); setOrders([]); setWishlist([]); }} style={{fontFamily:'var(--mono)',fontSize:'.72rem',letterSpacing:'.08em',textTransform:'uppercase',textDecoration:'underline',color:'rgba(33,29,25,.55)',background:'none',border:'none',cursor:'pointer'}}>Sign Out</button>
      </div>

      <nav className="account-tabs">
        <a href="#" className={tab==='orders'?'is-active':''} onClick={e=>{e.preventDefault();setTab('orders')}}>Orders</a>
        <a href="#" className={tab==='addresses'?'is-active':''} onClick={e=>{e.preventDefault();setTab('addresses')}}>Addresses</a>
        <a href="#" className={tab==='profile'?'is-active':''} onClick={e=>{e.preventDefault();setTab('profile')}}>Account Details</a>
        <a href="#" className={tab==='wishlist'?'is-active':''} onClick={e=>{e.preventDefault();setTab('wishlist')}}>Wishlist</a>
        <a href="#" className={tab==='inbox'?'is-active':''} onClick={e=>{e.preventDefault();setTab('inbox')}}>Inbox</a>
      </nav>

      {tab === 'orders' && (
        <div className="orders-list">
          {orders.length === 0 ? (
            <p style={{padding:'3rem 0',textAlign:'center',color:'rgba(33,29,25,.55)'}}>No orders yet. <Link href="/shop" style={{textDecoration:'underline',color:'var(--oxblood)'}}>Start shopping</Link></p>
          ) : orders.map(order => {
            const isOpen = openOrder === order.id;
            const statusClass = order.status === 'DELIVERED' ? 'status--delivered' : order.status === 'SHIPPED' ? 'status--shipped' : 'status--processing';
            return (
              <article key={order.id} className={`order-card ${isOpen?'is-open':''}`}>
                <div className="order-card__head" onClick={()=>toggleOrder(order.id)}>
                  <div>
                    <p className="order-card__id">{order.orderNumber}</p>
                    <p className="order-card__date">Placed {new Date(order.createdAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
                  </div>
                  <div className="order-card__mid">
                    <span className={`status ${statusClass}`}>{order.status}</span>
                    <span className="order-card__total">{formatPrice(order.totalCents, order.currency)}</span>
                  </div>
                  <span className="order-card__chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg></span>
                </div>
                <div 
                  className="order-card__body" 
                  style={{ 
                    maxHeight: isOpen ? '2000px' : '0px',
                    opacity: isOpen ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'all 0.4s ease',
                    borderTop: isOpen ? '1px solid rgba(33,29,25,.1)' : 'none'
                  }}
                >
                    <div className="order-card__body-inner">
                      <div>
                        {order.lines?.map((line, i) => (
                          <div key={i} className="order-line">
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <Link href={`/shop/${line.productSlug}`} style={{ display: 'block', position: 'relative', width: '56px', height: '56px', flexShrink: 0, background: 'linear-gradient(135deg,#DCD3C2,#B89B6E)' }}>
                                {line.imageUrl && <Image src={line.imageUrl} alt={line.productName} fill style={{ objectFit: 'cover' }} />}
                              </Link>
                              <div>
                                <Link href={`/shop/${line.productSlug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                  <p className="order-line__name">{line.productName}</p>
                                </Link>
                                <p className="order-line__meta">Qty {line.quantity}</p>
                              </div>
                            </div>
                            <span>{formatPrice(line.unitPriceCents * line.quantity, order.currency)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-meta" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(33,29,25,.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                          <span style={{ color: 'rgba(33,29,25,.7)' }}>Subtotal</span>
                          <span>{formatPrice(order.subtotalCents, order.currency)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                          <span style={{ color: 'rgba(33,29,25,.7)' }}>Shipping</span>
                          <span>{formatPrice(order.shippingCents, order.currency)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                          <span style={{ color: 'rgba(33,29,25,.7)' }}>Tax</span>
                          <span>{formatPrice(order.taxCents, order.currency)}</span>
                        </div>
                        {(order.discountCents ?? 0) > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem', color: 'var(--brand-primary)' }}>
                            <span>Discount {order.promotionCode ? `(${order.promotionCode})` : ''}</span>
                            <span>-{formatPrice(order.discountCents || 0, order.currency)}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginTop: '.5rem', paddingTop: '.5rem', borderTop: '1px solid rgba(33,29,25,.1)' }}>
                          <span>Total</span>
                          <span>{formatPrice(order.totalCents, order.currency)}</span>
                        </div>
                      </div>
                      <div className="order-meta" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <h4 style={{ fontSize: '.9rem', fontWeight: 600, marginBottom: '.25rem' }}>Fulfillment Status</h4>
                          <p style={{ fontSize: '.85rem', color: 'rgba(33,29,25,.8)', marginBottom: '.75rem' }}>{order.status}</p>
                          
                          <h4 style={{ fontSize: '.9rem', fontWeight: 600, marginBottom: '.25rem' }}>Payment</h4>
                          <p style={{ fontSize: '.85rem', color: 'rgba(33,29,25,.8)', marginBottom: '.75rem' }}>
                            {order.payment?.provider === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                            <span style={{ display: 'inline-block', marginLeft: '.5rem', padding: '.1rem .4rem', background: 'rgba(33,29,25,.05)', borderRadius: '4px', fontSize: '.75rem' }}>
                              {order.payment?.status || 'PENDING'}
                            </span>
                          </p>

                          {order.deliveryDate && (
                            <>
                              <h4 style={{ fontSize: '.9rem', fontWeight: 600, marginBottom: '.25rem' }}>Delivery Date</h4>
                              <p style={{ fontSize: '.85rem', color: 'rgba(33,29,25,.8)', marginBottom: '.75rem' }}>
                                {new Date(order.deliveryDate).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
                              </p>
                            </>
                          )}
                          {order.trackingNumber && (
                            <div style={{
                              marginTop: '.75rem',
                              border: '1px solid rgba(99,102,241,.25)',
                              borderRadius: '8px',
                              background: 'rgba(99,102,241,.05)',
                              padding: '.75rem',
                            }}>
                              <p style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'rgba(99,102,241,.9)', marginBottom: '.4rem' }}>
                                📦 Track Your Shipment
                              </p>
                              {order.carrier && (
                                <span style={{
                                  display: 'inline-block',
                                  background: 'rgba(99,102,241,.12)',
                                  color: 'rgba(67,56,202,1)',
                                  borderRadius: '999px',
                                  padding: '.15rem .6rem',
                                  fontSize: '.72rem',
                                  fontWeight: 600,
                                  marginBottom: '.4rem',
                                }}>
                                  {order.carrier}
                                </span>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.25rem' }}>
                                <code style={{
                                  fontFamily: 'var(--mono)',
                                  fontSize: '.8rem',
                                  fontWeight: 600,
                                  color: 'rgba(55,48,163,1)',
                                  letterSpacing: '.03em',
                                  flex: 1,
                                  wordBreak: 'break-all',
                                }}>
                                  {order.trackingNumber}
                                </code>
                                <button
                                  type="button"
                                  title="Copy tracking number"
                                  onClick={() => navigator.clipboard?.writeText(order.trackingNumber!)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'rgba(99,102,241,.8)', flexShrink: 0 }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                  </svg>
                                </button>
                              </div>
                              <a
                                href={`https://www.google.com/search?q=${encodeURIComponent((order.carrier ?? '') + ' ' + order.trackingNumber)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-block',
                                  marginTop: '.5rem',
                                  fontSize: '.72rem',
                                  color: 'rgba(99,102,241,.9)',
                                  textDecoration: 'underline',
                                  fontFamily: 'var(--mono)',
                                  letterSpacing: '.03em',
                                }}
                              >
                                Track online →
                              </a>
                            </div>
                          )}
                        </div>
                        {order.statusHistory && order.statusHistory.length > 0 && order.statusHistory[0].note && (
                          <div>
                            <h4 style={{ fontSize: '.9rem', fontWeight: 600, marginBottom: '.25rem' }}>Delivery & Gift Details</h4>
                            <div style={{ fontSize: '.85rem', color: 'rgba(33,29,25,.8)', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                              {order.statusHistory[0].note}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="order-card__actions">
                      <button 
                        onClick={() => handleBuyAgain(order)} 
                        disabled={addingToCart === order.id}
                        className="btn btn--primary"
                      >
                        {addingToCart === order.id ? 'Adding to Cart...' : 'Buy Again'}
                      </button>
                      <button 
                        onClick={() => handleNeedHelp(order)} 
                        className="btn btn--outline"
                      >
                        Need Help?
                      </button>
                      {order.status === 'PENDING_PAYMENT' && (
                        <button
                          onClick={() => handleReinitiatePayment(order)}
                          disabled={payingOrder === order.id}
                          className="btn btn--primary"
                        >
                          {payingOrder === order.id ? 'Loading...' : 'Pay Now'}
                        </button>
                      )}
                      {order.status === 'PENDING_PAYMENT' && settings?.codAllowed && (
                        <button
                          onClick={() => handleChangeToCOD(order.id)}
                          disabled={changingToCod === order.id}
                          className="btn btn--primary"
                          style={{ background: 'var(--ink)' }}
                        >
                          {changingToCod === order.id ? 'Updating...' : 'Change to COD'}
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          try {
                            await downloadInvoice(order.id);
                          } catch (e) {
                            alert('Could not download invoice');
                          }
                        }}
                        className="btn btn--outline"
                      >
                        Download Invoice
                      </button>
                    </div>
                  </div>
              </article>
            );
          })}
        </div>
      )}

      {tab === 'addresses' && (
        <div className="addresses-list">
          {addressForm ? (
              <form className="section-card" onSubmit={async (e) => {
              e.preventDefault();
              setSavingAddress(true);
              try {
                if (addressForm.id) {
                  await updateAddress(addressForm.id, addressForm as any);
                } else {
                  await addAddress(addressForm as any);
                }
                const newAddrs = await fetchAddresses();
                setAddresses(newAddrs);
                setAddressForm(null);
                
                // If came from checkout, redirect back to checkout
                if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('redirect') === 'checkout') {
                  window.location.href = '/checkout';
                }
              } catch (err) {
                alert(err instanceof Error ? err.message : 'Failed to save address');
              } finally {
                setSavingAddress(false);
              }
            }}>
              <h2>{addressForm.id ? 'Edit Address' : 'New Address'}</h2>
              <div className="form-row">
                <div className="form-field"><label>Name</label><input required minLength={2} maxLength={100} value={addressForm.name || ''} onChange={e=>setAddressForm({...addressForm, name: e.target.value})} /></div>
                <div className="form-field"><label>Mobile Number</label><input required pattern="\d{10}" title="Mobile number must be exactly 10 digits" value={addressForm.phone || ''} onChange={e=>setAddressForm({...addressForm, phone: e.target.value})} placeholder="10-digit number" /></div>
              </div>
              <div className="form-field"><label>Address Line 1</label><input required maxLength={255} value={addressForm.streetLine1 || ''} onChange={e=>setAddressForm({...addressForm, streetLine1: e.target.value})} /></div>
              <div className="form-field"><label>Address Line 2 (Optional)</label><input maxLength={255} value={addressForm.streetLine2 || ''} onChange={e=>setAddressForm({...addressForm, streetLine2: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-field"><label>City</label><input required maxLength={100} value={addressForm.city || ''} onChange={e=>setAddressForm({...addressForm, city: e.target.value})} /></div>
                <div className="form-field"><label>State</label><input required maxLength={100} value={addressForm.state || ''} onChange={e=>setAddressForm({...addressForm, state: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-field"><label>Postal Code</label><input required maxLength={20} value={addressForm.postalCode || ''} onChange={e=>setAddressForm({...addressForm, postalCode: e.target.value})} /></div>
                <div className="form-field"><label>Country</label><select required value={addressForm.country || 'India'} onChange={e=>setAddressForm({...addressForm, country: e.target.value})} style={{width:'100%',padding:'0.85em 1em',border:'1px solid rgba(33,29,25,.25)',background:'transparent',fontSize:'.95rem',outline:'none',borderRadius:'1px'}}><option value="India">India</option></select></div>
              </div>
              <div className="checkbox-row" style={{marginBottom: '1rem'}}><input type="checkbox" id="isDefault" checked={addressForm.isDefault || false} onChange={e=>setAddressForm({...addressForm, isDefault: e.target.checked})} /><label htmlFor="isDefault">Set as default</label></div>
              <div className="save-row">
                <button type="submit" disabled={savingAddress} className="btn btn--primary" style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                  {savingAddress ? (
                    <><svg className="spinner" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin 1s linear infinite'}}><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/></svg> Processing...</>
                  ) : 'Save'}
                </button>
                <button type="button" disabled={savingAddress} className="btn btn--outline" onClick={() => setAddressForm(null)}>Cancel</button>
              </div>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </form>
          ) : (
            <>
              <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem'}}>
                <button onClick={() => setAddressForm({ country: 'India' })} className="btn btn--primary">Add New Address</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(addresses || []).length === 0 ? (
                  <p style={{padding:'3rem 0',color:'rgba(33,29,25,.55)',gridColumn:'1/-1',textAlign:'center'}}>No addresses saved yet.</p>
                ) : (addresses || []).map(addr => (
                  <div key={addr.id} className="section-card" style={{position:'relative', padding:'1.5rem'}}>
                    {addr.isDefault && <span className="tag" style={{position:'absolute',top:'1rem',right:'1rem'}}>Default</span>}
                    <h4 style={{marginBottom:'.5rem'}}>{addr.name}</h4>
                    <p style={{fontSize:'.875rem',color:'rgba(33,29,25,.7)',marginBottom:'.25rem'}}>{addr.streetLine1}</p>
                    {addr.streetLine2 && <p style={{fontSize:'.875rem',color:'rgba(33,29,25,.7)',marginBottom:'.25rem'}}>{addr.streetLine2}</p>}
                    <p style={{fontSize:'.875rem',color:'rgba(33,29,25,.7)',marginBottom:'.25rem'}}>{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p style={{fontSize:'.875rem',color:'rgba(33,29,25,.7)',marginBottom:'1rem'}}>Phone: {addr.phone}</p>
                    <div style={{display:'flex',gap:'1rem'}}>
                      <button onClick={()=>setAddressForm(addr)} style={{fontFamily:'var(--mono)',fontSize:'.75rem',textTransform:'uppercase',textDecoration:'underline',background:'none',border:'none',cursor:'pointer'}}>Edit</button>
                      <button onClick={async ()=>{
                        if(confirm('Are you sure you want to delete this address?')) {
                          try { await deleteAddress(addr.id); setAddresses(await fetchAddresses()); }
                          catch(err) { alert('Failed to delete'); }
                        }
                      }} style={{fontFamily:'var(--mono)',fontSize:'.75rem',textTransform:'uppercase',textDecoration:'underline',color:'var(--oxblood)',background:'none',border:'none',cursor:'pointer'}}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'profile' && (
        <div className="profile-layout">
          <aside className="profile-card">
            <div className="avatar">{user ? (user.firstName?.[0] + (user.lastName?.[0] || '')) : 'MK'}</div>
            <h3>{user ? `${user.firstName} ${user.lastName || ''}` : 'Member'}</h3>
            <p className="email">{user?.email || email || 'customer@noeve.local'}</p>
            <p className="since">Member Since {user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}</p>
            <Link href="#" className="btn btn--outline" style={{width:'100%'}}>View Orders</Link>
          </aside>
          <div>
            <div className="section-card">
              <h2>Personal Information</h2>
              <p className="section-sub">Update your name, email and phone number.</p>
              <div className="form-row">
                <div className="form-field"><label>First Name</label><input type="text" defaultValue="Maren" style={{background:'var(--cream)'}}/></div>
                <div className="form-field"><label>Last Name</label><input type="text" defaultValue="K." style={{background:'var(--cream)'}}/></div>
              </div>
              <div className="form-field"><label>Email Address</label><input type="email" defaultValue={email || 'customer@noeve.local'} style={{background:'var(--cream)'}}/></div>
            </div>
            <div className="section-card">
              <h2>Email Preferences</h2>
              <p className="section-sub">Choose what you&apos;d like to hear from us about.</p>
              <div className="checkbox-row"><input type="checkbox" id="prefDrops" defaultChecked/><label htmlFor="prefDrops">New drops, early access and seasonal notes.</label></div>
              <div className="checkbox-row"><input type="checkbox" id="prefSms"/><label htmlFor="prefSms">SMS order and shipping updates.</label></div>
            </div>
            <div className="save-row">
              <button type="button" className="btn btn--primary">Save Changes</button>
              <a href="#" className="btn btn--outline">Cancel</a>
            </div>
          </div>
        </div>
      )}

      {tab === 'wishlist' && (
        <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          {wishlist.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '4rem 0', textAlign: 'center', color: 'rgba(33,29,25,.55)' }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Your wishlist is empty.</p>
              <Link href="/shop" className="btn btn--primary" style={{ display: 'inline-block' }}>
                Explore Collection
              </Link>
            </div>
          ) : (
            wishlist.map(item => (
              <article key={item.id} className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const updated = await removeFromWishlist(item.productId);
                      setWishlist(updated);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 10,
                    background: 'var(--cream)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                  title="Remove from wishlist"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--oxblood)" stroke="var(--oxblood)" strokeWidth="2">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                  </svg>
                </button>
                <Link href={`/shop/${item.productSlug}`} style={{ display: 'block', flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                  <div className="product-card__media" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '120%', background: 'var(--cream)', borderRadius: '4px' }}>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(33,29,25,.3)' }}>
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="product-card__meta" style={{ marginTop: '1rem' }}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>{item.productName}</h3>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--oxblood)', margin: 0 }}>
                      {formatPrice(item.basePriceCents, item.currency)}
                    </p>
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>
      )}
      {tab === 'inbox' && (
        <div className="addresses-list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="text-xl">Your Messages</h2>
            <button className="btn btn--primary" onClick={() => setInboxForm(true)}>New Message</button>
          </div>

          {inboxForm && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const { apiClient } = await import('@/lib/api');
                await apiClient.store.createSupportTicket({ name: 'User', email: 'user@example.com', subject: inboxSubject, message: inboxMessage });
                setInboxForm(false);
                setInboxSubject('');
                setInboxMessage('');
                fetchInbox();
              } catch (err) {
                console.error(err);
              }
            }} style={{ 
              marginBottom: '3rem', padding: '2rem', border: '1px solid var(--bone)', 
              borderRadius: '8px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontFamily: 'var(--serif)', color: 'var(--ink)' }}>Create a New Ticket</h3>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', color: 'rgba(33,29,25,.8)' }}>Subject</label>
                <input 
                  required 
                  value={inboxSubject} 
                  onChange={e => setInboxSubject(e.target.value)} 
                  placeholder="What do you need help with?"
                  style={{ 
                    width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--bone)', 
                    background: '#fafafa', borderRadius: '6px', outline: 'none', 
                    fontFamily: 'inherit', fontSize: '0.95rem'
                  }} 
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--oxblood)'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--bone)'; e.currentTarget.style.background = '#fafafa'; }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', color: 'rgba(33,29,25,.8)' }}>Message</label>
                <textarea 
                  required 
                  rows={5} 
                  value={inboxMessage} 
                  onChange={e => setInboxMessage(e.target.value)} 
                  placeholder="Describe your issue in detail..."
                  style={{ 
                    width: '100%', padding: '1rem', border: '1px solid var(--bone)', 
                    background: '#fafafa', borderRadius: '6px', outline: 'none', 
                    fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical'
                  }} 
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--oxblood)'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--bone)'; e.currentTarget.style.background = '#fafafa'; }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyItems: 'flex-end', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setInboxForm(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(33,29,25,.6)', cursor: 'pointer', fontWeight: 'bold', padding: '0.6rem 1.5rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" style={{ padding: '0.6rem 2rem', borderRadius: '4px' }}>
                  Submit Ticket
                </button>
              </div>
            </form>
          )}

          {inbox.length === 0 && !inboxForm ? (
            <p style={{padding:'3rem 0',textAlign:'center',color:'rgba(33,29,25,.55)'}}>You have no messages.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {(() => {
                const openTickets = inbox.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED');
                const closedTickets = inbox.filter(t => t.status === 'CLOSED' || t.status === 'RESOLVED');

                const renderTicket = (ticket: any) => (
                  <div 
                    key={ticket.id} 
                    onClick={() => setActiveTicket(ticket)}
                    style={{ 
                      padding: '1.2rem', border: '1px solid var(--bone)', borderRadius: '4px', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff',
                      transition: 'background 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--cream)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem 0' }}>{ticket.subject}</h3>
                      <span style={{ fontSize: '0.85rem', color: 'rgba(33,29,25,.6)' }}>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: ticket.status === 'OPEN' ? 'var(--oxblood)' : 'var(--ink)', background: 'var(--bone)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>{ticket.status}</span>
                  </div>
                );

                return (
                  <>
                    {openTickets.length > 0 && (
                      <div>
                        <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '1rem', fontWeight: 'bold' }}>Open Tickets</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {openTickets.map(renderTicket)}
                        </div>
                      </div>
                    )}
                    
                    {closedTickets.length > 0 && (
                      <div>
                        <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', color: 'rgba(33,29,25,.55)', marginBottom: '1rem', fontWeight: 'bold' }}>Closed & Resolved</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.85 }}>
                          {closedTickets.map(renderTicket)}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Active Ticket Drawer Modal */}
      {activeTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Backdrop */}
          <div 
            onClick={() => { setActiveTicket(null); setReplyMessage(''); }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
          />
          {/* Drawer Panel */}
          <aside style={{ position: 'relative', width: '100%', maxWidth: '600px', background: '#fff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', animation: 'slideIn 0.3s ease-out' }}>
            <style>{`
              @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
            
            {/* Drawer Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--bone)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--cream)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: activeTicket.status === 'OPEN' ? '#fff' : 'var(--ink)', background: activeTicket.status === 'OPEN' ? 'var(--oxblood)' : 'var(--bone)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>{activeTicket.status}</span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(33,29,25,.5)' }}>{new Date(activeTicket.createdAt).toLocaleString()}</span>
                </div>
                <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--ink)' }}>{activeTicket.subject}</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={async () => {
                    setRefreshingTicket(true);
                    try {
                      const { apiClient } = await import('@/lib/api');
                      const res = await apiClient.store.getMySupportTickets();
                      const updatedTickets = res.data || [];
                      setInbox(updatedTickets);
                      const updatedActive = updatedTickets.find((t: any) => t.id === activeTicket.id);
                      if (updatedActive) setActiveTicket(updatedActive);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setRefreshingTicket(false);
                    }
                  }}
                  disabled={refreshingTicket}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', opacity: refreshingTicket ? 0.5 : 1 }}
                  title="Refresh Ticket"
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animation: refreshingTicket ? 'spin 1s linear infinite' : 'none' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button 
                  onClick={() => { setActiveTicket(null); setReplyMessage(''); }}
                  style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--ink)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  title="Close Ticket"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Conversation Thread */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fafafa' }}>
              {/* Original Message Bubble */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(33,29,25,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', flexShrink: 0, color: 'var(--ink)' }}>
                  Y
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>You</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(33,29,25,.5)' }}>{new Date(activeTicket.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ background: '#fff', padding: '1rem', borderRadius: '1rem', borderTopLeftRadius: '0', fontSize: '0.95rem', whiteSpace: 'pre-wrap', color: 'var(--ink)', border: '1px solid var(--bone)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    {activeTicket.message}
                  </div>
                </div>
              </div>

              {/* Replies */}
              {activeTicket.replies?.map((reply: any) => {
                const isMe = !reply.isAdmin;
                return (
                  <div key={reply.id} style={{ display: 'flex', gap: '0.75rem', flexDirection: isMe ? 'row' : 'row-reverse' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: isMe ? 'rgba(33,29,25,0.1)' : 'var(--oxblood)', 
                      color: isMe ? 'var(--ink)' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem'
                    }}>
                      {isMe ? 'Y' : 'S'}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-start' : 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexDirection: isMe ? 'row' : 'row-reverse' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{isMe ? 'You' : 'Sarangi Jewels Support'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(33,29,25,.5)' }}>{new Date(reply.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ 
                        background: isMe ? '#fff' : 'var(--cream)', 
                        color: 'var(--ink)',
                        padding: '1rem', borderRadius: '1rem', 
                        borderTopLeftRadius: isMe ? '0' : '1rem',
                        borderTopRightRadius: isMe ? '1rem' : '0',
                        fontSize: '0.95rem', whiteSpace: 'pre-wrap',
                        maxWidth: '85%',
                        border: isMe ? '1px solid var(--bone)' : 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        {reply.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            {activeTicket.status !== 'CLOSED' && activeTicket.status !== 'RESOLVED' && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--bone)', background: '#fff' }}>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!replyMessage.trim()) return;
                  setSendingReply(true);
                  try {
                    const { apiClient } = await import('@/lib/api');
                    await apiClient.store.replyToSupportTicket(activeTicket.id, { message: replyMessage });
                    
                    // Re-fetch to update the active ticket
                    const res = await apiClient.store.getMySupportTickets();
                    const updatedTickets = res.data || [];
                    setInbox(updatedTickets);
                    
                    const updatedActive = updatedTickets.find((t: any) => t.id === activeTicket.id);
                    if (updatedActive) setActiveTicket(updatedActive);
                    
                    setReplyMessage('');
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setSendingReply(false);
                  }
                }}>
                  <textarea 
                    required 
                    rows={3} 
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    style={{ 
                      width: '100%', padding: '1rem', border: '1px solid var(--bone)', 
                      background: '#fff', marginBottom: '1rem', borderRadius: '8px',
                      fontFamily: 'inherit', fontSize: '0.95rem', resize: 'none',
                      outline: 'none', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        const target = e.target as HTMLTextAreaElement;
                        target.form?.requestSubmit();
                      }
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(33,29,25,.4)' }}>Press Ctrl+Enter or Cmd+Enter to send</span>
                    <button type="submit" disabled={sendingReply} className="btn btn--primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '4px' }}>
                      {sendingReply ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

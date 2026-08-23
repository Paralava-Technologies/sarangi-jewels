'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useCart } from '@/components/cart/cart-provider';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import { isLoggedIn } from '@/lib/auth';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '@/lib/wishlist';
import parse from 'html-react-parser';
import { SJAccordionItem } from '@/components/atomic/SJHomeComponents';


interface SJProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

const FALLBACK_GALLERY_BGS = [
  'linear-gradient(135deg, #DCD3C2, #B89B6E)',
  'linear-gradient(200deg, #F6F1E8, #DCD3C2)',
  'radial-gradient(circle at 30% 30%, #F6F1E8, #B89B6E 80%)',
  'repeating-linear-gradient(100deg, #DCD3C2 0 8px, #EDE7DB 8px 16px)',
];

export function SJProductDetail({ product, relatedProducts }: SJProductDetailProps): React.JSX.Element {
  const router = useRouter();
  const { addItem } = useCart();
  const [activeThumb, setActiveThumb] = useState(0);
  const [activeVariant, setActiveVariant] = useState(product.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [mode, setMode] = useState<'buy' | 'rent'>('buy');
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [rentStartDate, setRentStartDate] = useState('');
  const [rentEndDate, setRentEndDate] = useState('');

  React.useEffect(() => {
    import('@/lib/api').then(({ apiClient }) => {
      apiClient.store.getReviews(product.id).then(res => setReviews(res.data)).catch(console.error);
    });
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      alert('Please sign in to leave a review.');
      return;
    }
    setSubmittingReview(true);
    try {
      const { apiClient } = await import('@/lib/api');
      await apiClient.store.addReview(product.id, { rating: reviewRating, comment: reviewText });
      alert('Your review has been submitted and is pending approval.');
      setReviewText('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  React.useEffect(() => {
    if (isLoggedIn()) {
      fetchWishlist().then(items => {
        setInWishlist(items.some(item => item.productId === product.id));
      }).catch(err => console.error(err));
    }
  }, [product.id]);

  const handleWishlistToggle = async () => {
    if (!isLoggedIn()) {
      alert('Please sign in to save items to your wishlist.');
      return;
    }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        setInWishlist(false);
      } else {
        await addToWishlist(product.id);
        setInWishlist(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const FALLBACK_IMAGE = { url: 'https://placehold.co/600x600/f5f5f5/a3a3a3.png?text=No+Image', alt: 'Placeholder' };
  const images = product.images?.length ? product.images : [FALLBACK_IMAGE, FALLBACK_IMAGE, FALLBACK_IMAGE];
  const activeImage = images[activeThumb] || images[0];

  const handleAddToBag = async () => {
    if (product.variants && product.variants.length > 0) {
      if (!activeVariant || (activeVariant.stockQuantity ?? 0) <= 0) return;
    }

    if (mode === 'rent' && (!rentStartDate || !rentEndDate)) {
      alert('Please select both start and end dates for your rental.');
      return;
    }
    
    setIsAdding(true);
    try {
      const isRental = mode === 'rent';
      await addItem(product.id, activeVariant?.id, quantity, isRental, rentStartDate || undefined, rentEndDate || undefined);
      router.push('/cart');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const categoryName = product.category?.name || 'Jewellery';
  const materialLabel = product.material || 'Fine Material';

  return (
    <div className="wrap">
      {/* PDP Grid */}
      <section className="section" style={{ padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div className="crumbs" style={{ color: 'var(--gold)' }}>
              <Link href="/" style={{ color: 'inherit' }}>Home</Link> / <Link href="/shop" style={{ color: 'inherit' }}>Shop</Link> / {product.name}
            </div>
            <button 
              onClick={() => {
                if (window.history.length > 2) router.back();
                else router.push('/shop');
              }} 
              style={{ background: 'none', border: 'none', color: 'var(--wine)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: 500, padding: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back to List
            </button>
          </div>
          <div className="pd-layout">
            {/* Gallery */}
            <div>
              <div
                className="pd-gallery-main frame"
                style={{
                  background: 'linear-gradient(160deg,#efe0c0,#e2cf9f)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'zoom-in',
                  height: '500px'
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {activeImage ? (
                  <div style={{ position: 'absolute', inset: 0, transition: 'transform 0.1s ease-out', ...zoomStyle, pointerEvents: 'none' }}>
                    <Image
                      src={activeImage.url}
                      alt={activeImage.alt || product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  </div>
                ) : (
                  <span style={{fontSize: '5rem', color: 'rgba(74,14,30,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>&#128142;</span>
                )}
              </div>

              <div className="pd-thumbs">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={0}
                    style={{ background: 'transparent', position: 'relative', overflow: 'hidden', cursor: 'pointer', borderColor: activeThumb === idx ? 'var(--wine)' : 'var(--line)' }}
                    onClick={() => setActiveThumb(idx)}
                    onKeyDown={(e) => e.key === 'Enter' && setActiveThumb(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              <p className="eyebrow">{categoryName} · {materialLabel}</p>
              <h1 style={{fontSize: '2.3rem', margin: '12px 0 10px', color: 'var(--wine-deep)', fontFamily: 'var(--display)'}}>{product.name}</h1>
              <div className="stars" style={{color: 'var(--gold)', marginBottom: '16px'}}>
                {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))} 
                <span style={{color: '#8a7a6a', fontSize: '.8rem', fontFamily: 'Jost'}}>({reviews.length} reviews)</span>
              </div>

              <div className="pd-mode-toggle">
                <button className={mode === 'buy' ? 'active' : ''} onClick={() => setMode('buy')}>Buy — Own It</button>
                {product.isRental && (
                  <button className={mode === 'rent' ? 'active' : ''} onClick={() => setMode('rent')}>Rent — Wear It</button>
                )}
              </div>

              {mode === 'buy' && (
                <div id="buyPanel">
                  <div className="price-row">
                    <span className="price" style={{fontSize: '2rem'}}>{formatPrice(activeVariant ? activeVariant.priceCents : product.basePriceCents, product.currency)}</span>
                    {(activeVariant ? activeVariant.compareAtPriceCents : product.compareAtPriceCents) && (
                      <span className="price strike" style={{fontSize: '1.2rem'}}>{formatPrice((activeVariant ? activeVariant.compareAtPriceCents : product.compareAtPriceCents) as number, product.currency)}</span>
                    )}
                  </div>
                  <div style={{color: '#6b5a4d', margin: '16px 0', lineHeight: 1.8, fontSize: '.92rem'}}>
                    {product.description ? parse(product.description) : 'A beautifully detailed and premium quality addition to our curated drops, designed with clean silhouettes and made to last.'}
                  </div>
                  
                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div className="sizes" style={{flexWrap: 'wrap'}}>
                        {product.variants.map((v) => (
                          <button
                            key={v.id}
                            className={`size-pill ${activeVariant?.id === v.id ? 'is-active' : ''}`}
                            onClick={() => setActiveVariant(v)}
                            disabled={(v.stockQuantity ?? 0) <= 0}
                            style={{ 
                              opacity: (v.stockQuantity ?? 0) <= 0 ? 0.5 : 1, 
                              textDecoration: (v.stockQuantity ?? 0) <= 0 ? 'line-through' : 'none',
                            }}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="qty-stepper" style={{ background: 'var(--white)' }}>
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                      <span>{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)}>+</button>
                    </div>
                    <button className="btn btn-gold" onClick={handleAddToBag} disabled={isAdding || (activeVariant ? (activeVariant.stockQuantity ?? 0) <= 0 : false)} style={{ flex: 1, justifyContent: 'center' }}>
                      {isAdding ? 'Adding…' : (activeVariant && (activeVariant.stockQuantity ?? 0) <= 0) ? 'Out of Stock' : 'Add To Bag'}
                    </button>
                    <button onClick={handleWishlistToggle} disabled={wishlistLoading} style={{ width: '50px', height: '50px', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', cursor: 'pointer' }}>
                      <span style={{ color: inWishlist ? 'var(--wine)' : 'rgba(74,14,30,.5)', fontSize: '1.2rem' }}>{inWishlist ? '♥' : '♡'}</span>
                    </button>
                  </div>
                </div>
              )}

              {mode === 'rent' && (
                <div id="rentPanel">
                  <div className="price-row">
                    <span className="price" style={{fontSize: '2rem'}}>
                      {formatPrice(activeVariant?.rentPriceCents ?? product.rentPriceCents ?? Math.round((activeVariant ? activeVariant.priceCents : product.basePriceCents) * 0.1), product.currency)}
                    </span>
                    <span style={{color: '#8a7a6a', fontSize: '.9rem'}}>/ day</span>
                  </div>
                  <div className="pd-meta">
                    <div><strong>Deposit</strong><br/>{activeVariant?.rentalDepositCents || product.rentalDepositCents ? formatPrice(activeVariant?.rentalDepositCents ?? product.rentalDepositCents ?? 0, product.currency) : 'None'} (refundable)</div>
                    <div><strong>Min. Rental</strong><br/>2 days</div>
                    <div><strong>Cleaning</strong><br/>Included</div>
                  </div>
                  <label style={{fontSize: '.8rem', color: '#6b5a4d', display: 'block', marginBottom: '6px'}}>Select your dates</label>
                  <div style={{display: 'flex', gap: '10px', marginBottom: '18px'}}>
                    <input type="date" value={rentStartDate} onChange={e => setRentStartDate(e.target.value)} style={{flex: 1, padding: '12px', border: '1px solid var(--line)', fontFamily: 'Jost'}} />
                    <input type="date" value={rentEndDate} onChange={e => setRentEndDate(e.target.value)} style={{flex: 1, padding: '12px', border: '1px solid var(--line)', fontFamily: 'Jost'}} />
                  </div>
                  <button className="btn btn-peacock" onClick={handleAddToBag} style={{width: '100%', justifyContent: 'center'}}>Reserve This Item</button>
                </div>
              )}
          <div className="accordion" style={{ marginTop: '34px' }}>
            <SJAccordionItem summary="Details &amp; Care" open>
              {product.composition && <div><strong>Composition:</strong> {parse(product.composition)}</div>}
              {product.careInstructions ? parse(product.careInstructions) : <p>Antique gold-tone alloy, hand-set stones, nickel-free coating. Store in a dry pouch, avoid perfume contact.</p>}
            </SJAccordionItem>
            <SJAccordionItem summary="Size &amp; Fit">
              {product.sizeAndFit ? parse(product.sizeAndFit) : <p>Adjustable thread closure, fits neck sizes 12&quot;–16&quot;.</p>}
            </SJAccordionItem>
            <SJAccordionItem summary="Delivery &amp; Rental Terms">
              {product.shippingAndReturns ? parse(product.shippingAndReturns) : <p>Free store pickup in Kochi. Delivery across Kerala in 2–4 days. Rental deposit refunded within 48 hours of return, subject to condition check.</p>}
            </SJAccordionItem>
          </div>
        </div>
        </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">From the current edit</p>
            <h2>You may also like</h2>
          </div>
          <div className="product-grid">
            {relatedProducts.slice(0, 4).map((rp, idx) => (
              <div key={rp.id} className="product-card">
                <Link href={`/shop/${rp.slug}`}>
                  <div
                    className="product-media"
                    style={{
                      background: FALLBACK_GALLERY_BGS[idx % FALLBACK_GALLERY_BGS.length],
                      position: 'relative',
                      aspectRatio: '1',
                      width: '100%',
                    }}
                  >
                    <span className="wish">&#9825;</span>
                    {rp.images?.[0] && (
                      <Image
                        src={rp.images[0].url}
                        alt={rp.images[0].alt || rp.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    )}
                  </div>
                  <div className="product-info">
                    <div className="cat">{rp.category?.name || 'Jewellery'}</div>
                    <h4>{rp.name}</h4>
                    <div className="price-row">
                      <span className="price">{formatPrice(rp.basePriceCents, rp.currency)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section" id="reviews">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">What they say</p>
            <h2>Customer reviews</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '3rem', padding: '2rem', background: 'var(--cream)', border: '1px solid var(--line)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontFamily: 'var(--display)', color: 'var(--wine)', lineHeight: 1 }}>{avgRating}</div>
              <div style={{ color: 'var(--gold)', letterSpacing: '2px', margin: '10px 0' }}>{'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}</div>
              <div style={{ fontSize: '0.85rem', color: '#6b5a4d' }}>Based on {reviews.length} reviews</div>
            </div>
          </div>

          <form onSubmit={handleSubmitReview} style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--white)', border: '1px solid var(--line)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--display)' }}>Write a review</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Rating</label>
              <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} style={{ padding: '0.8rem', border: '1px solid var(--line)', width: '100%', maxWidth: '200px' }}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Comment</label>
              <textarea required value={reviewText} onChange={e => setReviewText(e.target.value)} rows={4} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--line)', fontFamily: 'inherit' }} />
            </div>
            <button type="submit" className="btn btn-gold" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>

          <div className="testi-grid">
            {reviews.length === 0 ? (
              <p style={{ color: 'rgba(33,29,25,0.6)' }}>No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map(review => (
                <div className="testi-card" key={review.id}>
                  <div className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                  <p>{review.comment}</p>
                  <div className="who">
                    {review.user?.firstName || 'Anonymous'}
                    <span className="tag" style={{ marginLeft: '10px' }}>Verified Buyer</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

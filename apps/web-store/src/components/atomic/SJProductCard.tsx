import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import { SJWishlistButton } from '@/components/atomic/SJWishlistButton';

interface SJProductCardProps {
  product?: Product;
  isRent?: boolean;
  glyph?: string;
  badgeOverride?: string;
  rentNote?: string;
  // Fallbacks if not using full Product model
  href?: string;
  title?: string;
  category?: string;
  price?: string;
  strike?: string;
}

export function SJProductCard({ product, isRent, glyph = '💎', badgeOverride, rentNote, href, title, category, price, strike }: SJProductCardProps) {
  const linkHref = href || (product ? `/shop/${product.slug}` : '#');
  const displayTitle = title || product?.name || 'Untitled Product';
  const displayCategory = category || product?.category?.name || 'Jewellery';
  const displayPrice = price || (product ? formatPrice(product.basePriceCents, product.currency) : '');
  const image = product?.images?.[0];

  return (
    <div className="product-card">
      <Link href={linkHref}>
        <div className="product-media">
          {badgeOverride ? (
            <span className={`badge ${isRent ? 'rent' : ''}`}>{badgeOverride}</span>
          ) : (product?.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 1) === 0 ? (
            <span className={`badge ${isRent ? 'rent' : ''}`}>Out of Stock</span>
          ) : null}
          {product?.id ? <SJWishlistButton productId={product.id} /> : <span className="wish">♡</span>}
          {image ? (
            <Image
              src={image.url}
              alt={image.alt ?? displayTitle}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <span className="glyph">{glyph}</span>
          )}
        </div>
        <div className="product-info">
          <div className="cat">{displayCategory}</div>
          <h4>{displayTitle}</h4>
          <div className="price-row">
            <span className="price">{displayPrice}</span>
            {strike && <span className="price strike">{strike}</span>}
          </div>
          {rentNote && <div className="rent-note">{rentNote}</div>}
        </div>
      </Link>
    </div>
  );
}

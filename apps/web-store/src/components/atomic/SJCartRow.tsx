'use client';

import React from 'react';
import Image from 'next/image';

interface SJCartRowProps {
  id: string;
  imageUrl?: string;
  productName: string;
  sku?: string;
  quantity: number;
  formattedPrice: string;
  orderType?: 'RETAIL' | 'RENTAL' | 'MAKEUP';
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  children?: React.ReactNode;
}

export function SJCartRow({
  id,
  imageUrl,
  productName,
  sku,
  quantity,
  formattedPrice,
  orderType = 'RETAIL',
  onUpdateQuantity,
  onRemove,
  children
}: SJCartRowProps): React.JSX.Element {
  return (
    <div className="cart-row">
      <div className="thumb" style={{ position: 'relative', overflow: 'hidden' }}>
        {imageUrl ? (
          <Image src={imageUrl} alt={productName} fill style={{ objectFit: 'cover' }} />
        ) : '💎'}
      </div>
      <div>
        <h5>{productName}</h5>
        <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{sku || 'Piece'}</span>
          <span style={{ 
            fontSize: '0.65rem', 
            textTransform: 'uppercase', 
            background: orderType === 'RENTAL' ? '#e2d7c1' : orderType === 'MAKEUP' ? '#edd4d4' : '#f0f0f0',
            padding: '2px 6px',
            borderRadius: '4px',
            letterSpacing: '0.5px'
          }}>
            {orderType === 'RENTAL' ? 'Rental' : orderType === 'MAKEUP' ? 'Makeup Session' : 'Purchase'}
          </span>
        </div>
      </div>
      <div className="qty-stepper">
        <button onClick={() => onUpdateQuantity(id, Math.max(1, quantity - 1))}>
          -
        </button>
        <span>{quantity}</span>
        <button onClick={() => onUpdateQuantity(id, quantity + 1)}>
          +
        </button>
      </div>
      <div className="price">{formattedPrice}</div>
      <div>{children}</div>
      <div>
        <button className="remove-link" onClick={() => onRemove(id)}>
          Remove
        </button>
      </div>
    </div>
  );
}

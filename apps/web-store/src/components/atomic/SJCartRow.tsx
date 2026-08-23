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
        <div className="meta">{sku || 'Piece'}</div>
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

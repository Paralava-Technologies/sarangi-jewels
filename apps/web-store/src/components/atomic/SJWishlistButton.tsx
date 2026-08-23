'use client';

import React, { useEffect, useState } from 'react';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '@/lib/wishlist';
import { isLoggedIn } from '@/lib/auth';

export function SJWishlistButton({ productId }: { productId: string }) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn() && productId) {
      fetchWishlist().then(items => {
        setInWishlist(items.some(item => item.productId === productId));
      }).catch(() => {});
    }
  }, [productId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn()) {
      alert('Please sign in to save items to your wishlist.');
      return;
    }
    
    if (loading) return;
    setLoading(true);
    
    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
        setInWishlist(false);
      } else {
        await addToWishlist(productId);
        setInWishlist(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span 
      className="wish" 
      onClick={handleToggle}
      style={{ 
        cursor: 'pointer',
        color: inWishlist ? 'var(--wine)' : 'inherit',
        opacity: loading ? 0.5 : 1
      }}
    >
      {inWishlist ? '♥' : '♡'}
    </span>
  );
}

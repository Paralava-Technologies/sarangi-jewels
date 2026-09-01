'use client';

import { apiClient } from './api';
import type { WishlistItem } from '@sarangi/shared-types';

export type { WishlistItem };

import { isLoggedIn } from './auth';

export async function fetchWishlist(): Promise<WishlistItem[]> {
  if (!isLoggedIn()) return [];
  try {
    const res = await apiClient.store.getWishlist();
    return res.data;
  } catch (err) {
    return [];
  }
}

export async function addToWishlist(productId: string): Promise<WishlistItem[]> {
  const res = await apiClient.store.addToWishlist({ productId });
  return res.data;
}

export async function removeFromWishlist(productId: string): Promise<WishlistItem[]> {
  const res = await apiClient.store.removeFromWishlist(productId);
  return res.data;
}

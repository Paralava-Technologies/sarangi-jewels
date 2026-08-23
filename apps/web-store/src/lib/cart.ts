import { apiClient } from './api';
import type { Cart, CartLine } from '@noeve/shared-types';

const SESSION_KEY = 'noeve_cart_session';

export type { Cart, CartLine };

const emptyCart: Cart = {
  id: null,
  sessionId: null,
  lines: [],
  subtotalCents: 0,
  itemCount: 0,
  currency: 'INR',
  taxCents: 0,
  shippingCents: 0,
  cgstCents: 0,
  sgstCents: 0,
  igstCents: 0,
  totalCents: 0,
};

export function getCartSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setCartSessionId(sessionId: string) {
  localStorage.setItem(SESSION_KEY, sessionId);
}

async function ensureSession(): Promise<string> {
  let sessionId = getCartSessionId();
  if (sessionId) return sessionId;

  const res = await apiClient.store.getCartSession();
  sessionId = res.data.sessionId;
  if (sessionId) {
    setCartSessionId(sessionId);
  }
  return sessionId || '';
}

export async function fetchCart(): Promise<Cart> {
  try {
    const sessionId = getCartSessionId();
    if (!sessionId) return emptyCart;
    const res = await apiClient.store.getCart();
    return res.data;
  } catch {
    return emptyCart;
  }
}

export async function addToCart(productId: string, variantId?: string, quantity = 1, isRental?: boolean, rentStartDate?: string, rentEndDate?: string) {
  await ensureSession();
  const res = await apiClient.store.addToCart({ productId, variantId, quantity, isRental, rentStartDate, rentEndDate });
  return res.data;
}

export async function updateCartLine(lineId: string, quantity: number) {
  await ensureSession();
  const res = await apiClient.store.updateCartLine(lineId, { quantity });
  return res.data;
}

export async function removeCartLine(lineId: string) {
  await ensureSession();
  const res = await apiClient.store.removeCartLine(lineId);
  return res.data;
}

export async function clearCart() {
  await ensureSession();
  const res = await apiClient.store.clearCart();
  return res.data;
}

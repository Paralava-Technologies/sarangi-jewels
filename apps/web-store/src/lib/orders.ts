'use client';

import { authHeaders } from './auth';
import { getCartSessionId } from './cart';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

export interface OrderLine {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  imageUrl?: string | null;
  productSlug?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  trackingNumber: string | null;
  carrier: string | null;
  deliveryDate?: string | null;
  createdAt: string;
  lines: OrderLine[];
  statusHistory?: { note: string | null; createdAt: string }[];
  discountCents?: number;
  promotionCode?: string | null;
  payment?: {
    status: string;
    provider: string;
  };
}

export async function placeOrder(
  note?: string,
  promotionCode?: string,
  discountCents?: number,
  deliveryMethod?: 'ONLINE_DELIVERY' | 'STORE_PICKUP',
): Promise<Order> {
  const sessionId = getCartSessionId();
  const res = await fetch(`${API_URL}/store/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(sessionId ? { 'X-Cart-Session': sessionId } : {}),
    },
    body: JSON.stringify({ note, promotionCode, discountCents, deliveryMethod }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Could not place order');
  }
  const json = await res.json();
  return json.data as Order;
}

export async function fetchMyOrders(): Promise<Order[]> {
  const res = await fetch(`${API_URL}/store/orders`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error('Could not load orders');
  }
  const json = await res.json();
  return json.data as Order[];
}

export async function validatePromotion(
  code: string,
  cartTotalCents: number,
): Promise<{ discountCents: number; code: string }> {
  const res = await fetch(`${API_URL}/store/orders/promotions/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ code, cartTotalCents }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Invalid promotion code');
  }
  const json = await res.json();
  return json.data;
}

export async function downloadInvoice(orderId: string): Promise<void> {
  const res = await fetch(`${API_URL}/store/orders/${orderId}/invoice`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error('Could not download invoice');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${orderId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

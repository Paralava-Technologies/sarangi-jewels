'use client';

import React from 'react';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  addToCart as apiAdd,
  fetchCart,
  removeCartLine,
  updateCartLine,
  type Cart,
} from '@/lib/cart';

interface CartContextValue {
  cart: Cart;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: string, variantId?: string, quantity?: number, isRental?: boolean, rentStartDate?: string, rentEndDate?: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

const empty: Cart = {
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

export function CartProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [cart, setCart] = useState<Cart>(empty);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await fetchCart();
    setCart(data);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const addItem = useCallback(async (productId: string, variantId?: string, quantity = 1, isRental?: boolean, rentStartDate?: string, rentEndDate?: string) => {
    const data = await apiAdd(productId, variantId, quantity, isRental, rentStartDate, rentEndDate);
    setCart(data);
  }, []);

  const updateQuantity = useCallback(async (lineId: string, quantity: number) => {
    try {
      const data = await updateCartLine(lineId, quantity);
      setCart(data);
    } catch (error) {
      console.warn('Failed to update cart line, refreshing cart state:', error);
      await refresh();
    }
  }, [refresh]);

  const removeItem = useCallback(async (lineId: string) => {
    try {
      const data = await removeCartLine(lineId);
      setCart(data);
    } catch (error) {
      console.warn('Failed to remove cart line, refreshing cart state:', error);
      await refresh();
    }
  }, [refresh]);

  const value = useMemo(
    () => ({ cart, loading, refresh, addItem, updateQuantity, removeItem }),
    [cart, loading, refresh, addItem, updateQuantity, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

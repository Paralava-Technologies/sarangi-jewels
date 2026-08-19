import Constants from 'expo-constants';
import { SarangiJewelsApiClient } from '@noeve/api-client';
import type { Category, Product, WishlistItem } from '@noeve/shared-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SESSION_KEY = 'noeve_cart_session';
export const TOKEN_KEY = 'noeve_access_token';

let currentSessionId: string | null = null;
let currentAccessToken: string | null = null;

AsyncStorage.getItem(SESSION_KEY).then(val => { currentSessionId = val; });
AsyncStorage.getItem(TOKEN_KEY).then(val => { currentAccessToken = val; });

export function getApiUrl() {
  return (
    (Constants.expoConfig?.extra as { apiUrl?: string })?.apiUrl ?? 'http://localhost:3001/v1'
  );
}

export const apiClient = new SarangiJewelsApiClient({
  baseUrl: getApiUrl(),
  getSessionId: () => currentSessionId,
  getAccessToken: () => currentAccessToken,
});

export async function setApiSessionId(id: string) {
  currentSessionId = id;
  await AsyncStorage.setItem(SESSION_KEY, id);
}

export async function setApiAccessToken(token: string | null) {
  currentAccessToken = token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await apiClient.store.getCategories();
    return res.data;
  } catch {
    return [];
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await apiClient.store.getProducts();
    return res.data;
  } catch {
    return [];
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await apiClient.store.getProduct(slug);
    return res.data;
  } catch {
    return null;
  }
}

export function filterByCategory(products: Product[], categorySlug?: string) {
  if (!categorySlug) return products;
  return products.filter((p) => p.category?.slug === categorySlug);
}

export async function getWishlist(): Promise<WishlistItem[]> {
  try {
    const res = await apiClient.store.getWishlist();
    return res.data;
  } catch {
    return [];
  }
}

export async function addToWishlist(productId: string): Promise<WishlistItem[]> {
  try {
    const res = await apiClient.store.addToWishlist({ productId });
    return res.data;
  } catch {
    return [];
  }
}

export async function removeFromWishlist(productId: string): Promise<WishlistItem[]> {
  try {
    const res = await apiClient.store.removeFromWishlist(productId);
    return res.data;
  } catch {
    return [];
  }
}


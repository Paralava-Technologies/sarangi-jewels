import { SarangiJewelsApiClient } from '@sarangi/api-client';
import { getCartSessionId } from './cart';
import { getAccessToken } from './auth';
import type { Category, Product } from '@sarangi/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

export const apiClient = new SarangiJewelsApiClient({
  baseUrl: API_URL,
  getSessionId: () => {
    if (typeof window === 'undefined') return null;
    return getCartSessionId();
  },
  getAccessToken: () => {
    if (typeof window === 'undefined') return null;
    return getAccessToken();
  },
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      const { clearAccessToken } = require('./auth');
      clearAccessToken();
      const path = window.location.pathname;
      if (path.startsWith('/account') || path.startsWith('/checkout')) {
        window.location.href = '/login?session_expired=true';
      } else {
        window.location.reload();
      }
    }
  }
});

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await apiClient.store.getCategories({ next: { revalidate: 60 } } as RequestInit);
    return res.data;
  } catch {
    return [];
  }
}

export async function getProducts(sort?: string): Promise<Product[]> {
  try {
    const res = await apiClient.store.getProducts({ sort }, { next: { revalidate: 60 } } as RequestInit);
    return res.data;
  } catch {
    return [];
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await apiClient.store.getProduct(slug, { cache: 'no-store' } as RequestInit);
    return res.data;
  } catch {
    return null;
  }
}

export function filterByCategory(products: Product[], categorySlug?: string) {
  if (!categorySlug) return products;
  return products.filter((p) => p.category?.slug === categorySlug);
}

export async function getBlogs(page = 1, pageSize = 20, category?: string) {
  try {
    const url = new URL(`${API_URL}/store/blogs`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('pageSize', pageSize.toString());
    if (category) url.searchParams.append('category', category);
    
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch blogs');
    return res.json();
  } catch (err) {
    return { data: [], meta: { page, pageSize, total: 0, totalPages: 0 } };
  }
}

export async function getBlog(slug: string) {
  try {
    const res = await fetch(`${API_URL}/store/blogs/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    return null;
  }
}

export async function getSettings() {
  try {
    const res = await fetch(`${API_URL}/store/settings`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    return null;
  }
}

export async function getMakeupPackages(): Promise<any[]> {
  try {
    const res = await apiClient.store.getMakeupPackages({ next: { revalidate: 60 } } as RequestInit);
    return res.data;
  } catch {
    return [];
  }
}

export async function getMakeupPackage(slug: string): Promise<any | null> {
  try {
    const res = await apiClient.store.getMakeupPackage(slug, { next: { revalidate: 60 } } as RequestInit);
    return res.data;
  } catch {
    return null;
  }
}

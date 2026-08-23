'use client';

import { getAccessToken, clearAccessToken } from './auth';
import { SarangiJewelsApiClient } from '@noeve/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';


async function fetchWithAuth(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    apiClient.config.onUnauthorized?.();
  }
  return res;
}

export const apiClient = new SarangiJewelsApiClient({
  baseUrl: API_URL,
  getAccessToken: () => getAccessToken(),
  onUnauthorized: () => {
    clearAccessToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login?session_expired=true';
    }
  },
});

export interface OrderLine {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface OrderUserAddress {
  name: string;
  phone: string;
  streetLine1: string;
  streetLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  addresses?: OrderUserAddress[];
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
  createdAt: string;
  lines: OrderLine[];
  user?: OrderUser;
  discountCents?: number;
  promotionCode?: string | null;
  payment?: {
    status: string;
    provider: string;
  };
  deliveryDate?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchOrders(
  status?: string,
  page = 1,
  pageSize = 20,
  paymentProvider?: string,
  paymentStatus?: string,
  deliveryDate?: string,
  search?: string
): Promise<PaginatedResponse<Order>> {
  const res = await apiClient.admin.getOrders({ status, page, pageSize, paymentProvider, paymentStatus, deliveryDate, search } as any);
  return { data: res.data as unknown as Order[], meta: res.meta! };
}

export async function fetchRentals(page = 1, pageSize = 100): Promise<PaginatedResponse<any>> {
  const res = await apiClient.admin.getRentals({ page, pageSize });
  return { data: res.data as unknown as any[], meta: res.meta! };
}

export async function updateOrderStatus(orderId: string, status: string, note?: string, trackingNumber?: string, carrier?: string): Promise<Order> {
  const res = await apiClient.admin.updateOrderStatus(orderId, { status, note, trackingNumber, carrier });
  return res.data as unknown as Order;
}

export async function updateOrderDeliveryDate(orderId: string, deliveryDate: string | null): Promise<Order> {
  const token = getAccessToken();
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';
  const res = await fetchWithAuth(`${API_URL}/admin/orders/${orderId}/delivery-date`, {
    method: 'PATCH',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ deliveryDate })
  });
  if (!res.ok) throw new Error('Failed to update delivery date');
  const json = await res.json();
  return json.data as unknown as Order;
}

export async function refundOrder(orderId: string, reason?: string): Promise<any> {
  const token = getAccessToken();
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';
  const res = await fetchWithAuth(`${API_URL}/admin/orders/${orderId}/refund`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to refund order');
  }
  return res.json();
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  priceCents: number;
  rentPriceCents?: number | null;
  rentalDepositCents?: number | null;
  stockQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePriceCents: number;
  rentPriceCents?: number | null;
  rentalDepositCents?: number | null;
  isRental?: boolean;
  currency: string;
  categoryId: string;
  material: string | null;
  purity: string | null;
  gemstone: string | null;
  weightGrams: number | null;
  composition?: string;
  careInstructions?: string;
  sizeAndFit?: string;
  shippingAndReturns?: string;
  hsnCode?: string;
  createdAt?: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
  reviews?: { rating: number }[];
}

export async function fetchProducts(page = 1, pageSize = 20): Promise<PaginatedResponse<Product>> {
  const res = await apiClient.admin.getProducts({ page, pageSize });
  return { data: res.data as unknown as Product[], meta: res.meta! };
}

export async function createProduct(payload: any): Promise<Product> {
  const res = await apiClient.admin.createProduct(payload);
  return res.data as unknown as Product;
}

export async function updateProduct(id: string, payload: any): Promise<Product> {
  const res = await apiClient.admin.updateProduct(id, payload);
  return res.data as unknown as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.admin.deleteProduct(id);
}

export async function uploadFile(file: File): Promise<string> {
  const res = await apiClient.admin.uploadFile(file);
  return res.data.url;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  taxRatePercentage?: number | null;
  returnPolicy?: string | null;
}

export async function fetchCategories(page = 1, pageSize = 20): Promise<PaginatedResponse<Category>> {
  const res = await apiClient.admin.getCategories({ page, pageSize });
  return { data: res.data as unknown as Category[], meta: res.meta! };
}

export async function createCategory(data: any): Promise<Category> {
  const res = await apiClient.admin.createCategory(data);
  return res.data as unknown as Category;
}

export async function updateCategory(id: string, data: any): Promise<Category> {
  const res = await apiClient.admin.updateCategory(id, data);
  return res.data as unknown as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.admin.deleteCategory(id);
}

export interface Promotion {
  id: string;
  code: string;
  description: string | null;
  discountPercentage: number | null;
  discountCents: number | null;
  minOrderValue: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export async function fetchPromotions(page = 1, pageSize = 20): Promise<PaginatedResponse<Promotion>> {
  const res = await apiClient.admin.getPromotions({ page, pageSize });
  return { data: res.data as unknown as Promotion[], meta: res.meta! };
}

export async function createPromotion(payload: any): Promise<Promotion> {
  const res = await apiClient.admin.createPromotion(payload);
  return res.data as unknown as Promotion;
}

export async function deletePromotion(id: string): Promise<void> {
  await apiClient.admin.deletePromotion(id);
}

export interface StoreSettings {
  id: string;
  storeName?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  whatsappNumber?: string | null;
  facebookLink?: string | null;
  instagramLink?: string | null;
  codAllowed: boolean;
  codReconciliationMode: 'MANUAL' | 'AUTOMATIC';
  shippingThresholdCents: number;
  shippingRateCents: number;
  taxRatePercentage: number;
  storeState: string;
  gstin?: string;
  marqueeText?: string;
  rentalDeliveryAllowed?: boolean;
  updatedAt: string;
}

export async function fetchSettings(): Promise<StoreSettings> {
  const res = await apiClient.admin.getSettings();
  return res.data as unknown as StoreSettings;
}

export async function updateSettings(payload: any): Promise<StoreSettings> {
  const res = await apiClient.admin.updateSettings(payload);
  return res.data as unknown as StoreSettings;
}

export interface MarketingSubscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export async function fetchMarketingSubscribers(page = 1, pageSize = 20): Promise<PaginatedResponse<MarketingSubscriber>> {
  const res = await apiClient.admin.getMarketingSubscribers({ page, pageSize });
  return { data: res.data as unknown as MarketingSubscriber[], meta: res.meta! };
}

export async function toggleMarketingSubscriber(id: string, isActive: boolean) {
  const res = await apiClient.admin.toggleMarketingSubscriber(id, { isActive });
  return res.data;
}

export async function deleteMarketingSubscriber(id: string) {
  await apiClient.admin.deleteMarketingSubscriber(id);
}

import type { ReviewResponse } from '@noeve/shared-types';

export async function fetchReviews(page = 1, pageSize = 20): Promise<PaginatedResponse<ReviewResponse>> {
  const res = await apiClient.admin.getReviews({ page, pageSize });
  return { data: res.data as unknown as ReviewResponse[], meta: res.meta! };
}

export async function updateReviewStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
  const res = await apiClient.admin.updateReviewStatus(id, { status });
  return res.data;
}

export async function deleteReview(id: string) {
  await apiClient.admin.deleteReview(id);
}

export async function fetchSupportTickets(page = 1, pageSize = 20): Promise<PaginatedResponse<any>> {
  const token = getAccessToken();
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';
  const res = await fetchWithAuth(`${API_URL}/admin/support?page=${page}&pageSize=${pageSize}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch tickets');
  const json = await res.json();
  return { data: json.data, meta: json.meta };
}

export async function updateSupportTicketStatus(id: string, status: string) {
  const res = await apiClient.admin.updateSupportTicketStatus(id, { status });
  return res.data;
}

export async function fetchSupportTicket(id: string) {
  const res = await apiClient.admin.getSupportTicket(id);
  return res.data as any;
}

export async function addSupportTicketReply(id: string, message: string) {
  const res = await apiClient.admin.addSupportTicketReply(id, { message });
  return res.data as any;
}


export async function fetchReportsData(type: string, query: Record<string, string> = {}) {
  const params = new URLSearchParams(query).toString();
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/reports/${type}${params ? `?${params}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function fetchInventory(threshold = 10) {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/inventory/low-stock?threshold=${threshold}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
}

export async function fetchAllInventory(page = 1, pageSize = 20, search = '') {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/inventory?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function updateInventoryStock(variantId: string, quantity: number) {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/inventory/stock/${variantId}`, {
    method: 'PATCH',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quantity })
  });
  return res.json();
}

export async function fetchCrmCustomers(page = 1, limit = 20, search = '') {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/crm/customers?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function fetchCrmCustomerInsights(id: string) {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/crm/customers/${id}/insights`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function fetchBlogs(page = 1, pageSize = 20) {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/blogs?page=${page}&pageSize=${pageSize}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function createBlog(data: any) {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/blogs`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteBlog(id: string) {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/blogs/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function fetchBlog(id: string) {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/blogs/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch blog');
  return res.json();
}

export async function updateBlog(id: string, data: any) {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/blogs/${id}`, {
    method: 'PATCH',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function uploadSettlementReport(file: File) {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetchWithAuth(`${API_URL}/admin/reconciliation/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to process settlement report');
  }
  
  return res.json();
}

export interface TaxRule {
  id: string;
  hsnCode: string;
  description: string | null;
  cgstPercentage: number;
  sgstPercentage: number;
  igstPercentage: number;
  createdAt: string;
}

export async function fetchTaxRules(): Promise<TaxRule[]> {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/tax-rules`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch tax rules');
  const json = await res.json();
  return json.data;
}

export async function createTaxRule(data: Partial<TaxRule>): Promise<TaxRule> {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/tax-rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create tax rule');
  const json = await res.json();
  return json.data;
}

export async function updateTaxRule(id: string, data: Partial<TaxRule>): Promise<TaxRule> {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/tax-rules/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update tax rule');
  const json = await res.json();
  return json.data;
}

export async function deleteTaxRule(id: string): Promise<void> {
  const token = getAccessToken();
  const res = await fetchWithAuth(`${API_URL}/admin/tax-rules/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete tax rule');
}

export async function fetchMakeupSessions(): Promise<any[]> {
  const res = await apiClient.admin.getMakeupSessions();
  return res.data;
}

export async function updateMakeupSessionStatus(id: string, status: string): Promise<any> {
  const res = await apiClient.admin.updateMakeupSessionStatus(id, { status });
  return res.data;
}

export async function fetchMakeupPackages(): Promise<any[]> {
  const res = await apiClient.admin.getMakeupPackages();
  return res.data;
}

export async function createMakeupPackage(data: any): Promise<any> {
  const res = await apiClient.admin.createMakeupPackage(data);
  return res.data;
}

export async function updateMakeupPackage(id: string, data: any): Promise<any> {
  const res = await apiClient.admin.updateMakeupPackage(id, data);
  return res.data;
}

export async function deleteMakeupPackage(id: string): Promise<void> {
  await apiClient.admin.deleteMakeupPackage(id);
}

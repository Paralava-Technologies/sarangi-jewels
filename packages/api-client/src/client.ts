import type { ApiErrorBody, ApiResponse, AuthTokens, LoginRequest, RegisterRequest, Category, Product, Cart, Order, WishlistItem, PaginationQuery } from '@sarangi/shared-types';

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => string | null;
  getSessionId?: () => string | null;
  onUnauthorized?: () => void;
}

export class SarangiJewelsApiClient {
  constructor(public readonly config: ApiClientConfig) {}

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const isFormData = options.body instanceof FormData || (options.body && typeof (options.body as any).append === 'function');
    const headers: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers ?? {}),
    };

    const token = this.config.getAccessToken?.();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const sessionId = this.config.getSessionId?.();
    if (sessionId) {
      (headers as Record<string, string>)['X-Cart-Session'] = sessionId;
    }

    let res: Response;
    try {
      res = await fetch(`${this.config.baseUrl}${path}`, {
        ...options,
        headers,
      });
    } catch (err) {
      throw new ApiClientError(503, "Our servers are currently unreachable. Please check your connection or try again later.");
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as ApiErrorBody;
      if (res.status === 401) {
        this.config.onUnauthorized?.();
      }
      throw new ApiClientError(res.status, body.message ?? res.statusText, body);
    }

    return res.json() as Promise<ApiResponse<T>>;
  }

  store = {
    health: () => this.request<{ status: string }>('/store/health'),

    login: (body: LoginRequest) =>
      this.request<AuthTokens>('/store/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    register: (body: RegisterRequest) =>
      this.request<AuthTokens>('/store/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    getCategories: (options?: RequestInit) => this.request<Category[]>('/store/categories', options),
    getSettings: (options?: RequestInit) => this.request<any>('/store/settings', options),
    getProducts: (params?: { sort?: string }, options?: RequestInit) => 
      this.request<Product[]>(params?.sort ? `/store/products?sort=${params.sort}` : '/store/products', options),
    getProduct: (slug: string, options?: RequestInit) => this.request<Product>(`/store/products/${slug}`, options),
    getReviews: (productId: string, options?: RequestInit) => this.request<any[]>(`/store/products/${productId}/reviews`, options),
    addReview: (productId: string, body: { rating: number; comment?: string }, options?: RequestInit) => 
      this.request<any>(`/store/products/${productId}/reviews`, { ...options, method: 'POST', body: JSON.stringify(body) }),

    getCartSession: () => this.request<{ sessionId: string }>('/store/cart/session'),
    getCart: (options?: RequestInit) => this.request<Cart>('/store/cart', options),
    addToCart: (body: { productId: string; variantId?: string; quantity: number; isRental?: boolean; rentStartDate?: string; rentEndDate?: string }, options?: RequestInit) =>
      this.request<Cart>('/store/cart/items', { ...options, method: 'POST', body: JSON.stringify(body) }),
    updateCartLine: (lineId: string, body: { quantity: number }, options?: RequestInit) =>
      this.request<Cart>(`/store/cart/items/${lineId}`, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    removeCartLine: (lineId: string, options?: RequestInit) =>
      this.request<Cart>(`/store/cart/items/${lineId}`, { ...options, method: 'DELETE' }),
    clearCart: (options?: RequestInit) =>
      this.request<Cart>('/store/cart', { ...options, method: 'DELETE' }),

    placeOrder: (body?: { note?: string, promotionCode?: string, discountCents?: number }, options?: RequestInit) =>
      this.request<{ orders: Order[], paymentId?: string }>('/store/orders', { ...options, method: 'POST', body: JSON.stringify(body || {}) }),
    getOrders: (options?: RequestInit) => this.request<Order[]>('/store/orders', options),
    changeToCod: (orderId: string, options?: RequestInit) => 
      this.request<Order>(`/store/orders/${orderId}/change-to-cod`, { ...options, method: 'POST' }),

    validatePromotion: (body: { code: string; cartTotalCents: number }, options?: RequestInit) =>
      this.request<{ discountCents: number; code: string }>('/store/orders/promotions/validate', {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
      }),

    createPaymentSession: (body: { paymentId: string }, options?: RequestInit) =>
      this.request<{
        paymentId: string;
        providerOrderId: string;
        amount: number;
        currency: string;
        keyId: string;
        isMock: boolean;
      }>('/store/payments/create-session', { ...options, method: 'POST', body: JSON.stringify(body) }),

    verifyPayment: (
      body: {
        paymentId: string;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
      },
      options?: RequestInit,
    ) =>
      this.request<{
        success: boolean;
        paymentId: string;
        status: string;
      }>('/store/payments/verify', { ...options, method: 'POST', body: JSON.stringify(body) }),

    getWishlist: (options?: RequestInit) => this.request<WishlistItem[]>('/store/wishlist', options),
    addToWishlist: (body: { productId: string }, options?: RequestInit) =>
      this.request<WishlistItem[]>('/store/wishlist', { ...options, method: 'POST', body: JSON.stringify(body) }),
    removeFromWishlist: (productId: string, options?: RequestInit) =>
      this.request<WishlistItem[]>(`/store/wishlist/${productId}`, { ...options, method: 'DELETE' }),

    getAddresses: (options?: RequestInit) => this.request<any[]>('/store/user/addresses', options),
    addAddress: (body: any, options?: RequestInit) =>
      this.request<any>('/store/user/addresses', { ...options, method: 'POST', body: JSON.stringify(body) }),
    updateAddress: (id: string, body: any, options?: RequestInit) =>
      this.request<any>(`/store/user/addresses/${id}`, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    deleteAddress: (id: string, options?: RequestInit) =>
      this.request<void>(`/store/user/addresses/${id}`, { ...options, method: 'DELETE' }),

    subscribeNewsletter: (body: { email: string }, options?: RequestInit) =>
      this.request<void>('/store/newsletter/subscribe', { ...options, method: 'POST', body: JSON.stringify(body) }),

    createSupportTicket: (body: { name: string; email: string; subject: string; message: string }, options?: RequestInit) =>
      this.request<any>('/store/support', { ...options, method: 'POST', body: JSON.stringify(body) }),
    getMySupportTickets: (options?: RequestInit) =>
      this.request<any[]>('/store/support/my-tickets', options),
      
    replyToSupportTicket: (ticketId: string, body: { message: string }, options?: RequestInit) =>
      this.request<any>(`/store/support/${ticketId}/reply`, { ...options, method: 'POST', body: JSON.stringify(body) }),
      
    createMakeupSession: (body: { serviceName: string; location: string; date: string; time: string; address?: string }, options?: RequestInit) =>
      this.request<any>('/store/makeup', { ...options, method: 'POST', body: JSON.stringify(body) }),
    getMyMakeupSessions: (options?: RequestInit) =>
      this.request<any[]>('/store/makeup/me', options),
      
    getMakeupPackages: (options?: RequestInit) =>
      this.request<any[]>('/store/makeup/packages', options),
    getMakeupPackage: (slug: string, options?: RequestInit) =>
      this.request<any>(`/store/makeup/packages/${slug}`, options),
  };

  admin = {
    health: () => this.request<{ status: string }>('/admin/health'),

    login: (body: LoginRequest) =>
      this.request<AuthTokens>('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    getOrders: (params?: PaginationQuery & { status?: string, paymentProvider?: string, paymentStatus?: string, deliveryDate?: string }, options?: RequestInit) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.paymentProvider) q.append('paymentProvider', params.paymentProvider);
      if (params?.paymentStatus) q.append('paymentStatus', params.paymentStatus);
      if (params?.deliveryDate) q.append('deliveryDate', params.deliveryDate);
      if (params?.page) q.append('page', String(params.page));
      if (params?.pageSize) q.append('pageSize', String(params.pageSize));
      const qs = q.toString();
      return this.request<Order[]>(qs ? `/admin/orders?${qs}` : '/admin/orders', options);
    },
    getRentals: (params?: PaginationQuery, options?: RequestInit) => {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', String(params.page));
      if (params?.pageSize) q.append('pageSize', String(params.pageSize));
      const qs = q.toString();
      return this.request<any[]>(qs ? `/admin/orders/rentals?${qs}` : '/admin/orders/rentals', options);
    },
    updateOrderStatus: (orderId: string, body: { status: string; note?: string; trackingNumber?: string; carrier?: string }, options?: RequestInit) =>
      this.request<Order>(`/admin/orders/${orderId}/status`, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

    getProducts: (params?: PaginationQuery, options?: RequestInit) => {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', String(params.page));
      if (params?.pageSize) q.append('pageSize', String(params.pageSize));
      const qs = q.toString();
      return this.request<Product[]>(qs ? `/admin/products?${qs}` : '/admin/products', options);
    },
    getCategories: (params?: PaginationQuery, options?: RequestInit) => {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', String(params.page));
      if (params?.pageSize) q.append('pageSize', String(params.pageSize));
      const qs = q.toString();
      return this.request<Category[]>(qs ? `/admin/categories?${qs}` : '/admin/categories', options);
    },
    createCategory: (body: any, options?: RequestInit) =>
      this.request<Category>('/admin/categories', { ...options, method: 'POST', body: JSON.stringify(body) }),
    updateCategory: (id: string, body: any, options?: RequestInit) =>
      this.request<Category>(`/admin/categories/${id}`, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    deleteCategory: (id: string, options?: RequestInit) =>
      this.request<void>(`/admin/categories/${id}`, { ...options, method: 'DELETE' }),
    createProduct: (body: any, options?: RequestInit) =>
      this.request<Product>('/admin/products', { ...options, method: 'POST', body: JSON.stringify(body) }),
    updateProduct: (id: string, body: any, options?: RequestInit) =>
      this.request<Product>(`/admin/products/${id}`, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    deleteProduct: (id: string, options?: RequestInit) =>
      this.request<void>(`/admin/products/${id}`, { ...options, method: 'DELETE' }),
    uploadFile: (file: File, options?: RequestInit) => {
      const formData = new FormData();
      formData.append('file', file);
      return this.request<{ url: string }>('/admin/upload', { ...options, method: 'POST', body: formData });
    },

    getPromotions: (params?: PaginationQuery, options?: RequestInit) => {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', String(params.page));
      if (params?.pageSize) q.append('pageSize', String(params.pageSize));
      const qs = q.toString();
      return this.request<any[]>(qs ? `/admin/orders/promotions?${qs}` : '/admin/orders/promotions', options);
    },
    createPromotion: (body: any, options?: RequestInit) =>
      this.request<any>('/admin/orders/promotions', { ...options, method: 'POST', body: JSON.stringify(body) }),
    deletePromotion: (id: string, options?: RequestInit) =>
      this.request<void>(`/admin/orders/promotions/${id}`, { ...options, method: 'DELETE' }),

    getSettings: (options?: RequestInit) => this.request<any>('/admin/settings', options),
    updateSettings: (body: any, options?: RequestInit) =>
      this.request<any>('/admin/settings', { ...options, method: 'PATCH', body: JSON.stringify(body) }),

    getMarketingSubscribers: (params?: PaginationQuery, options?: RequestInit) => {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', String(params.page));
      if (params?.pageSize) q.append('pageSize', String(params.pageSize));
      const qs = q.toString();
      return this.request<any[]>(qs ? `/admin/marketing/subscribers?${qs}` : '/admin/marketing/subscribers', options);
    },
    toggleMarketingSubscriber: (id: string, body: { isActive: boolean }, options?: RequestInit) =>
      this.request<any>(`/admin/marketing/subscribers/${id}`, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    deleteMarketingSubscriber: (id: string, options?: RequestInit) =>
      this.request<void>(`/admin/marketing/subscribers/${id}`, { ...options, method: 'DELETE' }),
    sendMarketingCampaign: (body: { subject: string; html: string }, options?: RequestInit) =>
      this.request<{ success: boolean; count: number }>('/admin/marketing/subscribers/campaign', {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
      }),
    
    getReviews: (params?: PaginationQuery, options?: RequestInit) => {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', String(params.page));
      if (params?.pageSize) q.append('pageSize', String(params.pageSize));
      const qs = q.toString();
      return this.request<any[]>(qs ? `/admin/reviews?${qs}` : '/admin/reviews', options);
    },
    updateReviewStatus: (id: string, body: { status: 'APPROVED' | 'REJECTED' | 'PENDING' }, options?: RequestInit) =>
      this.request<any>(`/admin/reviews/${id}/status`, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    deleteReview: (id: string, options?: RequestInit) =>
      this.request<void>(`/admin/reviews/${id}`, { ...options, method: 'DELETE' }),

    getSupportTickets: (params?: PaginationQuery, options?: RequestInit) => {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', String(params.page));
      if (params?.pageSize) q.append('pageSize', String(params.pageSize));
      const qs = q.toString();
      return this.request<any[]>(qs ? `/admin/support?${qs}` : '/admin/support', options);
    },
    updateSupportTicketStatus: (id: string, body: { status: string }, options?: RequestInit) =>
      this.request<any>(`/admin/support/${id}/status`, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    getSupportTicket: (id: string, options?: RequestInit) =>
      this.request<any>(`/admin/support/${id}`, options),
    addSupportTicketReply: (id: string, body: { message: string }, options?: RequestInit) =>
      this.request<any>(`/admin/support/${id}/reply`, { ...options, method: 'POST', body: JSON.stringify(body) }),
      
    getMakeupSessions: (options?: RequestInit) =>
      this.request<any[]>('/admin/makeup', options),
    updateMakeupSessionStatus: (id: string, body: { status: string }, options?: RequestInit) =>
      this.request<any>(`/admin/makeup/${id}/status`, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
      
    getMakeupPackages: (options?: RequestInit) =>
      this.request<any[]>('/admin/makeup/packages', options),
    createMakeupPackage: (body: any, options?: RequestInit) =>
      this.request<any>('/admin/makeup/packages', { ...options, method: 'POST', body: JSON.stringify(body) }),
    updateMakeupPackage: (id: string, body: any, options?: RequestInit) =>
      this.request<any>(`/admin/makeup/packages/${id}`, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    deleteMakeupPackage: (id: string, options?: RequestInit) =>
      this.request<void>(`/admin/makeup/packages/${id}`, { ...options, method: 'DELETE' }),
  };
}

export class ApiClientError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly body?: ApiErrorBody,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

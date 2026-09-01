import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/v1';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await SecureStore.getItemAsync('sarangi_admin_token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      await SecureStore.deleteItemAsync('sarangi_admin_token');
      // In a real app, this should trigger a redirect to login via context/navigation
    }
    throw new Error(data.message || 'API Error');
  }

  return data;
}

export async function fetchOrders(status?: string, page = 1, pageSize = 20) {
  const query = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (status) {
    query.append('status', status);
  }
  return fetchWithAuth(`/admin/orders?${query.toString()}`);
}

export async function updateOrderStatus(orderId: string, status: string, note?: string) {
  return fetchWithAuth(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });
}

export async function markOrderPicked(orderId: string) {
  return fetchWithAuth(`/admin/fulfillment/${orderId}/pick`, {
    method: 'POST',
    body: JSON.stringify({ note: 'Picked via mobile admin' }),
  });
}

export async function markOrderPacked(orderId: string) {
  return fetchWithAuth(`/admin/fulfillment/${orderId}/pack`, {
    method: 'POST',
    body: JSON.stringify({ note: 'Packed via mobile admin' }),
  });
}

export async function markOrderShipped(orderId: string, trackingNumber: string, carrier: string) {
  return fetchWithAuth(`/admin/fulfillment/${orderId}/ship`, {
    method: 'POST',
    body: JSON.stringify({ 
      trackingNumber,
      carrier,
      note: 'Shipped via mobile admin' 
    }),
  });
}

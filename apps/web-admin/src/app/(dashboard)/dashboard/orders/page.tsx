'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus, fetchSupportTickets, refundOrder, returnRentalLine, type Order } from '@/lib/api';
import { Pagination } from '@/components/Pagination';
import { useSearchParams, useRouter } from 'next/navigation';

const STATUS_OPTIONS = [
  'PENDING_PAYMENT',
  'CONFIRMED',
  'PROCESSING',
  'PICKED',
  'PACKED',
  'READY_FOR_PICKUP',
  'SHIPPED',
  'DELIVERED',
  'RETURNED',
  'CANCELLED',
] as const;

const NEXT_STATUS: Record<string, string[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PICKED', 'CANCELLED'],
  PICKED: ['PACKED'],
  PACKED: ['SHIPPED', 'READY_FOR_PICKUP'],
  READY_FOR_PICKUP: ['DELIVERED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['RETURNED'],
};

function formatPrice(cents: number, currency = 'INR') {
  return (cents / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
}

export default function OrdersPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStatus = searchParams.get('status') || '';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openTickets, setOpenTickets] = useState<any[]>([]);
  
  const [filterStatus, setFilterStatus] = useState<string>(initialStatus);
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>(searchParams.get('paymentProvider') || '');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>(searchParams.get('paymentStatus') || '');
  const [filterDeliveryDate, setFilterDeliveryDate] = useState<string>(searchParams.get('deliveryDate') || '');

  const load = useCallback(async (silent = false) => {
    setError(null);
    if (!silent) setLoading(true);
    try {
      const [res, ticketsRes] = await Promise.all([
        fetchOrders(
          filterStatus || undefined, 
          page, 
          20,
          filterPaymentMode || undefined,
          filterPaymentStatus || undefined,
          filterDeliveryDate || undefined
        ),
        fetchSupportTickets(1, 100).catch(() => ({ data: [] }))
      ]);
      setOrders(res.data);
      setTotalPages(res.meta.totalPages || 1);
      setOpenTickets(ticketsRes.data.filter((t: any) => t.status === 'OPEN'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterPaymentMode, filterPaymentStatus, filterDeliveryDate]);

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      load(true);
    }, 30000); // Auto-poll every 30 seconds
    return () => clearInterval(interval);
  }, [load]);

  const applyFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    setPage(1);
    router.replace(`/dashboard/orders?${params.toString()}`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilterStatus(val);
    applyFilters({ status: val });
  };
  
  const handlePaymentModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilterPaymentMode(val);
    applyFilters({ paymentProvider: val });
  };

  const handlePaymentStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilterPaymentStatus(val);
    applyFilters({ paymentStatus: val });
  };

  const handleDeliveryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFilterDeliveryDate(val);
    applyFilters({ deliveryDate: val });
  };

  const handleStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const handleRefund = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to refund this order?')) return;
    setUpdating(orderId);
    try {
      await refundOrder(orderId, 'Admin initiated refund');
      await load();
      alert('Order refunded successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refund failed');
      alert(`Refund failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUpdating(null);
    }
  };

  const handleReturnRental = async (orderId: string, lineId: string) => {
    if (!window.confirm('Process rental return and refund deposit (if any)?')) return;
    setUpdating(lineId);
    try {
      await returnRentalLine(orderId, lineId);
      await load();
      alert('Rental return processed successfully');
    } catch (err) {
      alert(`Return failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUpdating(null);
    }
  };

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortOrder, setSortOrder] = useState('newest');

  const filteredAndSortedOrders = React.useMemo(() => {
    let result = [...orders];

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.orderNumber.toLowerCase().includes(lowerQ) ||
        (o.user?.email && o.user.email.toLowerCase().includes(lowerQ)) ||
        (o.user?.firstName && o.user.firstName.toLowerCase().includes(lowerQ)) ||
        (o.user?.lastName && o.user.lastName.toLowerCase().includes(lowerQ))
      );
    }

    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOrder === 'total-high') {
      result.sort((a, b) => b.totalCents - a.totalCents);
    } else if (sortOrder === 'total-low') {
      result.sort((a, b) => a.totalCents - b.totalCents);
    }

    return result;
  }, [orders, searchQuery, sortOrder]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">Orders</h1>
            <button 
              onClick={() => { load(); }}
              disabled={loading}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50"
              title="Refresh Orders"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-neutral-600">Manage customer orders and fulfillment status.</p>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-md border-neutral-300 py-1.5 pl-3 pr-8 text-sm shadow-sm focus:border-brand-primary focus:ring-brand-primary"
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="rounded-md border-neutral-300 py-1.5 pl-3 pr-8 text-sm shadow-sm focus:border-brand-primary focus:ring-brand-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="total-high">Total: High to Low</option>
            <option value="total-low">Total: Low to High</option>
          </select>
          <select 
            value={filterStatus}
            onChange={handleFilterChange}
            className="rounded-md border-neutral-300 py-1.5 pl-3 pr-8 text-sm shadow-sm focus:border-brand-primary focus:ring-brand-primary"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Advanced Filters Bar */}
      <div className="mt-4 flex flex-wrap gap-4 items-center bg-neutral-50 p-4 rounded-lg border border-neutral-200">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Payment Mode</label>
          <select 
            value={filterPaymentMode}
            onChange={handlePaymentModeChange}
            className="rounded-md border-neutral-300 py-1.5 pl-3 pr-8 text-sm shadow-sm focus:border-brand-primary focus:ring-brand-primary"
          >
            <option value="">All Modes</option>
            <option value="RAZORPAY">Razorpay (Online)</option>
            <option value="COD">Cash on Delivery</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Payment Status</label>
          <select 
            value={filterPaymentStatus}
            onChange={handlePaymentStatusChange}
            className="rounded-md border-neutral-300 py-1.5 pl-3 pr-8 text-sm shadow-sm focus:border-brand-primary focus:ring-brand-primary"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Delivery Date</label>
          <input 
            type="date"
            value={filterDeliveryDate}
            onChange={handleDeliveryDateChange}
            className="rounded-md border-neutral-300 py-1.5 px-3 text-sm shadow-sm focus:border-brand-primary focus:ring-brand-primary"
          />
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="mt-8 text-sm text-neutral-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">No orders yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Delivery Date</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOrders.map((order) => {
                let next = NEXT_STATUS[order.status] ?? [];
                if (order.status === 'PACKED') {
                  next = order.isPickup ? ['READY_FOR_PICKUP'] : ['SHIPPED'];
                } else if (order.status === 'DELIVERED') {
                  next = order.lines?.some(l => l.isRental) ? ['RETURNED'] : [];
                }
                const isOpen = openOrder === order.id;
                
                // Check if there is an open ticket for this user or order
                const hasOpenTicket = openTickets.some(t => 
                  (t.userId && order.user?.id && t.userId === order.user.id) || 
                  (t.email && order.user?.email && t.email === order.user.email) ||
                  (t.subject && t.subject.includes(order.orderNumber)) ||
                  (t.message && t.message.includes(order.orderNumber))
                );

                return (
                  <React.Fragment key={order.id}>
                  <tr className="border-b border-neutral-100 hover:bg-neutral-50/50 cursor-pointer" onClick={() => setOpenOrder(isOpen ? null : order.id)}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{order.orderNumber}</p>
                          {hasOpenTicket && (
                            <span title="User has an open support ticket" className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {order.lines?.some(l => l.isRental) && (
                            <span className="rounded bg-orange-100 text-orange-800 px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide">Rental</span>
                          )}
                          {order.lines?.some(l => !l.isRental && (l.sku?.toLowerCase().includes('makeup') || l.productName?.toLowerCase().includes('makeup'))) && (
                            <span className="rounded bg-pink-100 text-pink-800 px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide">Makeup</span>
                          )}
                          {order.lines?.some(l => !l.isRental && !(l.sku?.toLowerCase().includes('makeup') || l.productName?.toLowerCase().includes('makeup'))) && (
                            <span className="rounded bg-blue-100 text-blue-800 px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide">Purchase</span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500">
                          {new Date(order.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      <div>{order.user?.firstName} {order.user?.lastName}</div>
                      <div className="text-xs text-neutral-500">{order.user?.email ?? '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-accent-light px-2 py-0.5 text-xs font-medium text-brand-primary">
                        {order.status === 'PENDING_PAYMENT' && order.payment?.provider === 'COD' ? 'CONFIRMED' : order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-neutral-800">{order.payment?.provider === 'COD' ? 'COD' : 'Online'}</div>
                      <div className={`text-xs ${order.payment?.status === 'SUCCESS' ? 'text-green-600' : 'text-orange-600'}`}>
                        {order.payment?.status || 'PENDING'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(order.totalCents, order.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {next.map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={updating === order.id}
                            onClick={(e) => { e.stopPropagation(); handleStatus(order.id, status); }}
                            className="rounded border border-neutral-300 px-2 py-1 text-xs hover:border-brand-primary disabled:opacity-50"
                          >
                            → {status}
                          </button>
                        ))}
                        {(order.status === 'CANCELLED' || order.status === 'DELIVERED') && order.payment?.status === 'SUCCESS' && (
                          <button
                            type="button"
                            disabled={updating === order.id}
                            onClick={(e) => { e.stopPropagation(); handleRefund(order.id); }}
                            className="rounded border border-red-300 bg-red-50 text-red-700 px-2 py-1 text-xs hover:bg-red-100 disabled:opacity-50"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-neutral-200 bg-neutral-50/30">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm text-neutral-800">Items</h4>
                              <span className="text-xs font-medium px-2 py-1 bg-neutral-100 text-neutral-600 rounded">
                                {order.lines?.some(l => l.isRental) ? (order.lines?.some(l => !l.isRental) ? 'Mixed Order (Rental & Purchase)' : 'Rental Order') : 'Purchase Order'}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {order.lines?.map((line, i) => (
                                <div key={i} className="flex flex-col text-sm border-b border-neutral-100 pb-2 last:border-0 last:pb-0">
                                  <div className="flex justify-between">
                                    <span className="text-neutral-600">{line.quantity} × {line.productName}</span>
                                    <span className="font-medium">{formatPrice(line.lineTotalCents, order.currency)}</span>
                                  </div>
                                  {line.isRental && (
                                    <div className="mt-1 flex items-center justify-between text-xs">
                                      <span className="text-violet-600 font-medium bg-violet-50 px-2 py-0.5 rounded">
                                        Rental: {line.rentStartDate ? new Date(line.rentStartDate).toLocaleDateString() : ''} - {line.rentEndDate ? new Date(line.rentEndDate).toLocaleDateString() : ''}
                                      </span>
                                      <button 
                                        className="text-brand-primary hover:underline font-medium disabled:opacity-50"
                                        disabled={updating === line.id}
                                        onClick={(e) => { e.stopPropagation(); handleReturnRental(order.id, line.id); }}
                                      >
                                        {updating === line.id ? 'Processing...' : 'Process Return / Refund Deposit'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-2 text-neutral-800">Financial Summary</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-neutral-500">Subtotal:</span><span>{formatPrice(order.subtotalCents, order.currency)}</span></div>
                              <div className="flex justify-between"><span className="text-neutral-500">Shipping:</span><span>{formatPrice(order.shippingCents, order.currency)}</span></div>
                              <div className="flex justify-between"><span className="text-neutral-500">Tax:</span><span>{formatPrice(order.taxCents, order.currency)}</span></div>
                              {(order.depositCents ?? 0) > 0 && (
                                <div className="flex justify-between"><span className="text-neutral-500">Deposit:</span><span>{formatPrice(order.depositCents || 0, order.currency)}</span></div>
                              )}
                              {(order.discountCents ?? 0) > 0 && (
                                <div className="flex justify-between text-brand-primary"><span className="text-neutral-500">Discount:</span><span>-{formatPrice(order.discountCents || 0, order.currency)}</span></div>
                              )}
                              <div className="flex justify-between font-semibold pt-1 mt-1 border-t border-neutral-200">
                                <span>Total:</span><span>{formatPrice(order.totalCents, order.currency)}</span>
                              </div>
                            </div>
                            
                            <h4 className="font-semibold text-sm mb-2 mt-6 text-neutral-800">Final Delivery Date</h4>
                            <div className="flex gap-2 items-center text-sm">
                              <input 
                                type="date"
                                className="rounded border-neutral-300 py-1 px-2 text-sm"
                                value={order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : ''}
                                onChange={async (e) => {
                                  const newDate = e.target.value || null;
                                  try {
                                    setUpdating(order.id);
                                    const { updateOrderDeliveryDate } = await import('@/lib/api');
                                    await updateOrderDeliveryDate(order.id, newDate);
                                    await load();
                                  } catch (err) {
                                    setError('Failed to update delivery date');
                                  } finally {
                                    setUpdating(null);
                                  }
                                }}
                                disabled={updating === order.id}
                              />
                            </div>
                            
                            <h4 className="font-semibold text-sm mb-2 mt-6 text-neutral-800">
                              {order.isPickup ? 'Delivery Type: Store Pickup' : 'Shipping Address'}
                            </h4>
                            {order.isPickup ? (
                              <div className="text-sm text-neutral-600 bg-violet-50 text-violet-800 px-3 py-2 rounded-md font-medium border border-violet-100 inline-block mb-2">
                                Customer will pick up from store.
                              </div>
                            ) : order.user?.addresses?.[0] ? (
                              <div className="text-sm text-neutral-600 space-y-1">
                                <p className="font-medium text-neutral-800">{order.user.addresses[0].name}</p>
                                <p>{order.user.addresses[0].streetLine1}</p>
                                {order.user.addresses[0].streetLine2 && <p>{order.user.addresses[0].streetLine2}</p>}
                                <p>{order.user.addresses[0].city}, {order.user.addresses[0].state} {order.user.addresses[0].postalCode}</p>
                                <p>{order.user.addresses[0].country}</p>
                                <p className="mt-1">Phone: {order.user.addresses[0].phone}</p>
                              </div>
                            ) : (
                              <p className="text-sm text-neutral-400 italic">No default address found</p>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-2 text-neutral-800">ID Verification (For Rentals)</h4>
                            <div className="text-sm bg-white border border-neutral-200 p-3 rounded-md shadow-sm mb-6">
                              {order.user?.idDocumentUrl ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-neutral-700">Status:</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${order.user.idVerificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : order.user.idVerificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                      {order.user.idVerificationStatus || 'PENDING'}
                                    </span>
                                  </div>
                                  <a href={order.user.idDocumentUrl} target="_blank" rel="noreferrer" className="block text-brand-primary hover:underline font-medium text-sm">
                                    View Uploaded ID Document
                                  </a>
                                  <div className="flex gap-2 pt-2 border-t border-neutral-100">
                                    <button 
                                      className="flex-1 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 py-1.5 rounded-md font-medium transition-colors"
                                      disabled={updating === order.user.id}
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        setUpdating(order.user!.id);
                                        try {
                                          const { updateUser } = await import('@/lib/api');
                                          await updateUser(order.user!.id, { idVerificationStatus: 'VERIFIED' });
                                          await load();
                                        } catch(err) {
                                          setError('Failed to verify ID');
                                        } finally {
                                          setUpdating(null);
                                        }
                                      }}
                                    >Approve ID</button>
                                    <button 
                                      className="flex-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 py-1.5 rounded-md font-medium transition-colors"
                                      disabled={updating === order.user.id}
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        setUpdating(order.user!.id);
                                        try {
                                          const { updateUser } = await import('@/lib/api');
                                          await updateUser(order.user!.id, { idVerificationStatus: 'REJECTED' });
                                          await load();
                                        } catch(err) {
                                          setError('Failed to reject ID');
                                        } finally {
                                          setUpdating(null);
                                        }
                                      }}
                                    >Reject ID</button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-neutral-500 italic">No ID uploaded by customer.</p>
                              )}
                            </div>

                            <h4 className="font-semibold text-sm mb-2 text-neutral-800">Tracking Info</h4>
                            {order.trackingNumber ? (
                              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
                                {order.carrier && (
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                      {order.carrier}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono text-sm font-medium text-blue-900 break-all">
                                    {order.trackingNumber}
                                  </span>
                                  <button
                                    type="button"
                                    title="Copy tracking number"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(order.trackingNumber!);
                                    }}
                                    className="flex-shrink-0 rounded p-1 text-blue-500 hover:bg-blue-100 hover:text-blue-700"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-neutral-400 italic">No tracking info yet</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <details className="mt-6 text-xs text-neutral-500">
        <summary>All status values</summary>
        <p className="mt-2">{STATUS_OPTIONS.join(' · ')}</p>
      </details>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

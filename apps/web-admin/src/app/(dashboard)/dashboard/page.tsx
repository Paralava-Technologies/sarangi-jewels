'use client';

import React, { useEffect, useState } from 'react';
import { fetchOrders, fetchReportsData, fetchSupportTickets, fetchRentals, fetchMakeupSessions, type Order } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Reports state
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [makeupSessions, setMakeupSessions] = useState<any[]>([]);

  const formatPrice = (cents: number, currency = 'INR') =>
    (cents / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });

  const loadData = (silent = false) => {
    if (!silent) setLoading(true);
    Promise.all([
      fetchOrders().catch(() => ({ data: [] })),
      fetchReportsData('sales-summary').catch(() => null),
      fetchReportsData('top-products').catch(() => []),
      fetchReportsData('recent-transactions').catch(() => []),
      fetchReportsData('daily-revenue').catch(() => []),
      fetchReportsData('orders-by-status').catch(() => []),
      fetchSupportTickets(1, 100).catch(() => ({ data: [] })),
      fetchRentals(1, 100).catch(() => ({ data: [] })),
      fetchMakeupSessions().catch(() => []),
    ])
      .then(([ordersRes, salesRes, productsRes, transactionsRes, dailyRes, statusRes, ticketsRes, rentalsRes, makeupRes]) => {
        setOrders(ordersRes.data || []);
        setSalesSummary(salesRes?.data || salesRes);
        setTopProducts(
          Array.isArray(productsRes?.data)
            ? productsRes.data
            : Array.isArray(productsRes)
              ? productsRes
              : [],
        );
        setTransactions(
          Array.isArray(transactionsRes?.data)
            ? transactionsRes.data
            : Array.isArray(transactionsRes)
              ? transactionsRes
              : [],
        );
        setDailyRevenue(
          Array.isArray(dailyRes?.data) ? dailyRes.data : Array.isArray(dailyRes) ? dailyRes : [],
        );
        setOrdersByStatus(
          Array.isArray(statusRes?.data)
            ? statusRes.data
            : Array.isArray(statusRes)
              ? statusRes
              : [],
        );
        setSupportTickets(ticketsRes?.data || []);
        setRentals(rentalsRes?.data || []);
        setMakeupSessions(makeupRes || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 30000); // Auto-poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const openOrders = orders.filter((o) => o.status === 'CONFIRMED').length;
  const processing = orders.filter((o) =>
    ['PROCESSING', 'PICKED', 'PACKED'].includes(o.status),
  ).length;
  const shippedToday = orders.filter((o) => {
    if (o.status !== 'SHIPPED') return false;
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;
  
  const openTickets = supportTickets.filter((t) => t.status === 'OPEN').length;
  const unattendedList = supportTickets.filter(
    (t) => t.status === 'OPEN' && (!t.replies || t.replies.length === 0 || !t.replies[t.replies.length - 1].isAdmin)
  );
  const unattendedTickets = unattendedList.length;
  const firstUnattendedId = unattendedList[0]?.id;

  const upcomingRentals = rentals.length;
  const pendingMakeup = makeupSessions.filter((s: any) => s.status === 'PENDING').length;

  const stats = [
    {
      label: 'Open orders',
      value: loading ? '—' : openOrders,
      href: '/dashboard/orders?status=CONFIRMED',
    },
    {
      label: 'Processing',
      value: loading ? '—' : processing,
      href: '/dashboard/orders?status=PROCESSING',
    },
    {
      label: 'Shipped today',
      value: loading ? '—' : shippedToday,
      href: '/dashboard/orders?status=SHIPPED',
    },
    {
      label: 'Open tickets',
      value: loading ? '—' : openTickets,
      subValue: loading ? undefined : unattendedTickets,
      subHref: firstUnattendedId ? `/dashboard/support?ticketId=${firstUnattendedId}` : undefined,
      href: '/dashboard/support',
    },
    {
      label: 'Upcoming rentals',
      value: loading ? '—' : upcomingRentals,
      href: '/dashboard/rentals',
    },
    {
      label: 'Pending makeup',
      value: loading ? '—' : pendingMakeup,
      href: '/dashboard/makeup',
    },
  ];

  // const totalSalesCents = orders
  //   .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
  //   .reduce((acc, o) => acc + o.totalCents, 0);
  // const totalTaxCents = orders
  //   .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
  //   .reduce((acc, o) => acc + o.taxCents, 0);

  // const financialStats = [
  //   { label: 'Total Sales Revenue', value: loading ? '—' : formatPrice(totalSalesCents) },
  //   { label: 'Total Tax Collected (GST)', value: loading ? '—' : formatPrice(totalTaxCents) },
  // ];

  const maxRevenue = Math.max(...(dailyRevenue.map((d) => d.revenueCents) || [0]), 100000);

  const statusColors: Record<string, string> = {
    PENDING_PAYMENT: '#f97316',
    CONFIRMED: '#14b8a6',
    PROCESSING: '#f59e0b',
    PICKED: '#8b5cf6',
    PACKED: '#6366f1',
    SHIPPED: '#3b82f6',
    DELIVERED: '#10b981',
    CANCELLED: '#ef4444',
    REFUNDED: '#64748b',
  };
  const totalStatusCount = ordersByStatus.reduce((acc, curr) => acc + curr.count, 0) || 1;
  let currentOffset = 0;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <div className="flex justify-between items-center">
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50"
            title="Refresh Data"
          >
            <svg
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        <p className="mt-2 text-neutral-600">
          Order queue, product management, and fulfillment tracking connect to{' '}
          <code className="rounded bg-neutral-100 px-1">/v1/admin/*</code> endpoints.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative block rounded-lg border border-neutral-200 bg-white p-6 hover:border-brand-primary hover:bg-neutral-50 transition-colors"
            >
              <Link href={stat.href} className="absolute inset-0" aria-label={`View ${stat.label}`} />
              <div className="relative z-10 pointer-events-none">
                <p className="text-sm text-neutral-500">{stat.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-neutral-900">{stat.value}</span>
                  {stat.subValue !== undefined && stat.subValue > 0 && (
                    <Link
                      href={stat.subHref || stat.href}
                      className="text-sm font-semibold text-red-500 hover:text-red-600 pointer-events-auto transition-colors"
                      title={`${stat.subValue} unattended tickets`}
                    >
                      ({stat.subValue} unattended)
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr />

      <div className="space-y-8">
        {loading ? (
          <div className="text-sm text-neutral-500">Loading reports...</div>
        ) : (
          <>
            <section>
              <h2 className="text-xl font-medium mb-4">Financial Overview</h2>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-neutral-200 bg-white p-6">
                  <p className="text-sm text-neutral-500">Total Revenue</p>
                  <p className="mt-2 text-3xl font-semibold text-brand-primary">
                    {formatPrice(salesSummary?.totalRevenueCents || 0)}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-white p-6">
                  <p className="text-sm text-neutral-500">Total Orders</p>
                  <p className="mt-2 text-3xl font-semibold text-neutral-900">
                    {salesSummary?.totalOrders || 0}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-white p-6">
                  <p className="text-sm text-neutral-500">Avg Order Value</p>
                  <p className="mt-2 text-3xl font-semibold text-neutral-900">
                    {formatPrice(salesSummary?.averageOrderValueCents || 0)}
                  </p>
                </div>
                <div className="rounded-lg border border-brand-accent/30 bg-brand-accent-light/10 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-neutral-600 font-medium">Deposits Held</p>
                      <span className="text-xs bg-brand-primary text-white px-2 py-0.5 rounded-full">Rentals</span>
                    </div>
                    <p className="mt-2 text-3xl font-display text-wine-deep">
                      {formatPrice(rentals.reduce((sum, r) => sum + (r.depositCents || 0), 0))}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">Across {rentals.length} active rentals</p>
                  </div>
                  <Link href="/dashboard/deposits" className="mt-4 text-sm font-semibold text-brand-primary hover:underline">
                    Manage Deposits →
                  </Link>
                </div>
              </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-2">
              <section className="rounded-lg border border-neutral-200 bg-white p-6">
                <h2 className="text-lg font-medium mb-6">Daily Revenue</h2>
                {dailyRevenue.length > 0 ? (
                  <div className="h-64 flex items-end gap-1">
                    {dailyRevenue.map((day) => {
                      const heightPct = Math.max((day.revenueCents / maxRevenue) * 100, 1);
                      return (
                        <div
                          key={day.date}
                          className="group relative flex-1 flex flex-col justify-end items-center h-full"
                        >
                          <div
                            className="w-full bg-brand-primary/80 hover:bg-brand-primary rounded-t transition-colors"
                            style={{ height: `${heightPct}%` }}
                          />
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-neutral-900 text-white text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                            {new Date(day.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                            : {formatPrice(day.revenueCents)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-sm text-neutral-400">
                    No data available
                  </div>
                )}
              </section>

              <section className="rounded-lg border border-neutral-200 bg-white p-6">
                <h2 className="text-lg font-medium mb-6">Orders by Status</h2>
                {ordersByStatus.length > 0 ? (
                  <div className="flex items-center justify-center gap-8 h-64">
                    <div className="relative w-48 h-48">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {ordersByStatus.map((status) => {
                          const pct = status.count / totalStatusCount;
                          const strokeDasharray = `${pct * 314} 314`;
                          const strokeDashoffset = -currentOffset * 314;
                          currentOffset += pct;
                          const color = statusColors[status.status] || '#cbd5e1';
                          return (
                            <circle
                              key={status.status}
                              cx="50"
                              cy="50"
                              r="50"
                              fill="transparent"
                              stroke={color}
                              strokeWidth="20"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              className="transition-all duration-1000 hover:opacity-80"
                            />
                          );
                        })}
                        <circle cx="50" cy="50" r="40" fill="white" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-bold">{totalStatusCount}</span>
                        <span className="text-xs text-neutral-500 uppercase tracking-widest">
                          Total
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {ordersByStatus.map((status) => (
                        <div key={status.status} className="flex items-center gap-2 text-sm">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: statusColors[status.status] || '#cbd5e1' }}
                          />
                          <span className="font-medium">{status.status}</span>
                          <span className="text-neutral-500 ml-auto">{status.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-sm text-neutral-400">
                    No data available
                  </div>
                )}
              </section>
            </div>

            <section>
              <h2 className="text-xl font-medium mb-4">Top Products</h2>
              <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Units Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {topProducts?.map((tp: any) => (
                      <tr key={tp.productId}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-900">
                          {tp.productName}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                          {tp._sum?.quantity || tp.sales}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                          {formatPrice(tp._sum?.lineTotalCents || 0)}
                        </td>
                      </tr>
                    ))}
                    {(!topProducts || topProducts.length === 0) && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-sm text-neutral-500 text-center">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-4">Recent Transactions</h2>
              <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Order #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {transactions?.map((t: any) => (
                      <tr key={t.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-900">
                          {t.order?.orderNumber}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                          {t.order?.user?.firstName} {t.order?.user?.lastName}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                          {formatPrice(t.amountCents || 0)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${t.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {(!transactions || transactions.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-sm text-neutral-500 text-center">
                          No transactions available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>

      <hr className="my-8" />

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { name: 'Orders', href: '/dashboard/orders', icon: '📦' },
            { name: 'Products', href: '/dashboard/products', icon: '🛍️' },
            { name: 'Marketing', href: '/dashboard/marketing', icon: '📢' },
            { name: 'Categories', href: '/dashboard/categories', icon: '📑' },
            { name: 'Promotions', href: '/dashboard/promotions', icon: '🏷️' },
            { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
          ].map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 hover:border-brand-primary hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{link.icon}</span>
                <span className="font-medium text-neutral-800 group-hover:text-brand-primary">
                  {link.name}
                </span>
              </div>
              <span className="text-neutral-400 group-hover:text-brand-primary transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

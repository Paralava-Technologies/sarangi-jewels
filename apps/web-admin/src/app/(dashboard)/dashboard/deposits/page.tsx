'use client';

import React, { useEffect, useState } from 'react';
import { fetchRentals, fetchReportsData } from '@/lib/api';
import Link from 'next/link';

function formatPrice(cents: number, currency = 'INR') {
  return (cents / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
}

export default function DepositsPage(): React.JSX.Element {
  const [rentals, setRentals] = useState<any[]>([]);
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'HELD' | 'REFUND_DUE' | 'FAILED'>('ALL');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchRentals(1, 100).catch(() => ({ data: [] })),
      fetchReportsData('sales-summary').catch(() => null),
    ])
      .then(([res, salesRes]) => {
        setRentals(res.data || []);
        setSalesSummary(salesRes?.data || salesRes);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalHeld = rentals
    .filter((r) => r.order?.status !== 'CANCELLED' && r.order?.status !== 'REFUNDED')
    .reduce((sum, r) => sum + (r.depositCents || 0), 0);

  // A mock logic for Refunds Due (e.g., rentals past end date that haven't been refunded yet)
  const refundsDue = rentals.filter((r) => {
    if (r.order?.status === 'CANCELLED' || r.order?.status === 'REFUNDED') return false;
    if (!r.rentEndDate) return false;
    return new Date(r.rentEndDate) < new Date();
  });
  
  const refundsDueAmount = refundsDue.reduce((sum, r) => sum + (r.depositCents || 0), 0);

  const filteredRentals = rentals.filter((r) => {
    if (filter === 'HELD') return r.order?.status !== 'CANCELLED' && r.order?.status !== 'REFUNDED';
    if (filter === 'REFUND_DUE') return refundsDue.includes(r);
    if (filter === 'FAILED') return r.order?.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Payments & Deposits</h1>
            <p className="mt-1 text-sm text-neutral-500">Deposits are tracked separately from revenue</p>
          </div>
          <button className="btn btn--outline bg-white px-4 py-2 border border-neutral-300 rounded hover:bg-neutral-50 text-sm font-medium">
            Export Statement
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Revenue (MTD)</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900">{formatPrice(salesSummary?.totalRevenueCents || 0)}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Deposits Currently Held</p>
          <p className="mt-2 text-3xl font-semibold text-brand-primary">{formatPrice(totalHeld)}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Refunds Pending</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-semibold text-neutral-900">{formatPrice(refundsDueAmount)}</p>
            {refundsDue.length > 0 && (
              <span className="text-xs font-medium text-red-600">{refundsDue.length} overdue</span>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Failed Transactions</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-900">0</p>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
        <div className="border-b border-neutral-200 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-neutral-50">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by order ID..."
              className="w-full rounded-md border border-neutral-300 pl-10 pr-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
            <span className="absolute left-3 top-2.5 text-neutral-400">🔍</span>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'HELD', label: 'Deposits Held' },
              { id: 'REFUND_DUE', label: 'Refunds Due' },
              { id: 'FAILED', label: 'Failed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Transaction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-neutral-500">
                  Loading...
                </td>
              </tr>
            ) : filteredRentals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-neutral-500">
                  No deposits found.
                </td>
              </tr>
            ) : (
              filteredRentals.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded bg-brand-accent-light/30 text-lg">
                        📦
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">#{r.order?.orderNumber || 'Unknown'}</div>
                        <div className="text-xs text-neutral-500">Rental fee + deposit</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {r.order?.user?.firstName || 'Guest'} {r.order?.user?.lastName || ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600">
                      Rental
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {formatPrice(r.lineTotalCents || 0)} <span className="text-neutral-400">+</span> {formatPrice(r.depositCents || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {r.rentStartDate ? new Date(r.rentStartDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {r.order?.status === 'CANCELLED' || r.order?.status === 'REFUNDED' ? (
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800">
                        {r.order?.status}
                      </span>
                    ) : refundsDue.includes(r) ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Deposit Held
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {refundsDue.includes(r) && r.order?.status !== 'REFUNDED' ? (
                      <Link href={`/dashboard/orders?search=${r.order?.orderNumber}`} className="text-white bg-brand-primary px-3 py-1.5 rounded hover:bg-brand-primary/90 transition-colors">
                        Refund Now
                      </Link>
                    ) : (
                      <Link href={`/dashboard/orders?search=${r.order?.orderNumber}`} className="text-brand-primary hover:text-brand-primary/80 px-3 py-1.5 border border-brand-primary rounded">
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-medium text-neutral-900">Damage Fee Tiers</h2>
          <p className="mt-1 text-sm text-neutral-500">Reference schedule shown to customers at booking — keeps deductions consistent</p>
        </div>
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Condition</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Fee</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200 text-sm text-neutral-600">
            <tr>
              <td className="px-6 py-4">Normal wear (expected)</td>
              <td className="px-6 py-4 font-medium">No charge</td>
            </tr>
            <tr>
              <td className="px-6 py-4">Minor tarnish / light staining</td>
              <td className="px-6 py-4 font-medium">10% of item value</td>
            </tr>
            <tr>
              <td className="px-6 py-4">Stone loss / broken clasp</td>
              <td className="px-6 py-4 font-medium">25–40% of item value</td>
            </tr>
            <tr>
              <td className="px-6 py-4">Item lost or unreturned</td>
              <td className="px-6 py-4 font-medium text-red-600">Full item value, deposit forfeited</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

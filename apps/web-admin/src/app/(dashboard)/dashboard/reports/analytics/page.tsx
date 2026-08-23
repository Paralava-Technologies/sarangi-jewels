'use client';
import React from 'react';
import Link from 'next/link';

export default function AnalyticsSummaryPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Analytics Summary</h1>
      <p className="text-neutral-500">High level overview of all organizational reports.</p>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: 'Sales Performance', href: '/dashboard/reports/sales' },
          { name: 'Customer LTV', href: '/dashboard/reports/customer' },
          { name: 'Order Processing (Heatmaps)', href: '/dashboard/reports/order' },
          { name: 'Product Leaderboard', href: '/dashboard/reports/product' },
          { name: 'Rental Bookings', href: '/dashboard/reports/rentals' },
          { name: 'Profit & Loss', href: '/dashboard/reports/profit-and-loss' }
        ].map(r => (
          <Link key={r.name} href={r.href} className="flex items-center justify-between p-4 rounded border border-neutral-200 bg-white hover:border-brand-primary">
            <span className="font-medium">{r.name}</span>
            <span className="text-neutral-400">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
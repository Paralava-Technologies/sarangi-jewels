'use client';
import React, { useEffect, useState } from 'react';
import { fetchReportsData, apiClient } from '@/lib/api';
import Link from 'next/link';

export default function RentalReportPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (cents: number, currency = 'INR') => 
    (cents / 100).toLocaleString('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 });

  const [heatmapData, setHeatmapData] = useState<{ months: string[]; products: string[]; data: Record<string, Record<string, number>>; view: string } | null>(null);

  const [heatmapView, setHeatmapView] = useState('monthly');
  const [productNameFilter, setProductNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadHeatmap = () => {
    setLoading(true);
    const query: Record<string, string> = { view: heatmapView, isRental: 'true' };
    if (productNameFilter) query.productName = productNameFilter;
    if (categoryFilter) query.category = categoryFilter;
    if (startDate) query.startDate = startDate;
    if (endDate) query.endDate = endDate;

    fetchReportsData('product-heatmap', query)
      .then(res => setHeatmapData(res))
      .catch(() => setHeatmapData(null))
      .finally(() => setLoading(false));
  };

  const loadRentals = () => {
    const params: any = { page: 1, pageSize: 50 };
    if (productNameFilter) params.productName = productNameFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    apiClient.admin.getRentals(params)
      .then(res => {
        setRentals(res.data || []);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadHeatmap();
    loadRentals();
  }, [heatmapView]); // load when view changes, but not automatically for filters


  if (loading) return <div className="p-8 text-neutral-500">Loading Rental Report...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Rental Report</h1>
      <p className="text-neutral-500">Detailed performance metrics and history for your rental business.</p>
      
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-lg font-medium text-neutral-900">Rental Heat Map</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <input 
              type="text"
              placeholder="Search product..."
              value={productNameFilter}
              onChange={e => setProductNameFilter(e.target.value)}
              className="rounded-md border-neutral-300 py-1.5 px-3 text-sm shadow-sm"
            />
            <input 
              type="text"
              placeholder="Category..."
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="rounded-md border-neutral-300 py-1.5 px-3 text-sm shadow-sm"
            />
            <input 
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="rounded-md border-neutral-300 py-1.5 px-3 text-sm shadow-sm"
            />
            <span className="text-neutral-500 text-sm">to</span>
            <input 
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="rounded-md border-neutral-300 py-1.5 px-3 text-sm shadow-sm"
            />
            <button 
              onClick={() => { loadHeatmap(); loadRentals(); }}
              className="rounded bg-brand-primary px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-brand-primary/90"
            >
              Apply Filter
            </button>
            <div className="flex rounded-md shadow-sm ml-2" role="group">
              <button
                type="button"
                onClick={() => setHeatmapView('monthly')}
                className={`px-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-l-lg ${heatmapView === 'monthly' ? 'bg-neutral-100 text-brand-primary' : 'bg-white text-neutral-500 hover:bg-neutral-50'}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setHeatmapView('weekly')}
                className={`px-3 py-1.5 text-sm font-medium border border-l-0 border-neutral-200 rounded-r-lg ${heatmapView === 'weekly' ? 'bg-neutral-100 text-brand-primary' : 'bg-white text-neutral-500 hover:bg-neutral-50'}`}
              >
                Weekly
              </button>
            </div>
          </div>
        </div>
        {heatmapData && heatmapData.products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs text-center">
              <thead>
                <tr>
                  <th className="border border-neutral-200 p-2 bg-neutral-50 text-left font-medium text-neutral-500">
                    Product \ Month
                  </th>
                  {heatmapData.months.map((m) => {
                    const isWeekly = heatmapData.view === 'weekly';
                    const headerLabel = isWeekly ? `Week of ${m}` : new Date(`${m}-01`).toLocaleString('en-US', { month: 'short', year: 'numeric' });
                    return (
                      <th key={m} className="border border-neutral-200 p-2 bg-neutral-50 font-medium text-neutral-500 min-w-[60px]">
                        {headerLabel}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {heatmapData.products.map((productName) => (
                  <tr key={productName}>
                    <td className="border border-neutral-200 p-2 text-left font-medium whitespace-nowrap text-neutral-900">
                      {productName}
                    </td>
                    {heatmapData.months.map((month) => {
                      const count = heatmapData.data[productName]?.[month] || 0;
                      // Maximum opacity at 10+ items for visibility
                      const alpha = Math.min(count * 0.15, 1);
                      return (
                        <td
                          key={month}
                          className="border border-neutral-200 p-2 font-medium"
                          style={{
                            backgroundColor: count > 0 ? `rgba(16, 185, 129, ${alpha})` : 'transparent', // Emerald color for rentals
                            color: count > 0 && alpha > 0.5 ? 'white' : 'inherit',
                          }}
                          title={`${count} rentals in ${month}`}
                        >
                          {count > 0 ? count : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-neutral-500">
              Note: Darker colors indicate higher rental volume. Weekly view groups bookings starting from the Monday of that week.
            </p>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No rental heatmap data available.</p>
        )}
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-medium mb-4">Rental Orders</h2>
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {rentals.map((line: any) => (
                <tr key={line.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-brand-primary">
                    <Link href={`/dashboard/orders`}>
                      {line.order?.orderNumber || 'Unknown'}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                    {line.productName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                    {line.rentStartDate ? new Date(line.rentStartDate).toLocaleDateString() : 'N/A'} - {line.rentEndDate ? new Date(line.rentEndDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                    {line.order?.user ? `${line.order.user.firstName || ''} ${line.order.user.lastName || ''}`.trim() : 'Guest'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                    <span className="inline-flex rounded-full bg-neutral-100 px-2 text-xs font-semibold leading-5 text-neutral-800">
                      {line.order?.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                    {formatPrice((line.lineTotalCents || 0) + (line.depositCents || 0), 'INR')}
                  </td>
                </tr>
              ))}
              {rentals.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-4 text-sm text-neutral-500 text-center">No rental items found for these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

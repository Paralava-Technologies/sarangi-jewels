'use client';
import React, { useEffect, useState } from 'react';
import { fetchReportsData } from '@/lib/api';

export default function ProductReportPage() {
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (cents: number, currency = 'INR') => 
    (cents / 100).toLocaleString('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 });

  const [heatmapData, setHeatmapData] = useState<{ months: string[]; products: string[]; data: Record<string, Record<string, number>>; view: string } | null>(null);
  const [productOrders, setProductOrders] = useState<any[]>([]);

  const [heatmapView, setHeatmapView] = useState('monthly');
  const [productNameFilter, setProductNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadHeatmap = () => {
    setLoading(true);
    const query: Record<string, string> = { view: heatmapView };
    if (productNameFilter) query.productName = productNameFilter;
    if (categoryFilter) query.category = categoryFilter;
    if (startDate) query.startDate = startDate;
    if (endDate) query.endDate = endDate;

    Promise.all([
      fetchReportsData('product-heatmap', query).catch(() => null),
      fetchReportsData('product-orders', query).catch(() => [])
    ])
      .then(([heatmap, orders]) => {
        setHeatmapData(heatmap);
        setProductOrders(Array.isArray(orders) ? orders : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      fetchReportsData('top-products'),
    ])
      .then(([topRes]) => {
        setTopProducts(Array.isArray(topRes?.data) ? topRes.data : Array.isArray(topRes) ? topRes : []);
      })
      .catch(() => {
        setTopProducts([]);
      });
  }, []);

  useEffect(() => {
    loadHeatmap();
  }, [heatmapView]); // load when view changes, but not automatically for filters


  if (loading) return <div className="p-8 text-neutral-500">Loading Product Report...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Product Orders Report</h1>
      <p className="text-neutral-500">Detailed performance metrics for your catalog.</p>
      
      <section className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-medium mb-4">Top Performing Products</h2>
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Units Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {topProducts.map((tp: any) => (
                <tr key={tp.productId}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-900">{tp.productName}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">{tp._sum?.quantity || tp.sales}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">{formatPrice(tp._sum?.lineTotalCents || 0)}</td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-4 text-sm text-neutral-500 text-center">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-lg font-medium text-neutral-900">Product Heat Map</h2>
          
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
              onClick={loadHeatmap}
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
                            backgroundColor: count > 0 ? `rgba(244, 63, 94, ${alpha})` : 'transparent', // Rose color for product heatmap
                            color: count > 0 && alpha > 0.5 ? 'white' : 'inherit',
                          }}
                          title={`${count} units sold in ${month}`}
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
              Note: Darker colors indicate higher sales volume. Weekly view groups sales starting from the Monday of that week.
            </p>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No heatmap data available.</p>
        )}
      </section>
      
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Product Orders List</h2>
        {productOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {productOrders.map((line: any) => (
                  <tr key={line.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-brand-primary">{line.order?.orderNumber}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                      {new Date(line.order?.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">{line.productName}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                      {line.order?.user ? `${line.order.user.firstName || ''} ${line.order.user.lastName || ''}`.trim() || line.order.user.email : 'Guest'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">{line.quantity}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">{formatPrice(line.lineTotalCents || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No orders found for the selected filters.</p>
        )}
      </section>
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { fetchRentals } from '@/lib/api';
import Link from 'next/link';

export default function RentalsPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    setLoading(true);
    try {
      const res = await fetchRentals(1, 100);
      setRentals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-neutral-500">Loading rentals...</div>;
  }

  // Get date range for the matrix (30 days window: 15 days past, 15 days future)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 15);
  
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Rental Heatmap</h1>
          <p className="text-sm text-neutral-500">Manage and track your upcoming rental inventory blocks.</p>
        </div>
      </header>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-4 py-3 font-semibold text-neutral-900 min-w-[200px] sticky left-0 bg-neutral-50 border-r border-neutral-200 z-10 shadow-[1px_0_0_0_#e5e7eb]">Item & Order</th>
                {days.map((day, i) => (
                  <th key={i} className="px-2 py-3 text-center text-xs text-neutral-500 font-medium min-w-[40px] border-r border-neutral-100 last:border-0">
                    <div>{day.toLocaleDateString('en-US', { weekday: 'narrow' })}</div>
                    <div className="text-neutral-900 font-bold">{day.getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan={31} className="px-4 py-8 text-center text-neutral-500">No upcoming rentals found.</td>
                </tr>
              ) : (
                rentals.map((rental) => {
                  const start = new Date(rental.rentStartDate);
                  const end = new Date(rental.rentEndDate);
                  start.setHours(0,0,0,0);
                  end.setHours(0,0,0,0);

                  return (
                    <tr key={rental.id} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-neutral-50 border-r border-neutral-200 z-10 shadow-[1px_0_0_0_#e5e7eb]">
                        <div className="font-medium text-neutral-900 truncate max-w-[200px]" title={rental.productName}>
                          {rental.productName}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                          <Link href={`/dashboard/orders?search=${rental.order.orderNumber}`} className="text-violet-600 hover:underline">
                            {rental.order.orderNumber}
                          </Link>
                          <span>•</span>
                          <span className="truncate max-w-[80px]">{rental.order.user?.firstName} {rental.order.user?.lastName}</span>
                          {rental.order.isPickup ? (
                            <span className="ml-1 rounded bg-violet-100 text-violet-800 px-1 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider">Pickup</span>
                          ) : (
                            <span className="ml-1 rounded bg-blue-100 text-blue-800 px-1 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider">Ship</span>
                          )}
                        </div>
                      </td>
                      {days.map((day, i) => {
                        const isRented = day >= start && day <= end;
                        return (
                          <td key={i} className={`px-1 py-1 border-r border-neutral-100 last:border-0 ${isRented ? 'bg-violet-50' : ''}`}>
                            {isRented && (
                              <div 
                                className={`h-8 w-full bg-violet-600 rounded-sm ${day.getTime() === start.getTime() ? 'rounded-l-md' : ''} ${day.getTime() === end.getTime() ? 'rounded-r-md' : ''}`}
                                title={`Rented by ${rental.order.user?.firstName}`}
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

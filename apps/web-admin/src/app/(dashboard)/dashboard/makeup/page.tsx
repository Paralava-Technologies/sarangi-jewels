'use client';

import React, { useEffect, useState } from 'react';
import { fetchMakeupSessions, updateMakeupSessionStatus } from '@/lib/api';

interface Session {
  id: string;
  serviceName: string;
  location: string;
  date: string;
  time: string;
  address?: string;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export default function MakeupAdminPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await fetchMakeupSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateMakeupSessionStatus(id, newStatus);
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Makeup Sessions</h1>
          <p className="mt-1 text-sm text-gray-500">Manage bookings for artist kits and makeup sessions.</p>
        </div>
        <button onClick={loadSessions} className="btn">Refresh</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No sessions booked yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service & Location</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sessions.map(s => (
                <tr key={s.id} className="hover:bg-violet-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.user ? `${s.user.firstName || ''} ${s.user.lastName || ''}`.trim() : 'Guest'}</div>
                    <div className="text-xs text-neutral-500">{s.user?.email || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-violet-700">{s.serviceName}</div>
                    <div className="text-xs text-neutral-500">{s.location}</div>
                    {s.address && <div className="text-xs text-neutral-400 mt-1 max-w-[200px] truncate" title={s.address}>{s.address}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{new Date(s.date).toLocaleDateString()}</div>
                    <div className="text-xs text-neutral-500">{s.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={s.status}
                      onChange={(e) => handleStatusChange(s.id, e.target.value)}
                      className="border border-neutral-200 rounded p-1 text-xs font-semibold outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400">
                    <button
                      onClick={() => setSelectedSession(s)}
                      className="text-violet-600 hover:text-violet-800 font-semibold"
                    >
                      View Details
                    </button>
                    <div className="mt-1">Booked {new Date(s.createdAt).toLocaleDateString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl flex flex-col">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Session Details</h2>
              <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-semibold leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Customer</h3>
                <p className="text-sm font-medium text-gray-900">
                  {selectedSession.user ? `${selectedSession.user.firstName || ''} ${selectedSession.user.lastName || ''}`.trim() : 'Guest User'}
                </p>
                <p className="text-sm text-gray-600">{selectedSession.user?.email || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Service</h3>
                  <p className="text-sm font-medium text-violet-700">{selectedSession.serviceName}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Location Type</h3>
                  <p className="text-sm font-medium text-gray-900">{selectedSession.location}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Date</h3>
                  <p className="text-sm font-medium text-gray-900">{new Date(selectedSession.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Time</h3>
                  <p className="text-sm font-medium text-gray-900">{selectedSession.time}</p>
                </div>
              </div>
              {selectedSession.location === 'Home Visit' && selectedSession.address && (
                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Address</h3>
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedSession.address}
                  </div>
                </div>
              )}
              <div className="pt-4 flex items-center justify-between border-t border-neutral-100">
                <div>
                  <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Status</h3>
                  <p className="text-sm font-bold text-gray-900">{selectedSession.status}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Booked On</h3>
                  <p className="text-sm text-gray-600">{new Date(selectedSession.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end rounded-b-xl">
              <button onClick={() => setSelectedSession(null)} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

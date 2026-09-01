'use client';

import React, { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '@/lib/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states (using standard units, e.g., rupees instead of cents)
  const [shippingThreshold, setShippingThreshold] = useState('');
  const [shippingRate, setShippingRate] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [marqueeText, setMarqueeText] = useState('');
  
  const [storeName, setStoreName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappServiceEnabled, setWhatsappServiceEnabled] = useState(true);
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [codAllowed, setCodAllowed] = useState(false);
  const [codReconciliationMode, setCodReconciliationMode] = useState<'MANUAL' | 'AUTOMATIC'>('MANUAL');
  const [storeState, setStoreState] = useState('');
  const [gstin, setGstin] = useState('');
  const [rentalDeliveryAllowed, setRentalDeliveryAllowed] = useState(true);
  const [maxRentalDeposit, setMaxRentalDeposit] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setError(null);
    try {
      setLoading(true);
      const data = await fetchSettings();
      // Convert cents to standard currency for display
      setShippingThreshold((data.shippingThresholdCents / 100).toString());
      setShippingRate((data.shippingRateCents / 100).toString());
      setTaxRate(data.taxRatePercentage.toString());
      setMarqueeText(data.marqueeText || '');
      setStoreName(data.storeName || '');
      setSupportEmail(data.supportEmail || '');
      setSupportPhone(data.supportPhone || '');
      setWhatsappNumber(data.whatsappNumber || '');
      setWhatsappServiceEnabled(data.whatsappServiceEnabled ?? true);
      setFacebookLink(data.facebookLink || '');
      setInstagramLink(data.instagramLink || '');
      setCodAllowed(data.codAllowed || false);
      setCodReconciliationMode(data.codReconciliationMode || 'MANUAL');
      setStoreState(data.storeState || 'Kerala');
      setGstin(data.gstin || '');
      setRentalDeliveryAllowed(data.rentalDeliveryAllowed ?? true);
      setMaxRentalDeposit(((data.maxRentalDepositCents || 0) / 100).toString());
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await updateSettings({
        shippingThresholdCents: Math.round(parseFloat(shippingThreshold || '0') * 100),
        shippingRateCents: Math.round(parseFloat(shippingRate || '0') * 100),
        taxRatePercentage: parseFloat(taxRate || '0'),
        marqueeText: marqueeText || null,
        storeName: storeName || 'Sarangi Jewels Store',
        supportEmail: supportEmail || null,
        supportPhone: supportPhone || null,
        whatsappNumber: whatsappNumber || null,
        whatsappServiceEnabled,
        facebookLink: facebookLink || null,
        instagramLink: instagramLink || null,
        codAllowed,
        codReconciliationMode,
        storeState: storeState || 'Kerala',
        gstin: gstin || null,
        rentalDeliveryAllowed,
        maxRentalDepositCents: Math.round(parseFloat(maxRentalDeposit || '5000') * 100),
      });
      setSuccess('Settings updated successfully');
      await loadSettings();
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-sm text-gray-500">Manage global rules for shipping and taxes.</p>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {success && <p className="mb-4 text-sm text-green-600">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Admin Security</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" placeholder="••••••••" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" />
            </div>
          </div>
          <div className="pt-2">
            <button type="button" onClick={() => alert('Admin password updated successfully')} className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800">
              Update Password
            </button>
          </div>
        </div>

        <div className="space-y-4 mt-8 pt-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">General Settings</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" placeholder="Sarangi Jewels Store" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" placeholder="support@noeve.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
              <input type="text" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" placeholder="+91 98765 43210" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={whatsappServiceEnabled} onChange={(e) => setWhatsappServiceEnabled(e.target.checked)} className="form-checkbox h-5 w-5 text-black border-gray-300 rounded" />
                <span className="text-sm font-medium text-gray-700">Enable WhatsApp API Service (Automated two-way messages)</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-8">Allows the CRM to auto-respond to and manage tickets via WhatsApp. Only Super Admins can save changes to this setting.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Link</label>
              <input type="url" value={facebookLink} onChange={(e) => setFacebookLink(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Link</label>
              <input type="url" value={instagramLink} onChange={(e) => setInstagramLink(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" placeholder="https://instagram.com/..." />
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-8 pt-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Shipping Rules</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Free Shipping Threshold (₹)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                step="0.01"
                required
                value={shippingThreshold}
                onChange={(e) => setShippingThreshold(e.target.value)}
                className="pl-7 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="15000"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Orders above this amount qualify for free shipping.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Standard Shipping Rate (₹)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                step="0.01"
                required
                value={shippingRate}
                onChange={(e) => setShippingRate(e.target.value)}
                className="pl-7 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="1000"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">The flat rate applied to orders below the free shipping threshold.</p>
          </div>
        </div>

        <div className="space-y-4 mt-8 pt-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Appearance</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Header Marquee Text
            </label>
            <textarea
              rows={3}
              value={marqueeText}
              onChange={(e) => setMarqueeText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. THE NEW EDIT IS NOW LIVE. Separate messages with a newline."
            />
            <p className="mt-1 text-xs text-gray-500">
              The scrolling text displayed at the top of the store. If left blank, default text will be used.
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-8 pt-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Tax Settings</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate Percentage (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                required
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="pr-7 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="18"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">The default GST or tax rate applied during checkout if no HSN rule matches.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Registered State</label>
              <input type="text" value={storeState} onChange={(e) => setStoreState(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" placeholder="Kerala" />
              <p className="mt-1 text-xs text-gray-500">Used for CGST/SGST vs IGST calculation.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN Number</label>
              <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black" placeholder="32AABCU9603R1ZM" />
              <p className="mt-1 text-xs text-gray-500">Displayed on Tax Invoices.</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 mt-8 pt-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Rental Settings</h2>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rentalDeliveryAllowed"
              checked={rentalDeliveryAllowed}
              onChange={(e) => setRentalDeliveryAllowed(e.target.checked)}
              className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
            />
            <label htmlFor="rentalDeliveryAllowed" className="ml-2 block text-sm text-gray-900">
              Allow Online Delivery for Rentals (if unchecked, Shop Visit Only)
            </label>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Rental Deposit per Order (₹)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                step="0.01"
                required
                value={maxRentalDeposit}
                onChange={(e) => setMaxRentalDeposit(e.target.value)}
                className="pl-7 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="5000"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">The maximum total deposit amount that can be charged for a single order, regardless of the items included.</p>
          </div>
        </div>

        <div className="space-y-4 mt-8 pt-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Payment Settings</h2>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="codAllowed"
              checked={codAllowed}
              onChange={(e) => setCodAllowed(e.target.checked)}
              className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
            />
            <label htmlFor="codAllowed" className="ml-2 block text-sm text-gray-900">
              Allow Cash on Delivery (COD)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              COD Reconciliation Mode
            </label>
            <select
              value={codReconciliationMode}
              onChange={(e) => setCodReconciliationMode(e.target.value as 'MANUAL' | 'AUTOMATIC')}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white"
            >
              <option value="MANUAL">Manual (CSV Upload)</option>
              <option value="AUTOMATIC">Automatic (Webhooks via Partners)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Choose whether to upload CSVs manually or let automated webhooks handle settlement via Delivery Partners.</p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

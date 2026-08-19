'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus, type Order } from '@/lib/api';
import { Pagination } from '@/components/Pagination';

export default function FulfillmentPage(): React.JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('PROCESSING');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Print Label state — we no longer use in-page DOM; we open a popup window.
  // labelOrder kept only for triggering the QR canvas generation.
  // const [, setLabelOrder] = useState<Order | null>(null);
  // const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Tracking form state
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOrders(statusFilter, page, 20, undefined, undefined, undefined, searchQuery);
      setOrders(res.data);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, searchQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus, 'Status updated via Fulfillment');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleShipOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingOrderId) return;
    setUpdatingId(shippingOrderId);
    try {
      await updateOrderStatus(shippingOrderId, 'SHIPPED', 'Order shipped', trackingNumber, carrier);
      setShippingOrderId(null);
      setTrackingNumber('');
      setCarrier('');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to ship order');
    } finally {
      setUpdatingId(null);
    }
  };

  /**
   * Opens a dedicated popup window containing a compact shipping label with a
   * real QR code rendered on a canvas element, then auto-triggers print.
   */
  const handlePrintLabel = async (order: Order) => {
    // Dynamically load qrcode only on client
    const QRCode = (await import('qrcode')).default;

    // Encode a short payload: order number + customer + status
    const qrPayload = `ORDER:${order.orderNumber}\nSTATUS:${order.status}${order.trackingNumber ? `\nTRACKING:${order.trackingNumber}` : ''}${order.carrier ? `\nCARRIER:${order.carrier}` : ''}`;
    const qrDataUrl: string = await QRCode.toDataURL(qrPayload, {
      width: 180,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });

    const addr = order.user?.addresses?.[0];
    const addressLines = addr
      ? [
          addr.name,
          addr.streetLine1,
          addr.streetLine2 ?? null,
          `${addr.city}, ${addr.state} ${addr.postalCode}`,
          `PH: ${addr.phone}`,
        ].filter(Boolean)
      : ['Address not available'];

    const itemRows = order.lines
      .map(
        (l) =>
          `<tr><td style="padding:2px 4px;border-bottom:1px solid #ddd">${l.quantity}× ${l.productName}</td><td style="padding:2px 4px;border-bottom:1px solid #ddd;text-align:right;font-family:monospace">${l.sku}</td></tr>`,
      )
      .join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Shipping Label — ${order.orderNumber}</title>
  <style>
    @page { size: 100mm 150mm; margin: 6mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
      color: #000;
      width: 100mm;
    }
    .label { border: 2px solid #000; padding: 6px; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #000;
      padding-bottom: 5px;
      margin-bottom: 5px;
    }
    .brand { font-size: 14pt; font-weight: 900; letter-spacing: 2px; }
    .brand-sub { font-size: 7pt; color: #555; }
    .order-num { font-size: 10pt; font-weight: 700; text-align: right; }
    .order-date { font-size: 7pt; color: #555; text-align: right; }
    .body { display: flex; gap: 6px; margin-bottom: 5px; }
    .ship-to { flex: 1; }
    .ship-to h4 { font-size: 7pt; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; color: #555; }
    .ship-to p { font-size: 9pt; line-height: 1.4; font-weight: 600; }
    .qr-block { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .qr-block img { width: 70px; height: 70px; display: block; }
    .qr-label { font-size: 6pt; color: #555; text-align: center; }
    .items-section { border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
    .items-section h4 { font-size: 7pt; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 3px; }
    table { width: 100%; border-collapse: collapse; font-size: 8pt; }
    .tracking-section { border: 1px solid #000; padding: 4px; margin-top: 5px; border-radius: 2px; }
    .tracking-section h4 { font-size: 7pt; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 2px; }
    .tracking-section p { font-size: 9pt; font-weight: 700; font-family: monospace; }
    .footer { margin-top: 4px; font-size: 6pt; color: #888; text-align: center; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="label">
    <div class="header">
      <div>
        <div class="brand">NOEVE</div>
        <div class="brand-sub">Premium Jewellery</div>
      </div>
      <div>
        <div class="order-num">${order.orderNumber}</div>
        <div class="order-date">${new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
      </div>
    </div>

    <div class="body">
      <div class="ship-to">
        <h4>Ship To</h4>
        <p>${addressLines.join('<br/>')}</p>
      </div>
      <div class="qr-block">
        <img src="${qrDataUrl}" alt="QR Code" />
        <span class="qr-label">Scan to verify</span>
      </div>
    </div>

    <div class="items-section">
      <h4>Contents</h4>
      <table>
        <tbody>${itemRows}</tbody>
      </table>
    </div>

    ${order.trackingNumber ? `
    <div class="tracking-section">
      <h4>Tracking</h4>
      <p>${order.carrier ? `${order.carrier} — ` : ''}${order.trackingNumber}</p>
    </div>` : ''}

    <div class="footer">Sarangi Jewels © ${new Date().getFullYear()} · sarangijewels.com</div>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };</script>
</body>
</html>`;

    const popup = window.open('', '_blank', 'width=420,height=600,toolbar=0,scrollbars=0,status=0');
    if (!popup) {
      alert('Please allow pop-ups to print the label.');
      return;
    }
    popup.document.write(html);
    popup.document.close();
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Fulfillment Center</h1>
          <p className="mt-2 text-sm text-neutral-600">Track and manage the pick-pack-ship workflow.</p>
        </div>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search Order / Email / Tracking"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="block rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
          />
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="block rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
          >
            <option value="PROCESSING">Processing (To Pick)</option>
            <option value="PICKED">Picked (To Pack)</option>
            <option value="PACKED">Packed (To Ship)</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="">All Orders</option>
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-neutral-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
          No orders found for the current filter.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                  <p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className="inline-flex rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                  {order.status}
                </span>
              </div>

              <div className="text-sm mb-4 flex-grow">
                <p className="font-medium text-neutral-700 mb-1">Items:</p>
                <ul className="list-disc pl-5 text-neutral-600 space-y-1 mb-4">
                  {order.lines.map(line => (
                    <li key={line.id}>{line.quantity}x {line.productName} {line.sku ? `(${line.sku})` : ''}</li>
                  ))}
                </ul>
                
                {order.user?.addresses && order.user.addresses.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <p className="font-medium text-neutral-700 mb-1">Shipping To:</p>
                    <p className="text-neutral-600">
                      {order.user.addresses[0].name}<br/>
                      {order.user.addresses[0].streetLine1} {order.user.addresses[0].streetLine2}<br/>
                      {order.user.addresses[0].city}, {order.user.addresses[0].state} {order.user.addresses[0].postalCode}<br/>
                      {order.user.addresses[0].phone}
                    </p>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">Tracking</p>
                    {order.carrier && (
                      <p className="text-xs text-blue-700 font-medium">{order.carrier}</p>
                    )}
                    <p className="text-xs font-mono text-blue-900 break-all">{order.trackingNumber}</p>
                  </div>
                )}
              </div>

              <div className="mt-auto border-t pt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handlePrintLabel(order)}
                  className="rounded bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
                >
                  Print Label
                </button>
                
                {order.status === 'PROCESSING' && (
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => handleUpdateStatus(order.id, 'PICKED')}
                    className="rounded bg-brand-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-primary/90 disabled:opacity-50"
                  >
                    Mark Picked
                  </button>
                )}
                
                {order.status === 'PICKED' && (
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => handleUpdateStatus(order.id, 'PACKED')}
                    className="rounded bg-brand-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-primary/90 disabled:opacity-50"
                  >
                    Mark Packed
                  </button>
                )}
                
                {order.status === 'PACKED' && (
                  <button
                    onClick={() => setShippingOrderId(order.id)}
                    className="rounded bg-brand-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-primary/90"
                  >
                    Ship Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Shipping Modal */}
      {shippingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Shipping Details</h2>
            <form onSubmit={handleShipOrder}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Carrier</label>
                  <input
                    type="text"
                    required
                    value={carrier}
                    onChange={e => setCarrier(e.target.value)}
                    placeholder="e.g. FedEx, BlueDart, Delhivery"
                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Tracking Number</label>
                  <input
                    type="text"
                    required
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShippingOrderId(null)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === shippingOrderId}
                  className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary/90 disabled:opacity-50"
                >
                  {updatingId === shippingOrderId ? 'Saving...' : 'Confirm Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* No in-page print label DOM needed — printing is handled via popup window */}
    </div>
  );
}

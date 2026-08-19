'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import { logout } from '@/lib/auth';
import NextTopLoader from 'nextjs-toploader';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Package,
  Tags,
  Boxes,
  ShoppingCart,
  Truck,
  Percent,
  Users,
  MessageSquare,
  LifeBuoy,
  Megaphone,
  Settings,
  LogOut,
  PenTool,
  Receipt,
} from 'lucide-react';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Reports',
    items: [
      { href: '/dashboard/reports/sales', label: 'Sales Report', icon: FileText },
      { href: '/dashboard/reports/customer', label: 'Customer Report', icon: Users },
      { href: '/dashboard/reports/product', label: 'Product Report', icon: Package },
      { href: '/dashboard/reports/vendor', label: 'Vendor Report', icon: Truck },
      { href: '/dashboard/reports/order', label: 'Order Heat Map', icon: ShoppingCart },
      { href: '/dashboard/reports/support', label: 'Support Report', icon: LifeBuoy },
      { href: '/dashboard/reports/shipment', label: 'Shipment Report', icon: Truck },
      { href: '/dashboard/reports/returns', label: 'Returns Report', icon: FileText },
      { href: '/dashboard/reports/profit-loss', label: 'Profit and Loss', icon: FileText },
      { href: '/dashboard/reports/burnout', label: 'Work Burn Out', icon: FileText },
      { href: '/dashboard/reports/analytics', label: 'Analytics Summary', icon: BarChart3 },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { href: '/dashboard/products', label: 'Products', icon: Package },
      { href: '/dashboard/categories', label: 'Categories', icon: Tags },
      { href: '/dashboard/inventory', label: 'Inventory', icon: Boxes },
    ],
  },
  {
    title: 'Sales',
    items: [
      { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/dashboard/fulfillment', label: 'Fulfillment', icon: Truck },
      { href: '/dashboard/reconciliation', label: 'COD Reconciliation', icon: FileText },
      { href: '/dashboard/promotions', label: 'Promotions', icon: Percent },
    ],
  },
  {
    title: 'Customers',
    items: [
      { href: '/dashboard/crm', label: 'CRM', icon: Users },
      { href: '/dashboard/reviews', label: 'Reviews', icon: MessageSquare },
      { href: '/dashboard/support', label: 'Support', icon: LifeBuoy },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { href: '/dashboard/content', label: 'Content (CMS)', icon: PenTool },
      { href: '/dashboard/marketing', label: 'Marketing', icon: Megaphone },
      { href: '/dashboard/taxes', label: 'Tax Rules', icon: Receipt },
      { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function DashboardLayout({ children }: { children: any }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  /**
   * Determine if a nav item is active.
   * The Overview ("/dashboard") only matches exactly; sub-pages match by prefix.
   */
  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <AuthGuard>
      {/* Top-of-page route-change progress bar */}
      <NextTopLoader color="#8b5cf6" showSpinner={false} height={3} />

      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-neutral-200 bg-white p-4 shadow-sm z-10 flex flex-col h-screen sticky top-0 overflow-y-auto">
          <div className="mb-8 pl-3 pt-2">
            <img
              src="/images/logo.png"
              alt="Sarangi Jewels Admin"
              style={{ height: '32px', width: 'auto' }}
            />
          </div>
          <nav className="space-y-6 flex-1">
            {navGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-2 px-3 text-[0.7rem] font-bold uppercase tracking-widest text-neutral-400">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={[
                          'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                          active
                            ? 'bg-violet-50 text-violet-700 shadow-sm relative after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:h-4 after:w-1 after:rounded-r-full after:bg-violet-600'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                        ].join(' ')}
                      >
                        <Icon
                          className={`h-4 w-4 transition-colors ${active ? 'text-violet-600' : 'text-neutral-400 group-hover:text-neutral-600'}`}
                          strokeWidth={active ? 2.5 : 2}
                        />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-8 border-t border-neutral-100 pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-red-600"
            >
              <LogOut
                className="h-4 w-4 text-neutral-400 group-hover:text-red-500"
                strokeWidth={2}
              />
              Sign out
            </button>
          </div>
        </aside>
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-8">{children}</main>
          <footer className="border-t border-neutral-200 p-4 text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Sarangi Jewels Web Admin. All rights reserved.
          </footer>
        </div>
      </div>
    </AuthGuard>
  );
}

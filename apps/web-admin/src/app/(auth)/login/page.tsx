'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAdmin } from '@/lib/auth';

function AdminLoginForm(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('admin@sarangi.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (searchParams.get('session_expired') === 'true') {
      setError('Your session has expired due to inactivity. Please log in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginAdmin(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-2">
          <img src="/images/logo.png" alt="Sarangi Jewels Admin" style={{ height: '36px', width: 'auto' }} />
        </div>
        <p className="mt-2 text-sm text-neutral-600">Sign in to manage orders and catalog.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
              placeholder="admin@sarangi.local"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-brand-primary py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-xs text-neutral-500">Demo: admin@sarangi.local / Admin123!</p>
      </div>
    </div>
  );
}

export default function AdminLoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

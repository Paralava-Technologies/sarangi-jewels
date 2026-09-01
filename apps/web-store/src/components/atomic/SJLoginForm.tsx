'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginStore } from '@/lib/auth';
import { SJMinimalHeader } from './SJHeader';

export function SJLoginForm(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (searchParams.get('session_expired') === 'true') {
      setError('Your session has expired due to inactivity. Please log in again.');
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    
    loginStore(email.trim(), password.trim())
      .then(() => {
        setSuccess(true);
        setTimeout(() => router.push('/account'), 1500);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : '';
        setError(
          msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('unauthorized')
            ? 'Invalid email or password.'
            : msg || 'Sign in failed. Please try again.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (success) {
    return (
      <div className="wrap" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth__success is-visible">
          <div className="auth__success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2>Welcome back.</h2>
          <p>Redirecting you to your account page…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SJMinimalHeader />
      <div className="auth-wrap">
        <div className="auth-visual">
        <div className="inner">
          <p className="eyebrow" style={{ color: 'var(--gold-light)' }}>Welcome Back</p>
          <h2 style={{ color: 'var(--ivory)', fontSize: '1.7rem', margin: '10px 0' }}>Your bag, wishlist and rental bookings — right where you left them</h2>
          <p>Sign in to track orders, manage rental dates, and check out faster next time.</p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-box">
          <Link href="/shop" style={{ display: 'inline-block', marginBottom: '20px', fontSize: '.8rem', fontFamily: 'var(--mono)', letterSpacing: '1px', color: 'var(--wine)', textDecoration: 'none', textTransform: 'uppercase' }}>
            &larr; Back to Shop
          </Link>
          <p className="eyebrow">Sign In</p>
          <h1>Welcome Back</h1>
          <p style={{ fontSize: '.88rem', color: '#8a7a6a', marginBottom: '30px' }}>
            New to Sarangi? <Link href="/register" style={{ color: 'var(--wine)', borderBottom: '1px solid var(--gold)' }}>Create an account</Link>
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="loginEmail">Email Address</label>
              <input
                type="email"
                id="loginEmail"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="loginPassword">Password</label>
              <input
                type="password"
                id="loginPassword"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p style={{ fontSize: '.76rem', color: 'var(--oxblood)', marginBottom: '1.2rem' }}>{error}</p>}

            <div className="form-row-between" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', fontFamily: 'var(--sans)', letterSpacing: '0' }}>
                <input type="checkbox" /> Keep me signed in
              </label>
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" disabled={loading} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="divider-or"><span className="line"></span>OR<span className="line"></span></div>
          <Link href="/" className="btn" style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--bone)', background: 'transparent' }}>
            Continue as Guest
          </Link>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.72rem', color: 'rgba(33,29,25,0.4)' }}>
            Demo: customer@sarangi.local / Customer123!
          </p>
          <p className="switch" style={{ marginTop: '2rem' }}>
            By continuing, you agree to Sarangi&apos;s <Link href="/terms">Terms &amp; Conditions</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}

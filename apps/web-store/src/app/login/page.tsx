'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginStore } from '@/lib/auth';

function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (searchParams.get('session_expired') === 'true') {
      setError('Your session has expired due to inactivity. Please log in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await loginStore(email, password);
      setSuccess(true);
      setTimeout(() => router.push('/account'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
    <div className="wrap">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--ink)' }}>Sign In</span>
      </nav>

      {/* Auth layout */}
      <section className="auth">
        {/* Visual panel */}
        <div className="auth__visual">
          <svg className="bg-art" viewBox="0 0 560 660" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="fold1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#DCD3C2" />
                <stop offset="100%" stopColor="#B89B6E" />
              </linearGradient>
            </defs>
            <path
              d="M60 40 C200 10, 380 90, 420 230 C460 370, 320 420, 260 540 C220 620, 140 640, 90 600 C30 555, 80 470, 150 420 C230 365, 250 280, 190 210 C130 140, 20 120, 60 40 Z"
              fill="url(#fold1)"
            />
          </svg>
          <div className="auth__visual-top">
            <span className="tag">Member Access</span>
          </div>
          <div>
            <div className="auth__visual-hairline" />
            <h2>&quot;We don&apos;t chase seasons. We build the pieces that outlast them.&quot;</h2>
            <span className="quote-byline">— The Sarangi Jewels Studio</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="auth__form-card">
          <p className="eyebrow">Welcome Back</p>
          <h1>Sign in</h1>
          <p className="sub">Access your orders, saved details and early drop access.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
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

            <div className="form-field">
              <div className="label-row">
                <label htmlFor="loginPassword">Password</label>
                <a href="#">Forgot password?</a>
              </div>
              <div className="input-group">
                <input
                  type={showPw ? 'text' : 'password'}
                  id="loginPassword"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPw(!showPw)}
                  aria-label="Toggle password"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            {error && <p style={{ fontSize: '.76rem', color: 'var(--oxblood)', marginBottom: '1.2rem' }}>{error}</p>}

            <button type="submit" disabled={loading} className="btn btn--primary">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="auth__divider">or</div>

          <Link href="/" className="btn btn--outline">
            Continue as Guest
          </Link>

          <p className="auth__switch">
            New to Sarangi Jewels? <Link href="/register">Create an account</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: '0.8rem', fontSize: '0.72rem', color: 'rgba(33,29,25,0.4)' }}>
            Demo: customer@noeve.local / Customer123!
          </p>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="wrap">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

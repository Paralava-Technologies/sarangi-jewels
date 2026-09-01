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
  const [loginMethod, setLoginMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loadingOtp, setLoadingOtp] = useState(false);

  React.useEffect(() => {
    if (searchParams.get('session_expired') === 'true') {
      setError('Your session has expired due to inactivity. Please log in again.');
    }
  }, [searchParams]);

  const handleSendOtp = async () => {
    setError(null);
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
      return;
    }
    setLoadingOtp(true);
    try {
      const { sendOtp } = await import('@/lib/auth');
      await sendOtp(phone);
      setOtpSent(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const { verifyOtp } = await import('@/lib/auth');
      await verifyOtp(phone, otp);
      setSuccess(true);
      setTimeout(() => router.push('/account'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMethod === 'PHONE') {
      if (otpSent) return handleVerifyOtp(e);
      return;
    }

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

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              type="button" 
              onClick={() => { setLoginMethod('EMAIL'); setError(null); }}
              className={`btn ${loginMethod === 'EMAIL' ? 'btn-gold' : ''}`}
              style={{ flex: 1, padding: '10px', fontSize: '0.8rem', background: loginMethod === 'EMAIL' ? undefined : 'transparent', border: loginMethod === 'EMAIL' ? undefined : '1px solid var(--bone)' }}
            >
              Email Login
            </button>
            <button 
              type="button" 
              onClick={() => { setLoginMethod('PHONE'); setError(null); }}
              className={`btn ${loginMethod === 'PHONE' ? 'btn-gold' : ''}`}
              style={{ flex: 1, padding: '10px', fontSize: '0.8rem', background: loginMethod === 'PHONE' ? undefined : 'transparent', border: loginMethod === 'PHONE' ? undefined : '1px solid var(--bone)' }}
            >
              Phone (OTP)
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {loginMethod === 'EMAIL' ? (
              <>
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
              </>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="loginPhone">Phone Number</label>
                  <input
                    type="tel"
                    id="loginPhone"
                    placeholder="e.g. 9876543210"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={otpSent}
                    required
                  />
                </div>
                {otpSent && (
                  <div className="field">
                    <label htmlFor="loginOtp">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      id="loginOtp"
                      placeholder="XXXXXX"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                )}
              </>
            )}

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px 16px', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            {loginMethod === 'EMAIL' && (
              <div className="form-row-between" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', fontFamily: 'var(--sans)', letterSpacing: '0' }}>
                  <input type="checkbox" /> Keep me signed in
                </label>
                <a href="#">Forgot password?</a>
              </div>
            )}

            {loginMethod === 'EMAIL' ? (
              <button type="submit" disabled={loading} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            ) : (
              !otpSent ? (
                <button type="button" onClick={handleSendOtp} disabled={loadingOtp} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                  {loadingOtp ? 'Sending…' : 'Send OTP via SMS'}
                </button>
              ) : (
                <button type="submit" disabled={loading} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? 'Verifying…' : 'Verify & Sign In'}
                </button>
              )
            )}
          </form>

          <div className="divider-or"><span className="line"></span>OR<span className="line"></span></div>
          <Link href="/" className="btn" style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--bone)', background: 'transparent' }}>
            Continue as Guest
          </Link>


          <p className="switch" style={{ marginTop: '2rem' }}>
            By continuing, you agree to Sarangi&apos;s <Link href="/terms">Terms &amp; Conditions</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerStore } from '@/lib/auth';
import { SJMinimalHeader } from './SJHeader';

export function SJRegisterForm(): React.JSX.Element {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [regMethod, setRegMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loadingOtp, setLoadingOtp] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regMethod === 'PHONE') {
      if (otpSent) return handleVerifyOtp(e);
      return;
    }

    setError(null);

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await registerStore({ email, password, firstName, lastName });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-50">
        <div className="max-w-2xl text-center px-6 animate-fade-in-up">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-stone-200/40 backdrop-blur-sm">
            <img src="/images/logo.png" alt="SARANGI" style={{ height: '40px', width: 'auto', mixBlendMode: 'multiply' }} />
          </div>
          
          <h1 className="mb-6 font-serif text-3xl tracking-tight text-stone-900 md:text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-serif)' }}>
            Hello {firstName || 'there'}!
          </h1>
          
          <div className="mx-auto max-w-2xl text-left text-base leading-relaxed text-stone-600 md:text-lg space-y-4">
            <p>I am incredibly excited to share something very close to my heart. For the past few months, we’ve been working on a passion project to bring true, mindful curation right to you.</p>
            <p>Today, I’m thrilled to invite you to take a first look at our brand-new platform: Sarangi Jewels.</p>
            <p>Whether you are looking for considered apparel, timeless beauty essentials, or lifestyle objects designed to outlast the season, Sarangi Jewels is built to be your go-to destination. We believe that style isn’t just about clothing; it’s about intentionality, longevity, and embracing fewer, finer pieces.</p>
            <p>This is just the beginning of our journey together, and your support means the world to us. Take a look around, explore our curated pieces, and get ready to experience the ultimate celebration of considered living!</p>
            <p className="font-medium text-stone-800 pt-2">Thank you so much for your love and encouragement. Let the journey begin!</p>
          </div>
          
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => router.push('/account')}
              className="rounded-full bg-stone-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
            >
              Go to my account
            </button>
          </div>
        </div>
        
        <style>{`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <SJMinimalHeader />
      <div className="auth-wrap">
        <div className="auth-visual">
        <div className="inner">
          <p className="eyebrow" style={{ color: 'var(--gold-light)' }}>Join The Circle</p>
          <h2 style={{ color: 'var(--ivory)', fontSize: '1.7rem', margin: '10px 0' }}>Create an account for faster checkout and easier rentals</h2>
          <p>Save addresses, track every order and booking, and get first access to new arrivals and rental drops.</p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-box">
          <Link href="/shop" style={{ display: 'inline-block', marginBottom: '20px', fontSize: '.8rem', fontFamily: 'var(--mono)', letterSpacing: '1px', color: 'var(--wine)', textDecoration: 'none', textTransform: 'uppercase' }}>
            &larr; Back to Shop
          </Link>
          <p className="eyebrow">Create Account</p>
          <h1>Join Sarangi</h1>
          <p style={{ fontSize: '.88rem', color: '#8a7a6a', marginBottom: '30px' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--wine)', borderBottom: '1px solid var(--gold)' }}>Sign in</Link>
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              type="button" 
              onClick={() => { setRegMethod('EMAIL'); setError(null); }}
              className={`btn ${regMethod === 'EMAIL' ? 'btn-gold' : ''}`}
              style={{ flex: 1, padding: '10px', fontSize: '0.8rem', background: regMethod === 'EMAIL' ? undefined : 'transparent', border: regMethod === 'EMAIL' ? undefined : '1px solid var(--bone)' }}
            >
              Sign Up with Email
            </button>
            <button 
              type="button" 
              onClick={() => { setRegMethod('PHONE'); setError(null); }}
              className={`btn ${regMethod === 'PHONE' ? 'btn-gold' : ''}`}
              style={{ flex: 1, padding: '10px', fontSize: '0.8rem', background: regMethod === 'PHONE' ? undefined : 'transparent', border: regMethod === 'PHONE' ? undefined : '1px solid var(--bone)' }}
            >
              Sign Up with Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {regMethod === 'EMAIL' ? (
              <>
                <div className="field-row" style={{ display: 'flex', gap: '15px' }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      placeholder="Your first name"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      placeholder="Your last name"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="regEmail">Email Address</label>
                  <input
                    type="email"
                    id="regEmail"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="field-row" style={{ display: 'flex', gap: '15px' }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label htmlFor="regPassword">Password</label>
                    <input
                      type="password"
                      id="regPassword"
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="regPhone">Phone Number</label>
                  <input
                    type="tel"
                    id="regPhone"
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
                    <label htmlFor="regOtp">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      id="regOtp"
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

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '.8rem', color: '#6b5a4d', marginBottom: '22px', lineHeight: 1.6 }}>
              <input type="checkbox" style={{ marginTop: '3px' }} required />
              <span>I agree to the <Link href="/terms" style={{ color: 'var(--wine)' }}>Terms &amp; Conditions</Link> and <Link href="/privacy-policy" style={{ color: 'var(--wine)' }}>Privacy Policy</Link>, including how my data is used for rental bookings.</span>
            </label>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px 16px', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            {regMethod === 'EMAIL' ? (
              <button type="submit" disabled={loading} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            ) : (
              !otpSent ? (
                <button type="button" onClick={handleSendOtp} disabled={loadingOtp} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                  {loadingOtp ? 'Sending…' : 'Send OTP via SMS'}
                </button>
              ) : (
                <button type="submit" disabled={loading} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? 'Verifying…' : 'Verify & Create Account'}
                </button>
              )
            )}
          </form>
          <p className="switch">Planning to rent bridal jewellery or dance costumes? You can add ID verification later from your account, before your first rental booking.</p>
        </div>
      </div>
      </div>
    </>
  );
}

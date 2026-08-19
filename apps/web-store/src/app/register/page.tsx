'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerStore } from '@/lib/auth';

export default function RegisterPage(): React.JSX.Element {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // Removed auto-redirect so user can read at their own pace
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
            <img src="/images/logo.png" alt="NOEVE" style={{ height: '40px', width: 'auto', mixBlendMode: 'multiply' }} />
          </div>
          
          <h1 className="mb-6 font-serif text-3xl tracking-tight text-stone-900 md:text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-serif)' }}>
            Hello {firstName}!
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
    <div className="wrap">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/login">Sign In</Link>
        <span>/</span>
        <span style={{ color: 'var(--ink)' }}>Create Account</span>
      </nav>

      {/* Auth layout */}
      <section className="auth">
        {/* Visual panel */}
        <div className="auth__visual">
          <svg className="bg-art" viewBox="0 0 560 660" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="fold2" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F6F1E8" />
                <stop offset="100%" stopColor="#DCD3C2" />
              </linearGradient>
            </defs>
            <path
              d="M340 20 C440 60, 520 180, 480 300 C440 420, 320 400, 300 500 C285 575, 360 620, 440 600 L520 640 L540 80 Z"
              fill="url(#fold2)"
            />
          </svg>
          <div className="auth__visual-top">
            <span className="tag">Join Sarangi Jewels</span>
          </div>
          <div>
            <div className="auth__visual-hairline" />
            <h2>&quot;Fewer pieces. Finer ones.&quot; — made for members who buy once, and buy well.</h2>
            <span className="quote-byline">Member Benefits</span>
            <div className="auth__perks" style={{ marginTop: '1.6rem' }}>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>{' '}
                Early access to new drops
              </div>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>{' '}
                Order tracking &amp; history
              </div>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>{' '}
                Saved addresses for faster checkout
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="auth__form-card">
          <p className="eyebrow">New Here</p>
          <h1>Create your account</h1>
          <p className="sub">Takes less than a minute.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="Maren"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Kjær"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field">
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

            <div className="form-field">
              <label htmlFor="regPassword">Password</label>
              <div className="input-group">
                <input
                  type={showPw ? 'text' : 'password'}
                  id="regPassword"
                  placeholder="Create a password"
                  autoComplete="new-password"
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
              <p className="form-hint">At least 8 characters.</p>
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-group">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  aria-label="Toggle password"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="checkbox-row">
              <input type="checkbox" id="emailOptIn" defaultChecked />
              <label htmlFor="emailOptIn">Email me about new drops, early access and seasonal notes.</label>
            </div>

            <div className="checkbox-row">
              <input type="checkbox" id="termsAgree" required />
              <label htmlFor="termsAgree">
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </label>
            </div>

            {error && <p style={{ fontSize: '.76rem', color: 'var(--oxblood)', marginBottom: '1.2rem' }}>{error}</p>}

            <button type="submit" disabled={loading} className="btn btn--primary">
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth__switch">
            Already a member? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

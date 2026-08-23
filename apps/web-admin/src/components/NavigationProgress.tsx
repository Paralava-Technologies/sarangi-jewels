'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * NavigationProgress
 *
 * Renders a slim animated progress bar at the top of the viewport whenever
 * a client-side navigation is in-flight.  It starts as soon as the user clicks
 * a nav link (via the exported `startProgress` helper) and disappears once the
 * new pathname is rendered by Next.js.
 *
 * Usage
 * -----
 * 1. Mount <NavigationProgress /> once, high in the tree (e.g. dashboard layout).
 * 2. Call startProgress() from onClick handlers before pushing a route.
 */

type ProgressState = 'idle' | 'loading' | 'done';

// Singleton state so any component can trigger the bar.
let _setState: ((s: ProgressState) => void) | null = null;

export function startProgress() {
  _setState?.('loading');
}

export function NavigationProgress(): React.JSX.Element | null {
  const [state, setState] = useState<ProgressState>('idle');
  const [width, setWidth] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Register the singleton setter so external callers can start the bar.
  useEffect(() => {
    _setState = setState;
    return () => { _setState = null; };
  }, []);

  // Advance the bar slowly while loading.
  useEffect(() => {
    if (state === 'loading') {
      setWidth(20); // jump-start
      intervalRef.current = setInterval(() => {
        setWidth((w) => {
          if (w >= 90) return w; // stall near the end, never reach 100 until done
          return w + Math.random() * 8;
        });
      }, 350);
    }

    if (state === 'done') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setWidth(100); // flash to 100 %
    }

    if (state === 'idle') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Small delay before hiding so the "100 %" flash is visible.
      const t = setTimeout(() => setWidth(0), 300);
      return () => clearTimeout(t);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  // Detect route completion: when pathname changes, mark as done then idle.
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      if (state === 'loading') {
        setState('done');
        const t = setTimeout(() => setState('idle'), 350);
        return () => clearTimeout(t);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (state === 'idle' && width === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${width}%`,
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)',
          transition: state === 'done'
            ? 'width 0.2s ease-out'
            : 'width 0.35s ease-in-out',
          borderRadius: '0 2px 2px 0',
          boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)',
        }}
      />
    </div>
  );
}

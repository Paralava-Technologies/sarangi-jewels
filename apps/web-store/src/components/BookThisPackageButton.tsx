'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';

export function BookThisPackageButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isLoggedIn()) {
      e.preventDefault();
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
  };

  return (
    <a href="#book" onClick={handleClick} className="btn btn-primary w-full text-center py-3 text-lg font-bold">
      Book This Package
    </a>
  );
}

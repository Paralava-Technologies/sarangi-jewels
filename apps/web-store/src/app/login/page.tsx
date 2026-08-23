'use client';

import React, { Suspense } from 'react';
import { SJLoginForm } from '@/components/atomic/SJLoginForm';

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="wrap">Loading...</div>}>
      <SJLoginForm />
    </Suspense>
  );
}

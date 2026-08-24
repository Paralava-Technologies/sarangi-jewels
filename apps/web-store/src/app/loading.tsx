import React from 'react';

export default function Loading(): React.ReactNode {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
      <svg className="spinner" viewBox="0 0 24 24" width="40" height="40" stroke="var(--gold)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/>
      </svg>
    </div>
  );
}

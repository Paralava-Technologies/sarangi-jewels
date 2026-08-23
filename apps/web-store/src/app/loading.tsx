import React from 'react';

export default function Loading(): React.ReactNode {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <svg className="spinner" viewBox="0 0 24 24" width="32" height="32" stroke="var(--oxblood)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/>
      </svg>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

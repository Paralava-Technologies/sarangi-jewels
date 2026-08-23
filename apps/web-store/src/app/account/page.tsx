import React from 'react';
import { SJAccountPanel } from '@/components/atomic/SJAccountPanel';

export default function AccountPage(): React.JSX.Element {
  return (
    <div className="wrap" style={{paddingBottom:'4rem'}}>
      <SJAccountPanel />
    </div>
  );
}

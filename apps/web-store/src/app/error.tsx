'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-4">We&apos;re experiencing technical difficulties</h1>
      <p className="text-gray-600 max-w-md mb-8">
        We&apos;re currently unable to connect to our servers. Our team has been notified and is working to restore service as quickly as possible.
      </p>
      
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Try again
        </button>
        <Link 
          href="/"
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

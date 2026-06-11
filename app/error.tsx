// app/error.tsx
'use client';

import { useEffect } from 'react';
import { RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error monitoring (e.g. Sentry) in production
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-red-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6 animate-float">⚠️</div>
        <h1 className="font-display text-3xl font-bold text-surface-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-surface-500 mb-2 leading-relaxed">
          An unexpected error occurred. Our team has been notified.
        </p>
        {error.digest && (
          <p className="text-xs text-surface-400 font-mono bg-surface-100 rounded-lg px-3 py-2 mb-6 inline-block">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <button onClick={reset} className="btn-primary">
            <RefreshCw size={16} /> Try Again
          </button>
          <Link href="/" className="btn-secondary">
            <Home size={16} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
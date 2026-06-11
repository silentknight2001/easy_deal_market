// app/not-found.tsx
import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-brand-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <p className="font-display text-[160px] font-bold text-surface-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-float">🔍</div>
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold text-surface-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-surface-500 text-lg mb-8 leading-relaxed">
          Looks like this page has already been sold! The URL may be wrong or the listing may have been removed.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Home size={16} /> Go Home
          </Link>
          <Link href="/products" className="btn-secondary">
            <Search size={16} /> Browse Products
          </Link>
        </div>

        <p className="mt-8 text-sm text-surface-400">
          Looking for something specific?{' '}
          <Link href="/contact" className="text-brand-600 hover:underline font-medium">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
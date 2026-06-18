// app/(main)/sell/page.tsx
import type { Metadata } from 'next';
import { SellProductForm } from './SellProductForm';

export const metadata: Metadata = {
  title: 'Sell Your Product | Easy Deals LMG',
  description: 'List your second-hand product for sale in Silchar, Guwahati, and Assam. Fast, safe, and free to list.',
};

export default function SellPage() {
  return (
    <div className="py-10">
      <div className="section-container max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-200 rounded-full text-brand-700 text-sm font-semibold mb-4">
            🚀 Free to List · Get Paid Fast
          </div>
          <h1 className="font-display text-4xl font-bold text-surface-900 mb-3">Sell Your Product</h1>
          <p className="text-surface-500 text-lg">
            Fill in the details below and our team will review your listing within a few hours.
          </p>
        </div>
        <SellProductForm />
      </div>
    </div>
  );
}
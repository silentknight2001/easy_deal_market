// app/(main)/products/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductsClient } from './ProductsClient';

interface Props {
  searchParams: {
    q?:         string;
    category?:  string;
    city?:      string;
    condition?: string;
    minPrice?:  string;
    maxPrice?:  string;
    sortBy?:    string;
    page?:      string;
  };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, category, city } = searchParams;
  const parts = ['Buy & Sell Second-Hand Products'];
  if (q)        parts.unshift(`"${q}"`);
  if (category) parts.unshift(category.replace('_', ' '));
  if (city)     parts.push(`in ${city}`);
  return {
    title:       parts.join(' | ') + ' | Easy Deals LMG',
    description: `Browse second-hand ${category ?? 'products'} ${city ? `in ${city}` : 'in Assam'}. Buy and sell used mobiles, laptops, furniture and more on Easy Deals LMG.`,
    alternates:  { canonical: 'https://easydealslmg.com/products' },
  };
}

export default function ProductsPage({ searchParams }: Props) {
  return (
    <div className="py-8">
      <div className="section-container">
        <Suspense fallback={<div className="h-12 skeleton rounded-xl" />}>
          <ProductsClient searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
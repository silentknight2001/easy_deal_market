// app/(main)/categories/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound }      from 'next/navigation';
import { Suspense }      from 'react';
import { PRODUCT_CATEGORIES } from '@/types';
import { ProductsClient }     from '@/app/(main)/products/ProductsClient';

interface Props { params: { slug: string } }

function getCategoryBySlug(slug: string) {
  return PRODUCT_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export async function generateStaticParams() {
  return PRODUCT_CATEGORIES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategoryBySlug(params.slug);
  if (!category) return { title: 'Category Not Found | Easy Deals LMG' };
  return {
    title:       `Buy & Sell Second-Hand ${category.name} in Assam | Easy Deals LMG`,
    description: `Find the best deals on used ${category.name.toLowerCase()} in Silchar, Guwahati, and across Assam. Verified sellers, fair prices, safe transactions.`,
    alternates:  { canonical: `https://easydealslmg.com/categories/${params.slug}` },
  };
}

export default function CategoryPage({ params }: Props) {
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();

  return (
    <div className="py-8">
      <div className="section-container">

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context':  'https://schema.org',
              '@type':     'CollectionPage',
              name:        `Used ${category.name} for Sale in Assam`,
              description: `Browse second-hand ${category.name.toLowerCase()} listings in Silchar, Guwahati & Assam.`,
              url:         `https://easydealslmg.com/categories/${params.slug}`,
            }),
          }}
        />

        {/* Category header */}
        <div className="flex items-center gap-5 mb-10 p-6 bg-gradient-to-br from-brand-50 to-white rounded-2xl border border-brand-100">
          <div className="w-20 h-20 rounded-2xl bg-white border-2 border-brand-200 flex items-center justify-center text-5xl shadow-brand-sm flex-shrink-0">
            {category.icon}
          </div>
          <div>
            <nav className="flex items-center gap-2 text-xs text-surface-400 mb-1" aria-label="Breadcrumb">
              <a href="/"           className="hover:text-brand-600">Home</a>
              <span>/</span>
              <a href="/categories" className="hover:text-brand-600">Categories</a>
              <span>/</span>
              <span className="text-surface-700 font-medium">{category.name}</span>
            </nav>
            <h1 className="font-display text-3xl font-bold text-surface-900">{category.name}</h1>
            <p className="text-surface-500 mt-0.5">{category.description}</p>
          </div>
        </div>

        <Suspense fallback={<div className="h-12 skeleton rounded-xl" />}>
          <ProductsClient searchParams={{ category: category.id }} />
        </Suspense>
      </div>
    </div>
  );
}
// app/(main)/categories/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { PRODUCT_CATEGORIES } from '@/types';
import { adminDb } from '@/lib/firebase/admin';

export const metadata: Metadata = {
  title:       'Product Categories | Easy Deals LMG',
  description: 'Browse all second-hand product categories in Assam — Mobiles, Laptops, TVs, Furniture, Bikes and more on Easy Deals LMG.',
};

export const revalidate = 3600;

async function getCategoryCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  await Promise.all(
    PRODUCT_CATEGORIES.map(async ({ id }) => {
      try {
        const snap = await adminDb
          .collection('products')
          .where('status',   '==', 'active')
          .where('category', '==', id)
          .count()
          .get();
        counts[id] = snap.data().count;
      } catch {
        counts[id] = 0;
      }
    })
  );
  return counts;
}

export default async function CategoriesPage() {
  const counts = await getCategoryCounts();

  return (
    <div className="py-16">
      <div className="section-container">

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type':    'ItemList',
              name:       'Easy Deals LMG Product Categories',
              itemListElement: PRODUCT_CATEGORIES.map(({ name, slug }, i) => ({
                '@type':   'ListItem',
                position:  i + 1,
                name,
                url: `https://easydealslmg.com/categories/${slug}`,
              })),
            }),
          }}
        />

        <div className="text-center mb-14">
          <h1 className="section-heading">Browse by Category</h1>
          <p className="section-subheading mx-auto">
            Find exactly what you&apos;re looking for across Assam&apos;s largest second-hand marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PRODUCT_CATEGORIES.map(({ id, name, description, icon, slug }) => (
            <Link
              key={id}
              href={`/categories/${slug}`}
              className="group card card-hover p-8 flex flex-col items-center text-center gap-4"
              aria-label={`Browse ${name} – ${counts[id] ?? 0} listings`}
            >
              <div className="w-20 h-20 rounded-2xl bg-brand-50 border-2 border-brand-100 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
                {icon}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-surface-900 group-hover:text-brand-600 transition-colors">
                  {name}
                </h2>
                <p className="text-sm text-surface-500 mt-1">{description}</p>
              </div>
              <div className="mt-auto">
                <span className="badge badge-brand">{counts[id] ?? 0} listings</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-surface-50 rounded-2xl p-8 border border-surface-100">
          <h2 className="font-display text-xl font-bold text-surface-900 mb-4 text-center">
            Popular Searches in Assam
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              'iPhone Silchar', 'Used laptop Guwahati', 'Second hand bike Cachar',
              'Old TV Dibrugarh', 'Furniture Silchar', 'Samsung phone Assam',
              'Used AC Guwahati', 'Second hand MacBook', 'Old refrigerator Silchar',
              'Used sofa Cachar',
            ].map((term) => (
              <Link key={term} href={`/products?q=${encodeURIComponent(term)}`}
                className="px-4 py-2 bg-white rounded-xl border border-surface-200 text-sm text-surface-700 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all duration-150 shadow-sm">
                🔍 {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
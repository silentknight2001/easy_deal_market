// app/(main)/products/[id]/page.tsx
import type { Metadata } from 'next';
import { notFound }      from 'next/navigation';
import { adminDb }       from '@/lib/firebase/admin';
import { Product }       from '@/types';
import { ProductDetailClient } from './ProductDetailClient';
import { formatPrice }   from '@/lib/utils';

interface Props { params: { id: string } }

async function getProduct(id: string): Promise<Product | null> {
  try {
    const snap = await adminDb.collection('products').doc(id).get();
    if (!snap.exists) return null;
    const data = snap.data()!;
    if (data.status !== 'active' && data.status !== 'sold') return null;
    return { id: snap.id, ...data } as Product;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) return { title: 'Product Not Found | Easy Deals LMG' };
  return {
    title:       `${product.title} – ${formatPrice(product.price)} | Easy Deals LMG`,
    description: `Buy ${product.title} (${product.condition.replace('_', ' ')}) for ${formatPrice(product.price)} in ${product.city}, Assam. ${product.description.slice(0, 120)}`,
    openGraph: {
      title:       product.title,
      description: product.description.slice(0, 200),
      images:      product.images[0] ? [{ url: product.images[0].url, width: 800, height: 600, alt: product.title }] : [],
    },
    alternates: { canonical: `https://easydealslmg.com/products/${params.id}` },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type':    'Product',
            name:       product.title,
            description: product.description,
            image:      product.images.map((i) => i.url),
            offers: {
              '@type':       'Offer',
              price:          product.price,
              priceCurrency: 'INR',
              availability:  product.status === 'active'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/SoldOut',
              seller: { '@type': 'Person', name: product.sellerName },
            },
          }),
        }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
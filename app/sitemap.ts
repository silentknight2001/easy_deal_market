// app/sitemap.ts
import { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://easydealslmg.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                    lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/products`,      lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${baseUrl}/sell`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/categories`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${baseUrl}/about`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/faq`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/privacy`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/terms`,         lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];

  // Category pages
  const categories = ['mobiles', 'laptops', 'tvs', 'furniture', 'bikes', 'electronics', 'home-appliances'];
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url:             `${baseUrl}/categories/${cat}`,
    lastModified:    new Date(),
    changeFrequency: 'daily' as const,
    priority:        0.7,
  }));

  // City pages
  const cities = ['silchar', 'guwahati', 'cachar', 'dibrugarh', 'jorhat', 'tezpur'];
  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url:             `${baseUrl}/products?city=${city}`,
    lastModified:    new Date(),
    changeFrequency: 'daily' as const,
    priority:        0.7,
  }));

  // Active product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const snap = await adminDb
      .collection('products')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get();

    productPages = snap.docs.map((doc) => ({
      url:             `${baseUrl}/products/${doc.id}`,
      lastModified:    doc.data().updatedAt?.toDate() ?? new Date(),
      changeFrequency: 'weekly' as const,
      priority:        0.6,
    }));
  } catch (err) {
    console.error('Sitemap product fetch error:', err);
  }

  return [...staticPages, ...categoryPages, ...cityPages, ...productPages];
}
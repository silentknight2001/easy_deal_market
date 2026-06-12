// app/(main)/page.tsx
import type { Metadata } from 'next';
import { HeroSection }         from '@/components/home/HeroSection';
import { TrustBanner }         from '@/components/home/TrustBanner';
import { CategoriesSection }   from '@/components/home/CategoriesSection';
import { FeaturedProducts }    from '@/components/home/FeaturedProducts';
import { HowItWorks, ServiceAreas, TestimonialsSection, ScamNotice, CTASection } from '@/components/home/index';

export const metadata: Metadata = {
  title: 'Easy Deals LMG | Turn Your Old Products Into Instant Cash',
  alternates: { canonical: 'https://easydealslmg.com' },
};

export const revalidate = 600;

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type':    'LocalBusiness',
            name:       'Easy Deals LMG',
            description:'Second-hand marketplace for Assam. Buy and sell used mobiles, laptops, furniture, bikes in Silchar, Guwahati.',
            url:        'https://easydealslmg.com',
            telephone:  '+91-98765-43210',
            address: {
              '@type':         'PostalAddress',
              addressLocality: 'Silchar',
              addressRegion:   'Assam',
              postalCode:      '788001',
              addressCountry:  'IN',
            },
            aggregateRating: {
              '@type':      'AggregateRating',
              ratingValue:  '4.8',
              reviewCount:  '1000',
            },
          }),
        }}
      />
      <div className="overflow-x-hidden">
        <HeroSection />
        <TrustBanner />
        <CategoriesSection />
        <FeaturedProducts />
        <HowItWorks />
        <ServiceAreas />
        <TestimonialsSection />
        <ScamNotice />
        <CTASection />
      </div>
    </>
  );
}
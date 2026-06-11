// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/layout/Providers';
import './globals.css';

// ─── Fonts ────────────────────────────────────────────────────────────────────

const plusJakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  variable: '--font-plus-jakarta',
  display:  'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets:  ['latin'],
  variable: '--font-bricolage',
  display:  'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets:  ['latin'],
  variable: '--font-jetbrains',
  display:  'swap',
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://easydealslmg.com'),

  title: {
    default:  'Easy Deals LMG | Buy & Sell Second-Hand Products in Assam',
    template: '%s | Easy Deals LMG',
  },
  description:
    'Turn your old products into instant cash! Easy Deals LMG connects buyers and sellers of second-hand goods in Silchar, Guwahati, Cachar, and Assam. Sell used phones, laptops, furniture, bikes & more.',

  keywords: [
    'sell used phone Silchar',
    'second hand buyer Assam',
    'used laptop buyer Guwahati',
    'buy sell old products Silchar',
    'second hand marketplace Cachar',
    'used phone buyer Assam',
    'Easy Deals LMG',
    'purana phone becho Silchar',
  ],

  authors:    [{ name: 'Easy Deals LMG', url: 'https://easydealslmg.com' }],
  creator:    'Easy Deals LMG',
  publisher:  'Easy Deals LMG',

  openGraph: {
    type:        'website',
    locale:      'en_IN',
    url:         'https://easydealslmg.com',
    siteName:    'Easy Deals LMG',
    title:       'Easy Deals LMG | Trusted Second-Hand Marketplace in Assam',
    description: 'Turn your old products into instant cash. Trusted second-hand marketplace for Silchar, Guwahati & Assam.',
    images: [
      {
        url:    '/og-image.jpg',
        width:  1200,
        height: 630,
        alt:    'Easy Deals LMG - Second Hand Marketplace',
      },
    ],
  },

  twitter: {
    card:        'summary_large_image',
    title:       'Easy Deals LMG | Second-Hand Marketplace in Assam',
    description: 'Turn your old products into instant cash in Silchar, Guwahati & Assam.',
    images:      ['/og-image.jpg'],
    creator:     '@easydealslmg',
  },

  robots: {
    index:            true,
    follow:           true,
    googleBot: {
      index:                   true,
      follow:                  true,
      'max-video-preview':     -1,
      'max-image-preview':     'large',
      'max-snippet':           -1,
    },
  },

  verification: {
    google: 'your-google-site-verification-token',
  },

  alternates: {
    canonical: 'https://easydealslmg.com',
  },

  category: 'marketplace',
};

export const viewport: Viewport = {
  themeColor:         '#f97316',
  width:              'device-width',
  initialScale:       1,
  maximumScale:       5,
};

// ─── Schema.org structured data ───────────────────────────────────────────────

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type':    'Organization',
  name:       'Easy Deals LMG',
  url:        'https://easydealslmg.com',
  logo:       'https://easydealslmg.com/logo.png',
  description: 'Trusted second-hand marketplace connecting buyers and sellers in Assam, India.',
  address: {
    '@type':           'PostalAddress',
    addressLocality:   'Silchar',
    addressRegion:     'Assam',
    addressCountry:    'IN',
  },
  contactPoint: {
    '@type':       'ContactPoint',
    contactType:   'customer support',
    availableLanguage: ['English', 'Bengali', 'Assamese', 'Hindi'],
  },
  sameAs: [
    'https://wa.me/919876543210',
  ],
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${bricolage.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg"    type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="font-sans bg-white text-surface-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
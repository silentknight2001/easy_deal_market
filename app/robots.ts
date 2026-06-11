// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow:  [
          '/admin/',
          '/api/',
          '/profile',
          '/wishlist',
          '/bookings',
          '/my-listings',
          '/*?*page=',   // prevent pagination crawl
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow:  '/',
      },
    ],
    sitemap: 'https://easydealslmg.com/sitemap.xml',
    host:    'https://easydealslmg.com',
  };
}
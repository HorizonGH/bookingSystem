import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://reserva-smart.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/search', '/signup', '/login'],
        disallow: [
          '/profile',
          '/upgrade',
          '/billing',
          '/business/*/settings',
          '/admin',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

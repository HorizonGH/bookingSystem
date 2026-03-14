import type { MetadataRoute } from 'next';

import { getSiteUrl } from '../lib/siteUrl';

const SITE_URL = getSiteUrl();

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

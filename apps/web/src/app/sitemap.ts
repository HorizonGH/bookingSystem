import type { MetadataRoute } from 'next';

import { getSiteUrl } from '../lib/siteUrl';

export const dynamic = 'force-static';

const SITE_URL = getSiteUrl();

function formatDate(date: Date) {
  // Use YYYY-MM-DD (no time) to maximize parser compatibility.
  return date.toISOString().slice(0, 10);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const today = formatDate(new Date());

  return [
    {
      url: SITE_URL,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: today,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
}

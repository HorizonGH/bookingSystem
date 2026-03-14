export function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (siteUrl && siteUrl.trim().length > 0) {
    // Ensure no trailing slash (sitemap / robots expect exact URL)
    return siteUrl.replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // When deployed to Vercel and a custom domain isn't configured via env vars,
  // default to the Vercel-provided domain so the site remains functional.
  // For a custom domain, set NEXT_PUBLIC_SITE_URL to that domain.
  return 'https://reserva-smart.vercel.app';
}

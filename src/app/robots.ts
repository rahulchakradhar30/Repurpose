import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/what-is-drug-repurposing',
          '/methodology',
          '/sources',
          '/about',
          '/drug/',
          '/icon.svg',
          '/manifest.json',
        ],
        disallow: [
          '/api/',
          '/*?*', // Disallow crawling user search query URLs with parameters (e.g. /?drug=...)
          '/_next/',
          '/saved',
          '/admin',
          '/auth',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

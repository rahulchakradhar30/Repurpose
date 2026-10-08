import { MetadataRoute } from 'next';
import { getCanonicalUrl } from '@/lib/seo';
import { getPublishedDrugSlugs, getPublishedDrugBySlug } from '@/lib/publishedDrugs';
import { getVerifiedNewsArticles } from '@/lib/news/newsEngine';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString().split('T')[0];

  // Core canonical indexable public pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl('/'),
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: getCanonicalUrl('/what-is-drug-repurposing'),
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: getCanonicalUrl('/news'),
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: getCanonicalUrl('/methodology'),
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: getCanonicalUrl('/sources'),
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: getCanonicalUrl('/about'),
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: getCanonicalUrl('/terms-privacy-disclaimer'),
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: getCanonicalUrl('/license'),
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Verified drug pages
  const verifiedSlugs = getPublishedDrugSlugs();
  const drugRoutes: MetadataRoute.Sitemap = verifiedSlugs
    .map((slug) => {
      const guide = getPublishedDrugBySlug(slug);
      if (!guide) return null;

      return {
        url: getCanonicalUrl(`/drug/${slug}`),
        lastModified: guide.lastReviewedDate || currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  // Verified news article pages
  const verifiedNews = await getVerifiedNewsArticles();
  const newsRoutes: MetadataRoute.Sitemap = verifiedNews.map((article) => ({
    url: getCanonicalUrl(`/news/${article.slug}`),
    lastModified: article.lastVerifiedAt.split('T')[0] || currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...drugRoutes, ...newsRoutes];
}

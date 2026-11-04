import { Suspense } from 'react';
import type { Metadata } from 'next';
import { HomeClient } from '@/components/HomeClient';
import { HomeSkeleton } from '@/components/HomeSkeleton';
import { generateHomeJsonLd, getCanonicalUrl, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from '@/lib/seo';

// Incremental Static Regeneration: revalidate every 6 hours so landing page never crashes on cold starts
export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'Evidence-Based Drug Repurposing Explorer',
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: getCanonicalUrl('/'),
  },
  openGraph: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: getCanonicalUrl('/'),
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export default function Home() {
  const homeJsonLd = generateHomeJsonLd();

  return (
    <>
      {/* Inject Structured Data (Server-Rendered for Search Engine Crawlers) */}
      {homeJsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <Suspense fallback={<HomeSkeleton />}>
        <HomeClient />
      </Suspense>
    </>
  );
}

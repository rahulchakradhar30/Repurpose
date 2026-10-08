import type { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper, ArrowLeft, ShieldAlert } from 'lucide-react';
import { getVerifiedNewsArticles } from '@/lib/news/newsEngine';
import { generateBreadcrumbJsonLd, getCanonicalUrl, SITE_NAME, CREATOR_ATTRIBUTION, MEDICAL_DISCLAIMER_TEXT } from '@/lib/seo';
import { NewsClientList } from './NewsClientList';

export const metadata: Metadata = {
  title: 'Drug News & Research Updates | Repurpose',
  description:
    'Verified regulatory, safety, and research updates, summarized from original FDA MedWatch notices, drug approvals, and peer-reviewed PubMed literature.',
  keywords: [
    'Drug Repurposing News',
    'FDA Drug Approvals',
    'FDA Safety Alerts',
    'PubMed Clinical Trials',
    'Drug Recalls',
    'Pharmacology Research Updates',
    'Clinical Pharmacology Evidence'
  ],
  alternates: {
    canonical: getCanonicalUrl('/news'),
  },
  openGraph: {
    title: 'Drug News & Research Updates | Repurpose',
    description:
      'Verified regulatory, safety, and research updates from FDA MedWatch notices and peer-reviewed PubMed literature.',
    url: getCanonicalUrl('/news'),
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drug News & Research Updates | Repurpose',
    description:
      'Verified regulatory, safety, and research updates from FDA MedWatch notices and peer-reviewed PubMed literature.',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

export default async function NewsPage() {
  const articles = await getVerifiedNewsArticles();

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Workspace', url: '/' },
    { name: 'Drug News & Research Updates', url: '/news' },
  ]);

  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Drug News & Research Updates',
    description:
      'Verified regulatory, safety, and research updates from original FDA MedWatch notices and peer-reviewed PubMed literature.',
    url: getCanonicalUrl('/news'),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: getCanonicalUrl('/'),
    },
    publisher: {
      '@type': 'Person',
      name: CREATOR_ATTRIBUTION.name,
    },
    about: {
      '@type': 'MedicalSpecialty',
      name: 'Clinical Pharmacology & Drug Repurposing',
    },
    disclaimer: MEDICAL_DISCLAIMER_TEXT,
    hasPart: articles.slice(0, 10).map((a) => ({
      '@type': 'NewsArticle',
      headline: a.title,
      url: getCanonicalUrl(`/news/${a.slug}`),
      datePublished: a.publishedAt,
      publisher: {
        '@type': 'Organization',
        name: a.source,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />

      <div className="flex-1 flex flex-col pb-16 md:pb-8 text-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1 w-full">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 no-print h-5">
            <Link href="/" className="hover:text-teal-800 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate">
              Drug News &amp; Research Updates
            </span>
          </nav>

          {/* Page Header */}
          <div className="space-y-2 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 tracking-wide font-mono">
              <Newspaper className="w-3.5 h-3.5 text-teal-700" />
              <span>Official Regulatory &amp; Literature Feeds</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading">
              Drug News &amp; Research Updates
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              Verified regulatory and research updates, summarized from original biomedical sources.
            </p>
          </div>

          {/* AI Disclosure & Source Grounding Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-800">
                Source Grounding &amp; AI Summarization Policy
              </p>
              <p className="leading-relaxed">
                All updates are sourced exclusively from public U.S. FDA regulatory notices and peer-reviewed PubMed records. Summaries are AI-assisted syntheses of original source text and do not constitute clinical guidance, prescribing recommendations, or medical advice.
              </p>
            </div>
          </div>

          {/* News List with Client Filtering */}
          <NewsClientList initialArticles={articles} />
        </div>
      </div>
    </>
  );
}

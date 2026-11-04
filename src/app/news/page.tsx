import type { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper, ArrowLeft, ShieldAlert } from 'lucide-react';
import { getVerifiedNewsArticles } from '@/lib/news/newsEngine';
import { generateBreadcrumbJsonLd, getCanonicalUrl, SITE_NAME, CREATOR_ATTRIBUTION, MEDICAL_DISCLAIMER_TEXT } from '@/lib/seo';
import { NewsClientList } from './NewsClientList';

export const revalidate = 21600; // 6 hours

export const metadata: Metadata = {
  title: 'Drug News & Research Updates',
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
    title: 'Drug News & Research Updates',
    description:
      'Verified regulatory, safety, and research updates from FDA MedWatch notices and peer-reviewed PubMed literature.',
    url: getCanonicalUrl('/news'),
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drug News & Research Updates',
    description:
      'Verified regulatory, safety, and research updates from FDA MedWatch notices and peer-reviewed PubMed literature.',
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
      'Curated regulatory updates, drug safety communications, and peer-reviewed clinical research briefs for pharmacological repositioning.',
    url: getCanonicalUrl('/news'),
    publisher: {
      '@type': 'Person',
      name: CREATOR_ATTRIBUTION.name,
    },
    about: {
      '@type': 'MedicalAudience',
      audienceType: 'Biomedical researchers, healthcare professionals, clinical pharmacologists, and pharmacy students',
    },
    hasPart: articles.slice(0, 10).map((a) => ({
      '@type': 'Article',
      headline: a.title,
      url: getCanonicalUrl(`/news/${a.slug}`),
      datePublished: a.publishedAt,
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

      <div className="flex-1 flex flex-col pb-16 md:pb-6 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-6">
          {/* Header & Breadcrumb */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-teal-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Repurpose Workspace</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800">
                <Newspaper className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
                  Drug News &amp; Research Updates
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  Verified regulatory alerts, FDA approvals, and peer-reviewed drug repositioning clinical studies.
                </p>
              </div>
            </div>
          </div>

          {/* Medical & Regulatory Disclaimer Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-slate-900">Research &amp; Surveillance Feed Disclosure</div>
              <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs">
                {MEDICAL_DISCLAIMER_TEXT} Feed contents are aggregated from official U.S. FDA feeds and PubMed/NCBI E-utilities. Summaries do not constitute clinical guidance or treatment recommendations.
              </p>
            </div>
          </div>

          {/* Interactive Filterable News List */}
          <NewsClientList initialArticles={articles} />
        </main>
      </div>
    </>
  );
}

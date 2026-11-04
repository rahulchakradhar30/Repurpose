import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  Building2, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink,
  BookOpen,
  AlertTriangle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { getNewsArticleBySlug, getVerifiedNewsArticles } from '@/lib/news/newsEngine';
import { generateBreadcrumbJsonLd, getCanonicalUrl, SITE_NAME, CREATOR_ATTRIBUTION, MEDICAL_DISCLAIMER_TEXT } from '@/lib/seo';
import { PrintSummaryButton } from '@/components/PrintSummaryButton';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getVerifiedNewsArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested drug news or research update was not found.',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = getCanonicalUrl(`/news/${article.slug}`);

  return {
    title: `${article.title} · Drug News & Evidence Brief`,
    description: article.summary,
    keywords: [
      article.category,
      'Drug Repurposing',
      'Clinical Pharmacology',
      'Biomedical Research',
      article.source,
      'Evidence Brief'
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${article.title} · Repurpose`,
      description: article.summary,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.lastVerifiedAt,
      section: article.category,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} · Repurpose`,
      description: article.summary,
    },
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  };
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Workspace', url: '/' },
    { name: 'Drug News & Research Updates', url: '/news' },
    { name: article.title, url: `/news/${article.slug}` },
  ]);

  const newsArticleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': getCanonicalUrl(`/news/${article.slug}`),
    },
    headline: article.title,
    description: article.summary,
    datePublished: article.publishedAt,
    dateModified: article.lastVerifiedAt,
    url: getCanonicalUrl(`/news/${article.slug}`),
    inLanguage: 'en-US',
    articleSection: article.category,
    publisher: {
      '@type': 'Organization',
      name: article.source,
      url: article.sourceUrl,
    },
    author: {
      '@type': 'Person',
      name: CREATOR_ATTRIBUTION.name,
      url: getCanonicalUrl('/about'),
    },
    about: {
      '@type': 'MedicalEntity',
      name: 'Drug Repurposing & Pharmacology Research',
    },
    citation: article.citation.sourceUrl,
    disclaimer: MEDICAL_DISCLAIMER_TEXT,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />

      <div className="flex-1 flex flex-col pb-16 md:pb-8 text-slate-900">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 flex-1 w-full">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 no-print h-5">
            <Link href="/" className="hover:text-teal-800 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/news" className="hover:text-teal-800 transition-colors">
              <span>News</span>
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
              {article.title}
            </span>
          </nav>

          {/* 1. Header: Category & Source Label */}
          <header className="space-y-4 border-b border-slate-200 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-teal-50 text-teal-800 px-2.5 py-1 rounded border border-teal-200">
                  <Building2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>{article.source}</span>
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                  {article.category}
                </span>

                {/* Ahead of Print Badge */}
                {article.scheduledPrintIssue && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                      {article.scheduledPrintIssue}
                    </span>
                  </>
                )}

                {/* Metadata-Only Badge */}
                {article.abstractStatus === 'metadata_only' && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs font-medium text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Abstract Pending / Metadata-Only Record</span>
                    </span>
                  </>
                )}
              </div>

              {/* One Small Outlined Print Button */}
              <PrintSummaryButton label="Print" variant="outline" />
            </div>

            {/* 2. Full Article Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 font-heading leading-tight">
              {article.title}
            </h1>

            {/* 3. Publication Date, Original Date & Last Verified Timestamp */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Published: <strong className="text-slate-700">{formatDate(article.publishedAt)}</strong></span>
              </span>
              {article.originalSourceDate && article.originalSourceDate !== article.publishedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Original Source Date: {formatDate(article.originalSourceDate)}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-teal-800 font-medium">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Last verified: {formatDate(article.lastVerifiedAt)}</span>
              </span>
            </div>
          </header>

          {/* Source-Provided Image (Only if legally available) */}
          {article.thumbnailUrl && (
            <figure className="space-y-2">
              <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <Image
                  src={article.thumbnailUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
              {article.imageCaption && (
                <figcaption className="text-xs text-slate-500 italic text-center">
                  {article.imageCaption}
                </figcaption>
              )}
            </figure>
          )}

          {/* 7. Summary Section */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-1">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                <span>Summary</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-500">
                {article.abstractStatus === 'metadata_only'
                  ? 'Verbatim NLM metadata record'
                  : article.isAIAssisted
                  ? 'AI-assisted synthesis of linked original source'
                  : 'Peer-reviewed evidence synthesis'}
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {article.summary}
            </p>
          </section>

          {/* 8. Evidence Brief Section */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-2">
              <BookOpen className="w-4 h-4 text-teal-700" />
              <span>Evidence Brief</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-800">Study or Alert Overview</div>
                <div className="text-slate-600 leading-relaxed">{article.evidenceBrief.overview}</div>
              </div>

              {article.evidenceBrief.studyType && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-800">Study / Report Type</div>
                  <div className="text-slate-600 leading-relaxed">{article.evidenceBrief.studyType}</div>
                </div>
              )}

              {article.evidenceBrief.population && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-800">Population / Distribution Scope</div>
                  <div className="text-slate-600 leading-relaxed">{article.evidenceBrief.population}</div>
                </div>
              )}

              {article.evidenceBrief.intervention && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-800">Intervention / Action</div>
                  <div className="text-slate-600 leading-relaxed">{article.evidenceBrief.intervention}</div>
                </div>
              )}

              {article.evidenceBrief.outcome && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 md:col-span-2">
                  <div className="font-semibold text-slate-800">Observed Findings / Reported Outcome</div>
                  <div className="text-slate-600 leading-relaxed">{article.evidenceBrief.outcome}</div>
                </div>
              )}

              {article.evidenceBrief.limitations && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 md:col-span-2">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Evidence Boundaries &amp; Limitations</span>
                  </div>
                  <div className="text-slate-600 leading-relaxed">{article.evidenceBrief.limitations}</div>
                </div>
              )}

              {article.evidenceBrief.repurposingRelevance && (
                <div className="p-3.5 rounded-lg bg-teal-50/70 border border-teal-200 space-y-1 md:col-span-2">
                  <div className="font-semibold text-teal-950">Repurposing &amp; Clinical Significance</div>
                  <div className="text-teal-900 leading-relaxed">{article.evidenceBrief.repurposingRelevance}</div>
                </div>
              )}
            </div>
          </section>

          {/* 9. What This Does NOT Establish */}
          {article.whatThisDoesNotEstablish && article.whatThisDoesNotEstablish.length > 0 && (
            <section className="p-6 rounded-xl bg-amber-50/50 border border-amber-200 shadow-xs space-y-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>What This Notice Does NOT Establish</span>
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {article.whatThisDoesNotEstablish.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold shrink-0 mt-0.5">&bull;</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 10. Direct Citation & Source Link */}
          <section className="p-6 rounded-xl bg-slate-900 text-white shadow-xs space-y-4">
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-teal-400" />
              <span>Original Source Citation &amp; Provenance</span>
            </h2>

            <div className="space-y-2 text-xs sm:text-sm text-slate-300">
              <div className="font-semibold text-white">{article.citation.title}</div>
              <div className="text-slate-400">
                <span>Published by: </span>
                <strong className="text-slate-200">{article.citation.publisher}</strong>
                <span> ({article.citation.date})</span>
              </div>
              {article.citation.identifier && (
                <div className="font-mono text-xs text-teal-300">
                  <span>Identifier: {article.citation.identifier}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <a
                href={article.citation.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
              >
                <span>Read Full Original Document on {article.source}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </section>

          {/* 11. Disclaimer & Methodology Footer */}
          <footer className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span>Educational and research surveillance update only. Not clinical or medical guidance. </span>
              <Link href="/terms-privacy-disclaimer" className="text-teal-800 underline hover:text-teal-950 font-medium">
                <span>Read full disclaimer &amp; research terms</span>
              </Link>
            </div>
          </footer>

          {/* Bottom Back Button */}
          <div className="pt-4 border-t border-slate-200">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-teal-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Drug News &amp; Updates</span>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}

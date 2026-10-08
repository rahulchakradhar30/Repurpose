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
  FileText
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
      title: 'Article Not Found | Repurpose',
      description: 'The requested drug news or research update was not found.',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = getCanonicalUrl(`/news/${article.slug}`);

  return {
    title: `${article.title} | Drug News & Evidence Brief`,
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
      title: `${article.title} | Repurpose`,
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
      title: `${article.title} | Repurpose`,
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
            <span>/</span>
            <Link href="/news" className="hover:text-teal-800 transition-colors">
              News
            </Link>
            <span>/</span>
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
                  {article.source}
                </span>
                <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                  {article.category}
                </span>
              </div>

              {/* 4. One Small Outlined Print Button Only */}
              <PrintSummaryButton label="Print" variant="outline" />
            </div>

            {/* 2. Full Article Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 font-heading leading-tight">
              {article.title}
            </h1>

            {/* 3. Publication Date, Original Date & Last Verified Timestamp */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Published: <strong className="text-slate-700">{formatDate(article.publishedAt)}</strong></span>
              </span>
              {article.originalSourceDate && article.originalSourceDate !== article.publishedAt && (
                <span>&bull; Original Source Date: {formatDate(article.originalSourceDate)}</span>
              )}
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-teal-800 font-medium">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Last verified: {formatDate(article.lastVerifiedAt)}</span>
              </span>
            </div>
          </header>

          {/* 5 & 6. Source-Provided Image & Attribution (Only if legally available) */}
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

          {/* 7. Summary Section (Concise AI-generated source-grounded summary) */}
          <section className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                Summary
              </h2>
              <span className="text-[11px] font-mono text-slate-500">
                AI-generated summary of the linked original source.
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
              Evidence Brief
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                <strong className="text-slate-900 font-semibold">Overview: </strong>
                {article.evidenceBrief.overview}
              </p>

              {article.evidenceBrief.studyType && (
                <p>
                  <strong className="text-slate-900 font-semibold">Study / Evaluation Type: </strong>
                  {article.evidenceBrief.studyType}
                </p>
              )}

              {article.evidenceBrief.population && (
                <p>
                  <strong className="text-slate-900 font-semibold">Target Population / Setting: </strong>
                  {article.evidenceBrief.population}
                </p>
              )}

              {article.evidenceBrief.intervention && (
                <p>
                  <strong className="text-slate-900 font-semibold">Intervention / Exposure: </strong>
                  {article.evidenceBrief.intervention}
                </p>
              )}

              {article.evidenceBrief.outcome && (
                <p>
                  <strong className="text-slate-900 font-semibold">Observed Outcome / Finding: </strong>
                  {article.evidenceBrief.outcome}
                </p>
              )}

              {article.evidenceBrief.limitations && (
                <p>
                  <strong className="text-slate-900 font-semibold">Important Limitations: </strong>
                  {article.evidenceBrief.limitations}
                </p>
              )}

              {article.evidenceBrief.repurposingRelevance && (
                <p className="pt-2 border-t border-slate-100 text-teal-950 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
                  <strong className="text-teal-900 font-semibold">Relevance to Drug Repurposing: </strong>
                  {article.evidenceBrief.repurposingRelevance}
                </p>
              )}
            </div>
          </section>

          {/* 9. What This Does Not Establish Section */}
          <section className="p-6 rounded-xl bg-amber-50/40 border border-amber-200/80 shadow-xs space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-amber-950 tracking-tight flex items-center gap-2 border-b border-amber-200/60 pb-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              What this does not establish
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-amber-900">
              {article.whatThisDoesNotEstablish.map((point, idx) => (
                <li key={idx} className="leading-relaxed">
                  {point}
                </li>
              ))}
            </ul>
          </section>

          {/* 10. Original Source Citation with plain text external link */}
          <section className="p-6 rounded-xl bg-slate-50 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              Original Source Citation
            </h2>
            <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed font-mono bg-white p-3.5 rounded border border-slate-200">
              <p><strong className="text-slate-900">Title:</strong> {article.citation.title}</p>
              <p><strong className="text-slate-900">Publisher / Issuing Body:</strong> {article.citation.publisher}</p>
              <p><strong className="text-slate-900">Date:</strong> {article.citation.date}</p>
              {article.citation.identifier && (
                <p><strong className="text-slate-900">Record Identifier:</strong> {article.citation.identifier}</p>
              )}
              <p className="pt-1 text-slate-600 break-all font-sans">
                <strong>Source Link: </strong>
                <a
                  href={article.citation.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-800 hover:text-teal-950 underline inline-flex items-center gap-1 font-medium"
                >
                  <span>{article.citation.sourceUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </p>
            </div>
          </section>

          {/* 11. Persistent Research-Only Disclaimer */}
          <footer className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p>
              <strong>Disclaimer: </strong>
              This content is for education and research only. It is not medical advice, treatment guidance, or a substitute for the original source.
            </p>
          </footer>

          {/* Navigation link back to news */}
          <div className="pt-4 border-t border-slate-200 no-print">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Drug News &amp; Research Updates
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}

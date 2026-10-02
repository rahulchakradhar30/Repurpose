/**
 * Production SEO & Metadata Utilities for Repurpose
 * Ensures canonical URL integrity, JSON-LD structured data generation,
 * and search engine crawling directives.
 */

import { PublishedDrugGuide } from '@/lib/publishedDrugs';

export function getSiteUrl(): string {
  // Read production canonical URL from environment variable
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.trim() !== '') {
    // Strip trailing slash
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Fallback for Vercel production deployment if environment variable is not yet configured
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, '');
  }

  // Local development fallback
  return 'http://localhost:3000';
}

/**
 * Returns a canonical URL for a given relative path.
 * Strips duplicate and trailing slashes.
 */
export function getCanonicalUrl(path: string = ''): string {
  const baseUrl = getSiteUrl();
  const trimmed = path.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  if (!trimmed) {
    return baseUrl;
  }
  return `${baseUrl}/${trimmed}`;
}

export const getAbsoluteUrl = getCanonicalUrl;

export const SITE_NAME = 'Repurpose';
export const SITE_TAGLINE = 'Evidence-Based Drug Repurposing Research Explorer';
export const SITE_DESCRIPTION =
  'Independent, open-source educational and research-support platform for biomedical researchers and pharmacy students exploring evidence-based drug repurposing candidates across RxNorm, openFDA, ClinicalTrials.gov, and PubMed.';

export const CREATOR_ATTRIBUTION = {
  name: 'P. Rahul Chakradhar',
  email: 'rahulchakradhar30@outlook.com',
  role: 'Open-source creator & maintainer',
};

export const SITE_CONFIG = {
  name: SITE_NAME,
  tagline: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
  creator: {
    name: CREATOR_ATTRIBUTION.name,
    contactEmail: CREATOR_ATTRIBUTION.email,
    role: CREATOR_ATTRIBUTION.role,
  },
};

export const MEDICAL_DISCLAIMER_TEXT =
  'For education and research only. This tool does not provide medical advice, diagnosis, or treatment recommendations. Always verify findings with original peer-reviewed literature and consult qualified healthcare professionals.';

/**
 * Generates JSON-LD for WebSite, SoftwareApplication, and Person on the home page.
 */
export function generateHomeJsonLd() {
  const siteUrl = getSiteUrl();

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: {
      '@type': 'Person',
      name: CREATOR_ATTRIBUTION.name,
      email: CREATOR_ATTRIBUTION.email,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?drug={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${siteUrl}/#software`,
    name: SITE_NAME,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    url: siteUrl,
    description: SITE_DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Person',
      name: CREATOR_ATTRIBUTION.name,
      email: CREATOR_ATTRIBUTION.email,
    },
  };

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: CREATOR_ATTRIBUTION.name,
    email: CREATOR_ATTRIBUTION.email,
  };

  return [websiteSchema, softwareAppSchema, personSchema];
}

/**
 * Generates BreadcrumbList schema for crawlable hierarchy.
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; path?: string; url?: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => {
      const rawTarget = item.url || item.path || '';
      const canonicalTarget = rawTarget.startsWith('http')
        ? rawTarget
        : getCanonicalUrl(rawTarget);

      return {
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        item: canonicalTarget,
      };
    }),
  };
}

/**
 * Generates Article / MedicalWebPage schema for educational pages.
 */
export function generateArticleJsonLd(props: {
  headline?: string;
  title?: string;
  description: string;
  path?: string;
  url?: string;
  datePublished: string;
  dateModified: string;
  type?: string;
}) {
  const heading = props.headline || props.title || SITE_NAME;
  const pagePath = props.path || props.url || '';
  const pageUrl = pagePath.startsWith('http') ? pagePath : getCanonicalUrl(pagePath);
  const siteUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': props.type || 'Article',
    '@id': `${pageUrl}/#article`,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    name: heading,
    headline: heading,
    description: props.description,
    datePublished: props.datePublished,
    dateModified: props.dateModified,
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: SITE_NAME,
    },
    author: {
      '@type': 'Person',
      name: CREATOR_ATTRIBUTION.name,
      email: CREATOR_ATTRIBUTION.email,
    },
    publisher: {
      '@type': 'Person',
      name: CREATOR_ATTRIBUTION.name,
      email: CREATOR_ATTRIBUTION.email,
    },
    disclaimer: MEDICAL_DISCLAIMER_TEXT,
  };
}

/**
 * Generates MedicalWebPage schema for verified public drug dossiers.
 */
export function generateDrugPageJsonLd(guide: PublishedDrugGuide) {
  const pageUrl = getCanonicalUrl(`/drug/${guide.slug}`);
  const siteUrl = getSiteUrl();
  const { drug, candidates } = guide;

  // Extract all citations and trial links into citations
  const citations: string[] = [];
  candidates.forEach((c) => {
    c.citations?.forEach((cite) => {
      if (cite.url) citations.push(cite.url);
    });
    c.clinicalTrials?.forEach((t) => {
      if (t.studyUrl) citations.push(t.studyUrl);
    });
  });
  drug.sources?.forEach((s) => {
    if (s.url) citations.push(s.url);
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${pageUrl}/#drugpage`,
    url: pageUrl,
    name: `${drug.genericName} Drug Repurposing Research & Clinical Evidence Dossier`,
    headline: `${drug.genericName} Repurposing & Clinical Evidence Dossier`,
    description: guide.educationalOverview,
    dateModified: guide.lastReviewedDate || drug.lastVerifiedDate,
    citation: citations,
    aspect: [
      'Repurposing Candidate',
      'Clinical Trials',
      'Pharmacological Mechanism',
      'Regulatory Indications',
    ],
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: SITE_NAME,
    },
    about: {
      '@type': 'Drug',
      name: drug.genericName,
      drugClass: drug.drugClass,
      identifier: drug.rxNormId ? `RxNorm:${drug.rxNormId}` : undefined,
    },
    author: {
      '@type': 'Person',
      name: CREATOR_ATTRIBUTION.name,
      email: CREATOR_ATTRIBUTION.email,
    },
    disclaimer: MEDICAL_DISCLAIMER_TEXT,
  };
}

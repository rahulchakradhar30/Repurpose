import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEvidenceDossier } from '@/lib/evidenceDossier';
import { EvidenceDossierClient } from './EvidenceDossierClient';
import { getCanonicalUrl, generateBreadcrumbJsonLd } from '@/lib/seo';

interface PageProps {
  params: Promise<{ 'drug-slug': string; 'condition-slug': string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const drugSlug = resolvedParams['drug-slug'];
  const conditionSlug = resolvedParams['condition-slug'];

  const dossier = await getEvidenceDossier(drugSlug, conditionSlug);

  if (!dossier) {
    return {
      title: 'Evidence Dossier Not Found | Repurpose',
      description: 'The requested drug-condition repurposing hypothesis record could not be found or verified.',
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const { drug, candidate, isIndexable } = dossier;
  const canonicalUrl = getCanonicalUrl(`/evidence/${drugSlug}/${conditionSlug}`);
  const score = candidate.readinessScore ?? candidate.evidenceScore.totalScore;
  const state = candidate.researchState || 'Investigational';

  return {
    title: `${candidate.condition} & ${drug.genericName} Repurposing Evidence Dossier | Repurpose`,
    description: `Biomedical evidence dossier for ${drug.genericName} in ${candidate.condition}. Research state: ${state}. Research readiness score: ${score}/100. Verified trials & PubMed citations.`,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: isIndexable,
      follow: true,
      googleBot: {
        index: isIndexable,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: `${drug.genericName} for ${candidate.condition} | Repurposing Evidence Dossier`,
      description: `Investigate clinical trial evidence, PubMed citations, safety warnings, and Repurpose Compass readiness for ${drug.genericName} targeting ${candidate.condition}.`,
      url: canonicalUrl,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${drug.genericName} - ${candidate.condition} Repurposing Evidence Dossier`,
      description: `Verified clinical evidence and Research Readiness scoring for ${drug.genericName} in ${candidate.condition}.`,
    },
  };
}

export default async function EvidenceDossierPage({ params }: PageProps) {
  const resolvedParams = await params;
  const drugSlug = resolvedParams['drug-slug'];
  const conditionSlug = resolvedParams['condition-slug'];

  const dossier = await getEvidenceDossier(drugSlug, conditionSlug);

  if (!dossier) {
    notFound();
  }

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: dossier.drug.genericName, url: `/drug/${dossier.drugSlug}` },
    { name: `${dossier.candidate.condition} Dossier`, url: `/evidence/${dossier.drugSlug}/${dossier.conditionSlug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <EvidenceDossierClient dossier={dossier} />
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Database, ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { generateBreadcrumbJsonLd, generateArticleJsonLd, getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Data Sources & Public Biomedical Registries | Repurpose',
  description:
    'Transparent breakdown of open biomedical APIs and registries queried by Repurpose, including RxNorm, openFDA, PubChem, ClinicalTrials.gov, and PubMed.',
  alternates: {
    canonical: getCanonicalUrl('/sources'),
  },
  openGraph: {
    title: 'Biomedical Data Sources & Verification | Repurpose',
    description:
      'Explore the official biomedical registries queried in real-time by Repurpose to provide verifiable drug repurposing research.',
    url: getCanonicalUrl('/sources'),
    type: 'article',
  },
};

const INTEGRATED_SOURCES = [
  {
    name: 'RxNorm API',
    institution: 'U.S. National Library of Medicine (NLM / NIH)',
    role: 'Standardized Drug Nomenclature & Concept Normalization',
    license: 'Public Domain / Free US NLM License',
    url: 'https://rxnav.nlm.nih.gov/',
    description:
      'Provides normalized naming for clinical drugs and links generic ingredients to distinct RxNorm Concept Unique Identifiers (RxCUIs). Every drug search in Repurpose begins with RxNorm normalization to prevent ambiguity between brand names, salts, and international generic identifiers.',
    fieldsRetrieved: ['Generic Name', 'RxCUI', 'Brand Synonyms', 'Active Ingredient Matches'],
  },
  {
    name: 'openFDA API (DailyMed & Drug Labels)',
    institution: 'U.S. Food and Drug Administration (FDA)',
    role: 'Regulatory Status, Approved Indications & Safety Boxed Warnings',
    license: 'Public Domain / openFDA Terms of Service',
    url: 'https://open.fda.gov/apis/drug/label/',
    description:
      'Supplies structured product labeling (SPL) submitted by manufacturers and approved by the FDA. Repurpose queries openFDA to extract established approved indications, contraindications, and boxed warnings so investigators can clearly differentiate approved uses from investigational repurposing candidates.',
    fieldsRetrieved: ['FDA Approval Status', 'Established Indications', 'Mechanism of Action', 'Boxed Warnings', 'Contraindications'],
  },
  {
    name: 'PubChem PUG-REST API',
    institution: 'National Center for Biotechnology Information (NCBI / NIH)',
    role: 'Chemical Structures, Molecular Properties & Targets',
    license: 'Public Domain (NIH)',
    url: 'https://pubchem.ncbi.nlm.nih.gov/',
    description:
      'Delivers chemical nomenclature, 2D structure representations, molecular weight, canonical SMILES, hydrogen bond donors/acceptors, and known biological target interactions. This data provides the mechanistic rationale for why a small molecule might bind off-target receptors.',
    fieldsRetrieved: ['PubChem CID', 'Molecular Formula & Weight', 'Canonical SMILES', 'Target Macromolecules', 'Safety Pictograms'],
  },
  {
    name: 'ClinicalTrials.gov REST API v2',
    institution: 'National Library of Medicine (NLM / NIH)',
    role: 'Interventional Clinical Trials & Investigational Status',
    license: 'Public Domain',
    url: 'https://clinicaltrials.gov/data-api/api',
    description:
      'Searches active, recruiting, and completed human interventional trials testing the queried compound for novel indications. Repurpose parses study phase (Phase 1 to 4), primary completion dates, enrollment numbers, and recruitment status directly from ClinicalTrials.gov JSON records.',
    fieldsRetrieved: ['NCT Identifier', 'Study Title', 'Investigational Condition', 'Trial Phase', 'Recruitment Status', 'Sponsors'],
  },
  {
    name: 'NCBI PubMed / Entrez E-Utilities',
    institution: 'National Library of Medicine (NLM / NIH)',
    role: 'Peer-Reviewed Literature & Preclinical Mechanism Papers',
    license: 'Public Domain / Open Access',
    url: 'https://www.ncbi.nlm.nih.gov/home/develop/api/',
    description:
      'Retrieves peer-reviewed MEDLINE citations, systematic reviews, and preclinical bench studies indexed by PubMed ID (PMID). Used to confirm whether mechanistic hypotheses have demonstrated in-vitro or in-vivo activity prior to clinical trials.',
    fieldsRetrieved: ['PubMed ID (PMID)', 'Article Title', 'Authors & Journal', 'Publication Date', 'Direct PubMed Link'],
  },
];

export default function SourcesPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Data Sources', url: '/sources' },
  ]);

  const articleJsonLd = generateArticleJsonLd({
    headline: 'Biomedical Data Sources and Registry Integrations in Repurpose',
    description: 'Documentation of open biomedical data registries queried by Repurpose, including RxNorm, openFDA, PubChem, ClinicalTrials.gov, and PubMed.',
    path: '/sources',
    datePublished: '2025-01-15T00:00:00Z',
    dateModified: '2026-03-01T00:00:00Z',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center text-xs text-slate-500 gap-2">
            <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
            <li>/</li>
            <li className="text-slate-300 font-medium">Data Sources</li>
          </ol>
        </nav>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-4">
            <Database className="w-3.5 h-3.5" />
            Registry Provenance & API Integrity
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Biomedical Data Sources & Integrations
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Repurpose adheres to a strict zero-hallucination architecture. We query authoritative, publicly accessible biomedical registries via official government and research APIs. Every claim, condition, trial phase, and chemical target displayed in this platform maps back to a verifiable public record.
          </p>
        </div>

        {/* Licensing & Proprietary Exclusion Note */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-slate-800 mb-10">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Open Science & Intellectual Property Compliance: </span>
              Repurpose intentionally avoids scraping copyrighted or commercial proprietary databases (e.g., DrugBank Commercial, Clarivate Cortellis). We rely exclusively on open-access, public domain datasets provided by the U.S. National Institutes of Health (NIH), the Food and Drug Administration (FDA), and official international bioinformatics repositories.
            </div>
          </div>
        </div>

        {/* Source Cards */}
        <div className="space-y-6 mb-12">
          {INTEGRATED_SOURCES.map((src) => (
            <div
              key={src.name}
              className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">{src.name}</h2>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                    aria-label={`Official website for ${src.name}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/40 px-2.5 py-0.5 rounded-full w-fit">
                  {src.license}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono mb-3">
                Maintained by: {src.institution}
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {src.description}
              </p>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Key Fields Ingested:
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {src.fieldsRetrieved.map((field) => (
                    <span
                      key={field}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Fallback Strategy */}
        <div className="p-6 rounded-xl bg-amber-950/20 border border-amber-800/40 mb-12">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-amber-200 mb-2">
                Handling API Latency, Downtime & Rate Limits
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                Government APIs occasionally experience scheduled maintenance, transient timeouts, or rate limits. Repurpose executes concurrent parallel requests with graceful degradation:
              </p>
              <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5 list-disc pl-5">
                <li>If RxNorm fails, search halts with a clear error prompt rather than guessing an unverified compound identity.</li>
                <li>If ClinicalTrials.gov is temporarily unresponsive, published indication data from openFDA continues to render, accompanied by an explicit badge stating trial data could not be refreshed.</li>
                <li>AI synthesis is strictly blocked whenever underlying primary records are missing, preventing ungrounded inference.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-800 gap-4">
          <Link
            href="/methodology"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Read Evidence Scoring Methodology
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            Search Verified Compounds
          </Link>
        </div>
      </div>
    </>
  );
}

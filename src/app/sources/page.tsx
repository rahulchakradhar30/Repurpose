import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Database, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft,
  Clock,
  Layers
} from 'lucide-react';
import { generateBreadcrumbJsonLd, generateArticleJsonLd, getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Data Sources & Licence Registry',
  description:
    'Comprehensive registry of open biomedical APIs, access methods, licenses, refresh rates, terms of use, and permitted integration boundaries in Repurpose.',
  alternates: {
    canonical: getCanonicalUrl('/sources'),
  },
  openGraph: {
    title: 'Biomedical Data Source & Licence Registry | Repurpose',
    description:
      'Inspect verifiable source integrations, permitted public APIs, and licensing boundaries for drug repurposing evidence.',
    url: getCanonicalUrl('/sources'),
    type: 'article',
  },
};

interface SourceRegistryItem {
  name: string;
  institution: string;
  purpose: string;
  accessMethod: string;
  license: string;
  refreshFrequency: string;
  lastUpdate: string;
  status: 'Enabled' | 'Awaiting lawful integration' | 'Unavailable' | 'Source not configured';
  knownLimitations: string;
  termsUrl: string;
}

const SOURCE_REGISTRY: SourceRegistryItem[] = [
  {
    name: 'RxNorm API',
    institution: 'U.S. National Library of Medicine (NLM / NIH)',
    purpose: 'Normalized drug nomenclature, RxCUI concept mapping, active ingredients, and verified brand name synonyms.',
    accessMethod: 'REST JSON API (rxnav.nlm.nih.gov)',
    license: 'Public Domain / Free US NLM License (UMLS attribution)',
    refreshFrequency: 'On-demand live API query with in-memory caching',
    lastUpdate: 'Real-time (Active)',
    status: 'Enabled',
    knownLimitations: 'Focuses on drugs available in the US clinical market; novel international investigational candidates may lack immediate RxCUI.',
    termsUrl: 'https://www.nlm.nih.gov/research/umls/rxnorm/overview.html',
  },
  {
    name: 'openFDA Drug Product Labels API',
    institution: 'U.S. Food and Drug Administration (FDA / HHS)',
    purpose: 'Structured product labels, authorized indications and usage, boxed warnings, precautions, and contraindications.',
    accessMethod: 'REST JSON API (api.fda.gov/drug/label.json)',
    license: 'CC0 / US Government Public Domain (open.fda.gov terms)',
    refreshFrequency: 'Real-time query with deterministic cache fallback',
    lastUpdate: 'Real-time (Active)',
    status: 'Enabled',
    knownLimitations: 'Reflects FDA-approved package inserts; does not evaluate off-label clinical use.',
    termsUrl: 'https://open.fda.gov/terms/',
  },
  {
    name: 'ClinicalTrials.gov API v2',
    institution: 'National Library of Medicine / NIH',
    purpose: 'Registered clinical studies, trial identifiers (NCT), phases, intervention models, recruitment status, and study dates.',
    accessMethod: 'Modern REST JSON API (clinicaltrials.gov/api/v2)',
    license: 'Public Domain (US NIH Open Data Policy)',
    refreshFrequency: 'On-demand live API queries',
    lastUpdate: 'Real-time (Active)',
    status: 'Enabled',
    knownLimitations: 'Trial registration establishes exploratory activity; study existence does not equal positive peer-reviewed clinical outcome.',
    termsUrl: 'https://clinicaltrials.gov/data-api/about-api',
  },
  {
    name: 'PubMed E-Utilities (NCBI Entrez API)',
    institution: 'National Center for Biotechnology Information (NCBI / NLM)',
    purpose: 'Peer-reviewed biomedical literature citations, PMIDs, author rosters, journal metadata, publication dates, and PubMed links.',
    accessMethod: 'E-Utilities REST API (eutils.ncbi.nlm.nih.gov)',
    license: 'Public Domain / NCBI Open Science Attribution',
    refreshFrequency: 'Live queries with rate-controlled dispatch',
    lastUpdate: 'Real-time (Active)',
    status: 'Enabled',
    knownLimitations: 'Publishes literature citations indexed in MEDLINE; does not infer clinical efficacy from observational abstracts.',
    termsUrl: 'https://www.ncbi.nlm.nih.gov/home/about/policies/',
  },
  {
    name: 'PubChem REST API',
    institution: 'National Center for Biotechnology Information (NCBI / NLM)',
    purpose: 'Chemical compound structures, canonical SMILES, InChIKey identifiers, molecular properties, and Compound IDs (CID).',
    accessMethod: 'PUG REST API (pubchem.ncbi.nlm.nih.gov/rest/pug)',
    license: 'Public Domain (NCBI Open Data Policy)',
    refreshFrequency: 'Real-time chemical identifier mapping',
    lastUpdate: 'Real-time (Active)',
    status: 'Enabled',
    knownLimitations: 'Focuses on chemical structure and chemical substance records rather than clinical pharmacology indications.',
    termsUrl: 'https://pubchem.ncbi.nlm.nih.gov/docs/policies',
  },
  {
    name: 'DrugBank Commercial',
    institution: 'OMx Technologies Inc. / DrugBank',
    purpose: 'Proprietary comprehensive chemical, target, and drug action knowledgebase.',
    accessMethod: 'None (Scraping prohibited; Commercial License required)',
    license: 'Proprietary commercial license required',
    refreshFrequency: 'Not integrated',
    lastUpdate: 'Not configured',
    status: 'Awaiting lawful integration',
    knownLimitations: 'Repurpose strictly respects third-party commercial copyrights and never scrapes or mirrors proprietary datasets.',
    termsUrl: 'https://go.drugbank.com/legal/terms',
  },
  {
    name: 'DrugCentral',
    institution: 'University of New Mexico / Division of Translational Informatics',
    purpose: 'Online drug compendium with structure and target relationships.',
    accessMethod: 'None (Scraping prohibited)',
    license: 'CC BY-SA 4.0 (requires formal source attribution pipeline)',
    refreshFrequency: 'Awaiting pipeline implementation',
    lastUpdate: 'Not configured',
    status: 'Awaiting lawful integration',
    knownLimitations: 'Not currently scraped or mirrored. Never substituted with fake data.',
    termsUrl: 'https://drugcentral.org/',
  },
  {
    name: 'Open Targets Platform',
    institution: 'EMBL-EBI, Wellcome Sanger Institute, GSK, BMS, Sanofi, Pfizer',
    purpose: 'Target–disease association evidence graphs and genetic associations.',
    accessMethod: 'Public GraphQL API (Phase 3 candidate)',
    license: 'CC0 Open Access Data',
    refreshFrequency: 'Scheduled for Phase 3 target exploration',
    lastUpdate: 'Planned (Phase 3)',
    status: 'Awaiting lawful integration',
    knownLimitations: 'Currently awaiting dedicated GraphQL client integration. Feature hidden until verified and tested.',
    termsUrl: 'https://platform.opentargets.org/',
  },
];

export default function SourcesPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Data Source & Licence Registry', url: '/sources' },
  ]);

  const articleJsonLd = generateArticleJsonLd({
    headline: 'Data Source & Licence Registry | Repurpose',
    description: 'Documentation of open biomedical data registries, licensing terms, refresh frequencies, and permitted access methods.',
    path: '/sources',
    datePublished: '2025-01-15T00:00:00Z',
    dateModified: '2026-10-03T00:00:00Z',
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

      <div className="flex-1 flex flex-col pb-16 md:pb-6 text-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 flex-1 w-full">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center text-xs text-slate-500 gap-2">
              <li><Link href="/" className="hover:text-teal-800 transition-colors">Home</Link></li>
              <li>/</li>
              <li className="text-slate-800 font-semibold">Data Source &amp; Licence Registry</li>
            </ol>
          </nav>

          {/* Page Heading Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 tracking-wide font-mono">
              <Database className="w-3.5 h-3.5 text-teal-700" />
              <span>Transparent Registry Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 font-heading">
              Data Source &amp; Licence Registry
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              Repurpose is positioned as an open-source evidence workspace for investigating drug-repurposing hypotheses through transparent clinical, biological, regulatory, safety, and literature evidence.
            </p>
          </div>

          {/* Permitted Source Strategy Banner */}
          <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="font-bold text-slate-900">Strict Permitted Source Strategy &amp; Legal Compliance</div>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs">
                  <li>We query direct, documented, permitted public APIs provided by the NIH, FDA, and NLM.</li>
                  <li>We do not copy, scrape, rehost, or misrepresent third-party proprietary databases (e.g., DrugBank Commercial, Clarivate, DrugCentral, Broad Repurposing Hub, REFRAMEdb, repoDB, or Open Targets).</li>
                  <li>We preserve all required source citations and attribution links in every candidate evaluation and export.</li>
                  <li>Where source access, licensing, or credentials are unavailable, we explicitly show &quot;Awaiting lawful integration&quot; or hide the feature. We NEVER substitute fake or synthetic data.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Source Registry Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-700" />
                Integrated Biomedical Sources &amp; Boundary Status
              </h2>
              <span className="text-xs text-slate-600 font-mono">
                {SOURCE_REGISTRY.filter(s => s.status === 'Enabled').length} active sources
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px]">
                    <th className="p-4 font-semibold">Source &amp; Institution</th>
                    <th className="p-4 font-semibold">Purpose in Repurpose</th>
                    <th className="p-4 font-semibold">Access &amp; Licence</th>
                    <th className="p-4 font-semibold">Status &amp; Refresh</th>
                    <th className="p-4 font-semibold">Known Limitations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {SOURCE_REGISTRY.map((src) => {
                    const statusBadge = {
                      'Enabled': 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      'Awaiting lawful integration': 'bg-amber-50 text-amber-900 border-amber-200',
                      'Unavailable': 'bg-rose-50 text-rose-800 border-rose-200',
                      'Source not configured': 'bg-slate-100 text-slate-700 border-slate-200',
                    }[src.status];

                    return (
                      <tr key={src.name} className="hover:bg-slate-50/50">
                        <td className="p-4 align-top space-y-1 min-w-[200px]">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                            <span>{src.name}</span>
                            <a
                              href={src.termsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-teal-800 transition-colors"
                              title="Inspect license terms"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <div className="text-[11px] text-slate-500">{src.institution}</div>
                        </td>

                        <td className="p-4 align-top text-slate-700 min-w-[240px] leading-relaxed">
                          {src.purpose}
                        </td>

                        <td className="p-4 align-top space-y-1 min-w-[200px] font-mono text-[11px]">
                          <div className="text-slate-800">{src.accessMethod}</div>
                          <div className="text-teal-800 font-semibold">{src.license}</div>
                        </td>

                        <td className="p-4 align-top space-y-1.5 min-w-[170px]">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadge}`}>
                            {src.status}
                          </span>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {src.refreshFrequency}
                          </div>
                        </td>

                        <td className="p-4 align-top text-slate-600 min-w-[220px] text-[11px] leading-relaxed">
                          {src.knownLimitations}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Downtime & Rate Limit Resilience */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              API Resilience &amp; Fallback Controls
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a government biomedical API experiences transient downtime, rate limits, or scheduled maintenance, Repurpose handles requests with error isolation. The platform displays an explicit status notification rather than manufacturing synthetic records or guessing unverified clinical outcomes.
            </p>
          </div>

          {/* Bottom Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200 gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-teal-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Repurpose Workspace
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white transition-colors shadow-xs"
            >
              Open Compare Workspace
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

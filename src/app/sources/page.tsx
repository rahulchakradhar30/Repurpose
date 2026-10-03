import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Database, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft,
  Clock,
  Layers,
  Info,
  Lock,
  FileCheck
} from 'lucide-react';
import { generateBreadcrumbJsonLd, generateArticleJsonLd, getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Data Sources & Licence Registry | Repurpose',
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
    name: 'openFDA Drug Labeling API',
    institution: 'U.S. Food and Drug Administration (FDA)',
    purpose: 'Structured product labels (SPL), established FDA-approved indications, black-box warnings, contraindications, and pharmacology.',
    accessMethod: 'REST JSON API (api.fda.gov/drug/label.json)',
    license: 'CC0 1.0 Universal / openFDA Terms of Service',
    refreshFrequency: 'On-demand live API query',
    lastUpdate: 'Real-time (Active)',
    status: 'Enabled',
    knownLimitations: 'Label extraction reflects manufacturer submissions; unformatted text sections can occasionally vary in terminology between drug manufacturers.',
    termsUrl: 'https://open.fda.gov/terms/',
  },
  {
    name: 'PubChem PUG-REST API',
    institution: 'National Center for Biotechnology Information (NCBI / NIH)',
    purpose: 'Chemical compound structures, PubChem CID, 2D/3D representations, canonical SMILES, molecular properties, and protein target interactions.',
    accessMethod: 'REST API (pubchem.ncbi.nlm.nih.gov/rest/pug)',
    license: 'Public Domain (NIH Data Sharing Policy)',
    refreshFrequency: 'On-demand live API query',
    lastUpdate: 'Real-time (Active)',
    status: 'Enabled',
    knownLimitations: 'Target interactions represent aggregated bioassay records requiring clinical contextualization.',
    termsUrl: 'https://pubchem.ncbi.nlm.nih.gov/docs/privacy-policy-and-disclaimers',
  },
  {
    name: 'ClinicalTrials.gov API v2',
    institution: 'National Library of Medicine (NLM / NIH)',
    purpose: 'Interventional clinical studies, NCT identifiers, trial phase, enrollment numbers, completion dates, and study statuses (recruiting, completed, terminated).',
    accessMethod: 'REST JSON API v2 (clinicaltrials.gov/api/v2/studies)',
    license: 'Public Domain (U.S. Government Work)',
    refreshFrequency: 'On-demand live API query with disease normalization deduplication',
    lastUpdate: 'Real-time (Active)',
    status: 'Enabled',
    knownLimitations: 'Trial registration confirms study initiation and intent, not study completion or positive clinical outcomes.',
    termsUrl: 'https://clinicaltrials.gov/data-api/terms',
  },
  {
    name: 'NCBI PubMed Entrez E-Utilities',
    institution: 'National Library of Medicine (NLM / NIH)',
    purpose: 'Peer-reviewed human clinical outcomes, randomized trial results, observational studies, and preclinical mechanistic literature.',
    accessMethod: 'E-Utilities XML/JSON API (eutils.ncbi.nlm.nih.gov)',
    license: 'Public Domain / Open Access Literature Policy',
    refreshFrequency: 'On-demand live API query',
    lastUpdate: 'Real-time (Active)',
    status: 'Enabled',
    knownLimitations: 'Publication abstracts provide outcome summaries; full-text articles may be subject to individual publisher journal subscriptions.',
    termsUrl: 'https://www.ncbi.nlm.nih.gov/home/about/policies/',
  },
  {
    name: 'Broad Institute Repurposing Hub',
    institution: 'Broad Institute of MIT and Harvard',
    purpose: 'Curated compound library annotations for repurposing.',
    accessMethod: 'None (Scraping prohibited by policy)',
    license: 'Academic / Specific Terms of Use',
    refreshFrequency: 'Awaiting lawful direct API access',
    lastUpdate: 'Not configured',
    status: 'Awaiting lawful integration',
    knownLimitations: 'Repurpose strictly avoids scraping third-party databases. Integration will only be activated under documented institutional agreements.',
    termsUrl: 'https://clue.io/repurposing',
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

      <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center text-xs text-slate-400 gap-2">
              <li><Link href="/" className="hover:text-slate-200 transition-colors">Home</Link></li>
              <li>/</li>
              <li className="text-slate-200 font-semibold">Data Source & Licence Registry</li>
            </ol>
          </nav>

          {/* Page Heading Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" />
              <span>Transparent Registry Governance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
              Data Source & Licence Registry
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl">
              Repurpose is positioned as an open-source evidence workspace for investigating drug-repurposing hypotheses through transparent clinical, biological, regulatory, safety, and literature evidence.
            </p>
          </div>

          {/* Permitted Source Strategy Banner */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <div className="font-bold text-slate-100">Strict Permitted Source Strategy & Legal Compliance</div>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-xs">
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
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Integrated Biomedical Sources & Boundary Status
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {SOURCE_REGISTRY.filter(s => s.status === 'Enabled').length} active sources
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="p-4 font-semibold">Source & Institution</th>
                    <th className="p-4 font-semibold">Purpose in Repurpose</th>
                    <th className="p-4 font-semibold">Access & Licence</th>
                    <th className="p-4 font-semibold">Status & Refresh</th>
                    <th className="p-4 font-semibold">Known Limitations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {SOURCE_REGISTRY.map((src) => {
                    const statusBadge = {
                      'Enabled': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                      'Awaiting lawful integration': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                      'Unavailable': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                      'Source not configured': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
                    }[src.status];

                    return (
                      <tr key={src.name} className="hover:bg-slate-900/40">
                        <td className="p-4 align-top space-y-1 min-w-[200px]">
                          <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm">
                            <span>{src.name}</span>
                            <a
                              href={src.termsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-500 hover:text-indigo-400 transition-colors"
                              title="Inspect license terms"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <div className="text-[11px] text-slate-400">{src.institution}</div>
                        </td>

                        <td className="p-4 align-top text-slate-300 min-w-[240px] leading-relaxed">
                          {src.purpose}
                        </td>

                        <td className="p-4 align-top space-y-1 min-w-[200px] font-mono text-[11px]">
                          <div className="text-slate-300">{src.accessMethod}</div>
                          <div className="text-indigo-400">{src.license}</div>
                        </td>

                        <td className="p-4 align-top space-y-1.5 min-w-[170px]">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadge}`}>
                            {src.status}
                          </span>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {src.refreshFrequency}
                          </div>
                        </td>

                        <td className="p-4 align-top text-slate-400 min-w-[220px] text-[11px] leading-relaxed">
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
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              API Resilience & Fallback Controls
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When a government biomedical API experiences transient downtime, rate limits, or scheduled maintenance, Repurpose handles requests with error isolation. The platform displays an explicit status notification rather than manufacturing synthetic records or guessing unverified clinical outcomes.
            </p>
          </div>

          {/* Bottom Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-800 gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Repurpose Workspace
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Open Compare Workspace
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

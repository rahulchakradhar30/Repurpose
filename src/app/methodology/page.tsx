import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  getAbsoluteUrl, 
  generateArticleJsonLd, 
  generateBreadcrumbJsonLd 
} from '@/lib/seo';
import { 
  Compass, 
  ShieldAlert, 
  Calendar, 
  AlertTriangle, 
  Activity, 
  BookOpen, 
  Microscope, 
  Layers
} from 'lucide-react';

const PAGE_TITLE = 'Repurpose Compass™ & Research Readiness Scoring Methodology';
const PAGE_DESCRIPTION =
  'Transparent, deterministic 100-point Research Readiness Score breakdown, 8 research states, contradiction detection, and provenance tracking for drug repurposing hypotheses.';
const PAGE_PATH = '/methodology';
const DATE_PUBLISHED = '2026-10-02';
const DATE_MODIFIED = '2026-10-03';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: getAbsoluteUrl(PAGE_PATH),
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default function MethodologyPage() {
  const articleJsonLd = generateArticleJsonLd({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    path: PAGE_PATH,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
  });

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Methodology', path: PAGE_PATH },
  ]);

  return (
    <div className="flex-1 flex flex-col pb-16 md:pb-6 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-teal-800 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Methodology</span>
        </nav>

        {/* Page Header */}
        <header className="border-b border-slate-200 pb-6 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200">
            <Compass className="w-3.5 h-3.5" />
            <span>Repurpose Compass™ Architecture</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight font-heading">
            Research Readiness Scoring &amp; Repurpose Compass™ Methodology
          </h1>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
            Repurpose is positioned as an open-source evidence workspace for investigating drug-repurposing hypotheses through transparent clinical, biological, regulatory, safety, and literature evidence.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Specification Updated: October 3, 2026</span>
            </span>
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-teal-700" />
              <span>System: Repurpose Compass v2</span>
            </span>
          </div>
        </header>

        {/* Fundamental Safeguards Alert */}
        <section aria-label="Research Scope Safeguards">
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 sm:p-6 flex items-start gap-3.5">
            <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs sm:text-sm text-amber-950">
              <h2 className="font-bold text-amber-950 text-sm sm:text-base">
                Core Positioning &amp; Scoring Safeguards
              </h2>
              <p className="leading-relaxed">
                The <strong>Research Readiness Score</strong> measures the clinical maturity, literature documentation, biological plausibility, and source reproducibility of an investigational repurposing hypothesis. It is <strong>NOT</strong> an efficacy score, clinical approval probability, safety rating, or prescribing recommendation.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-amber-900 pt-1">
                <li>A candidate with 0 published citations is permanently capped at max 55/100 and will never be labeled &quot;High readiness&quot;.</li>
                <li>Trial existence is strictly separated from published outcome evidence. Registered interventional trials without peer-reviewed results receive transparent disclosure.</li>
                <li>Prematurely terminated, withdrawn, or suspended trials trigger immediate visual warnings and deduct readiness points.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 1. THE 8 RESEARCH STATES */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-700" />
            The 8 Standardized Research States
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Every candidate condition pair is mapped to exactly one of eight distinct states:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="font-bold text-emerald-800">1. Approved indication</span>
              <p className="text-slate-600">Formally authorized on official regulatory drug label for this therapeutic condition.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="font-bold text-blue-800">2. Off-label evidence</span>
              <p className="text-slate-600">Documented in peer-reviewed observational or clinical literature outside authorized label indications.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="font-bold text-teal-800">3. Investigational</span>
              <p className="text-slate-600">Registered in active or completed interventional clinical trials on ClinicalTrials.gov.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="font-bold text-purple-800">4. Preclinical</span>
              <p className="text-slate-600">In vitro, in vivo, or target binding pathway mechanisms documented without registered human trials.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="font-bold text-amber-800">5. Insufficient evidence</span>
              <p className="text-slate-600">Minimal or preliminary signals; lacks verified human trials or replicated literature.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="font-bold text-rose-800">6. Conflicting evidence</span>
              <p className="text-slate-600">Mixed, inconclusive, or opposing outcomes identified across trials and literature.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="font-bold text-red-800">7. Trial terminated, withdrawn, or suspended</span>
              <p className="text-slate-600">Clinical evaluation was discontinued, halted early, or withdrawn prior to enrollment.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="font-bold text-slate-700">8. No verified evidence found</span>
              <p className="text-slate-600">No interventional trials or peer-reviewed records verified in primary databases.</p>
            </div>
          </div>
        </section>

        {/* 2. THE 100-POINT RESEARCH READINESS BREAKDOWN */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-700" />
            The 100-Point Transparent Readiness Score Breakdown
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Scores are deterministically calculated across five positive pillars plus negative evidence-conflict penalties:
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-700" />
                  Clinical-Trial Maturity and Status (0 – 25 Points)
                </span>
                <span className="font-mono font-bold text-teal-800">Max 25 pts</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Phase 4: 25 pts | Phase 3: 20–24 pts | Phase 2: 14–18 pts | Phase 1: 8–10 pts | Early Phase 1: 4–6 pts. Terminated/withdrawn trials capped at max 4 pts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-700" />
                  Published Human Evidence (0 – 25 Points)
                </span>
                <span className="font-mono font-bold text-blue-800">Max 25 pts</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                4+ PubMed citations: 25 pts | 3 citations: 20 pts | 2 citations: 14 pts | 1 citation: 8 pts | 0 citations: 0 pts (triggers automatic score cap).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-purple-700" />
                  Mechanistic / Target–Disease Plausibility (0 – 20 Points)
                </span>
                <span className="font-mono font-bold text-purple-800">Max 20 pts</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Direct receptor/enzyme target alignment: 20 pts | Secondary pathway rationale: 14 pts | Broad/hypothesized mechanism: 8 pts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  Source Quality, Recency &amp; Reproducibility (0 – 15 Points)
                </span>
                <span className="font-mono font-bold text-emerald-800">Max 15 pts</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Multi-source corroboration across FDA, ClinicalTrials.gov, PubMed, and RxNorm: 15 pts | Partial registry coverage: 10 pts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Safety / Context Compatibility (0 – 15 Points)
                </span>
                <span className="font-mono font-bold text-amber-800">Max 15 pts</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                No acute target-tissue contraindications: 15 pts | General precautions documented: 10 pts | Severe organ toxicity: 5 pts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-950 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  Evidence-Conflict Penalties (Subtracted)
                </span>
                <span className="font-mono font-bold text-rose-800">Deductions</span>
              </div>
              <p className="text-rose-900 text-[11px] leading-relaxed">
                All trials terminated/withdrawn: -15 pts | FDA label absolute contraindication: -12 pts | Late-phase trials without outcome papers: -4 pts.
              </p>
            </div>
          </div>
        </section>

        {/* 3. CONTRADICTION DETECTION */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Evidence Contradiction Detection: &quot;What Needs Verification?&quot;
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            The Repurpose Compass continuously cross-references clinical trial registries against PubMed publications and FDA labels to detect 7 specific evidence discrepancies:
          </p>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <ul className="space-y-2 text-xs text-slate-700 pl-4 list-disc leading-relaxed">
              <li><strong>Trial exists but no published outcome:</strong> Clinical trial activity identified, but peer-reviewed findings have not yet been indexed in PubMed.</li>
              <li><strong>High trial phase but unconfirmed result:</strong> Phase 2 or Phase 3 trial registered without published corroboration.</li>
              <li><strong>PubMed findings conflict with trial status:</strong> Literature indicates clinical promise while all interventional trials were terminated or withdrawn.</li>
              <li><strong>Disease normalization overlap:</strong> Candidate appears across multiple ontology synonyms.</li>
              <li><strong>Safety warnings or contraindications:</strong> Boxed warnings or renal/hepatic contraindications may conflict with candidate disease pathology.</li>
              <li><strong>Source data recency or incompleteness:</strong> Records lack recent verification timestamps or required identifiers.</li>
              <li><strong>Uncharacterized biological mechanism:</strong> Empirical activity observed without characterized molecular receptor targets.</li>
            </ul>
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200 gap-4">
          <Link
            href="/sources"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-teal-800 transition-colors"
          >
            <Layers className="w-4 h-4" />
            View Data Source &amp; Licence Registry
          </Link>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white transition-colors shadow-xs"
          >
            Launch Compare Workspace
          </Link>
        </div>
      </main>
    </div>
  );
}

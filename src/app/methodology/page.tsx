import type { Metadata } from 'next';
import Link from 'next/link';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { Header } from '@/components/Header';
import { 
  getAbsoluteUrl, 
  generateArticleJsonLd, 
  generateBreadcrumbJsonLd, 
  CREATOR_ATTRIBUTION 
} from '@/lib/seo';
import { 
  Scale, 
  ShieldAlert, 
  Calendar, 
  User, 
  Cpu, 
  ArrowRight 
} from 'lucide-react';

const PAGE_TITLE = 'Evidence Scoring Methodology & Uncertainty Framework';
const PAGE_DESCRIPTION =
  'Transparent, deterministic 100-point biomedical evidence scoring methodology for evaluating drug repurposing candidates across clinical trials, literature, mechanism, and safety.';
const PAGE_PATH = '/methodology';
const DATE_PUBLISHED = '2026-10-02';
const DATE_MODIFIED = '2026-10-02';

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
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-16 md:pb-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <DisclaimerBanner />
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-teal-800">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Methodology</span>
        </nav>

        {/* Page Header */}
        <header className="border-b border-slate-200 pb-6 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200">
            <Scale className="w-3.5 h-3.5" />
            <span>Deterministic Scoring Algorithm</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Evidence Scoring Methodology & Evaluation Principles
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            How Repurpose quantitatively and transparently grades repurposing candidates out of 100 points, detects clinical trials attrition, accounts for FDA boxed warnings, and enforces uncertainty handling.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>Prepared by {CREATOR_ATTRIBUTION.name}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Last reviewed: {DATE_MODIFIED}</span>
            </span>
          </div>
        </header>

        {/* Clinical Disclaimer Notice */}
        <section aria-label="Methodological Notice" className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-950 space-y-1">
              <h2 className="font-bold text-amber-900">Score Interpretation Notice</h2>
              <p className="leading-relaxed">
                The Repurpose Evidence Score is a measure of <strong>evidence maturity, trial registration, and literature volume</strong>. 
                A high score does NOT signify that an off-label drug is safe, recommended, or clinically effective. 
                Candidates with high scores may still fail late-stage Phase 3 confirmatory trials.
              </p>
            </div>
          </div>
        </section>

        {/* The 5 Pillars of Evidence Scoring */}
        <section aria-labelledby="five-pillars-heading" className="space-y-4">
          <h2 id="five-pillars-heading" className="text-lg sm:text-xl font-bold text-slate-900">
            The 5 Pillars of the 100-Point Evidence Model
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Every candidate condition identified in registered biomedical trials is evaluated across five distinct evidentiary dimensions:
          </p>

          <div className="space-y-4">
            {/* Pillar 1 */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-base">
                  1. Clinical Trial Evidence (0 – 40 Points)
                </h3>
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Weight: 40%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
                Scored directly from interventional study protocols verified in the ClinicalTrials.gov API v2.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                <li><strong>Phase 4 Completed:</strong> 40 points (post-marketing randomized surveillance). Active: 36 points.</li>
                <li><strong>Phase 3 Completed:</strong> 35 points (large-scale randomized confirmatory). Active / Recruiting: 28–32 points.</li>
                <li><strong>Phase 2 Completed:</strong> 26 points (preliminary efficacy & dose finding). Active: 18–22 points.</li>
                <li><strong>Phase 1:</strong> 10–14 points (safety and pharmacokinetics only).</li>
                <li><strong>Early Phase 1 / Pilot:</strong> 6–8 points.</li>
                <li>
                  <strong className="text-red-700">Premature Termination Penalty:</strong> If all identified clinical trials were terminated, withdrawn, or suspended, the score is capped at 4 points with an explicit &ldquo;Trial stopped&rdquo; caution flag.
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-base">
                  2. Human / Observational Evidence (0 – 20 Points)
                </h3>
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Weight: 20%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
                Evaluates peer-reviewed observational studies, real-world cohort data, and case series indexed in NCBI PubMed.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                <li><strong>4+ Indexed PubMed Citations:</strong> 20 points (robust literature footprint).</li>
                <li><strong>3 Indexed Citations:</strong> 16 points.</li>
                <li><strong>2 Indexed Citations:</strong> 12 points.</li>
                <li><strong>1 Indexed Citation:</strong> 7 points (single report limitation flag).</li>
                <li><strong>0 Indexed Citations:</strong> 0 points with &ldquo;Human evidence unavailable&rdquo; uncertainty badge.</li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-base">
                  3. Mechanistic & Target Plausibility (0 – 20 Points)
                </h3>
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Weight: 20%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
                Grades biochemical target interaction, receptor binding profile, and documented biological rationale linking drug pharmacology to disease pathophysiology.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                <li><strong>Well-Characterized Pathway Engagement:</strong> 20 points (documented primary receptor or enzyme target aligned with disease mechanism).</li>
                <li><strong>Secondary / Hypothesized Pathway:</strong> 14 points (biological rationale documented).</li>
                <li><strong>Uncharacterized / Inferred:</strong> 5 points with uncertainty badge.</li>
              </ul>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-base">
                  4. Reproducibility & Publication Signals (0 – 10 Points)
                </h3>
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Weight: 10%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
                Assesses whether findings have been replicated by independent organizations or remain isolated to a single institution.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                <li><strong>Multiple Independent Study Sponsors (2+ distinct organizations):</strong> 10 points.</li>
                <li><strong>Single Organization / Single Academic Group:</strong> 6 points.</li>
                <li><strong>No Cross-Institutional Replication:</strong> 2 points with flag.</li>
              </ul>
            </div>

            {/* Pillar 5 */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-base">
                  5. Safety & Contraindication Compatibility (0 – 10 Points)
                </h3>
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Weight: 10%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">
                Cross-checked against official FDA structured product labeling (boxed warnings and contraindications).
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                <li><strong>Compatible Profile:</strong> 10 points (no overlap with target disease pathology).</li>
                <li><strong>Precautionary Warning Overlap:</strong> 5 points (specific monitoring required).</li>
                <li>
                  <strong className="text-red-700">Direct Contraindication Collision:</strong> Reduced to 1 point with high-risk alert (e.g., drug explicitly contraindicated in renal failure being explored in kidney disease).
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* AI Bounds: AI Never Replaces Evidence */}
        <section aria-labelledby="ai-principles-heading" className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-800" />
            <h2 id="ai-principles-heading" className="text-lg font-bold text-slate-900">
              Deterministic Evidence Principle: AI Never Replaces Evidence
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            In many medical applications, large language models are allowed to generate unbounded answers, which risks severe factual hallucination. In Repurpose:
          </p>
          <ul className="text-xs sm:text-sm text-slate-700 pl-4 list-disc space-y-1.5">
            <li>Scoring, trials retrieval, and PubMed citations are <strong>100% deterministic</strong>. No generative model calculates scores or invents studies.</li>
            <li>Groq AI is invoked only on factual payloads and is strictly schema-validated. Any response containing unverified facts or clinical advice is discarded.</li>
            <li>Every AI synthesis is visibly labeled &ldquo;AI-assisted summary&rdquo; and lists direct supporting source IDs.</li>
          </ul>
        </section>

        {/* Update Timestamps */}
        <section aria-labelledby="timestamps-heading" className="bg-white border border-slate-200 rounded-lg p-6 space-y-2 text-xs sm:text-sm text-slate-700 shadow-xs">
          <h2 id="timestamps-heading" className="text-base font-bold text-slate-900">
            Freshness & Timestamp Verification
          </h2>
          <p className="leading-relaxed">
            Every query and published guide displays its exact retrieval date. Because biomedical research rapidly evolves as new trial results are published on ClinicalTrials.gov, users can inspect the original source URLs on every drug card.
          </p>
        </section>

        {/* Navigation Call-to-Action */}
        <div className="bg-slate-100 rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Learn About Our Data Sources</h3>
            <p className="text-xs text-slate-600">
              Review the public biomedical registries powering Repurpose.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/sources"
              className="px-3.5 py-2 bg-white text-slate-800 text-xs font-semibold rounded border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Data Sources
            </Link>
            <Link
              href="/"
              className="px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <span>Search Database</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

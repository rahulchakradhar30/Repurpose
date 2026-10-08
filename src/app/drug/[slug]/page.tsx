import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ShieldAlert,
  ExternalLink,
  BookOpen,
  FlaskConical,
  CheckCircle2,
  Calendar,
  AlertOctagon,
  Database,
} from 'lucide-react';
import {
  getPublishedDrugBySlug,
  getPublishedDrugSlugs,
  isDrugPublishable,
} from '@/lib/publishedDrugs';
import {
  getCanonicalUrl,
  generateBreadcrumbJsonLd,
  generateDrugPageJsonLd,
} from '@/lib/seo';
import { CopyPageLinkButton } from '@/components/CopyPageLinkButton';
import { CompareDrugButton } from '@/components/CompareDrugButton';
import { SaveToNotebookButton } from '@/components/SaveToNotebookButton';
import { PrintSummaryButton } from '@/components/PrintSummaryButton';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getPublishedDrugSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getPublishedDrugBySlug(slug);

  if (!guide || !isDrugPublishable(guide)) {
    return {
      title: 'Drug Dossier Not Found | Repurpose',
      description: 'The requested drug record is not published or verified for public indexing.',
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const { drug } = guide;
  const canonicalUrl = getCanonicalUrl(`/drug/${guide.slug}`);

  return {
    title: `${drug.genericName} Repurposing & Clinical Evidence Dossier`,
    description: `Evidence-based drug repurposing research for ${drug.genericName}. Verified clinical trials, pharmacology rationale, approved indications, and biomedical source links.`,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: `${drug.genericName} Repurposing Dossier | Repurpose`,
      description: `Investigational indications, clinical trial records, and biological rationale for ${drug.genericName}.`,
      url: canonicalUrl,
      type: 'article',
    },
  };
}

export default async function DrugPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getPublishedDrugBySlug(slug);

  if (!guide || !isDrugPublishable(guide)) {
    notFound();
  }

  const { drug, candidates } = guide;

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Verified Drugs', url: '/' },
    { name: drug.genericName, url: `/drug/${guide.slug}` },
  ]);

  const drugPageJsonLd = generateDrugPageJsonLd(guide);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(drugPageJsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 flex-1 w-full text-slate-900">
        {/* Navigation Breadcrumb & Copy Link */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center text-xs text-slate-500 gap-2">
              <li><Link href="/" className="hover:text-teal-800 transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link href="/" className="hover:text-teal-800 transition-colors">Verified Drugs</Link></li>
              <li>/</li>
              <li className="text-slate-800 font-semibold">{drug.genericName}</li>
            </ol>
          </nav>
          <div className="flex items-center gap-2 flex-wrap">
            <CompareDrugButton drug={drug} candidates={guide.candidates} />
            <SaveToNotebookButton drug={drug} candidate={guide.candidates[0]} showViewLink={true} />
            <PrintSummaryButton label="Print Summary" />
            <CopyPageLinkButton label="Copy dossier link" />
          </div>
        </div>

        {/* Drug Header Dossier Card */}
        <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 shadow-xs mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Biomedical Record
              </span>
              <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                RxCUI: {drug.rxNormId}
              </span>
              {drug.pubchemCid && (
                <span className="text-xs font-mono text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  PubChem CID: {drug.pubchemCid}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Last Verified: {drug.lastVerifiedDate}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 font-heading">
            {drug.genericName}
          </h1>

          {drug.brandNames && drug.brandNames.length > 0 && (
            <p className="text-xs sm:text-sm text-slate-600 mb-4 font-mono">
              Common Brand Synonyms: {drug.brandNames.join(', ')}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Pharmacological Class
              </div>
              <div className="text-sm font-medium text-slate-900">
                {drug.drugClass || 'Small Molecule Pharmaceutical'}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Primary Mechanism of Action
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {drug.mechanismOfAction}
              </p>
            </div>
          </div>
        </div>

        {/* Research Disclaimer */}
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50 border-2 border-amber-300 mb-8 text-amber-950">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              <strong className="text-amber-950">Research &amp; Educational Reference Only: </strong>
              This profile summarizes peer-reviewed preclinical findings and registered clinical trials. It does not constitute medical advice or off-label prescribing recommendations. Therapeutic decisions require consultation with a licensed medical professional.
            </div>
          </div>
        </div>

        {/* Educational Overview & Repurposing Context */}
        <section className="mb-10 space-y-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-700" />
              Repurposing Rationale &amp; Scientific Context
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {guide.educationalOverview}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {guide.repurposingBackground}
            </p>
          </div>

          {/* Evidence Limitations Banner */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Evidence Boundaries &amp; Scientific Limitations
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {guide.evidenceLimitationsSummary}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Approved Indications vs Safety Warnings */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Established Regulatory Indications (FDA / DailyMed)
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 list-disc pl-5">
              {guide.approvedIndications.map((ind, i) => (
                <li key={i}>{ind}</li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-rose-900 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-700" />
              Safety Warnings &amp; Contraindications
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              {drug.warnings && drug.warnings.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <span className="font-semibold text-rose-950 text-xs uppercase tracking-wider block mb-1">Boxed Warnings:</span>
                  <ul className="list-disc pl-5 space-y-1 text-rose-900">
                    {drug.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {drug.contraindications && drug.contraindications.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="font-semibold text-amber-950 text-xs uppercase tracking-wider block mb-1">Contraindications:</span>
                  <ul className="list-disc pl-5 space-y-1 text-amber-900">
                    {drug.contraindications.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sourced Repurposing Candidates */}
        <section className="mb-12">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 tracking-wide font-mono mb-2">
              <FlaskConical className="w-3.5 h-3.5 text-teal-700" />
              <span>Investigational Candidates &amp; Active Evidence</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
              Investigational Repurposing Indications
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Each condition below has been evaluated in peer-reviewed clinical studies or interventional clinical trial protocols.
            </p>
          </div>

          <div className="space-y-6">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
                      {cand.condition}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full font-mono bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                        {cand.highestPhase}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        Status: {cand.status}
                      </span>
                      <span className="text-slate-500">
                        {cand.sourceCount} verified source references
                      </span>
                    </div>
                  </div>

                  {cand.evidenceScore && (
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono text-teal-800">
                        {cand.evidenceScore.totalScore}
                        <span className="text-xs text-slate-500 font-sans"> / 100</span>
                      </div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                        Evidence Confidence Score
                      </div>
                    </div>
                  )}
                </div>

                {/* Biological Rationale */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Off-Target Biological Rationale:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {cand.biologicalRationale}
                  </p>
                </div>

                {/* Clinical Trials Table */}
                {cand.clinicalTrials && cand.clinicalTrials.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Registered Clinical Trials (ClinicalTrials.gov):
                    </h4>
                    <div className="space-y-2">
                      {cand.clinicalTrials.map((trial) => (
                        <div
                          key={trial.nctId}
                          className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-semibold text-slate-900">
                              {trial.title}
                            </div>
                            <div className="text-slate-600 flex flex-wrap gap-2 mt-0.5 font-mono text-[11px]">
                              <span className="text-teal-800 font-semibold">{trial.nctId}</span>
                              <span>•</span>
                              <span>{trial.phase}</span>
                              <span>•</span>
                              <span>Status: {trial.status}</span>
                              {trial.completionDate && (
                                <>
                                  <span>•</span>
                                  <span>Completed: {trial.completionDate}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <a
                            href={trial.studyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-teal-800 hover:text-teal-900 text-xs shrink-0 font-medium bg-white px-2.5 py-1 rounded border border-slate-300 shadow-2xs"
                          >
                            <span>View Registry Record</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Citations List */}
                {cand.citations && cand.citations.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Peer-Reviewed Literature Citations (PubMed):
                    </h4>
                    <div className="space-y-2">
                      {cand.citations.map((cite) => (
                        <div
                          key={cite.pmid}
                          className="text-xs text-slate-700 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 p-2 rounded bg-slate-50 border border-slate-200"
                        >
                          <div>
                            <span className="font-medium text-slate-900">&ldquo;{cite.title}&rdquo;</span>
                            <span className="text-slate-500 ml-1">
                              — {cite.authors?.join(', ')} ({cite.journal}, {cite.pubDate})
                            </span>
                          </div>
                          <a
                            href={cite.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-teal-800 hover:text-teal-900 shrink-0 font-mono text-[11px] font-semibold"
                          >
                            PMID:{cite.pmid}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Transparent Sourced Data and Registries Section */}
        <section className="mb-12 p-6 sm:p-8 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <Database className="w-4 h-4 text-teal-700" />
            <span>Primary Source Audit Trail</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-3 font-heading">
            Sources &amp; Verified Evidence Registries
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            The data in this dossier was collected directly through official open APIs maintained by the U.S. National Library of Medicine, the Food and Drug Administration, and the National Institutes of Health. Direct outbound links to primary records:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {drug.sources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500 transition-all group flex items-start justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors flex items-center gap-1.5">
                    {source.name}
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {source.responseId ? `Identifier: ${source.responseId}` : 'Biomedical Record Query'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-2">
                    Verified: {source.timestamp?.split('T')[0] || drug.lastVerifiedDate}
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  {source.status === 'ok' ? 'Verified' : 'Cached'}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Methodology & Educational Context Cross-Links */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 font-mono">Curious about scoring?</div>
            <div className="text-sm font-bold text-slate-900">Understand how Repurpose grades repurposing evidence</div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/methodology"
              className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 hover:bg-slate-200 transition-colors shadow-2xs"
            >
              Methodology
            </Link>
            <Link
              href="/what-is-drug-repurposing"
              className="px-4 py-2 rounded-lg bg-teal-700 text-xs sm:text-sm font-medium text-white hover:bg-teal-800 transition-colors shadow-xs"
            >
              Educational Guide
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

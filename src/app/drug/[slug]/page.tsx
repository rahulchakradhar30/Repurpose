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
    title: `${drug.genericName} Repurposing & Clinical Evidence Dossier | Repurpose`,
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
      title: `${drug.genericName} Repurposing & Clinical Trials Research | Repurpose`,
      description: `Investigate off-target biology, active trials, and evidence scoring for ${drug.genericName}. Research-use reference tool.`,
      url: canonicalUrl,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${drug.genericName} Repurposing Dossier | Repurpose`,
      description: `Verified biomedical evidence and clinical trial data for ${drug.genericName}.`,
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
    { name: 'Drugs', url: '/' },
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

      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Navigation Breadcrumb & Copy Link */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center text-xs text-slate-500 gap-2">
              <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link href="/" className="hover:text-cyan-400 transition-colors">Verified Drugs</Link></li>
              <li>/</li>
              <li className="text-slate-300 font-medium">{drug.genericName}</li>
            </ol>
          </nav>
          <CopyPageLinkButton label="Copy dossier link" />
        </div>

        {/* Drug Header Dossier Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Biomedical Record
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
                RxCUI: {drug.rxNormId}
              </span>
              {drug.pubchemCid && (
                <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
                  PubChem CID: {drug.pubchemCid}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Last Verified: {drug.lastVerifiedDate}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {drug.genericName}
          </h1>

          {drug.brandNames && drug.brandNames.length > 0 && (
            <p className="text-xs sm:text-sm text-slate-400 mb-4 font-mono">
              Common Brand Synonyms: {drug.brandNames.join(', ')}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Pharmacological Class
              </div>
              <div className="text-sm font-medium text-slate-200">
                {drug.drugClass || 'Small Molecule Pharmaceutical'}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Primary Mechanism of Action
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {drug.mechanismOfAction}
              </p>
            </div>
          </div>
        </div>

        {/* Research Disclaimer */}
        <div className="p-4 sm:p-5 rounded-xl bg-amber-950/20 border border-amber-800/40 mb-8">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-amber-200">Research & Educational Reference Only: </strong>
              This profile summarizes peer-reviewed preclinical findings and registered clinical trials. It does not constitute medical advice or off-label prescribing recommendations. Therapeutic decisions require consultation with a licensed medical professional.
            </div>
          </div>
        </div>

        {/* Educational Overview & Repurposing Context */}
        <section className="mb-10 space-y-6">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Repurposing Rationale & Scientific Context
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {guide.educationalOverview}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {guide.repurposingBackground}
            </p>
          </div>

          {/* Evidence Limitations Banner */}
          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-1">
                  Evidence Boundaries & Scientific Limitations
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {guide.evidenceLimitationsSummary}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Approved Indications vs Safety Warnings */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Established Regulatory Indications (FDA / DailyMed)
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300 list-disc pl-5">
              {guide.approvedIndications.map((ind, i) => (
                <li key={i}>{ind}</li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-base font-bold text-rose-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Safety Warnings & Contraindications
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              {drug.warnings && drug.warnings.length > 0 && (
                <div>
                  <span className="font-semibold text-rose-200 text-xs uppercase tracking-wider block mb-1">Boxed Warnings:</span>
                  <ul className="list-disc pl-5 space-y-1">
                    {drug.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {drug.contraindications && drug.contraindications.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block mb-1">Contraindications:</span>
                  <ul className="list-disc pl-5 space-y-1">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2">
              <FlaskConical className="w-3.5 h-3.5" />
              Investigational Candidates & Active Evidence
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Investigational Repurposing Indications
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Each condition below has been evaluated in peer-reviewed clinical studies or interventional clinical trial protocols.
            </p>
          </div>

          <div className="space-y-6">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight mb-1">
                      {cand.condition}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                        {cand.highestPhase}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        Status: {cand.status}
                      </span>
                      <span className="text-slate-400">
                        {cand.sourceCount} verified source references
                      </span>
                    </div>
                  </div>

                  {cand.evidenceScore && (
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono text-cyan-400">
                        {cand.evidenceScore.totalScore}
                        <span className="text-xs text-slate-500 font-sans"> / 100</span>
                      </div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        Evidence Confidence Score
                      </div>
                    </div>
                  )}
                </div>

                {/* Biological Rationale */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Off-Target Biological Rationale:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {cand.biologicalRationale}
                  </p>
                </div>

                {/* Clinical Trials Table */}
                {cand.clinicalTrials && cand.clinicalTrials.length > 0 && (
                  <div className="mb-4 pt-3 border-t border-slate-800/60">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Registered Clinical Trials (ClinicalTrials.gov):
                    </h4>
                    <div className="space-y-2">
                      {cand.clinicalTrials.map((trial) => (
                        <div
                          key={trial.nctId}
                          className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-semibold text-slate-200">
                              {trial.title}
                            </div>
                            <div className="text-slate-400 flex flex-wrap gap-2 mt-0.5">
                              <span className="font-mono text-cyan-400">{trial.nctId}</span>
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
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs shrink-0 font-medium"
                          >
                            View Registry Record
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Citations List */}
                {cand.citations && cand.citations.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/60">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Peer-Reviewed Literature Citations (PubMed):
                    </h4>
                    <div className="space-y-2">
                      {cand.citations.map((cite) => (
                        <div
                          key={cite.pmid}
                          className="text-xs text-slate-300 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2"
                        >
                          <div>
                            <span className="font-medium text-slate-200">&ldquo;{cite.title}&rdquo;</span>
                            <span className="text-slate-400 ml-1">
                              — {cite.authors?.join(', ')} ({cite.journal}, {cite.pubDate})
                            </span>
                          </div>
                          <a
                            href={cite.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 shrink-0 font-mono text-[11px]"
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
        <section className="mb-12 p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2">
            <Database className="w-4 h-4" />
            Primary Source Audit Trail
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
            Sources & Verified Evidence Registries
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            The data in this dossier was collected directly through official open APIs maintained by the U.S. National Library of Medicine, the Food and Drug Administration, and the National Institutes of Health. Direct outbound links to primary records:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {drug.sources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-700/60 transition-all group flex items-start justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                    {source.name}
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {source.responseId ? `Identifier: ${source.responseId}` : 'Biomedical Record Query'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-2">
                    Verified: {source.timestamp?.split('T')[0] || drug.lastVerifiedDate}
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  {source.status === 'ok' ? 'Verified' : 'Cached'}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Methodology & Educational Context Cross-Links */}
        <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 font-mono">Curious about scoring?</div>
            <div className="text-sm font-bold text-white">Understand how Repurpose grades repurposing evidence</div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/methodology"
              className="px-4 py-2 rounded-lg bg-slate-800 text-xs sm:text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Methodology
            </Link>
            <Link
              href="/what-is-drug-repurposing"
              className="px-4 py-2 rounded-lg bg-cyan-600 text-xs sm:text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
            >
              Educational Guide
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

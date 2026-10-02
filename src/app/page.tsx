'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { Header } from '@/components/Header';
import { SearchSection } from '@/components/SearchSection';
import { DrugOverview } from '@/components/DrugOverview';
import { RepurposingList } from '@/components/RepurposingList';
import { EvidenceDetailModal } from '@/components/EvidenceDetailModal';
import { PWARegister } from '@/components/PWARegister';
import { 
  DrugResearchSnapshot, 
  RepurposingCandidate 
} from '@/types';
import { AlertCircle, Loader2, ArrowRight, BookOpen, FlaskConical } from 'lucide-react';
import { generateHomeJsonLd } from '@/lib/seo';

const FEATURED_DRUG_GUIDES = [
  {
    slug: 'metformin',
    name: 'Metformin',
    class: 'Biguanide / AMPK Activator',
    approvedFor: 'Type 2 Diabetes Mellitus',
    repurposingTarget: 'Polycystic Ovary Syndrome (PCOS) & Oncology Chemoprevention',
    highestPhase: 'Phase 3 Trials',
    sourcesCount: 4,
  },
  {
    slug: 'thalidomide',
    name: 'Thalidomide',
    class: 'Immunomodulatory Drug (IMiD)',
    approvedFor: 'Erythema Nodosum Leprosum & Multiple Myeloma',
    repurposingTarget: 'Metastatic Prostate Cancer & Angiogenesis Inhibition',
    highestPhase: 'Phase 2 Trials',
    sourcesCount: 4,
  },
  {
    slug: 'imatinib',
    name: 'Imatinib',
    class: 'Tyrosine Kinase Inhibitor (TKI)',
    approvedFor: 'Philadelphia+ CML & KIT+ GIST',
    repurposingTarget: 'Systemic Sclerosis & Fibrotic Disorders',
    highestPhase: 'Phase 2 Trials',
    sourcesCount: 4,
  },
];

function HomeContent() {
  const [researchSnapshot, setResearchSnapshot] = useState<DrugResearchSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<RepurposingCandidate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Structured Data (JSON-LD)
  const homeJsonLd = generateHomeJsonLd();

  // Drug Search Handler
  const handleSearchDrug = useCallback(async (drugName: string, targetCandidate?: string) => {
    const trimmed = drugName.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setSearchQuery(trimmed);

    // Update URL query parameters for direct sharing without full reload
    if (typeof window !== 'undefined') {
      const newUrl = targetCandidate 
        ? `/?drug=${encodeURIComponent(trimmed)}&candidate=${encodeURIComponent(targetCandidate)}`
        : `/?drug=${encodeURIComponent(trimmed)}`;
      window.history.pushState({}, '', newUrl);
    }

    try {
      const res = await fetch(`/api/drugs/research?drug=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve drug data');
      }

      setResearchSnapshot(data);

      // If a candidate parameter was requested, open it automatically
      if (targetCandidate && data.candidates) {
        const matched = data.candidates.find((c: RepurposingCandidate) => 
          c.condition.toLowerCase() === targetCandidate.toLowerCase()
        );
        if (matched) {
          setSelectedCandidate(matched);
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred while fetching biomedical records.');
      setResearchSnapshot(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Deep Link Handling: Check URL params on initial load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const drugParam = params.get('drug');
    const candidateParam = params.get('candidate');

    if (drugParam) {
      handleSearchDrug(drugParam, candidateParam || undefined);
    }
  }, [handleSearchDrug]);

  return (
    <>
      {/* Inject Structured Data */}
      {homeJsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-6 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
        {/* PWA offline banner & install prompt */}
        <PWARegister />

        {/* Prominent Educational/Clinical Disclaimer Banner */}
        <DisclaimerBanner />

        {/* Main App Navigation Header (Read-Only) */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 sm:py-6">
          <div className="space-y-8">
              <SearchSection
                onSearch={(name) => handleSearchDrug(name)}
                isLoading={isLoading}
                initialQuery={searchQuery}
              />

              {/* Error Message Alert */}
              {error && (
                <div 
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-900 rounded-lg p-4 text-xs sm:text-sm flex items-start gap-2.5 max-w-2xl mx-auto"
                >
                  <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-950 mb-0.5">Biomedical Query Notice</h3>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-700 mx-auto" />
                  <p className="text-sm font-medium text-slate-700">
                    Aggregating live evidence across RxNorm, openFDA, PubChem, ClinicalTrials.gov, and PubMed...
                  </p>
                  <p className="text-xs text-slate-500">
                    Checking interventional trials and peer-reviewed literature.
                  </p>
                </div>
              )}

              {/* Drug Overview & Candidate List */}
              {researchSnapshot && !isLoading && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <DrugOverview
                    drug={researchSnapshot.drug}
                  />

                  <RepurposingList
                    candidates={researchSnapshot.candidates}
                    onSelectCandidate={(cand) => setSelectedCandidate(cand)}
                    drugGenericName={researchSnapshot.drug.genericName}
                  />
                </div>
              )}

              {/* Featured Verified Drug Guides (Indexable, Crawlable HTML links) */}
              {!researchSnapshot && !isLoading && (
                <div className="space-y-8 pt-4">
                  <section aria-labelledby="featured-dossiers-heading" className="max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-2">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 uppercase tracking-wider mb-1">
                          <FlaskConical className="w-3.5 h-3.5" />
                          Curated Biomedical Dossiers
                        </div>
                        <h2 id="featured-dossiers-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
                          Verified Drug Repurposing Dossiers
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 max-w-xs sm:text-right">
                        Sourced directly from ClinicalTrials.gov, openFDA, and PubMed.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {FEATURED_DRUG_GUIDES.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/drug/${item.slug}`}
                          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-teal-600 hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                                {item.highestPhase}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {item.sourcesCount} sources
                              </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-xs text-slate-500 font-mono mb-3">
                              {item.class}
                            </p>

                            <div className="space-y-2 text-xs text-slate-600 mb-4">
                              <div>
                                <span className="font-semibold text-slate-700">Approved: </span>
                                {item.approvedFor}
                              </div>
                              <div>
                                <span className="font-semibold text-teal-800">Repurposing Focus: </span>
                                {item.repurposingTarget}
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-teal-800 group-hover:text-teal-900">
                            <span>Explore Evidence Dossier</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>

                  {/* Educational Knowledge Hub Internal Links */}
                  <section aria-labelledby="educational-hub-heading" className="max-w-4xl mx-auto pt-6 border-t border-slate-200">
                    <h2 id="educational-hub-heading" className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-700" />
                      Educational Resources & Verification Methodology
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Link
                        href="/what-is-drug-repurposing"
                        className="p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                          What is Drug Repurposing?
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Principles of off-target pharmacology, regulatory phases, and why clinical trials are essential.
                        </p>
                      </Link>

                      <Link
                        href="/methodology"
                        className="p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                          Evidence Scoring System
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Understand how clinical trials, human data, and mechanistic plausibility are weighted.
                        </p>
                      </Link>

                      <Link
                        href="/sources"
                        className="p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                          Open Biomedical Registries
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          How Repurpose integrates RxNorm, openFDA, PubChem, ClinicalTrials.gov, and PubMed.
                        </p>
                      </Link>
                    </div>
                  </section>
                </div>
              )}
            </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-200 bg-white py-5 px-4 text-center text-xs text-slate-600 mb-14 md:mb-0">
          <div className="max-w-5xl mx-auto space-y-2">
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-slate-500">
              <Link href="/what-is-drug-repurposing" className="hover:text-slate-800 transition-colors">
                What is Drug Repurposing?
              </Link>
              <span>·</span>
              <Link href="/methodology" className="hover:text-slate-800 transition-colors">
                Methodology
              </Link>
              <span>·</span>
              <Link href="/sources" className="hover:text-slate-800 transition-colors">
                Data Sources
              </Link>
              <span>·</span>
              <Link href="/about" className="hover:text-slate-800 transition-colors">
                About & Privacy
              </Link>
            </div>
            <p>
              Open-source tool prepared by P. Rahul Chakradhar · Contact:{' '}
              <a
                href="mailto:rahulchakradhar30@outlook.com"
                className="font-medium text-teal-800 hover:text-teal-900 hover:underline"
              >
                rahulchakradhar30@outlook.com
              </a>
            </p>
          </div>
        </footer>

        {/* Candidate Deep-Dive Modal (Read-Only with Copy Link) */}
        {selectedCandidate && researchSnapshot && (
          <EvidenceDetailModal
            candidate={selectedCandidate}
            drug={researchSnapshot.drug}
            onClose={() => {
              setSelectedCandidate(null);
              // Revert URL to drug-only
              if (typeof window !== 'undefined' && researchSnapshot.drug.genericName) {
                window.history.pushState({}, '', `/?drug=${encodeURIComponent(researchSnapshot.drug.genericName)}`);
              }
            }}
          />
        )}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

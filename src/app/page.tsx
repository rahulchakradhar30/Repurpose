'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { SearchSection } from '@/components/SearchSection';
import { DrugOverview } from '@/components/DrugOverview';
import { RepurposingList } from '@/components/RepurposingList';
import { EvidenceDetailModal } from '@/components/EvidenceDetailModal';
import { PWARegister } from '@/components/PWARegister';
import { 
  DrugResearchSnapshot, 
  RepurposingCandidate 
} from '@/types';
import { AlertCircle, Loader2, BookOpen, Scale, BookMarked, Compass, Database } from 'lucide-react';
import { generateHomeJsonLd } from '@/lib/seo';

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
      {/* If user search is active, emit noindex, follow in client DOM */}
      {searchQuery && (
        <head>
          <meta name="robots" content="noindex, follow" />
        </head>
      )}

      {/* Inject Structured Data */}
      {homeJsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="flex-1 flex flex-col pb-16 md:pb-6 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
        {/* PWA offline banner & install prompt */}
        <PWARegister />

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
                    candidates={researchSnapshot.candidates}
                  />

                  <RepurposingList
                    candidates={researchSnapshot.candidates}
                    onSelectCandidate={(cand) => setSelectedCandidate(cand)}
                    drugGenericName={researchSnapshot.drug.genericName}
                  />
                </div>
              )}

              {/* Educational Knowledge Hub Internal Links & Verified Drug Dossiers */}
              {!researchSnapshot && !isLoading && (
                <div className="space-y-8 pt-2">
                  {/* Verified Clinical Evidence Dossiers Section */}
                  <section aria-labelledby="verified-dossiers-heading" className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h2 id="verified-dossiers-heading" className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-teal-700" />
                        Featured Verified Drug Repurposing Dossiers
                      </h2>
                      <span className="text-xs text-slate-500 font-mono">Peer-reviewed &amp; trial-indexed</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Link
                        href="/drug/metformin"
                        className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-600 hover:shadow-xs transition-all group block"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-900 group-hover:text-teal-800">Metformin</span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            PCOS &amp; Oncology
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          First-line biguanide for type 2 diabetes explored in polycystic ovary syndrome and cancer chemoprevention trials.
                        </p>
                      </Link>

                      <Link
                        href="/drug/azithromycin"
                        className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-600 hover:shadow-xs transition-all group block"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-900 group-hover:text-teal-800">Azithromycin</span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                            CF &amp; Viral Trials
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          Macrolide with immunomodulatory properties investigated across cystic fibrosis and large randomized COVID-19 platform trials.
                        </p>
                      </Link>

                      <Link
                        href="/drug/thalidomide"
                        className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-600 hover:shadow-xs transition-all group block"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-900 group-hover:text-teal-800">Thalidomide</span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                            Myeloma &amp; ENL
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          Historic teratogen repurposed through cereblon-mediated anti-angiogenesis into standard multiple myeloma therapy.
                        </p>
                      </Link>

                      <Link
                        href="/drug/imatinib"
                        className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-600 hover:shadow-xs transition-all group block"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-900 group-hover:text-teal-800">Imatinib</span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                            GIST &amp; Scleroderma
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          Prototypical kinase inhibitor targeting BCR-ABL, KIT, and PDGFR evaluated in systemic sclerosis and fibrosis.
                        </p>
                      </Link>
                    </div>
                  </section>

                  {/* Knowledge Architecture Links */}
                  <section aria-labelledby="educational-hub-heading" className="max-w-4xl mx-auto pt-2">
                    <h2 id="educational-hub-heading" className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-teal-700" />
                      Educational Guides, Scoring Methodology &amp; Registry
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                      <Link
                        href="/what-is-drug-repurposing"
                        className="flex flex-col items-center justify-center p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-600 hover:text-teal-800 text-slate-800 text-xs font-semibold transition-all shadow-xs text-center"
                      >
                        <BookOpen className="w-4 h-4 text-teal-700 mb-1" />
                        <span>What is Repurposing?</span>
                      </Link>

                      <Link
                        href="/methodology"
                        className="flex flex-col items-center justify-center p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-600 hover:text-teal-800 text-slate-800 text-xs font-semibold transition-all shadow-xs text-center"
                      >
                        <Compass className="w-4 h-4 text-teal-700 mb-1" />
                        <span>Scoring Methodology</span>
                      </Link>

                      <Link
                        href="/sources"
                        className="flex flex-col items-center justify-center p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-600 hover:text-teal-800 text-slate-800 text-xs font-semibold transition-all shadow-xs text-center"
                      >
                        <Database className="w-4 h-4 text-teal-700 mb-1" />
                        <span>Data Sources</span>
                      </Link>

                      <Link
                        href="/compare"
                        className="flex flex-col items-center justify-center p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-600 hover:text-teal-800 text-slate-800 text-xs font-semibold transition-all shadow-xs text-center"
                      >
                        <Scale className="w-4 h-4 text-teal-700 mb-1" />
                        <span>Compare Candidates</span>
                      </Link>

                      <Link
                        href="/about"
                        className="flex flex-col items-center justify-center p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-600 hover:text-teal-800 text-slate-800 text-xs font-semibold transition-all shadow-xs text-center"
                      >
                        <BookMarked className="w-4 h-4 text-teal-700 mb-1" />
                        <span>About Mission</span>
                      </Link>

                      <Link
                        href="/privacy"
                        className="flex flex-col items-center justify-center p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-600 hover:text-teal-800 text-slate-800 text-xs font-semibold transition-all shadow-xs text-center"
                      >
                        <Compass className="w-4 h-4 text-teal-700 mb-1" />
                        <span>Privacy Policy</span>
                      </Link>
                    </div>
                  </section>
                </div>
              )}
            </div>
        </main>



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

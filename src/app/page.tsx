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
import { AlertCircle, Loader2, BookOpen } from 'lucide-react';
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
                  />

                  <RepurposingList
                    candidates={researchSnapshot.candidates}
                    onSelectCandidate={(cand) => setSelectedCandidate(cand)}
                    drugGenericName={researchSnapshot.drug.genericName}
                  />
                </div>
              )}

              {/* Educational Knowledge Hub Internal Links */}
              {!researchSnapshot && !isLoading && (
                <div className="space-y-8 pt-2">
                  <section aria-labelledby="educational-hub-heading" className="max-w-4xl mx-auto pt-4">
                    <h2 id="educational-hub-heading" className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-700" />
                      Research Workspace, Comparison & Verification Tools
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <Link
                        href="/compare"
                        className="p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                          Compare Workspace
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Side-by-side comparison of up to 3 candidate hypotheses with CSV and printable exports.
                        </p>
                      </Link>

                      <Link
                        href="/notebook"
                        className="p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                          Research Notebook
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Private saved dossiers, custom tags, study checklists, and citation collections.
                        </p>
                      </Link>

                      <Link
                        href="/methodology"
                        className="p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                          Repurpose Compass™
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Transparent 0–100 Research Readiness scoring, conflict detection, and provenance timelines.
                        </p>
                      </Link>

                      <Link
                        href="/sources"
                        className="p-4 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                          Data Source Registry
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Licensing boundaries and direct APIs: RxNorm, openFDA, PubChem, ClinicalTrials.gov, PubMed.
                        </p>
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

'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { SearchSection } from '@/components/SearchSection';
import { DrugOverview } from '@/components/DrugOverview';
import { RepurposingList } from '@/components/RepurposingList';
import { EvidenceDetailModal } from '@/components/EvidenceDetailModal';
import { PWARegister } from '@/components/PWARegister';
import { MicroscopeWatermark } from '@/components/MicroscopeWatermark';
import { 
  DrugResearchSnapshot, 
  RepurposingCandidate 
} from '@/types';
import { AlertCircle, Loader2 } from 'lucide-react';
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

  // Reset Search State (Fresh search)
  const handleResetSearch = useCallback(() => {
    setResearchSnapshot(null);
    setSelectedCandidate(null);
    setSearchQuery('');
    setError(null);
    setIsLoading(false);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
  }, []);

  // Deep Link Handling & Custom Reset Event Listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkUrlAndLoad = () => {
      const params = new URLSearchParams(window.location.search);
      const drugParam = params.get('drug');
      const candidateParam = params.get('candidate');

      if (drugParam) {
        handleSearchDrug(drugParam, candidateParam || undefined);
      } else {
        handleResetSearch();
      }
    };

    checkUrlAndLoad();

    window.addEventListener('repurpose:reset-search', handleResetSearch);
    window.addEventListener('popstate', checkUrlAndLoad);

    return () => {
      window.removeEventListener('repurpose:reset-search', handleResetSearch);
      window.removeEventListener('popstate', checkUrlAndLoad);
    };
  }, [handleSearchDrug, handleResetSearch]);

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

              {/* Watermark Illustration: Microscope examining drug candidate */}
              {!researchSnapshot && !isLoading && !error && (
                <MicroscopeWatermark />
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { Header } from '@/components/Header';
import { SearchSection } from '@/components/SearchSection';
import { DrugOverview } from '@/components/DrugOverview';
import { RepurposingList } from '@/components/RepurposingList';
import { EvidenceDetailModal } from '@/components/EvidenceDetailModal';
import { SavedResearchView } from '@/components/SavedResearchView';
import { AboutView } from '@/components/AboutView';
import { AuthModal } from '@/components/AuthModal';
import { PWARegister } from '@/components/PWARegister';
import { 
  DrugResearchSnapshot, 
  RepurposingCandidate, 
  SavedResearchItem, 
  UserSearchHistory 
} from '@/types';
import { 
  subscribeToAuth, 
  signOutUser, 
  fetchUserSavedDrugs, 
  saveDrugResearch, 
  deleteSavedDrug, 
  fetchRecentSearches, 
  recordSearchQuery, 
  getLocalUser 
} from '@/lib/firebase/client';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'search' | 'saved' | 'about'>('search');
  const [researchSnapshot, setResearchSnapshot] = useState<DrugResearchSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<RepurposingCandidate | null>(null);
  
  // Auth and User State
  const [user, setUser] = useState<{ uid: string; isAnonymous: boolean; displayName: string | null; email?: string | null } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Saved Research and History
  const [savedItems, setSavedItems] = useState<SavedResearchItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<UserSearchHistory[]>([]);

  // Auth Subscription
  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => {
      setUser(u || getLocalUser());
    });
    return () => unsubscribe();
  }, []);

  // Fetch saved items & search history whenever user changes
  const loadUserData = useCallback(async () => {
    if (!user) return;
    try {
      const [saved, searches] = await Promise.all([
        fetchUserSavedDrugs(user.uid),
        fetchRecentSearches(user.uid),
      ]);
      setSavedItems(saved);
      setRecentSearches(searches);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Drug Search Handler
  const handleSearchDrug = async (drugName: string) => {
    const trimmed = drugName.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setCurrentTab('search');

    try {
      const res = await fetch(`/api/drugs/research?drug=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve drug data');
      }

      setResearchSnapshot(data);

      // Record search in history
      if (user) {
        await recordSearchQuery(user.uid, trimmed, data.drug?.genericName);
        const updatedSearches = await fetchRecentSearches(user.uid);
        setRecentSearches(updatedSearches);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred while fetching biomedical records.');
      setResearchSnapshot(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Save Drug Overview
  const handleSaveCurrentDrug = async () => {
    if (!researchSnapshot || !user) return;
    const { drug, candidates } = researchSnapshot;
    
    await saveDrugResearch(user.uid, {
      drugGenericName: drug.genericName,
      rxNormId: drug.rxNormId,
      candidateConditionsCount: candidates.length,
      notes: `Overall dossier for ${drug.genericName} (${drug.drugClass || 'Therapeutic'}).`,
      tags: [drug.drugClass || 'Small Molecule'].filter(Boolean),
    });

    const updated = await fetchUserSavedDrugs(user.uid);
    setSavedItems(updated);
  };

  // Save Specific Candidate from Detail Modal
  const handleSaveCandidate = async (candidate: RepurposingCandidate, notes: string) => {
    if (!researchSnapshot || !user) return;
    const { drug } = researchSnapshot;

    await saveDrugResearch(user.uid, {
      drugGenericName: drug.genericName,
      rxNormId: drug.rxNormId,
      conditionFocus: candidate.condition,
      candidateConditionsCount: 1,
      notes: notes || `Repurposing investigation for ${candidate.condition}.`,
      tags: [candidate.status, candidate.highestPhase],
      evidenceSnapshot: {
        totalScore: candidate.evidenceScore.totalScore,
        highestPhase: candidate.highestPhase,
        clinicalTrialsCount: candidate.clinicalTrials.length,
        citationsCount: candidate.citations.length,
      },
    });

    const updated = await fetchUserSavedDrugs(user.uid);
    setSavedItems(updated);
  };

  // Delete Saved Item
  const handleDeleteSaved = async (id: string) => {
    if (!user) return;
    await deleteSavedDrug(user.uid, id);
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Update notes on a saved item
  const handleUpdateNotes = async (id: string, notes: string) => {
    if (!user) return;
    const target = savedItems.find((i) => i.id === id);
    if (!target) return;

    await saveDrugResearch(user.uid, {
      ...target,
      notes,
    });

    const updated = await fetchUserSavedDrugs(user.uid);
    setSavedItems(updated);
  };

  const isCurrentDrugSaved = !!(
    researchSnapshot &&
    savedItems.some(
      (i) =>
        i.drugGenericName.toLowerCase() ===
          researchSnapshot.drug.genericName.toLowerCase() && !i.conditionFocus
    )
  );

  const isCandidateSaved = (candidate: RepurposingCandidate) =>
    !!(
      researchSnapshot &&
      savedItems.some(
        (i) =>
          i.drugGenericName.toLowerCase() ===
            researchSnapshot.drug.genericName.toLowerCase() &&
          i.conditionFocus?.toLowerCase() === candidate.condition.toLowerCase()
      )
    );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-6 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* PWA offline banner & install prompt */}
      <PWARegister />

      {/* Prominent Educational/Clinical Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main App Navigation Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={async () => {
          await signOutUser();
          setUser(getLocalUser());
          setSavedItems([]);
        }}
        savedCount={savedItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 sm:py-6">
        {/* VIEW 1: SEARCH & DRUG RESULTS */}
        {currentTab === 'search' && (
          <div className="space-y-6">
            <SearchSection
              onSearch={handleSearchDrug}
              isLoading={isLoading}
              recentSearches={recentSearches}
              onSelectRecent={handleSearchDrug}
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
                  onSaveDrug={handleSaveCurrentDrug}
                  isSaved={isCurrentDrugSaved}
                />

                <RepurposingList
                  candidates={researchSnapshot.candidates}
                  onSelectCandidate={(cand) => setSelectedCandidate(cand)}
                  drugGenericName={researchSnapshot.drug.genericName}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: SAVED RESEARCH & COLLECTIONS */}
        {currentTab === 'saved' && (
          <SavedResearchView
            items={savedItems}
            onDelete={handleDeleteSaved}
            onUpdateNotes={handleUpdateNotes}
            onSelectDrug={handleSearchDrug}
          />
        )}

        {/* VIEW 3: ABOUT & METHODOLOGY */}
        {currentTab === 'about' && <AboutView />}
      </main>

      {/* Candidate Deep-Dive Modal */}
      {selectedCandidate && researchSnapshot && (
        <EvidenceDetailModal
          candidate={selectedCandidate}
          drug={researchSnapshot.drug}
          onClose={() => setSelectedCandidate(null)}
          onSaveToResearch={(notes) => handleSaveCandidate(selectedCandidate, notes)}
          isSaved={isCandidateSaved(selectedCandidate)}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={loadUserData}
      />
    </div>
  );
}

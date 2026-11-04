'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  DrugConcept, 
  RepurposingCandidate, 
  AISummary, 
  EvidenceStatus 
} from '@/types';
import { filterDistinctBrandNames } from '@/lib/normalization';
import { RepurposeCompass } from './RepurposeCompass';
import { SaveToNotebookButton } from './SaveToNotebookButton';
import { CompareDrugButton } from './CompareDrugButton';
import { PrintSummaryButton } from './PrintSummaryButton';
import { 
  ExternalLink, 
  Share2, 
  Check, 
  Compass, 
  FileText, 
  CheckCircle2, 
  ShieldAlert, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUpDown, 
  Loader2, 
  FlaskConical, 
  Database,
  BookOpen
} from 'lucide-react';

interface ClinicalCanvasProps {
  drug: DrugConcept;
  candidates: RepurposingCandidate[];
  initialCandidate?: RepurposingCandidate | null;
  onCandidateChange?: (candidate: RepurposingCandidate | null) => void;
}

type CanvasViewMode = 'workbench' | 'fda_profile' | 'safety_alerts';
type EvidenceSubTab = 'compass' | 'evidence' | 'trials' | 'literature' | 'scoring';
type CandidateFilter = 'ALL' | 'HIGH_EVIDENCE' | 'PHASE_2_3' | 'OFF_LABEL' | 'INVESTIGATIONAL';
type SortOption = 'score_desc' | 'score_asc' | 'trials_desc' | 'name_asc';

export function ClinicalCanvas({
  drug,
  candidates,
  initialCandidate,
  onCandidateChange,
}: ClinicalCanvasProps) {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<CanvasViewMode>('workbench');
  const [activeTab, setActiveTab] = useState<EvidenceSubTab>('compass');

  // Selected candidate state (defaults to first candidate or initial)
  const [selectedCandidate, setSelectedCandidate] = useState<RepurposingCandidate | null>(
    () => initialCandidate || (candidates.length > 0 ? candidates[0] : null)
  );

  // Mobile split view navigation state (false = show list, true = show detail)
  const [showMobileDetail, setShowMobileDetail] = useState<boolean>(Boolean(initialCandidate));

  // Filters & Sorting for Left Rail
  const [filterMode, setFilterMode] = useState<CandidateFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('score_desc');
  const [searchFilter, setSearchFilter] = useState('');

  // AI Summary Caching & Fetch State
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiCache = useRef<Map<string, AISummary>>(new Map());

  // Link copy feedback states
  const [copiedDrugLink, setCopiedDrugLink] = useState(false);

  // Synchronize when candidates prop changes
  useEffect(() => {
    if (initialCandidate) {
      setSelectedCandidate(initialCandidate);
      setShowMobileDetail(true);
    } else if (candidates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(candidates[0]);
    }
  }, [candidates, initialCandidate]);

  // Handle Candidate Selection
  const handleSelectCandidate = useCallback((cand: RepurposingCandidate) => {
    setSelectedCandidate(cand);
    setShowMobileDetail(true);
    if (onCandidateChange) {
      onCandidateChange(cand);
    }

    // Update URL query parameter without full reload
    if (typeof window !== 'undefined' && drug.genericName) {
      const newUrl = `/?drug=${encodeURIComponent(drug.genericName)}&candidate=${encodeURIComponent(cand.condition)}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [drug.genericName, onCandidateChange]);

  // AI Summary Background Fetch with In-Memory Caching
  useEffect(() => {
    if (!selectedCandidate) {
      setAiSummary(null);
      return;
    }

    const cacheKey = `${drug.genericName.toLowerCase()}::${selectedCandidate.condition.toLowerCase()}`;
    const cached = aiCache.current.get(cacheKey);

    if (cached) {
      setAiSummary(cached);
      setIsAiLoading(false);
      return;
    }

    let isMounted = true;
    setIsAiLoading(true);

    async function fetchAI() {
      try {
        const res = await fetch('/api/repurposing/ai-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ drug, candidate: selectedCandidate }),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.aiSummary) {
            aiCache.current.set(cacheKey, data.aiSummary);
            setAiSummary(data.aiSummary);
          }
        }
      } catch (err) {
        console.error('AI summary fetch failed:', err);
      } finally {
        if (isMounted) {
          setIsAiLoading(false);
        }
      }
    }

    fetchAI();

    return () => {
      isMounted = false;
    };
  }, [selectedCandidate, drug]);

  // Keyboard navigation for Left Rail (ArrowUp / ArrowDown)
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number, list: RepurposingCandidate[]) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(index + 1, list.length - 1);
      handleSelectCandidate(list[nextIndex]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(index - 1, 0);
      handleSelectCandidate(list[prevIndex]);
    }
  }, [handleSelectCandidate]);

  // Copy Share URL Handler (includes selected candidate when active)
  const handleCopyDrugLink = async () => {
    if (typeof window === 'undefined') return;
    const url = selectedCandidate
      ? `${window.location.origin}/?drug=${encodeURIComponent(drug.genericName)}&candidate=${encodeURIComponent(selectedCandidate.condition)}`
      : `${window.location.origin}/?drug=${encodeURIComponent(drug.genericName)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedDrugLink(true);
      setTimeout(() => setCopiedDrugLink(false), 2000);
    } catch {
      // ignore
    }
  };

  // Filtered and Sorted Candidates
  const filteredCandidates = useMemo(() => {
    let list = [...candidates];

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter((c) => c.condition.toLowerCase().includes(q));
    }

    if (filterMode === 'HIGH_EVIDENCE') {
      list = list.filter((c) => (c.readinessScore ?? c.evidenceScore.totalScore) >= 70);
    } else if (filterMode === 'PHASE_2_3') {
      list = list.filter((c) => c.highestPhase.includes('Phase 2') || c.highestPhase.includes('Phase 3') || c.highestPhase.includes('Phase 4'));
    } else if (filterMode === 'OFF_LABEL') {
      list = list.filter((c) => c.status === 'Off-label');
    } else if (filterMode === 'INVESTIGATIONAL') {
      list = list.filter((c) => c.status === 'Investigational');
    }

    list.sort((a, b) => {
      if (sortBy === 'score_desc') {
        return (b.readinessScore ?? b.evidenceScore.totalScore) - (a.readinessScore ?? a.evidenceScore.totalScore);
      }
      if (sortBy === 'score_asc') {
        return (a.readinessScore ?? a.evidenceScore.totalScore) - (b.readinessScore ?? b.evidenceScore.totalScore);
      }
      if (sortBy === 'trials_desc') {
        return b.clinicalTrials.length - a.clinicalTrials.length;
      }
      if (sortBy === 'name_asc') {
        return a.condition.localeCompare(b.condition);
      }
      return 0;
    });

    return list;
  }, [candidates, filterMode, sortBy, searchFilter]);

  const distinctBrandNames = filterDistinctBrandNames(drug.brandNames || [], drug.genericName);

  const fdaSource = drug.sources.find(
    (s) => s.name.toLowerCase().includes('fda') || s.name.toLowerCase().includes('dailymed')
  );
  const originalLabelUrl =
    fdaSource?.url ||
    `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(drug.genericName)}`;

  const rxNormUrl = drug.rxNormId
    ? `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${drug.rxNormId}`
    : `https://mor.nlm.nih.gov/RxNav/search?searchBy=String&searchTerm=${encodeURIComponent(drug.genericName)}`;

  const pubChemUrl = drug.pubchemCid
    ? `https://pubchem.ncbi.nlm.nih.gov/compound/${drug.pubchemCid}`
    : `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(drug.genericName)}`;

  const clinicalTrialsDrugUrl = `https://clinicaltrials.gov/search?intr=${encodeURIComponent(drug.genericName)}`;
  const pubMedDrugUrl = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(drug.genericName)}`;

  const candidateClinicalTrialsUrl = selectedCandidate
    ? `https://clinicaltrials.gov/search?intr=${encodeURIComponent(drug.genericName)}&cond=${encodeURIComponent(selectedCandidate.condition)}`
    : clinicalTrialsDrugUrl;

  const candidatePubMedUrl = selectedCandidate
    ? `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(drug.genericName)}+AND+${encodeURIComponent(selectedCandidate.condition)}`
    : pubMedDrugUrl;

  const displayIndications = (drug.approvedIndications || [])
    .map((ind) => ind.replace(/^INDICATIONS AND USAGE:?\s*/i, '').trim())
    .filter(Boolean)
    .slice(0, 5);

  const getStatusBadgeStyle = (status: EvidenceStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Investigational':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'Off-label':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Preclinical':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Unsupported':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getScoreColorBadge = (score: number) => {
    if (score >= 70) return 'text-teal-800 bg-teal-50 border-teal-300';
    if (score >= 45) return 'text-slate-800 bg-slate-100 border-slate-300';
    return 'text-amber-900 bg-amber-50 border-amber-300';
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. EXECUTIVE DRUG PROFILE BANNER (Frosted Glass Header)
          ────────────────────────────────────────────────────────────────────────── */}
      <header className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden transition-all">
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Identity & Badges */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                Verified Generic
              </span>
              {drug.rxNormId && (
                <a
                  href={rxNormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-slate-600 hover:text-teal-800 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded border border-slate-200 transition-colors inline-flex items-center gap-1"
                  title="Open record in NLM RxNav"
                >
                  <span>RxCUI: {drug.rxNormId}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
              {drug.pubchemCid && (
                <a
                  href={pubChemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-slate-600 hover:text-teal-800 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded border border-slate-200 transition-colors inline-flex items-center gap-1"
                  title="Open chemical structure in NCBI PubChem"
                >
                  <span>CID: {drug.pubchemCid}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
              <span className="text-slate-400 text-[11px]">
                Verified: {drug.lastVerifiedDate}
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {drug.genericName}
              </h1>
              {drug.drugClass && (
                <span className="text-xs sm:text-sm font-medium text-slate-600 bg-slate-100/80 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                  {drug.drugClass}
                </span>
              )}
            </div>

            {distinctBrandNames.length > 0 && (
              <p className="text-xs text-slate-500 truncate">
                <span className="font-medium text-slate-600">Brands: </span>
                <span>{distinctBrandNames.slice(0, 5).join(', ')}{distinctBrandNames.length > 5 ? '…' : ''}</span>
              </p>
            )}
          </div>

          {/* Quick Metrics & Action Controls (Single Unified Action Bar) */}
          <div className="flex items-center gap-2 self-start lg:self-center flex-wrap shrink-0">
            {selectedCandidate && (
              <Link
                href={`/evidence/${encodeURIComponent(drug.genericName.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}/${encodeURIComponent(selectedCandidate.condition.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                title={`Open full permanent dossier page for ${drug.genericName} in ${selectedCandidate.condition}`}
              >
                <span>Full Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            <CompareDrugButton drug={drug} candidates={candidates} />
            <SaveToNotebookButton drug={drug} candidate={selectedCandidate || candidates[0]} showViewLink={true} />
            <PrintSummaryButton label="Print" />

            <button
              onClick={handleCopyDrugLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                copiedDrugLink
                  ? 'bg-teal-50 text-teal-800 border-teal-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title="Copy direct share link"
            >
              {copiedDrugLink ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedDrugLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Executive Mode Navigation Bar */}
        <div className="border-t border-slate-100 bg-slate-50/70 px-4 sm:px-5 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 py-1.5">
            <button
              onClick={() => setViewMode('workbench')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'workbench'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Repurposing Canvas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                viewMode === 'workbench' ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {candidates.length}
              </span>
            </button>

            <button
              onClick={() => setViewMode('fda_profile')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'fda_profile'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>FDA Label & Pharmacology</span>
            </button>

            <button
              onClick={() => setViewMode('safety_alerts')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'safety_alerts'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Safety & Warnings</span>
              {(drug.warnings.length > 0 || drug.contraindications.length > 0) && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-medium text-slate-600">Live Repositories:</span>
            <a href={rxNormUrl} target="_blank" rel="noopener noreferrer" className="hover:text-teal-800 hover:underline">RxNorm</a>
            <span>·</span>
            <a href={originalLabelUrl} target="_blank" rel="noopener noreferrer" className="hover:text-teal-800 hover:underline">DailyMed</a>
            <span>·</span>
            <a href={pubChemUrl} target="_blank" rel="noopener noreferrer" className="hover:text-teal-800 hover:underline">PubChem</a>
            <span>·</span>
            <a href={clinicalTrialsDrugUrl} target="_blank" rel="noopener noreferrer" className="hover:text-teal-800 hover:underline">ClinicalTrials.gov</a>
            <span>·</span>
            <a href={pubMedDrugUrl} target="_blank" rel="noopener noreferrer" className="hover:text-teal-800 hover:underline">PubMed</a>
          </div>
        </div>

        {/* CLICKABLE SOURCE PROVENANCE STRIP (Always at bottom of executive header) */}
        <div className="border-t border-slate-100 bg-white px-4 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Database className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span className="font-semibold text-slate-700 text-[11px]">Primary Source Records for {drug.genericName}:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <a
              href={rxNormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 transition-colors"
              title="Open RxNorm / RxNav entry"
            >
              <span>RxNorm</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>

            <a
              href={originalLabelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 transition-colors"
              title="Open DailyMed FDA Structured Product Label"
            >
              <span>DailyMed FDA Label</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>

            <a
              href={pubChemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 transition-colors"
              title="Open NCBI PubChem chemical monograph"
            >
              <span>NCBI PubChem</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>

            <a
              href={clinicalTrialsDrugUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 transition-colors"
              title="Search all registered clinical studies on ClinicalTrials.gov"
            >
              <span>ClinicalTrials.gov ({candidates.reduce((a, b) => a + b.clinicalTrials.length, 0)} Studies)</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>

            <a
              href={pubMedDrugUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 transition-colors"
              title="Search peer-reviewed articles in PubMed Central"
            >
              <span>PubMed Central</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. SECONDARY VIEW: FDA LABEL & PHARMACOLOGY PROFILE
          ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'fda_profile' && (
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5 animate-in fade-in duration-150 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                FDA Regulatory Baseline & Pharmacology Profile
              </h2>
              <p className="text-xs text-slate-500">
                Official regulatory baseline established by the US Food and Drug Administration & NLM DailyMed.
              </p>
            </div>
            <a
              href={originalLabelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-800 hover:text-teal-900 hover:underline bg-teal-50 px-2.5 py-1.5 rounded-md border border-teal-200"
            >
              <span>View DailyMed Insert</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Mechanism of Action */}
          {drug.mechanismOfAction && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Mechanism of Action & Target Biology
              </h3>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 border border-slate-200 rounded-lg p-4">
                {drug.mechanismOfAction}
              </p>
            </div>
          )}

          {/* Approved Indications */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Current FDA-Approved Indications ({displayIndications.length})</span>
            </h3>

            {displayIndications.length > 0 ? (
              <ul className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-slate-800">
                {displayIndications.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2.5 bg-emerald-50/50 border border-emerald-200/80 rounded-lg p-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span className="leading-snug">{ind}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-200">
                No verified FDA structured product label found for this exact identifier.
              </p>
            )}
          </div>

          {/* PROVENANCE AT BOTTOM OF FDA VIEW */}
          <div className="pt-3 border-t border-slate-100 bg-slate-50 rounded-lg p-4 space-y-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-teal-700" />
              Primary Regulatory & Pharmacological Sources:
            </span>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={originalLabelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-teal-800 font-medium transition-colors"
              >
                <span>DailyMed SPL Package Insert</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={rxNormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-teal-800 font-medium transition-colors"
              >
                <span>NLM RxNav Normalized Active Ingredients</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={pubChemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-teal-800 font-medium transition-colors"
              >
                <span>NCBI PubChem Compound Annotation</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              onClick={() => setViewMode('workbench')}
              className="text-xs font-semibold text-teal-800 hover:text-teal-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Return to Repurposing Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          3. SECONDARY VIEW: SAFETY & SURVEILLANCE ALERTS
          ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'safety_alerts' && (
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5 animate-in fade-in duration-150 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
                <span>Safety, Warnings & Contraindications Context</span>
              </h2>
              <p className="text-xs text-slate-500">
                Critical safety boundaries, black box warnings, and patient contraindications from official label documentation.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {drug.warnings.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-4 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Boxed Warnings & Clinical Precautions</span>
                </span>
                <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                  {drug.warnings.join(' ')}
                </p>
              </div>
            )}

            {drug.contraindications.length > 0 && (
              <div className="bg-rose-50/80 border border-rose-200 rounded-lg p-4 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-950 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                  <span>Contraindications</span>
                </span>
                <p className="text-xs sm:text-sm text-rose-950 leading-relaxed">
                  {drug.contraindications.join(' ')}
                </p>
              </div>
            )}

            {drug.warnings.length === 0 && drug.contraindications.length === 0 && (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded border border-slate-200">
                No active boxed warnings or contraindications recorded in the standardized label extract.
              </p>
            )}
          </div>

          {/* PROVENANCE AT BOTTOM OF SAFETY VIEW */}
          <div className="pt-3 border-t border-slate-100 bg-slate-50 rounded-lg p-4 space-y-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-teal-700" />
              Pharmacovigilance & Safety Surveillance Repositories:
            </span>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-teal-800 font-medium transition-colors"
              >
                <span>FDA MedWatch Safety Alerts Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={originalLabelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-teal-800 font-medium transition-colors"
              >
                <span>DailyMed Boxed Warning Monograph</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://open.fda.gov/apis/drug/enforcement/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-teal-800 font-medium transition-colors"
              >
                <span>openFDA Drug Enforcement & Recalls API</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              onClick={() => setViewMode('workbench')}
              className="text-xs font-semibold text-teal-800 hover:text-teal-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Return to Repurposing Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          4. THE CLINICAL CANVAS (DUAL-PANE WORKBENCH) — MODE: 'workbench'
          ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'workbench' && (
        <div className="flex flex-col md:flex-row gap-4 items-stretch min-h-[640px]">
          {/* ────────────────────────────────────────────────────────────────
              LEFT RAIL: MASTER CANDIDATE STREAM (38% Desktop Width)
              ──────────────────────────────────────────────────────────────── */}
          <aside 
            className={`w-full md:w-[350px] lg:w-[380px] xl:w-[410px] shrink-0 flex flex-col bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden ${
              showMobileDetail ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Rail Header with Filter & Search */}
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 space-y-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-teal-700" />
                  <span>Candidates ({filteredCandidates.length})</span>
                </span>

                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent border-0 text-slate-700 font-medium cursor-pointer focus:ring-0 text-[11px]"
                    aria-label="Sort candidates by"
                  >
                    <option value="score_desc">Highest Score</option>
                    <option value="score_asc">Lowest Score</option>
                    <option value="trials_desc">Most Trials</option>
                    <option value="name_asc">Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Fast Filter Pills */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setFilterMode('ALL')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    filterMode === 'ALL'
                      ? 'bg-teal-700 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({candidates.length})
                </button>
                <button
                  onClick={() => setFilterMode('HIGH_EVIDENCE')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    filterMode === 'HIGH_EVIDENCE'
                      ? 'bg-teal-700 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  High (≥70)
                </button>
                <button
                  onClick={() => setFilterMode('PHASE_2_3')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    filterMode === 'PHASE_2_3'
                      ? 'bg-teal-700 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Phase 2/3
                </button>
                <button
                  onClick={() => setFilterMode('OFF_LABEL')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    filterMode === 'OFF_LABEL'
                      ? 'bg-teal-700 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Off-label
                </button>
              </div>
            </div>

            {/* Candidate Cards Stream */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[720px] p-2 space-y-1.5 focus:outline-hidden">
              {filteredCandidates.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <p>No candidates match the active filter.</p>
                </div>
              ) : (
                filteredCandidates.map((cand, idx) => {
                  const isSelected = selectedCandidate?.id === cand.id;
                  const score = cand.readinessScore ?? cand.evidenceScore.totalScore;

                  return (
                    <div
                      key={cand.id}
                      onClick={() => handleSelectCandidate(cand)}
                      onKeyDown={(e) => handleKeyDown(e, idx, filteredCandidates)}
                      tabIndex={0}
                      role="button"
                      aria-selected={isSelected}
                      aria-label={`Select ${cand.condition}, score ${score} of 100`}
                      className={`relative w-full text-left p-3 rounded-lg transition-all cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                        isSelected
                          ? 'bg-teal-50/70 border border-teal-300/80 shadow-xs ring-1 ring-teal-500/20'
                          : 'bg-white hover:bg-slate-50/80 border border-slate-200/80'
                      }`}
                    >
                      {/* Active Indicator Strip */}
                      {isSelected && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-teal-700 rounded-r" />
                      )}

                      <div className="space-y-1.5 pl-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getStatusBadgeStyle(cand.status)}`}>
                            {cand.status}
                          </span>

                          <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded border ${getScoreColorBadge(score)}`}>
                            {score}/100
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                          {cand.condition}
                        </h3>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                            {cand.highestPhase}
                          </span>
                          <span>
                            {cand.clinicalTrials.length} Trial{cand.clinicalTrials.length === 1 ? '' : 's'} · {cand.citations.length} Paper{cand.citations.length === 1 ? '' : 's'}
                          </span>
                        </div>

                        {cand.trialOutcomeStatus && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded truncate">
                            <AlertCircle className="w-3 h-3 shrink-0 text-amber-700" />
                            <span className="truncate">{cand.trialOutcomeStatus}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* ────────────────────────────────────────────────────────────────
              RIGHT VIEWPORT: LIVE EVIDENCE CANVAS (62% Desktop Width)
              ──────────────────────────────────────────────────────────────── */}
          <main 
            className={`flex-1 min-w-0 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col ${
              !showMobileDetail ? 'hidden md:flex' : 'flex'
            }`}
          >
            {selectedCandidate ? (
              <>
                {/* Mobile Back Button Navigation Bar */}
                <div className="md:hidden border-b border-slate-200 bg-slate-50 px-4 py-2.5 flex items-center justify-between">
                  <button
                    onClick={() => setShowMobileDetail(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-900 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Candidates ({filteredCandidates.length})</span>
                  </button>
                  <span className="text-xs text-slate-500 font-medium truncate max-w-[160px]">
                    {selectedCandidate.condition}
                  </span>
                </div>

                {/* Viewport Header: Title, Score & Actions */}
                <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-3 shrink-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadgeStyle(selectedCandidate.status)}`}>
                        {selectedCandidate.status}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Hypothesis for {drug.genericName}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                      {selectedCandidate.condition}
                    </h2>

                    <div className="flex items-center gap-2 text-xs text-slate-600 pt-0.5">
                      <span className="font-semibold text-slate-900">Research Readiness:</span>
                      <span className="font-bold font-mono text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        {selectedCandidate.readinessScore ?? selectedCandidate.evidenceScore.totalScore}/100
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 font-medium">
                        {selectedCandidate.evidenceScore.evidenceTier || 'Active Evaluation'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Viewport Sub-Tabs Navigation */}
                <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 sm:px-5 shrink-0 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('compass')}
                    className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'compass'
                        ? 'border-teal-700 text-teal-900 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 text-teal-700" />
                    <span>Repurpose Compass™</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('evidence')}
                    className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'evidence'
                        ? 'border-teal-700 text-teal-900 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Evidence & AI Synthesis
                  </button>

                  <button
                    onClick={() => setActiveTab('trials')}
                    className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'trials'
                        ? 'border-teal-700 text-teal-900 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Clinical Trials ({selectedCandidate.clinicalTrials.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('literature')}
                    className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'literature'
                        ? 'border-teal-700 text-teal-900 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    PubMed Papers ({selectedCandidate.citations.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('scoring')}
                    className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'scoring'
                        ? 'border-teal-700 text-teal-900 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    5-Pillar Score
                  </button>
                </div>

                {/* Viewport Scrollable Tab Body */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 max-h-[660px]">
                  {/* ──────────────────────────────────────────────────────────
                      TAB 1: REPURPOSE COMPASS™
                      ────────────────────────────────────────────────────────── */}
                  {activeTab === 'compass' && (
                    <div className="space-y-4">
                      <RepurposeCompass
                        candidate={selectedCandidate}
                        drugName={drug.genericName}
                        defaultExpanded={true}
                      />

                      {/* COMPASS PROVENANCE AT BOTTOM */}
                      <div className="pt-3 border-t border-slate-100 bg-slate-50 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span>Repurpose Compass™ formulated dynamically from registered trials and PubMed index.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href="/methodology" className="text-teal-800 font-semibold hover:underline inline-flex items-center gap-1">
                            <span>Methodology Guide</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <span>·</span>
                          <Link href="/sources" className="text-teal-800 font-semibold hover:underline inline-flex items-center gap-1">
                            <span>All Sources</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ──────────────────────────────────────────────────────────
                      TAB 2: EVIDENCE & AI SYNTHESIS
                      ────────────────────────────────────────────────────────── */}
                  {activeTab === 'evidence' && (
                    <div className="space-y-5">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2">
                        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <p>
                          <strong>Epistemic Research Notice:</strong> This summary presents biomedical hypotheses and registered investigations. It does not constitute medical advice or an endorsement of off-label prescribing.
                        </p>
                      </div>

                      {/* Trial Outcome Status Alert */}
                      {selectedCandidate.trialOutcomeStatus && (
                        <div className="bg-amber-50 border-l-4 border-amber-600 rounded-r-lg p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 mb-1 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-700" />
                            <span>Trial Outcome Status</span>
                          </h4>
                          <p className="text-xs text-amber-950 font-medium">
                            {selectedCandidate.trialOutcomeStatus}
                          </p>
                          <p className="text-[11px] text-amber-800 mt-1">
                            Interventional trials are registered on ClinicalTrials.gov, but peer-reviewed primary outcome results have not yet been indexed in PubMed. Trial existence does not equate to clinical efficacy.
                          </p>
                        </div>
                      )}

                      {/* Score Assignment Rationale Note */}
                      {selectedCandidate.evidenceNote && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
                          <span className="font-semibold text-slate-900">Score Assignment Rationale: </span>
                          <span>{selectedCandidate.evidenceNote}</span>
                        </div>
                      )}

                      {/* Uncertainty Limitations Badges */}
                      {selectedCandidate.evidenceScore.uncertaintyFlags.length > 0 && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-700" />
                            <span>Evidence Boundaries & Uncertainty Flags</span>
                          </h4>
                          <ul className="space-y-1.5 text-xs text-amber-950">
                            {selectedCandidate.evidenceScore.uncertaintyFlags.map((flag, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-amber-700 font-bold">•</span>
                                <span>{flag}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Biological Rationale */}
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                          Biological Rationale & Mechanism
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50/70 border border-slate-200 rounded-lg p-4">
                          {selectedCandidate.biologicalRationale}
                        </p>
                      </div>

                      {/* AI-Assisted Synthesis with strict provenance labels */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                              Evidence Synthesis
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                              AI-assisted summary
                            </span>
                          </div>
                          {isAiLoading && <Loader2 className="w-4 h-4 animate-spin text-teal-700" />}
                        </div>

                        {isAiLoading ? (
                          <div className="py-4 text-center text-xs text-slate-500 space-y-1">
                            <p>Synthesizing verified clinical trial and PubMed records...</p>
                            <p className="text-[11px] text-slate-400">Strictly grounded in upstream biomedical databases.</p>
                          </div>
                        ) : aiSummary ? (
                          <div className="space-y-3 text-xs sm:text-sm">
                            <p className="text-slate-800 leading-relaxed">{aiSummary.summary}</p>

                            {aiSummary.mechanismExplanation && (
                              <div className="bg-slate-50 rounded p-3 border border-slate-200">
                                <span className="font-semibold text-slate-900 block mb-1">Mechanistic Rationale:</span>
                                <p className="text-slate-700">{aiSummary.mechanismExplanation}</p>
                              </div>
                            )}

                            {aiSummary.limitations.length > 0 && (
                              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                                <span className="font-semibold text-slate-900 block mb-1">Key Study Limitations:</span>
                                <ul className="list-disc pl-4 space-y-1 text-slate-700 text-xs">
                                  {aiSummary.limitations.map((lim, i) => (
                                    <li key={i}>{lim}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Supporting Sources */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                              <span className="font-medium">Direct Sources Used:</span>
                              {aiSummary.sourcesUsed.map((srcId, idx) => (
                                <span key={idx} className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 border border-slate-200">
                                  {srcId}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            Evidence brief directly reflects verified clinical trial registry records and peer-reviewed PubMed citations listed in the adjacent tabs.
                          </p>
                        )}
                      </div>

                      {/* COMPREHENSIVE CLICKABLE SOURCE PROVENANCE AT BOTTOM OF EVIDENCE TAB */}
                      <div className="border border-teal-200 rounded-lg p-4 bg-teal-50/40 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-teal-100">
                          <span className="text-xs font-bold uppercase tracking-wider text-teal-950 flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-teal-700" />
                            Primary Outbound Evidence Sources & Registries
                          </span>
                          <span className="text-[11px] font-mono text-teal-800">
                            {selectedCandidate.clinicalTrials.length} Trials · {selectedCandidate.citations.length} Papers
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          All clinical and scientific findings for this hypothesis were collected through open, public biomedical APIs. Inspect the direct primary source registries:
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <a
                            href={candidateClinicalTrialsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-teal-900 shadow-2xs transition-colors"
                          >
                            <span>Search {selectedCandidate.condition} on ClinicalTrials.gov</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>

                          <a
                            href={candidatePubMedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-teal-900 shadow-2xs transition-colors"
                          >
                            <span>Search {drug.genericName} + {selectedCandidate.condition} on PubMed</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>

                          <a
                            href={rxNormUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-teal-900 shadow-2xs transition-colors"
                          >
                            <span>RxNorm RxCUI: {drug.rxNormId || drug.genericName}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ──────────────────────────────────────────────────────────
                      TAB 3: CLINICAL TRIALS REGISTRY
                      ────────────────────────────────────────────────────────── */}
                  {activeTab === 'trials' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                        <span>Direct interventional studies from ClinicalTrials.gov API v2.</span>
                        <span className="font-medium text-slate-700">{selectedCandidate.clinicalTrials.length} Trials Found</span>
                      </div>

                      {selectedCandidate.clinicalTrials.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded border border-slate-200">
                          No interventional trials matching this drug-condition pair were identified in the registry.
                        </p>
                      ) : (
                        selectedCandidate.clinicalTrials.map((trial) => (
                          <div key={trial.nctId} className="border border-slate-200 rounded-lg p-3.5 bg-white hover:bg-slate-50/50 transition-colors space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <a
                                    href={trial.studyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1"
                                    title="Open trial record on ClinicalTrials.gov"
                                  >
                                    <span>{trial.nctId}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    {trial.phase}
                                  </span>
                                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                                    trial.status.toUpperCase().includes('COMPLETED')
                                      ? 'bg-emerald-50 text-emerald-800'
                                      : trial.status.toUpperCase().includes('RECRUITING')
                                      ? 'bg-blue-50 text-blue-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {trial.status}
                                  </span>
                                </div>
                                <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                                  {trial.title}
                                </h4>
                              </div>

                              <a
                                href={trial.studyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-teal-800 hover:underline shrink-0 self-start"
                              >
                                <span>ClinicalTrials.gov</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>

                            <div className="text-xs text-slate-600 space-y-0.5">
                              {trial.leadSponsor && <p><strong>Lead Sponsor:</strong> {trial.leadSponsor}</p>}
                              {trial.completionDate && <p><strong>Completion:</strong> {trial.completionDate}</p>}
                              {trial.briefSummary && (
                                <p className="text-slate-500 pt-1 line-clamp-2">
                                  {trial.briefSummary}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}

                      {/* PROVENANCE AT BOTTOM OF TRIALS */}
                      <div className="pt-3 border-t border-slate-100 bg-slate-50 rounded-lg p-3 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-teal-700" />
                          Source Authority: US National Library of Medicine ClinicalTrials.gov PRS v2 API
                        </span>
                        <a
                          href={candidateClinicalTrialsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-teal-800 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Live ClinicalTrials.gov Query</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* ──────────────────────────────────────────────────────────
                      TAB 4: PUBMED LITERATURE
                      ────────────────────────────────────────────────────────── */}
                  {activeTab === 'literature' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                        <span>Peer-reviewed scientific citations indexed in NCBI PubMed.</span>
                        <span className="font-medium text-slate-700">{selectedCandidate.citations.length} Publications</span>
                      </div>

                      {selectedCandidate.citations.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded border border-slate-200">
                          No PubMed publications indexed matching this drug-condition hypothesis.
                        </p>
                      ) : (
                        selectedCandidate.citations.map((cit) => (
                          <div key={cit.pmid} className="border border-slate-200 rounded-lg p-3.5 bg-white hover:bg-slate-50/50 transition-colors space-y-1.5">
                            <div className="flex items-start justify-between gap-3">
                              <a
                                href={cit.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs font-semibold text-teal-800 hover:underline bg-slate-100 hover:bg-teal-50 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1"
                              >
                                <span>PMID: {cit.pmid}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                              <a
                                href={cit.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-teal-800 hover:underline shrink-0"
                              >
                                <span>PubMed</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>

                            <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                              {cit.title}
                            </h4>

                            <p className="text-xs text-slate-600">
                              {cit.authors.slice(0, 4).join(', ')}{cit.authors.length > 4 ? ' et al.' : ''} · <em>{cit.journal}</em> ({cit.pubDate})
                            </p>

                            {cit.doi && (
                              <p className="text-[11px] font-mono text-slate-400">
                                DOI: {cit.doi}
                              </p>
                            )}
                          </div>
                        ))
                      )}

                      {/* PROVENANCE AT BOTTOM OF LITERATURE */}
                      <div className="pt-3 border-t border-slate-100 bg-slate-50 rounded-lg p-3 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-teal-700" />
                          Source Authority: National Center for Biotechnology Information (NCBI) Entrez E-Utilities
                        </span>
                        <a
                          href={candidatePubMedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-teal-800 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Live PubMed Query</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* ──────────────────────────────────────────────────────────
                      TAB 5: 5-PILLAR SCORE RUBRIC
                      ────────────────────────────────────────────────────────── */}
                  {activeTab === 'scoring' && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex items-baseline justify-between mb-1">
                          <h3 className="text-sm font-bold text-slate-900">
                            Transparent Readiness Score: {selectedCandidate.evidenceScore.totalScore} / 100
                          </h3>
                          <span className="text-xs text-slate-500">
                            Deterministic Formulated Rubric
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Evaluates progress across 5 scientific pillars: clinical trial milestones, population volume, outcome consistency, mechanistic plausibility, and safety alignment.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="border border-slate-200 rounded-lg p-3 bg-white">
                          <div className="flex justify-between font-semibold text-slate-800 mb-1">
                            <span>Clinical Trial Evidence</span>
                            <span className="font-mono text-teal-800">{selectedCandidate.evidenceScore.clinicalTrialScore} / 40</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                            <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(selectedCandidate.evidenceScore.clinicalTrialScore / 40) * 100}%` }} />
                          </div>
                          <p className="text-[11px] text-slate-500">Phase progression, completion rate, and registration volume.</p>
                        </div>

                        <div className="border border-slate-200 rounded-lg p-3 bg-white">
                          <div className="flex justify-between font-semibold text-slate-800 mb-1">
                            <span>Human / Observational Evidence</span>
                            <span className="font-mono text-teal-800">{selectedCandidate.evidenceScore.humanObservationalScore} / 20</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                            <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(selectedCandidate.evidenceScore.humanObservationalScore / 20) * 100}%` }} />
                          </div>
                          <p className="text-[11px] text-slate-500">Peer-reviewed observational studies and literature volume.</p>
                        </div>

                        <div className="border border-slate-200 rounded-lg p-3 bg-white">
                          <div className="flex justify-between font-semibold text-slate-800 mb-1">
                            <span>Mechanistic & Target Plausibility</span>
                            <span className="font-mono text-teal-800">{selectedCandidate.evidenceScore.mechanisticScore} / 20</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                            <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(selectedCandidate.evidenceScore.mechanisticScore / 20) * 100}%` }} />
                          </div>
                          <p className="text-[11px] text-slate-500">Receptor binding, pathway interaction, and biological rationale.</p>
                        </div>

                        <div className="border border-slate-200 rounded-lg p-3 bg-white">
                          <div className="flex justify-between font-semibold text-slate-800 mb-1">
                            <span>Reproducibility & Publication Signals</span>
                            <span className="font-mono text-teal-800">{selectedCandidate.evidenceScore.reproducibilityScore} / 10</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                            <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(selectedCandidate.evidenceScore.reproducibilityScore / 10) * 100}%` }} />
                          </div>
                          <p className="text-[11px] text-slate-500">Cross-institutional replication and independent study sponsors.</p>
                        </div>

                        <div className="border border-slate-200 rounded-lg p-3 bg-white sm:col-span-2">
                          <div className="flex justify-between font-semibold text-slate-800 mb-1">
                            <span>Safety Profile Compatibility</span>
                            <span className="font-mono text-teal-800">{selectedCandidate.evidenceScore.safetyCompatibilityScore} / 10</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
                            <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(selectedCandidate.evidenceScore.safetyCompatibilityScore / 10) * 100}%` }} />
                          </div>
                          <p className="text-[11px] text-slate-500">Absence of acute toxicity overlap and clinical feasibility.</p>
                        </div>
                      </div>

                      {/* PROVENANCE AT BOTTOM OF SCORING */}
                      <div className="pt-3 border-t border-slate-100 bg-slate-50 rounded-lg p-3 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-teal-700" />
                          Evaluation Rubric Audit: 100% deterministic formula based on NIH & FDA guidelines
                        </span>
                        <Link
                          href="/methodology"
                          className="font-semibold text-teal-800 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Full Methodology Rubric</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500 flex-1 flex flex-col items-center justify-center space-y-2">
                <FlaskConical className="w-8 h-8 text-slate-300" />
                <p className="font-semibold text-slate-700">No Candidate Selected</p>
                <p>Select any condition from the left rail to view its live evidence dossier.</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

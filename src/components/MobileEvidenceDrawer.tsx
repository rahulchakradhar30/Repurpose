'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  DrugConcept, 
  RepurposingCandidate, 
  AISummary, 
  EvidenceStatus 
} from '@/types';
import { RepurposeCompass } from './RepurposeCompass';
import { SaveToNotebookButton } from './SaveToNotebookButton';
import { PrintSummaryButton } from './PrintSummaryButton';
import { 
  X, 
  ExternalLink, 
  Share2, 
  Check, 
  Compass, 
  FileText, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ArrowRight, 
  Database, 
  Loader2,
  Activity
} from 'lucide-react';

interface MobileEvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  drug: DrugConcept;
  candidate: RepurposingCandidate | null;
  candidates: RepurposingCandidate[];
  activeTab: 'compass' | 'evidence' | 'trials' | 'literature' | 'scoring';
  onTabChange: (tab: 'compass' | 'evidence' | 'trials' | 'literature' | 'scoring') => void;
  aiSummary: AISummary | null;
  isAiLoading: boolean;
  onOpenExportModal: () => void;
  candidateClinicalTrialsUrl: string;
  candidatePubMedUrl: string;
  rxNormUrl: string;
}

export function MobileEvidenceDrawer({
  isOpen,
  onClose,
  drug,
  candidate,
  candidates,
  activeTab,
  onTabChange,
  aiSummary,
  isAiLoading,
  onOpenExportModal,
  candidateClinicalTrialsUrl,
  candidatePubMedUrl,
  rxNormUrl,
}: MobileEvidenceDrawerProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Touch drag-to-dismiss state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef<number>(0);
  const currentDragY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) {
      currentDragY.current = deltaY;
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentDragY.current > 75) {
      onClose();
    }
    setDragOffset(0);
    currentDragY.current = 0;
  };

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !candidate) return null;

  const score = candidate.readinessScore ?? candidate.evidenceScore?.totalScore ?? 0;
  const tier = candidate.readinessTier || candidate.evidenceScore?.evidenceTier || 'Active Evaluation';
  const breakdown = candidate.readinessBreakdown || (candidate.evidenceScore as any)?.breakdown;

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/evidence/${encodeURIComponent(drug.genericName.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}/${encodeURIComponent(candidate.condition.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  const getStatusBadgeStyle = (status: EvidenceStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Investigational':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'Off-label':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Preclinical':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`${candidate.condition} Evidence Dossier`}
    >
      {/* Backdrop Tap Target */}
      <div 
        className="flex-1 w-full cursor-pointer" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Fluid Bottom Sheet Container */}
      <div 
        ref={drawerRef}
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16,1,0.3,1)'
        }}
        className="w-full bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 animate-in slide-in-from-bottom duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* Pull Handle Header - Interactive Touch Drag to Dismiss */}
        <div 
          className="pt-2.5 pb-2 flex flex-col items-center justify-center shrink-0 bg-slate-50/95 border-b border-slate-100 touch-none cursor-grab active:cursor-grabbing select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors" />
          <span className="text-[9px] font-semibold text-slate-600 mt-1 uppercase tracking-wider">Swipe down to dismiss</span>
        </div>

        {/* Dossier Header Info */}
        <div className="p-4 sm:p-5 bg-slate-50/90 border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(candidate.status)}`}>
                  {candidate.status}
                </span>
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {candidate.highestPhase}
                </span>
                <span className="text-xs text-slate-500 font-mono truncate">
                  for {drug.genericName}
                </span>
              </div>

              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 leading-snug">
                {candidate.condition}
              </h2>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              aria-label="Close evidence drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar: Apple Health Circular Gauge & Research Readiness */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              {/* Apple Health Circular Readiness Meter */}
              <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                <svg className="w-11 h-11 -rotate-90 transform" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="17" stroke="currentColor" strokeWidth="4" className="text-slate-200" fill="transparent" />
                  <circle
                    cx="22" cy="22" r="17"
                    stroke="currentColor" strokeWidth="4"
                    strokeDasharray={106.81}
                    strokeDashoffset={106.81 - (106.81 * Math.min(score, 100)) / 100}
                    strokeLinecap="round"
                    className={score >= 70 ? 'text-teal-600' : score >= 45 ? 'text-blue-600' : 'text-amber-600'}
                    fill="transparent"
                  />
                </svg>
                <span className="absolute font-mono text-xs font-black text-slate-900">
                  {score}
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                  <span>Research Readiness</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-bold text-teal-800">{score}/100</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  {tier}
                </div>
              </div>
            </div>

            {/* Quick Metrics Tag */}
            <div className="text-right text-[11px] text-slate-500 font-mono">
              <div>{candidate.clinicalTrials.length} Study{candidate.clinicalTrials.length === 1 ? '' : 'ies'}</div>
              <div>{candidate.citations.length} Citation{candidate.citations.length === 1 ? '' : 's'}</div>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-3 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTabChange('compass')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'compass'
                ? 'border-teal-700 text-teal-900 bg-teal-50/40 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-teal-700" />
            <span>Compass™</span>
          </button>

          <button
            onClick={() => onTabChange('evidence')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'border-teal-700 text-teal-900 bg-teal-50/40 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            <span>AI Synthesis</span>
          </button>

          <button
            onClick={() => onTabChange('trials')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'trials'
                ? 'border-teal-700 text-teal-900 bg-teal-50/40 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-700" />
            <span>Trials ({candidate.clinicalTrials.length})</span>
          </button>

          <button
            onClick={() => onTabChange('literature')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'literature'
                ? 'border-teal-700 text-teal-900 bg-teal-50/40 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Papers ({candidate.citations.length})</span>
          </button>

          <button
            onClick={() => onTabChange('scoring')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'scoring'
                ? 'border-teal-700 text-teal-900 bg-teal-50/40 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>5-Pillars</span>
          </button>
        </div>

        {/* Scrollable Sheet Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 pb-16">
          
          {/* ──────────────────────────────────────────────────────────
              TAB 1: REPURPOSE COMPASS™
              ────────────────────────────────────────────────────────── */}
          {activeTab === 'compass' && (
            <div className="space-y-4">
              <RepurposeCompass
                candidate={candidate}
                drugName={drug.genericName}
                defaultExpanded={true}
              />

              <div className="pt-3 border-t border-slate-100 bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1.5">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-teal-700" />
                  <span>Primary Scientific Registries:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <a href={candidateClinicalTrialsUrl} target="_blank" rel="noopener noreferrer" className="text-teal-800 underline font-medium inline-flex items-center gap-0.5">
                    <span>ClinicalTrials.gov ({candidate.clinicalTrials.length})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>·</span>
                  <a href={candidatePubMedUrl} target="_blank" rel="noopener noreferrer" className="text-teal-800 underline font-medium inline-flex items-center gap-0.5">
                    <span>PubMed ({candidate.citations.length})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 2: EVIDENCE & AI SYNTHESIS
              ────────────────────────────────────────────────────────── */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Epistemic Research Notice:</strong> Summarizes investigated hypotheses. Not medical advice or off-label prescribing guidance.
                </p>
              </div>

              {/* Trial Outcome Status Alert */}
              {candidate.trialOutcomeStatus && (
                <div className="bg-amber-50 border-l-4 border-amber-600 rounded-r-lg p-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Trial Outcome Status</span>
                  </h4>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {candidate.trialOutcomeStatus}
                  </p>
                </div>
              )}

              {/* Biological Rationale */}
              {candidate.biologicalRationale && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Biological Rationale &amp; Mechanism
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {candidate.biologicalRationale}
                  </p>
                </div>
              )}

              {/* AI-Assisted Synthesis */}
              <div className="border border-slate-200 rounded-lg p-3.5 bg-white space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Evidence Synthesis
                  </span>
                  <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    AI-Assisted
                  </span>
                </div>

                {isAiLoading ? (
                  <div className="py-4 text-center text-xs text-slate-500 space-y-1">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-700 mx-auto" />
                    <p>Synthesizing verified clinical trial and PubMed records...</p>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-2.5 text-xs">
                    <p className="text-slate-800 leading-relaxed">{aiSummary.summary}</p>
                    {aiSummary.mechanismExplanation && (
                      <div className="bg-slate-50 rounded p-2.5 border border-slate-200">
                        <span className="font-semibold text-slate-900 block mb-0.5">Pathway Mechanism:</span>
                        <p className="text-slate-700">{aiSummary.mechanismExplanation}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Evidence brief grounded in verified clinical trial records and PubMed citations.
                  </p>
                )}
              </div>

              {/* Provenance Strip */}
              <div className="pt-2 border-t border-slate-100 bg-slate-50 rounded-lg p-3 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Database className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  Source: DailyMed &amp; PubMed
                </span>
                <a
                  href={candidatePubMedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal-800 hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  <span>PubMed Literature</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 3: CLINICAL TRIALS REGISTRY
              ────────────────────────────────────────────────────────── */}
          {activeTab === 'trials' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>ClinicalTrials.gov Records</span>
                <span className="font-medium text-slate-700">{candidate.clinicalTrials.length} Studies</span>
              </div>

              {candidate.clinicalTrials.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded border border-slate-200">
                  No registered interventional trials matching this exact pair.
                </p>
              ) : (
                candidate.clinicalTrials.map((trial) => (
                  <div key={trial.nctId} className="border border-slate-200 rounded-lg p-3 bg-white space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={trial.studyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1"
                      >
                        <span>{trial.nctId}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {trial.phase}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-900 leading-snug">
                      {trial.title}
                    </h4>

                    {trial.leadSponsor && (
                      <p className="text-[11px] text-slate-500">
                        <strong>Sponsor:</strong> {trial.leadSponsor}
                      </p>
                    )}
                  </div>
                ))
              )}

              {/* Provenance Strip */}
              <div className="pt-2 border-t border-slate-100 bg-slate-50 rounded-lg p-3 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Database className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  Source: ClinicalTrials.gov
                </span>
                <a
                  href={candidateClinicalTrialsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal-800 hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  <span>Live Registry</span>
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
                <span>NCBI PubMed Citations</span>
                <span className="font-medium text-slate-700">{candidate.citations.length} Papers</span>
              </div>

              {candidate.citations.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded border border-slate-200">
                  No peer-reviewed citations indexed for this hypothesis.
                </p>
              ) : (
                candidate.citations.map((cit) => (
                  <div key={cit.pmid} className="border border-slate-200 rounded-lg p-3 bg-white space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={cit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs font-semibold text-teal-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1"
                      >
                        <span>PMID: {cit.pmid}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {cit.pubDate}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-900 leading-snug">
                      {cit.title}
                    </h4>

                    <p className="text-[11px] text-slate-600">
                      <em>{cit.journal}</em>
                    </p>
                  </div>
                ))
              )}

              {/* Provenance Strip */}
              <div className="pt-2 border-t border-slate-100 bg-slate-50 rounded-lg p-3 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Database className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  Source: NCBI Entrez PubMed
                </span>
                <a
                  href={candidatePubMedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal-800 hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  <span>Live PubMed Query</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 5: 5-PILLAR SCORE
              ────────────────────────────────────────────────────────── */}
          {activeTab === 'scoring' && (
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900">5-Pillar Rubric Breakdown</span>
                  <span className="font-mono text-teal-800 font-bold">{score}/100</span>
                </div>
                
                {breakdown ? (
                  <div className="space-y-2 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 pb-0.5">
                        <span>Clinical Trial Maturity</span>
                        <span className="font-mono font-semibold">{breakdown.clinicalTrialMaturity.score}/25</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(breakdown.clinicalTrialMaturity.score / 25) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 pb-0.5">
                        <span>Published Human Evidence</span>
                        <span className="font-mono font-semibold">{breakdown.publishedHumanEvidence.score}/25</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(breakdown.publishedHumanEvidence.score / 25) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 pb-0.5">
                        <span>Mechanistic Plausibility</span>
                        <span className="font-mono font-semibold">{breakdown.mechanisticPlausibility.score}/20</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(breakdown.mechanisticPlausibility.score / 20) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 pb-0.5">
                        <span>Source Quality &amp; Recency</span>
                        <span className="font-mono font-semibold">{breakdown.sourceQualityRecency.score}/15</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(breakdown.sourceQualityRecency.score / 15) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 pb-0.5">
                        <span>Safety Context Compatibility</span>
                        <span className="font-mono font-semibold">{breakdown.safetyContextCompatibility.score}/15</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(breakdown.safetyContextCompatibility.score / 15) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 pb-0.5">
                        <span>Clinical Trial Evidence</span>
                        <span className="font-mono font-semibold">{(candidate.evidenceScore as any)?.clinicalTrialScore ?? 0}/40</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(((candidate.evidenceScore as any)?.clinicalTrialScore ?? 0) / 40) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 pb-0.5">
                        <span>Human / Observational</span>
                        <span className="font-mono font-semibold">{(candidate.evidenceScore as any)?.humanObservationalScore ?? 0}/20</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(((candidate.evidenceScore as any)?.humanObservationalScore ?? 0) / 20) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 pb-0.5">
                        <span>Mechanistic Plausibility</span>
                        <span className="font-mono font-semibold">{(candidate.evidenceScore as any)?.mechanisticScore ?? 0}/20</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(((candidate.evidenceScore as any)?.mechanisticScore ?? 0) / 20) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 pb-0.5">
                        <span>Reproducibility</span>
                        <span className="font-mono font-semibold">{(candidate.evidenceScore as any)?.reproducibilityScore ?? 0}/10</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(((candidate.evidenceScore as any)?.reproducibilityScore ?? 0) / 10) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 pb-0.5">
                        <span>Safety Compatibility</span>
                        <span className="font-mono font-semibold">{(candidate.evidenceScore as any)?.safetyCompatibilityScore ?? 0}/10</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-700 h-full rounded-full" style={{ width: `${(((candidate.evidenceScore as any)?.safetyCompatibilityScore ?? 0) / 10) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Provenance Strip */}
              <div className="pt-2 border-t border-slate-100 bg-slate-50 rounded-lg p-3 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Database className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  Deterministic rubric
                </span>
                <Link
                  href="/methodology"
                  className="font-semibold text-teal-800 hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  <span>Methodology</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Mobile Bottom Action Dock */}
        <div className="p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shrink-0 flex items-center gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-lg">
          <Link
            href={`/evidence/${encodeURIComponent(drug.genericName.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}/${encodeURIComponent(candidate.condition.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))}`}
            className="flex-1 py-2.5 px-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <span>Full Evidence Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div className="shrink-0 flex items-center gap-1.5">
            <SaveToNotebookButton drug={drug} candidate={candidate} showViewLink={false} />
            <PrintSummaryButton label="PDF" onClick={onOpenExportModal} />
            <button
              onClick={handleCopyLink}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs font-semibold inline-flex items-center gap-1 shadow-2xs active:scale-[0.98] ${
                copiedLink ? 'bg-teal-50 text-teal-800 border-teal-300' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Share dossier link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-teal-700" /> : <Share2 className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

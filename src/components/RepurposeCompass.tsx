'use client';

import React, { useState } from 'react';
import { 
  Compass, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  BookOpen, 
  Activity, 
  Microscope, 
  HelpCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  RepurposingCandidate, 
  ResearchState, 
  ContradictionItem, 
  SourceTimelineEvent, 
  ResearchChecklistStep 
} from '@/types';

interface RepurposeCompassProps {
  candidate: RepurposingCandidate;
  drugName: string;
  className?: string;
  defaultExpanded?: boolean;
}

// Visual badge styling for the 8 research states
const RESEARCH_STATE_CONFIG: Record<ResearchState, { label: string; bg: string; text: string; border: string; desc: string }> = {
  'Approved indication': {
    label: 'Approved Indication',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    desc: 'Authorized on official regulatory drug label for this therapeutic condition.'
  },
  'Off-label evidence': {
    label: 'Off-label Evidence',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    desc: 'Documented in published observational or clinical literature outside authorized label indications.'
  },
  'Investigational': {
    label: 'Investigational',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    desc: 'Registered in active or completed interventional clinical trials evaluating efficacy/safety.'
  },
  'Preclinical': {
    label: 'Preclinical Evidence',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    desc: 'In vitro, in vivo, or target binding pathway mechanisms documented without registered clinical trials.'
  },
  'Insufficient evidence': {
    label: 'Insufficient Evidence',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    desc: 'Minimal or preliminary signals; lacks verified trials or replicated published outcomes.'
  },
  'Conflicting evidence': {
    label: 'Conflicting Evidence',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    desc: 'Mixed, inconclusive, or opposing outcomes identified across trials and published literature.'
  },
  'Trial terminated, withdrawn, or suspended': {
    label: 'Trial Terminated / Suspended',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/40',
    desc: 'Clinical evaluation was discontinued, withdrawn prior to enrollment, or suspended.'
  },
  'No verified evidence found': {
    label: 'No Verified Evidence',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    desc: 'No interventional trials or peer-reviewed records verified in primary databases.'
  }
};

export function RepurposeCompass({
  candidate,
  drugName,
  className = '',
  defaultExpanded = false
}: RepurposeCompassProps) {
  const [activeTab, setActiveTab] = useState<'readiness' | 'contradictions' | 'timeline' | 'checklist'>('readiness');
  const [showFullBreakdown, setShowFullBreakdown] = useState(defaultExpanded);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  const state = candidate.researchState || 'Investigational';
  const stateCfg = RESEARCH_STATE_CONFIG[state] || RESEARCH_STATE_CONFIG['Investigational'];
  const breakdown = candidate.readinessBreakdown || {
    clinicalTrialMaturity: { score: 10, max: 25, reason: 'Trial evidence' },
    publishedHumanEvidence: { score: 10, max: 25, reason: 'Published citations' },
    mechanisticPlausibility: { score: 10, max: 20, reason: 'Mechanistic plausibility' },
    sourceQualityRecency: { score: 8, max: 15, reason: 'Primary source coverage' },
    safetyContextCompatibility: { score: 10, max: 15, reason: 'FDA safety context' },
    conflictPenalties: { score: 0, reason: 'No severe conflict detected' },
  };

  const totalScore = candidate.readinessScore ?? candidate.evidenceScore.totalScore;
  const contradictions: ContradictionItem[] = candidate.contradictions || [];
  const timeline: SourceTimelineEvent[] = candidate.timeline || [];
  const checklist: ResearchChecklistStep[] = candidate.checklist || [];

  const toggleStep = (stepId: string) => {
    setCheckedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 45) return 'text-blue-400';
    if (score >= 25) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBadgeBg = (score: number) => {
    if (score >= 70) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (score >= 45) return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    if (score >= 25) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  };

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl ${className}`}>
      {/* Compass Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0 mt-0.5">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Repurpose Compass™
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-mono">
                  {drugName} ➔ {candidate.condition}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                Research Navigation & Evidence Alignment
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Transparent source-linked readiness evaluation. Not an efficacy, clinical safety, or prescribing score.
              </p>
            </div>
          </div>

          {/* Research State Badge & Score Preview */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Research Readiness</div>
              <div className="flex items-baseline justify-end gap-1">
                <span className={`text-2xl font-bold font-mono ${getScoreColor(totalScore)}`}>
                  {totalScore}
                </span>
                <span className="text-xs text-slate-500 font-mono">/100</span>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${stateCfg.bg} ${stateCfg.text} ${stateCfg.border}`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {stateCfg.label}
            </div>
          </div>
        </div>

        {/* State description banner */}
        <div className="mt-3 text-xs text-slate-300 bg-slate-950/50 rounded-lg p-2.5 border border-slate-800/80 flex items-start gap-2">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Research State: {stateCfg.label}</span> — {stateCfg.desc}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-2 bg-slate-950/60 border-b border-slate-800 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('readiness')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'readiness'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Score Breakdown</span>
          <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-800 font-mono text-[10px] text-slate-300">
            {totalScore}/100
          </span>
        </button>

        <button
          onClick={() => setActiveTab('contradictions')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'contradictions'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>What Needs Verification?</span>
          {contradictions.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
              {contradictions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>Source Timeline</span>
          <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-800 font-mono text-[10px] text-slate-300">
            {timeline.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'checklist'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Research Checklist</span>
          <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-800 font-mono text-[10px] text-slate-300">
            {checklist.length}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-4 sm:p-5">
        {/* TAB 1: READINESS SCORE BREAKDOWN */}
        {activeTab === 'readiness' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Transparent Research Readiness Score Breakdown
                </h4>
                <p className="text-xs text-slate-400">
                  Every score component is derived from verified primary source data with deterministic criteria.
                </p>
              </div>
              <button
                onClick={() => setShowFullBreakdown(!showFullBreakdown)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                {showFullBreakdown ? 'Hide details' : 'Show details'}
                {showFullBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Grid of score components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* 1. Clinical trial maturity */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    Clinical-Trial Maturity & Status
                  </span>
                  <span className="font-mono font-bold text-blue-400">
                    {breakdown.clinicalTrialMaturity.score} / {breakdown.clinicalTrialMaturity.max}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(breakdown.clinicalTrialMaturity.score / breakdown.clinicalTrialMaturity.max) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {breakdown.clinicalTrialMaturity.reason}
                </p>
              </div>

              {/* 2. Published human evidence */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    Published Human Evidence
                  </span>
                  <span className="font-mono font-bold text-indigo-400">
                    {breakdown.publishedHumanEvidence.score} / {breakdown.publishedHumanEvidence.max}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(breakdown.publishedHumanEvidence.score / breakdown.publishedHumanEvidence.max) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {breakdown.publishedHumanEvidence.reason}
                </p>
              </div>

              {/* 3. Mechanistic plausibility */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Microscope className="w-3.5 h-3.5 text-purple-400" />
                    Mechanistic / Target Plausibility
                  </span>
                  <span className="font-mono font-bold text-purple-400">
                    {breakdown.mechanisticPlausibility.score} / {breakdown.mechanisticPlausibility.max}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(breakdown.mechanisticPlausibility.score / breakdown.mechanisticPlausibility.max) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {breakdown.mechanisticPlausibility.reason}
                </p>
              </div>

              {/* 4. Source quality & recency */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Source Quality & Recency
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {breakdown.sourceQualityRecency.score} / {breakdown.sourceQualityRecency.max}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(breakdown.sourceQualityRecency.score / breakdown.sourceQualityRecency.max) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {breakdown.sourceQualityRecency.reason}
                </p>
              </div>

              {/* 5. Safety & context compatibility */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
                    Safety & Context Compatibility
                  </span>
                  <span className="font-mono font-bold text-teal-400">
                    {breakdown.safetyContextCompatibility.score} / {breakdown.safetyContextCompatibility.max}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(breakdown.safetyContextCompatibility.score / breakdown.safetyContextCompatibility.max) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {breakdown.safetyContextCompatibility.reason}
                </p>
              </div>

              {/* 6. Conflict penalties */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Evidence-Conflict Penalties
                  </span>
                  <span className={`font-mono font-bold ${breakdown.conflictPenalties.score < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {breakdown.conflictPenalties.score} pts
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${breakdown.conflictPenalties.score < 0 ? 'bg-rose-500' : 'bg-slate-700'}`}
                    style={{ width: `${Math.min(100, Math.abs(breakdown.conflictPenalties.score) * 4)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {breakdown.conflictPenalties.reason}
                </p>
              </div>
            </div>

            {/* Score safeguards notice */}
            <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/40 text-xs text-indigo-300/90 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-indigo-200">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                Score Methodology & Safeguards
              </div>
              <p className="text-[11px] text-indigo-300/80 leading-relaxed">
                A hypothesis with 0 published citations is permanently capped at max 55/100 and will never be labeled &quot;High Readiness&quot;. Registered clinical trials indicate active investigation, not confirmed outcome efficacy.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: CONTRADICTIONS PANEL ("What needs verification?") */}
        {activeTab === 'contradictions' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  What Needs Verification?
                </h4>
                <p className="text-xs text-slate-400">
                  Algorithmic gaps, unconfirmed trial milestones, safety contraindications, and conflicting signals detected.
                </p>
              </div>
            </div>

            {contradictions.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-950/50 border border-slate-800/80">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <h5 className="text-sm font-semibold text-slate-200">No Critical Contradictions Detected</h5>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Primary source records align across ClinicalTrials.gov and PubMed with no uncharacterized warnings or trial terminations.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {contradictions.map((c) => {
                  const isCrit = c.severity === 'critical' || c.severity === 'high';
                  const isWarn = c.severity === 'warning' || c.severity === 'medium';
                  const severityStyles = isCrit
                    ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                    : isWarn
                    ? 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                    : 'bg-blue-950/20 border-blue-900/40 text-blue-300';

                  const iconColor = isCrit
                    ? 'text-rose-400'
                    : isWarn
                    ? 'text-amber-400'
                    : 'text-blue-400';

                  return (
                    <div 
                      key={c.id} 
                      className={`p-3.5 rounded-lg border flex items-start gap-3 text-xs ${severityStyles}`}
                    >
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-100">{c.title}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-800 text-slate-400">
                            {c.category}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-[11px]">{c.description}</p>
                        <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                          <ArrowRight className="w-3 h-3 text-indigo-400" />
                          <span className="text-slate-300">Action:</span> {c.recommendedAction}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROVENANCE TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Chronological Source-Provenance Timeline
              </h4>
              <p className="text-xs text-slate-400">
                Directly attributable event sequence tracked from FDA labels, ClinicalTrials.gov, and PubMed citations.
              </p>
            </div>

            {timeline.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-950/50 border border-slate-800">
                <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No dated events registered for this candidate pair.</p>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-slate-800 space-y-4 my-2">
                {timeline.map((event) => (
                  <div key={event.id} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-indigo-400 group-hover:border-indigo-300 transition-colors" />
                    
                    <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-all text-xs space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-semibold text-slate-200">{event.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {event.date}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950/40 border border-indigo-800/50 text-indigo-300">
                            {event.source}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {event.summary}
                      </p>

                      {event.sourceUrl && (
                        <div className="pt-1">
                          <a
                            href={event.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <span>Inspect source record ({event.identifier || event.source})</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RESEARCH NEXT-STEP CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Deterministic Non-Clinical Research Next Steps
              </h4>
              <p className="text-xs text-slate-400">
                Actionable next investigation steps for literature review and evidence verification. Strictly for research; not patient care.
              </p>
            </div>

            <div className="space-y-2">
              {checklist.map((step) => {
                const isChecked = checkedSteps[step.id] || false;
                return (
                  <div
                    key={step.id}
                    onClick={() => toggleStep(step.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all text-xs flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-950/15 border-emerald-900/40 opacity-75'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked 
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                          : 'border-slate-600 bg-slate-900'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          {step.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {step.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

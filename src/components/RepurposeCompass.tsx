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

// Visual badge styling for the 8 research states matching Explore light palette
const RESEARCH_STATE_CONFIG: Record<ResearchState, { label: string; bg: string; text: string; border: string; desc: string }> = {
  'Approved indication': {
    label: 'Approved Indication',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    desc: 'Authorized on official regulatory drug label for this therapeutic condition.'
  },
  'Off-label evidence': {
    label: 'Off-label Evidence',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    desc: 'Documented in published observational or clinical literature outside authorized label indications.'
  },
  'Investigational': {
    label: 'Investigational',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    desc: 'Registered in active or completed interventional clinical trials evaluating efficacy/safety.'
  },
  'Preclinical': {
    label: 'Preclinical Evidence',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    desc: 'In vitro, in vivo, or target binding pathway mechanisms documented without registered clinical trials.'
  },
  'Insufficient evidence': {
    label: 'Insufficient Evidence',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-200',
    desc: 'Minimal or preliminary signals; lacks verified trials or replicated published outcomes.'
  },
  'Conflicting evidence': {
    label: 'Conflicting Evidence',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    desc: 'Mixed, inconclusive, or opposing outcomes identified across trials and published literature.'
  },
  'Trial terminated, withdrawn, or suspended': {
    label: 'Trial Terminated / Suspended',
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
    desc: 'Clinical evaluation was discontinued, withdrawn prior to enrollment, or suspended.'
  },
  'No verified evidence found': {
    label: 'No Verified Evidence',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
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
    if (score >= 70) return 'text-teal-800';
    if (score >= 45) return 'text-blue-700';
    if (score >= 25) return 'text-amber-700';
    return 'text-rose-700';
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs ${className}`}>
      {/* Compass Header Banner */}
      <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 shrink-0 mt-0.5">
              <Compass className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                  Repurpose Compass™
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-mono">
                  {drugName} ➔ {candidate.condition}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                Research Navigation &amp; Evidence Alignment
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Transparent source-linked readiness evaluation. Not an efficacy, clinical safety, or prescribing score.
              </p>
            </div>
          </div>

          {/* Research State Badge & Score Preview */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Research Readiness</div>
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
        <div className="mt-3 text-xs text-slate-700 bg-white rounded-lg p-2.5 border border-slate-200 flex items-start gap-2 shadow-xs">
          <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900">Research State: {stateCfg.label}</span> — {stateCfg.desc}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-2 bg-slate-100/70 border-b border-slate-200 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('readiness')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'readiness'
              ? 'bg-white text-teal-900 border border-slate-200 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-teal-700" />
          <span>Score Breakdown</span>
          <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-700 border border-slate-200">
            {totalScore}/100
          </span>
        </button>

        <button
          onClick={() => setActiveTab('contradictions')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'contradictions'
              ? 'bg-white text-amber-900 border border-slate-200 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>What Needs Verification?</span>
          {contradictions.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-mono text-[10px] font-bold border border-amber-200">
              {contradictions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'bg-white text-blue-900 border border-slate-200 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Source Timeline</span>
          <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-700 border border-slate-200">
            {timeline.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'checklist'
              ? 'bg-white text-teal-900 border border-slate-200 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>Research Checklist</span>
          <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-100 font-mono text-[10px] text-slate-700 border border-slate-200">
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
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-700" />
                  Transparent Research Readiness Score Breakdown
                </h4>
                <p className="text-xs text-slate-600">
                  Every score component is derived from verified primary source data with deterministic criteria.
                </p>
              </div>
              <button
                onClick={() => setShowFullBreakdown(!showFullBreakdown)}
                className="text-xs text-teal-800 hover:text-teal-900 flex items-center gap-1 font-medium"
              >
                {showFullBreakdown ? 'Hide details' : 'Show details'}
                {showFullBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Grid of score components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* 1. Clinical trial maturity */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-700" />
                    Clinical-Trial Maturity &amp; Status
                  </span>
                  <span className="font-mono font-bold text-teal-800">
                    {breakdown.clinicalTrialMaturity.score} / {breakdown.clinicalTrialMaturity.max}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(breakdown.clinicalTrialMaturity.score / breakdown.clinicalTrialMaturity.max) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {breakdown.clinicalTrialMaturity.reason}
                </p>
              </div>

              {/* 2. Published human evidence */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                    Published Human Evidence
                  </span>
                  <span className="font-mono font-bold text-blue-800">
                    {breakdown.publishedHumanEvidence.score} / {breakdown.publishedHumanEvidence.max}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(breakdown.publishedHumanEvidence.score / breakdown.publishedHumanEvidence.max) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {breakdown.publishedHumanEvidence.reason}
                </p>
              </div>

              {/* 3. Mechanistic plausibility */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Microscope className="w-3.5 h-3.5 text-purple-700" />
                    Mechanistic / Target Plausibility
                  </span>
                  <span className="font-mono font-bold text-purple-800">
                    {breakdown.mechanisticPlausibility.score} / {breakdown.mechanisticPlausibility.max}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(breakdown.mechanisticPlausibility.score / breakdown.mechanisticPlausibility.max) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {breakdown.mechanisticPlausibility.reason}
                </p>
              </div>

              {/* 4. Source quality & recency */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    Source Quality &amp; Recency
                  </span>
                  <span className="font-mono font-bold text-emerald-800">
                    {breakdown.sourceQualityRecency.score} / {breakdown.sourceQualityRecency.max}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(breakdown.sourceQualityRecency.score / breakdown.sourceQualityRecency.max) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {breakdown.sourceQualityRecency.reason}
                </p>
              </div>

              {/* 5. Safety & context compatibility */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                    Safety &amp; Context Compatibility
                  </span>
                  <span className="font-mono font-bold text-amber-800">
                    {breakdown.safetyContextCompatibility.score} / {breakdown.safetyContextCompatibility.max}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(breakdown.safetyContextCompatibility.score / breakdown.safetyContextCompatibility.max) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {breakdown.safetyContextCompatibility.reason}
                </p>
              </div>

              {/* 6. Conflict penalties */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                    Evidence-Conflict Penalties
                  </span>
                  <span className={`font-mono font-bold ${breakdown.conflictPenalties.score < 0 ? 'text-rose-700' : 'text-slate-600'}`}>
                    {breakdown.conflictPenalties.score} pts
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${breakdown.conflictPenalties.score < 0 ? 'bg-rose-500' : 'bg-slate-300'}`}
                    style={{ width: `${Math.min(100, Math.abs(breakdown.conflictPenalties.score) * 4)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {breakdown.conflictPenalties.reason}
                </p>
              </div>
            </div>

            {/* Score safeguards notice */}
            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-teal-950">
                <Info className="w-3.5 h-3.5 text-teal-700" />
                Score Methodology &amp; Safeguards
              </div>
              <p className="text-[11px] text-teal-900/90 leading-relaxed">
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
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  What Needs Verification?
                </h4>
                <p className="text-xs text-slate-600">
                  Algorithmic gaps, unconfirmed trial milestones, safety contraindications, and conflicting signals detected.
                </p>
              </div>
            </div>

            {contradictions.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-teal-700 mx-auto mb-2 opacity-90" />
                <h5 className="text-sm font-semibold text-slate-900">No Critical Contradictions Detected</h5>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  Primary source records align across ClinicalTrials.gov and PubMed with no uncharacterized warnings or trial terminations.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {contradictions.map((c) => {
                  const isCrit = c.severity === 'critical' || c.severity === 'high';
                  const isWarn = c.severity === 'warning' || c.severity === 'medium';
                  const severityStyles = isCrit
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : isWarn
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-blue-50 border-blue-200 text-blue-900';

                  const iconColor = isCrit
                    ? 'text-rose-600'
                    : isWarn
                    ? 'text-amber-600'
                    : 'text-blue-600';

                  return (
                    <div 
                      key={c.id} 
                      className={`p-3.5 rounded-lg border flex items-start gap-3 text-xs ${severityStyles}`}
                    >
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{c.title}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                            {c.category}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-[11px]">{c.description}</p>
                        <div className="pt-1 text-[11px] text-slate-700 flex items-center gap-1.5 font-medium">
                          <ArrowRight className="w-3 h-3 text-teal-700" />
                          <span className="text-slate-900">Action:</span> {c.recommendedAction}
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
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-700" />
                Chronological Source-Provenance Timeline
              </h4>
              <p className="text-xs text-slate-600">
                Directly attributable event sequence tracked from FDA labels, ClinicalTrials.gov, and PubMed citations.
              </p>
            </div>

            {timeline.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600">No dated events registered for this candidate pair.</p>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 my-2">
                {timeline.map((event) => (
                  <div key={event.id} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-white border-2 border-teal-600 group-hover:border-teal-700 transition-colors" />
                    
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all text-xs space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-semibold text-slate-900">{event.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {event.date}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800">
                            {event.source}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        {event.summary}
                      </p>

                      {event.sourceUrl && (
                        <div className="pt-1">
                          <a
                            href={event.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-teal-800 hover:text-teal-900 font-medium transition-colors"
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
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-700" />
                Deterministic Non-Clinical Research Next Steps
              </h4>
              <p className="text-xs text-slate-600">
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
                        ? 'bg-teal-50/50 border-teal-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked 
                          ? 'bg-teal-700 border-teal-700 text-white' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {step.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                          {step.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
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

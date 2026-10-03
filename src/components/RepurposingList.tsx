'use client';

import { useState, useMemo } from 'react';
import { 
  RepurposingCandidate, 
  EvidenceStatus 
} from '@/types';
import { 
  ArrowUpDown, 
  FlaskConical, 
  AlertTriangle, 
  ChevronRight, 
  Filter,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface RepurposingListProps {
  candidates: RepurposingCandidate[];
  onSelectCandidate: (candidate: RepurposingCandidate) => void;
  drugGenericName: string;
}

type SortOption = 'score_desc' | 'score_asc' | 'trials_desc' | 'name_asc';

export function RepurposingList({
  candidates,
  onSelectCandidate,
  drugGenericName,
}: RepurposingListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('score_desc');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredAndSorted = useMemo(() => {
    let list = [...candidates];

    if (statusFilter !== 'ALL') {
      list = list.filter((c) => c.status === statusFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'score_desc') {
        return b.evidenceScore.totalScore - a.evidenceScore.totalScore;
      }
      if (sortBy === 'score_asc') {
        return a.evidenceScore.totalScore - b.evidenceScore.totalScore;
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
  }, [candidates, sortBy, statusFilter]);

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

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-teal-800 bg-teal-50 border-teal-300';
    if (score >= 45) return 'text-slate-800 bg-slate-100 border-slate-300';
    return 'text-amber-900 bg-amber-50 border-amber-300';
  };

  return (
    <section aria-labelledby="repurposing-candidates-heading" className="space-y-4">
      {/* Controls & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200">
        <div>
          <h2 id="repurposing-candidates-heading" className="text-base sm:text-lg font-bold text-slate-900">
            Investigational & Repurposing Candidates ({candidates.length})
          </h2>
          <p className="text-xs text-slate-500">
            Conditions investigated in clinical trials and literature beyond current FDA-approved indications for {drugGenericName}.
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
              aria-label="Filter by evidence status"
            >
              <option value="ALL">All Statuses</option>
              <option value="Investigational">Investigational</option>
              <option value="Off-label">Off-label</option>
              <option value="Preclinical">Preclinical</option>
              <option value="Unsupported">Unsupported</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
              aria-label="Sort candidate conditions"
            >
              <option value="score_desc">Score: High to Low</option>
              <option value="score_asc">Score: Low to High</option>
              <option value="trials_desc">Most Clinical Trials</option>
              <option value="name_asc">Condition Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Cards List */}
      {filteredAndSorted.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <FlaskConical className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">
            No candidate conditions matched the current filters
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {candidates.length === 0
              ? 'No non-approved interventional conditions were identified in registered trials for this drug entity.'
              : 'Try selecting "All Statuses" to view all evaluated candidates.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredAndSorted.map((cand) => {
            const score = cand.evidenceScore.totalScore;
            return (
              <div
                key={cand.id}
                onClick={() => onSelectCandidate(cand)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCandidate(cand);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View evidence details for ${cand.condition}, score ${score} of 100`}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-4 sm:p-5 transition-all text-left shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadgeStyle(cand.status)}`}>
                        {cand.status}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {cand.highestPhase}
                      </span>
                      {cand.evidenceScore.evidenceTier && (
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                          cand.evidenceScore.evidenceTier === 'Insufficient evidence'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : cand.evidenceScore.evidenceTier === 'High'
                            ? 'bg-teal-50 text-teal-800 border-teal-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          Tier: {cand.evidenceScore.evidenceTier}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">
                        {cand.clinicalTrials.length} Trial{cand.clinicalTrials.length === 1 ? '' : 's'} · {cand.citations.length} Citation{cand.citations.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {cand.condition}
                    </h3>

                    {/* Trial Outcome Status Alert Banner */}
                    {cand.trialOutcomeStatus && (
                      <div className="flex items-start gap-1.5 text-xs text-amber-900 bg-amber-50/90 border border-amber-200 rounded p-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span className="font-medium leading-snug">
                          {cand.trialOutcomeStatus}
                        </span>
                      </div>
                    )}

                    {/* Evidence Note */}
                    {cand.evidenceNote && (
                      <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded p-2">
                        <span className="font-semibold text-slate-700">Evidence Note: </span>
                        {cand.evidenceNote}
                      </p>
                    )}

                    {/* Direct ClinicalTrials.gov Links & NCT Details */}
                    {cand.clinicalTrials.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
                        <span className="text-[11px] font-medium text-slate-500">ClinicalTrials.gov:</span>
                        {cand.clinicalTrials.slice(0, 3).map((trial) => (
                          <a
                            key={trial.nctId}
                            href={trial.studyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 px-1.5 py-0.5 rounded transition-colors"
                            title={`${trial.title} (${trial.phase}, ${trial.status})`}
                          >
                            <span>{trial.nctId}</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-[10px] text-slate-500">{trial.phase}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                          </a>
                        ))}
                        {cand.clinicalTrials.length > 3 && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            +{cand.clinicalTrials.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Uncertainty language tags */}
                    {cand.evidenceScore.uncertaintyFlags.length > 0 && !cand.trialOutcomeStatus && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {cand.evidenceScore.uncertaintyFlags[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Score & Visual Bar & Dossier Link */}
                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 sm:min-w-[140px] pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[11px] font-medium text-slate-500">Readiness:</span>
                      <span className={`text-base font-bold px-2 py-0.5 rounded border font-mono ${getScoreColor(score)}`}>
                        {score}/100
                      </span>
                    </div>

                    <div className="w-24 sm:w-28 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
                      />
                    </div>

                    {cand.contradictions && cand.contradictions.length > 0 && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        {cand.contradictions.length} verification flags
                      </span>
                    )}

                    <div className="hidden sm:flex items-center gap-1 text-xs text-indigo-700 font-medium hover:underline mt-1">
                      <span>Inspect Compass</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

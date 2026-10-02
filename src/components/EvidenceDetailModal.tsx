'use client';

import { useState, useEffect } from 'react';
import { 
  RepurposingCandidate, 
  DrugConcept, 
  AISummary 
} from '@/types';
import { 
  X, 
  ExternalLink, 
  AlertTriangle, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  Loader2, 
  Info,
  CheckCircle,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { generateRIS, generateCSV, downloadFile } from '@/lib/export';

interface EvidenceDetailModalProps {
  candidate: RepurposingCandidate;
  drug: DrugConcept;
  onClose: () => void;
  onSaveToResearch: (notes: string) => void;
  isSaved: boolean;
}

export function EvidenceDetailModal({
  candidate,
  drug,
  onClose,
  onSaveToResearch,
  isSaved,
}: EvidenceDetailModalProps) {
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAttempted, setAiAttempted] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'evidence' | 'trials' | 'literature' | 'scoring'>('evidence');

  // Load AI Summary on mount if not already fetched
  useEffect(() => {
    let isMounted = true;
    async function fetchAI() {
      setIsAiLoading(true);
      try {
        const res = await fetch('/api/repurposing/ai-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ drug, candidate }),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.aiSummary) {
            setAiSummary(data.aiSummary);
          }
        }
      } catch (err) {
        console.error('AI summary fetch failed:', err);
      } finally {
        if (isMounted) {
          setIsAiLoading(false);
          setAiAttempted(true);
        }
      }
    }

    fetchAI();

    return () => {
      isMounted = false;
    };
  }, [candidate, drug]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleExportRIS = () => {
    const risContent = generateRIS(drug, candidate);
    const safeCond = candidate.condition.toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadFile(risContent, `${drug.genericName}_${safeCond}_citations.ris`, 'application/x-research-info-systems');
  };

  const handleExportCSV = () => {
    const csvContent = generateCSV(drug, [candidate]);
    const safeCond = candidate.condition.toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadFile(csvContent, `${drug.genericName}_${safeCond}_evidence.csv`, 'text/csv;charset=utf-8;');
  };

  const breakdown = candidate.evidenceScore;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white border border-slate-300 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {candidate.status}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {drug.genericName}
              </span>
            </div>
            <h2 id="modal-title" className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {candidate.condition}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-teal-400 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar (Export, Save, Score) */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Evidence Score:</span>
            <span className="font-bold font-mono text-sm px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-300">
              {breakdown.totalScore}/100
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-600 font-medium hidden sm:inline">
              Highest Phase: {candidate.highestPhase}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportRIS}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-medium transition-colors"
              title="Export citations for Zotero, Mendeley, EndNote"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              <span>Export RIS</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-medium transition-colors"
              title="Export spreadsheet of trials and citations"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => onSaveToResearch(userNotes)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium border transition-colors ${
                isSaved
                  ? 'bg-teal-700 text-white border-teal-800'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved in Research' : 'Save Candidate'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Evidence & Rationale
          </button>
          <button
            onClick={() => setActiveTab('trials')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'trials'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Clinical Trials ({candidate.clinicalTrials.length})
          </button>
          <button
            onClick={() => setActiveTab('literature')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'literature'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            PubMed Literature ({candidate.citations.length})
          </button>
          <button
            onClick={() => setActiveTab('scoring')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'scoring'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Score Breakdown (5 Pillars)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* TAB 1: Evidence & Rationale */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              {/* Mandatory Non-Clinical Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Research Notice:</strong> This summary presents biomedical hypotheses and registered investigations. It is not an endorsement of off-label prescribing, safety, or clinical efficacy.
                </p>
              </div>

              {/* Uncertainty Badges */}
              {breakdown.uncertaintyFlags.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Evidence Limitations & Uncertainty Flags</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {breakdown.uncertaintyFlags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-700 font-bold">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Why this is being explored */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Why This Is Being Explored
                </h3>
                <p className="text-sm text-slate-800 leading-relaxed bg-slate-50/70 border border-slate-200 rounded-lg p-4">
                  {candidate.biologicalRationale}
                </p>
              </div>

              {/* AI-Assisted Synthesis (With strict label & citations) */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
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
                    <p className="text-[11px] text-slate-400">Strictly enforcing factual adherence to source registries.</p>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-slate-800 leading-relaxed">{aiSummary.summary}</p>
                    </div>

                    {aiSummary.mechanismExplanation && (
                      <div>
                        <span className="font-semibold text-slate-900 block mb-1">Mechanistic Rationale:</span>
                        <p className="text-slate-700">{aiSummary.mechanismExplanation}</p>
                      </div>
                    )}

                    {aiSummary.limitations.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 rounded p-3">
                        <span className="font-semibold text-slate-900 block mb-1">Key Trial Limitations:</span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700 text-xs">
                          {aiSummary.limitations.map((lim, i) => (
                            <li key={i}>{lim}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiSummary.evidenceGaps.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 rounded p-3">
                        <span className="font-semibold text-slate-900 block mb-1">Evidence Gaps:</span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700 text-xs">
                          {aiSummary.evidenceGaps.map((gap, i) => (
                            <li key={i}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Direct Supporting Sources List */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-medium">Direct Supporting Source Identifiers:</span>
                      {aiSummary.sourcesUsed.map((srcId, idx) => (
                        <span key={idx} className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 border border-slate-200">
                          {srcId}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    AI synthesis is unavailable (API key not configured or strict schema validation rejected unverified output). Examine the verified clinical trial records and PubMed citations directly below.
                  </p>
                )}
              </div>

              {/* Personal Research Notes */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <label htmlFor="user-research-notes" className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Researcher Notes & Hypotheses
                </label>
                <textarea
                  id="user-research-notes"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Record observations, dosing trial endpoints, target patient subsets, or protocol questions..."
                  rows={3}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:border-teal-700 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Clinical Trials */}
          {activeTab === 'trials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Verified studies sourced directly from ClinicalTrials.gov API v2.</span>
                <span>{candidate.clinicalTrials.length} Interventional Trials</span>
              </div>

              {candidate.clinicalTrials.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded border border-slate-200">
                  No registered interventional trials for this exact condition found in ClinicalTrials.gov.
                </p>
              ) : (
                <div className="space-y-3">
                  {candidate.clinicalTrials.map((trial) => (
                    <div key={trial.nctId} className="border border-slate-200 rounded-lg p-4 bg-white hover:bg-slate-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                              {trial.nctId}
                            </span>
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
                              Status: {trial.status}
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
                          <span>Open Study</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <p><strong>Lead Sponsor:</strong> {trial.leadSponsor}</p>
                        {trial.completionDate && <p><strong>Completion Date:</strong> {trial.completionDate}</p>}
                        {trial.briefSummary && (
                          <p className="text-slate-500 pt-1 line-clamp-2">
                            {trial.briefSummary}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PubMed Literature */}
          {activeTab === 'literature' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Direct peer-reviewed citations indexed in NCBI PubMed.</span>
                <span>{candidate.citations.length} Publications</span>
              </div>

              {candidate.citations.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded border border-slate-200">
                  No peer-reviewed PubMed publications indexed matching this drug-condition pair.
                </p>
              ) : (
                <div className="space-y-3">
                  {candidate.citations.map((cit) => (
                    <div key={cit.pmid} className="border border-slate-200 rounded-lg p-4 bg-white hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          PMID: {cit.pmid}
                        </span>
                        <a
                          href={cit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-teal-800 hover:underline shrink-0"
                        >
                          <span>PubMed</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-900 leading-snug mb-1">
                        {cit.title}
                      </h4>

                      <p className="text-xs text-slate-600">
                        {cit.authors.join(', ')} · <em>{cit.journal}</em> ({cit.pubDate})
                      </p>

                      {cit.doi && (
                        <p className="text-[11px] font-mono text-slate-400 mt-1">
                          DOI: {cit.doi}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Transparent Score Breakdown */}
          {activeTab === 'scoring' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Transparent Evidence Score: {breakdown.totalScore} / 100
                  </h3>
                  <span className="text-xs text-slate-500">
                    Deterministic 5-Factor Formulation
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Scores represent clinical and biological trial readiness. High scores do not equate to verified efficacy or therapeutic recommendation.
                </p>
              </div>

              {/* 5 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-200 rounded p-3 bg-white">
                  <div className="flex justify-between font-semibold text-slate-800 mb-1">
                    <span>Clinical Trial Evidence</span>
                    <span className="font-mono text-teal-800">{breakdown.clinicalTrialScore} / 40</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-teal-700 h-full" style={{ width: `${(breakdown.clinicalTrialScore / 40) * 100}%` }} />
                  </div>
                  <p className="text-slate-500 text-[11px]">Phase progression, completion rate, and registration volume.</p>
                </div>

                <div className="border border-slate-200 rounded p-3 bg-white">
                  <div className="flex justify-between font-semibold text-slate-800 mb-1">
                    <span>Human / Observational Evidence</span>
                    <span className="font-mono text-teal-800">{breakdown.humanObservationalScore} / 20</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-teal-700 h-full" style={{ width: `${(breakdown.humanObservationalScore / 20) * 100}%` }} />
                  </div>
                  <p className="text-slate-500 text-[11px]">Peer-reviewed observational studies and literature volume in PubMed.</p>
                </div>

                <div className="border border-slate-200 rounded p-3 bg-white">
                  <div className="flex justify-between font-semibold text-slate-800 mb-1">
                    <span>Mechanistic & Target Plausibility</span>
                    <span className="font-mono text-teal-800">{breakdown.mechanisticScore} / 20</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-teal-700 h-full" style={{ width: `${(breakdown.mechanisticScore / 20) * 100}%` }} />
                  </div>
                  <p className="text-slate-500 text-[11px]">Receptor binding, pathway interaction, and biological rationale.</p>
                </div>

                <div className="border border-slate-200 rounded p-3 bg-white">
                  <div className="flex justify-between font-semibold text-slate-800 mb-1">
                    <span>Reproducibility & Publication Signals</span>
                    <span className="font-mono text-teal-800">{breakdown.reproducibilityScore} / 10</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-teal-700 h-full" style={{ width: `${(breakdown.reproducibilityScore / 10) * 100}%` }} />
                  </div>
                  <p className="text-slate-500 text-[11px]">Cross-institutional replication and independent study sponsors.</p>
                </div>

                <div className="border border-slate-200 rounded p-3 bg-white sm:col-span-2">
                  <div className="flex justify-between font-semibold text-slate-800 mb-1">
                    <span>Safety & Contraindication Compatibility</span>
                    <span className="font-mono text-teal-800">{breakdown.safetyCompatibilityScore} / 10</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-teal-700 h-full" style={{ width: `${(breakdown.safetyCompatibilityScore / 10) * 100}%` }} />
                  </div>
                  <p className="text-slate-500 text-[11px]">Absence of boxed warnings or contraindications clashing with the condition population.</p>
                </div>
              </div>

              {/* Contributing Factors */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Contributing Factors Evaluated
                </h4>
                <ul className="space-y-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded p-3">
                  {breakdown.contributingFactors.map((fact, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">
            Citations formatted for academic attribution.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Evidence View
          </button>
        </div>
      </div>
    </div>
  );
}

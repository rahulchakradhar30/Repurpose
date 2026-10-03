'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Scale, 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  ExternalLink,
  Info
} from 'lucide-react';
import { RepurposingCandidate } from '@/types';
import { exportComparisonToCSV, triggerFileDownload } from '@/lib/exportUtils';
import { PUBLISHED_DRUG_REGISTRY } from '@/lib/publishedDrugs';

interface CompareItem {
  drug: string;
  drugSlug: string;
  conditionSlug: string;
  candidate: RepurposingCandidate;
  lastVerifiedDate: string;
}

export default function ComparePage() {
  const [selectedCandidates, setSelectedCandidates] = useState<CompareItem[]>([]);
  const [availablePresets, setAvailablePresets] = useState<CompareItem[]>([]);

  useEffect(() => {
    // Gather presets from published registry
    const presets: CompareItem[] = [];
    Object.values(PUBLISHED_DRUG_REGISTRY).forEach(guide => {
      guide.candidates.forEach(cand => {
        presets.push({
          drug: guide.drug.genericName,
          drugSlug: guide.slug,
          conditionSlug: cand.condition.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          candidate: cand,
          lastVerifiedDate: guide.lastReviewedDate,
        });
      });
    });

    setAvailablePresets(presets);

    // Initial load: 2 items
    if (selectedCandidates.length === 0 && presets.length >= 2) {
      setSelectedCandidates(presets.slice(0, 2));
    }
  }, []);

  const handleAddCandidate = (preset: CompareItem) => {
    if (selectedCandidates.length >= 3) return;
    if (selectedCandidates.some(s => s.drugSlug === preset.drugSlug && s.candidate.condition === preset.candidate.condition)) return;
    setSelectedCandidates(prev => [...prev, preset]);
  };

  const handleRemoveCandidate = (index: number) => {
    setSelectedCandidates(prev => prev.filter((_, i) => i !== index));
  };

  const handleExportCSV = () => {
    const csvContent = exportComparisonToCSV(
      selectedCandidates.map(c => ({
        drug: c.drug,
        candidate: c.candidate,
      }))
    );
    triggerFileDownload(csvContent, 'repurpose_hypotheses_comparison.csv', 'text/csv;charset=utf-8;');
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-16 md:pb-6 text-slate-900">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1 w-full">
        {/* Navigation Breadcrumb & Header */}
        <div className="space-y-3">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-500 no-print">
            <Link href="/" className="hover:text-teal-800 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Compare Workspace</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
                <Scale className="w-3.5 h-3.5" />
                <span>Side-by-Side Hypotheses Comparison (Up to 3)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
                Compare Repurposing Candidates
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-3xl">
                Evaluate readiness scores, trial phases, published literature, and flagged contradiction gaps side-by-side.
              </p>
            </div>

            <div className="flex items-center gap-2 no-print shrink-0">
              <button
                onClick={handleExportCSV}
                disabled={selectedCandidates.length === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-teal-700" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={selectedCandidates.length === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-blue-700" />
                <span>Print Summary</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preset selector banner */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs no-print space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs text-slate-800 font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-700" />
              Add Hypotheses to Workspace ({selectedCandidates.length}/3 selected)
            </div>
            {selectedCandidates.length >= 3 && (
              <span className="text-xs text-amber-700 font-medium">Maximum 3 candidates compared simultaneously.</span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {availablePresets.slice(0, 10).map((preset, idx) => {
              const isSelected = selectedCandidates.some(
                s => s.drugSlug === preset.drugSlug && s.candidate.condition === preset.candidate.condition
              );
              return (
                <button
                  key={idx}
                  disabled={isSelected || selectedCandidates.length >= 3}
                  onClick={() => handleAddCandidate(preset)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors border ${
                    isSelected
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-teal-500 shadow-2xs'
                  }`}
                >
                  + {preset.drug} ➔ {preset.candidate.condition.slice(0, 24)}...
                </button>
              );
            })}
          </div>
        </div>

        {selectedCandidates.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <Scale className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-base font-semibold text-slate-800">No Candidates Selected for Comparison</h2>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Select up to three hypotheses above or from individual drug research dossiers to compare readiness scores, trials, and safety signals.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-4 w-48 text-slate-700 font-semibold uppercase tracking-wider text-[11px] align-top">
                    Hypothesis Attribute
                  </th>
                  {selectedCandidates.map((item, idx) => (
                    <th key={idx} className="p-4 min-w-[280px] max-w-[340px] align-top border-l border-slate-200">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                            Candidate #{idx + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveCandidate(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors no-print"
                            title="Remove from comparison"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div>
                          <div className="text-base font-bold text-slate-900">{item.drug}</div>
                          <div className="text-xs text-teal-800 font-semibold">{item.candidate.condition}</div>
                        </div>
                        <div className="pt-1">
                          <Link
                            href={`/evidence/${item.drugSlug}/${item.conditionSlug}`}
                            className="text-[11px] text-teal-800 hover:text-teal-900 flex items-center gap-1 font-medium no-print"
                          >
                            <span>Open full dossier</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* 1. Research State */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60">Research State</td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-200">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        {item.candidate.researchState || item.candidate.status}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 2. Research Readiness Score */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60">
                    <div>Research Readiness</div>
                    <div className="text-[10px] text-slate-500 font-normal">Score out of 100</div>
                  </td>
                  {selectedCandidates.map((item, idx) => {
                    const score = item.candidate.readinessScore ?? item.candidate.evidenceScore.totalScore;
                    return (
                      <td key={idx} className="p-4 border-l border-slate-200">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-bold font-mono text-teal-800">{score}</span>
                          <span className="text-slate-500 font-mono text-xs">/ 100</span>
                        </div>
                        <div className="text-[10px] text-slate-600 mt-1">
                          Tier: <span className="font-semibold text-slate-800">{item.candidate.readinessTier || item.candidate.evidenceScore.evidenceTier}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Score Breakdown */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60">
                    <div>Score Breakdown</div>
                    <div className="text-[10px] text-slate-500 font-normal">Transparent criteria</div>
                  </td>
                  {selectedCandidates.map((item, idx) => {
                    const b = item.candidate.readinessBreakdown;
                    return (
                      <td key={idx} className="p-4 border-l border-slate-200 space-y-1.5 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Clinical trials (0-25):</span>
                          <span className="text-teal-800 font-bold">{b?.clinicalTrialMaturity.score ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Human literature (0-25):</span>
                          <span className="text-blue-800 font-bold">{b?.publishedHumanEvidence.score ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Mechanism (0-20):</span>
                          <span className="text-purple-800 font-bold">{b?.mechanisticPlausibility.score ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Source quality (0-15):</span>
                          <span className="text-emerald-800 font-bold">{b?.sourceQualityRecency.score ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Safety context (0-15):</span>
                          <span className="text-amber-800 font-bold">{b?.safetyContextCompatibility.score ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Conflict penalties:</span>
                          <span className={`font-bold ${(b?.conflictPenalties.score ?? 0) < 0 ? 'text-rose-700' : 'text-slate-600'}`}>
                            {b?.conflictPenalties.score ?? 0}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 4. Clinical Trials Count & Phase */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60">Clinical Trial Coverage</td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-200 space-y-1">
                      <div className="font-semibold text-slate-900">
                        {item.candidate.clinicalTrials?.length || 0} registered study/studies
                      </div>
                      <div className="text-slate-600">
                        Highest phase: <span className="font-mono text-teal-800 font-semibold">{item.candidate.highestPhase || 'Phase 1'}</span>
                      </div>
                      {item.candidate.trialOutcomeStatus && (
                        <div className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200">
                          {item.candidate.trialOutcomeStatus}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 5. Published Literature */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60">Published Literature</td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-200">
                      <div className="font-semibold text-slate-900">
                        {item.candidate.citations?.length || 0} PubMed citation(s)
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        {item.candidate.citations && item.candidate.citations.length > 0 ? (
                          <span>Latest: &quot;{item.candidate.citations[0].title.slice(0, 60)}...&quot;</span>
                        ) : (
                          <span className="italic text-slate-500">No peer-reviewed citations indexed yet.</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 6. Biological Rationale */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60">Target &amp; Rationale</td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                      {item.candidate.biologicalRationale || 'Pathway mechanism under investigation.'}
                    </td>
                  ))}
                </tr>

                {/* 7. Contradictions & Verification Flags */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60">
                    <div>Verification Needs</div>
                    <div className="text-[10px] text-slate-500 font-normal">Identified gaps &amp; conflicts</div>
                  </td>
                  {selectedCandidates.map((item, idx) => {
                    const flags = item.candidate.contradictions || [];
                    return (
                      <td key={idx} className="p-4 border-l border-slate-200 space-y-1.5">
                        {flags.length === 0 ? (
                          <span className="text-teal-800 font-medium text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" /> No critical contradictions flagged
                          </span>
                        ) : (
                          flags.map((f, fi) => (
                            <div key={fi} className="p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-950">
                              <span className="font-semibold block">{f.title}</span>
                              <span className="text-[10px] text-amber-900">{f.description}</span>
                            </div>
                          ))
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 8. Last Verified Date */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60">Last Verified</td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-200 font-mono text-slate-600 text-[11px]">
                      {item.lastVerifiedDate}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Comparison Research Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            The Repurpose Compare Workspace displays comparative research signals side-by-side to assist hypothesis prioritization. All comparisons are generated deterministically from primary source data (RxNorm, openFDA, PubChem, ClinicalTrials.gov, PubMed). This tool does not provide comparative clinical efficacy rankings or treatment recommendations.
          </p>
        </div>
      </main>
    </div>
  );
}

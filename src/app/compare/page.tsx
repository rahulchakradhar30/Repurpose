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
  AlertTriangle, 
  ShieldAlert, 
  BookOpen, 
  Activity, 
  Compass, 
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
    const exists = selectedCandidates.some(
      s => s.drugSlug === preset.drugSlug && s.candidate.condition === preset.candidate.condition
    );
    if (!exists) {
      setSelectedCandidates([...selectedCandidates, preset]);
    }
  };

  const handleRemoveCandidate = (index: number) => {
    setSelectedCandidates(selectedCandidates.filter((_, i) => i !== index));
  };

  const handleExportCSV = () => {
    if (selectedCandidates.length === 0) return;
    const csvData = exportComparisonToCSV(selectedCandidates);
    triggerFileDownload(csvData, `repurpose_comparison_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 print:bg-white print:text-black">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20 print:static print:border-b-2 print:border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors print:hidden"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-semibold print:text-black">
                  Compare Workspace
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 print:hidden">
                  Up to 3 hypotheses
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2 mt-0.5 print:text-black">
                <Scale className="w-5 h-5 text-indigo-400 print:hidden" />
                Side-by-Side Repurposing Hypothesis Comparison
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleExportCSV}
              disabled={selectedCandidates.length === 0}
              className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Comparison CSV</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={selectedCandidates.length === 0}
              className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Printable Summary</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Selector banner (hidden when printing) */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:hidden space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs text-slate-300 font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Add Hypotheses to Workspace ({selectedCandidates.length}/3 selected)
            </div>
            {selectedCandidates.length >= 3 && (
              <span className="text-xs text-amber-400 font-medium">Maximum 3 candidates compared simultaneously.</span>
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
                      ? 'bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                  }`}
                >
                  + {preset.drug} ➔ {preset.candidate.condition.slice(0, 24)}...
                </button>
              );
            })}
          </div>
        </div>

        {selectedCandidates.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <Scale className="w-12 h-12 text-slate-600 mx-auto" />
            <h2 className="text-base font-semibold text-slate-300">No Candidates Selected for Comparison</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select up to three hypotheses above or from individual drug research dossiers to compare readiness scores, trials, and safety signals.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-4 w-48 text-slate-400 font-semibold uppercase tracking-wider text-[11px] align-top">
                    Hypothesis Attribute
                  </th>
                  {selectedCandidates.map((item, idx) => (
                    <th key={idx} className="p-4 min-w-[280px] max-w-[340px] align-top border-l border-slate-800/80">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                            Candidate #{idx + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveCandidate(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors print:hidden"
                            title="Remove from comparison"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div>
                          <div className="text-base font-bold text-slate-100">{item.drug}</div>
                          <div className="text-xs text-indigo-300 font-medium">{item.candidate.condition}</div>
                        </div>
                        <div className="pt-1">
                          <Link
                            href={`/evidence/${item.drugSlug}/${item.conditionSlug}`}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium print:hidden"
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
              <tbody className="divide-y divide-slate-800/60">
                {/* 1. Research State */}
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 font-semibold text-slate-300 bg-slate-900/30">Research State</td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-800/80">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                        {item.candidate.researchState || item.candidate.status}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 2. Research Readiness Score */}
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 font-semibold text-slate-300 bg-slate-900/30">
                    <div>Research Readiness</div>
                    <div className="text-[10px] text-slate-500 font-normal">Score out of 100</div>
                  </td>
                  {selectedCandidates.map((item, idx) => {
                    const score = item.candidate.readinessScore ?? item.candidate.evidenceScore.totalScore;
                    return (
                      <td key={idx} className="p-4 border-l border-slate-800/80">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-bold font-mono text-indigo-400">{score}</span>
                          <span className="text-slate-500 font-mono text-xs">/ 100</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Tier: <span className="font-semibold text-slate-300">{item.candidate.readinessTier || item.candidate.evidenceScore.evidenceTier}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Score Breakdown */}
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 font-semibold text-slate-300 bg-slate-900/30">
                    <div>Score Breakdown</div>
                    <div className="text-[10px] text-slate-500 font-normal">Transparent criteria</div>
                  </td>
                  {selectedCandidates.map((item, idx) => {
                    const b = item.candidate.readinessBreakdown;
                    return (
                      <td key={idx} className="p-4 border-l border-slate-800/80 space-y-1.5 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Clinical trials (0-25):</span>
                          <span className="text-blue-400 font-bold">{b?.clinicalTrialMaturity.score ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Human literature (0-25):</span>
                          <span className="text-indigo-400 font-bold">{b?.publishedHumanEvidence.score ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Mechanism (0-20):</span>
                          <span className="text-purple-400 font-bold">{b?.mechanisticPlausibility.score ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Source quality (0-15):</span>
                          <span className="text-emerald-400 font-bold">{b?.sourceQualityRecency.score ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Safety context (0-15):</span>
                          <span className="text-teal-400 font-bold">{b?.safetyContextCompatibility.score ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Conflict penalties:</span>
                          <span className="text-rose-400 font-bold">{b?.conflictPenalties.score ?? 0}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 4. Clinical Trials Count & Phase */}
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 font-semibold text-slate-300 bg-slate-900/30">Clinical Trial Coverage</td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-800/80 space-y-1">
                      <div className="font-semibold text-slate-200">
                        {item.candidate.clinicalTrials?.length || 0} registered study/studies
                      </div>
                      <div className="text-slate-400">
                        Highest phase: <span className="font-mono text-indigo-400">{item.candidate.highestPhase || 'Phase 1'}</span>
                      </div>
                      {item.candidate.trialOutcomeStatus && (
                        <div className="text-[10px] text-amber-300/90 bg-amber-950/20 p-1.5 rounded border border-amber-900/40">
                          {item.candidate.trialOutcomeStatus}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 5. Published Literature */}
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 font-semibold text-slate-300 bg-slate-900/30">Published Literature</td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-800/80">
                      <div className="font-semibold text-slate-200">
                        {item.candidate.citations?.length || 0} PubMed citation(s)
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
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
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 font-semibold text-slate-300 bg-slate-900/30">Target & Rationale</td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                      {item.candidate.biologicalRationale || 'Pathway mechanism under investigation.'}
                    </td>
                  ))}
                </tr>

                {/* 7. Contradictions & Verification Flags */}
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 font-semibold text-slate-300 bg-slate-900/30">
                    <div>Verification Needs</div>
                    <div className="text-[10px] text-slate-500 font-normal">Identified gaps & conflicts</div>
                  </td>
                  {selectedCandidates.map((item, idx) => {
                    const flags = item.candidate.contradictions || [];
                    return (
                      <td key={idx} className="p-4 border-l border-slate-800/80 space-y-1.5">
                        {flags.length === 0 ? (
                          <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> No critical contradictions flagged
                          </span>
                        ) : (
                          flags.map((f, fi) => (
                            <div key={fi} className="p-2 rounded bg-amber-950/20 border border-amber-900/40 text-[11px] text-amber-300">
                              <span className="font-semibold block">{f.title}</span>
                              <span className="text-[10px] text-amber-200/80">{f.description}</span>
                            </div>
                          ))
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 8. Last Verified Date */}
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 font-semibold text-slate-300 bg-slate-900/30">Last Verified</td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-800/80 font-mono text-slate-400 text-[11px]">
                      {item.lastVerifiedDate}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Comparison Research Disclaimer */}
        <footer className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            The Repurpose Compare Workspace displays comparative research signals side-by-side to assist hypothesis prioritization. All comparisons are generated deterministically from primary source data (RxNorm, openFDA, PubChem, ClinicalTrials.gov, PubMed). This tool does not provide comparative clinical efficacy rankings or treatment recommendations.
          </p>
        </footer>
      </main>
    </div>
  );
}

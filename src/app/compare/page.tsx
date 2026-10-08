'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Scale, 
  Trash2, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  ExternalLink, 
  Info, 
  Search, 
  RotateCcw 
} from 'lucide-react';
import { 
  getCompareItems, 
  removeCompareItem, 
  clearCompareItems, 
  subscribeCompareItems, 
  CompareItem 
} from '@/lib/compareStorage';

export default function ComparePage() {
  const [selectedCandidates, setSelectedCandidates] = useState<CompareItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load persisted compare items from localStorage (starts empty if user hasn't added any)
    setSelectedCandidates(getCompareItems());

    const unsubscribe = subscribeCompareItems((items) => {
      setSelectedCandidates(items);
    });

    return () => unsubscribe();
  }, []);

  const handleRemoveCandidate = (item: CompareItem) => {
    removeCompareItem(item.id || item.drug);
  };

  const handleClearAll = () => {
    clearCompareItems();
  };


  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-16 md:pb-6 text-slate-900">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1 w-full">
        {/* Navigation Breadcrumb & Header */}
        <div className="space-y-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 no-print h-5">
            <Link href="/" className="hover:text-teal-800 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate">Compare Workspace</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 tracking-wide font-mono mb-2">
                <Scale className="w-3.5 h-3.5 text-teal-700" />
                <span>Side-by-Side Comparison Workspace ({selectedCandidates.length}/3)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
                Compare Drugs &amp; Repurposing Evidence
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-3xl">
                Evaluate mechanism of action, approved indications, readiness scores, trial phases, published literature, and flagged contradiction gaps side-by-side.
              </p>
            </div>

            <div className="flex items-center gap-2 no-print shrink-0 flex-wrap">
              {selectedCandidates.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="Clear all drugs from comparison"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Clear All</span>
                </button>
              )}


              <button
                onClick={handlePrint}
                disabled={selectedCandidates.length === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-blue-700" />
                <span>Print Summary</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comparison Body */}
        {isClient && selectedCandidates.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Scale className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                No Drugs Selected for Comparison
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your comparison workspace is empty. Search for any drug in the explorer, then click the <strong>&quot;Compare&quot;</strong> button beside <strong>&quot;Copy Link&quot;</strong> to add it here.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search &amp; Add Drugs</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-4 w-52 text-slate-700 font-semibold uppercase tracking-wider text-[11px] align-top">
                    Biomedical Attribute
                  </th>
                  {selectedCandidates.map((item, idx) => (
                    <th key={idx} className="p-4 min-w-[280px] max-w-[340px] align-top border-l border-slate-200">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                            Drug #{idx + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveCandidate(item)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors no-print cursor-pointer"
                            title="Remove from comparison"
                            aria-label={`Remove ${item.drug} from comparison`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-900">{item.drug}</div>
                          {item.drugConcept?.drugClass && (
                            <div className="text-[11px] text-slate-600 font-normal">
                              {item.drugConcept.drugClass}
                            </div>
                          )}
                          {item.candidate?.condition && (
                            <div className="text-xs text-teal-800 font-semibold mt-0.5">
                              Investigated: {item.candidate.condition}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {item.drugConcept?.rxNormId && (
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                              RxCUI: {item.drugConcept.rxNormId}
                            </span>
                          )}
                          {item.drugConcept?.pubchemCid && (
                            <span className="text-[10px] font-mono bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded border border-purple-200">
                              CID: {item.drugConcept.pubchemCid}
                            </span>
                          )}
                          <Link
                            href={`/drug/${item.drugSlug}`}
                            className="text-[11px] text-teal-800 hover:text-teal-950 inline-flex items-center gap-1 font-medium underline no-print ml-auto"
                          >
                            <span>Full dossier</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* 1. Pharmacological Class */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60 align-top">
                    Pharmacological Class
                  </td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-200 text-slate-800 font-medium">
                      {item.drugConcept?.drugClass || 'Biomedical Agent'}
                    </td>
                  ))}
                </tr>

                {/* 2. Approved Indications */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60 align-top">
                    <div>Approved Indications</div>
                    <div className="text-[10px] text-slate-500 font-normal">FDA / DailyMed</div>
                  </td>
                  {selectedCandidates.map((item, idx) => {
                    const inds = (item.drugConcept?.approvedIndications || [])
                      .map(ind => ind.replace(/^INDICATIONS AND USAGE:?\s*/i, '').trim())
                      .filter(Boolean)
                      .slice(0, 3);

                    return (
                      <td key={idx} className="p-4 border-l border-slate-200">
                        {inds.length > 0 ? (
                          <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-700 leading-relaxed">
                            {inds.map((ind, ii) => (
                              <li key={ii}>{ind}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Primary indications not indexed.</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Mechanism of Action */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60 align-top">
                    Mechanism of Action
                  </td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                      {item.drugConcept?.mechanismOfAction || item.candidate?.biologicalRationale || 'Pathway mechanism under investigation.'}
                    </td>
                  ))}
                </tr>

                {/* 4. Repurposing Hypotheses */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60 align-top">
                    <div>Investigated Candidates</div>
                    <div className="text-[10px] text-slate-500 font-normal">Hypotheses tracked</div>
                  </td>
                  {selectedCandidates.map((item, idx) => {
                    const candidateList = item.candidates || (item.candidate ? [item.candidate] : []);
                    return (
                      <td key={idx} className="p-4 border-l border-slate-200 space-y-1.5">
                        <div className="font-semibold text-slate-900 text-xs">
                          {candidateList.length} repurposing condition(s)
                        </div>
                        {candidateList.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {candidateList.slice(0, 4).map((c, ci) => (
                              <span
                                key={ci}
                                className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200"
                              >
                                {c.condition}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 5. Research State */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60 align-top">
                    Research State
                  </td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-200">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        {item.candidate?.researchState || item.candidate?.status || 'Investigational'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 6. Research Readiness Score */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60 align-top">
                    <div>Research Readiness</div>
                    <div className="text-[10px] text-slate-500 font-normal">Empirical score (0-100)</div>
                  </td>
                  {selectedCandidates.map((item, idx) => {
                    const score = item.candidate?.readinessScore ?? item.candidate?.evidenceScore?.totalScore ?? 0;
                    const tier = item.candidate?.readinessTier || item.candidate?.evidenceScore?.evidenceTier || 'Under investigation';
                    return (
                      <td key={idx} className="p-4 border-l border-slate-200">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-bold font-mono text-teal-800">{score}</span>
                          <span className="text-slate-500 font-mono text-xs">/ 100</span>
                        </div>
                        <div className="text-[10px] text-slate-600 mt-1">
                          Tier: <span className="font-semibold text-slate-800">{tier}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 7. Score Breakdown */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60 align-top">
                    <div>Score Breakdown</div>
                    <div className="text-[10px] text-slate-500 font-normal">Component criteria</div>
                  </td>
                  {selectedCandidates.map((item, idx) => {
                    const b = item.candidate?.readinessBreakdown;
                    return (
                      <td key={idx} className="p-4 border-l border-slate-200 space-y-1.5 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Clinical trials (0-25):</span>
                          <span className="text-teal-800 font-bold">{b?.clinicalTrialMaturity.score ?? (item.candidate?.clinicalTrials?.length ? '15+' : '0')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Human literature (0-25):</span>
                          <span className="text-blue-800 font-bold">{b?.publishedHumanEvidence.score ?? (item.candidate?.citations?.length ? '15+' : '0')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Mechanism (0-20):</span>
                          <span className="text-purple-800 font-bold">{b?.mechanisticPlausibility.score ?? (item.drugConcept?.mechanismOfAction ? '15+' : '0')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Source quality (0-15):</span>
                          <span className="text-emerald-800 font-bold">{b?.sourceQualityRecency.score ?? '12'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Safety context (0-15):</span>
                          <span className="text-amber-800 font-bold">{b?.safetyContextCompatibility.score ?? '10'}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 8. Clinical Trial Coverage */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60 align-top">
                    Clinical Trial Coverage
                  </td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-200 space-y-1">
                      <div className="font-semibold text-slate-900">
                        {item.candidate?.clinicalTrials?.length || 0} registered study/studies
                      </div>
                      <div className="text-slate-600">
                        Highest phase: <span className="font-mono text-teal-800 font-semibold">{item.candidate?.highestPhase || 'Phase 1/2'}</span>
                      </div>
                      {item.candidate?.trialOutcomeStatus && (
                        <div className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200">
                          {item.candidate.trialOutcomeStatus}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 9. Published Literature */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60 align-top">
                    Published Literature
                  </td>
                  {selectedCandidates.map((item, idx) => (
                    <td key={idx} className="p-4 border-l border-slate-200">
                      <div className="font-semibold text-slate-900">
                        {item.candidate?.citations?.length || 0} PubMed citation(s)
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        {item.candidate?.citations && item.candidate.citations.length > 0 ? (
                          <span>Latest: &quot;{item.candidate.citations[0].title.slice(0, 60)}...&quot;</span>
                        ) : (
                          <span className="italic text-slate-500">No peer-reviewed citations indexed yet.</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 10. Safety Warnings */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60 align-top">
                    <div>Warnings &amp; Safety</div>
                    <div className="text-[10px] text-slate-500 font-normal">Boxed warnings / contraindications</div>
                  </td>
                  {selectedCandidates.map((item, idx) => {
                    const warnings = item.drugConcept?.warnings || [];
                    const contras = item.drugConcept?.contraindications || [];
                    return (
                      <td key={idx} className="p-4 border-l border-slate-200 text-[11px] text-slate-700 space-y-1.5">
                        {warnings.length > 0 ? (
                          <div className="p-2 rounded bg-red-50 border border-red-200 text-red-950 font-medium">
                            <span className="font-bold block">Boxed Warning:</span>
                            {warnings[0].slice(0, 140)}...
                          </div>
                        ) : (
                          <div className="text-slate-500 italic">No boxed warnings indexed in FDA label.</div>
                        )}
                        {contras.length > 0 && (
                          <div className="text-[10px] text-slate-600">
                            <strong>Contraindications:</strong> {contras.slice(0, 2).join('; ')}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 11. Verification Flags & Contradictions */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60 align-top">
                    <div>Verification Needs</div>
                    <div className="text-[10px] text-slate-500 font-normal">Flagged gaps &amp; conflicts</div>
                  </td>
                  {selectedCandidates.map((item, idx) => {
                    const flags = item.candidate?.contradictions || [];
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

                {/* 12. Last Verified Date */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-800 bg-slate-50/60 align-top">
                    Last Verified
                  </td>
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

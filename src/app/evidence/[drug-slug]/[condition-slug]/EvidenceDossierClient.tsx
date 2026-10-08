'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  ShieldAlert, 
  BookOpen, 
  Activity, 
  Layers, 
  Calendar, 
  Sparkles, 
  ArrowLeft 
} from 'lucide-react';
import { EvidenceDossierData } from '@/lib/evidenceDossier';
import { RepurposeCompass } from '@/components/RepurposeCompass';
import { PrintSummaryButton } from '@/components/PrintSummaryButton';

interface EvidenceDossierClientProps {
  dossier: EvidenceDossierData;
}

export function EvidenceDossierClient({ dossier }: EvidenceDossierClientProps) {
  const { drug, approvedIndications, candidate, drugSlug, conditionSlug, lastVerifiedDate, sourceList } = dossier;
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Check local saved items on mount
  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('repurpose_saved_dossiers') || '[]');
      const pairId = `${drugSlug}__${conditionSlug}`;
      setIsSaved(saved.some((item: { id: string }) => item.id === pairId));
    } catch {
      // ignore localstorage errors
    }
  }, [drugSlug, conditionSlug]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleSave = () => {
    try {
      const pairId = `${drugSlug}__${conditionSlug}`;
      const saved = JSON.parse(localStorage.getItem('repurpose_saved_dossiers') || '[]');
      let updated;
      if (isSaved) {
        updated = saved.filter((item: { id: string }) => item.id !== pairId);
        setIsSaved(false);
      } else {
        const newItem = {
          id: pairId,
          drug: drug.genericName,
          condition: candidate.condition,
          drugSlug,
          conditionSlug,
          score: candidate.readinessScore ?? candidate.evidenceScore.totalScore,
          state: candidate.researchState || 'Investigational',
          savedAt: new Date().toISOString(),
          notes: '',
          tags: ['Prioritized Candidate'],
        };
        updated = [newItem, ...saved];
        setIsSaved(true);
      }
      localStorage.setItem('repurpose_saved_dossiers', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const trials = candidate.clinicalTrials || [];
  const citations = candidate.citations || [];

  return (
    <div className="flex-1 flex flex-col pb-16 md:pb-6 text-slate-900">
      {/* Top Breadcrumb & Action Header */}
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-20 no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-teal-800 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
            <span>/</span>
            <Link href={`/drug/${drugSlug}`} className="hover:text-teal-800 transition-colors">
              {drug.genericName}
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate max-w-xs">{candidate.condition}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSaved 
                  ? 'bg-teal-50 text-teal-800 border-teal-300' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-teal-700" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved in Notebook' : 'Save Dossier'}</span>
            </button>

            <PrintSummaryButton label="Print Summary" />

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Link' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 flex-1 w-full">
        {/* Title Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 tracking-wide font-mono">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Drug–Condition Evidence Dossier</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
                {candidate.condition}
              </h1>
              <p className="text-base sm:text-lg text-slate-700 mt-1">
                Investigational drug-repurposing hypothesis for{' '}
                <span className="font-semibold text-slate-900">{drug.genericName}</span>
                {drug.brandNames && drug.brandNames.length > 0 && (
                  <span className="text-slate-500 text-sm font-normal"> (Brand names: {drug.brandNames.slice(0, 4).join(', ')})</span>
                )}
              </p>
            </div>

            {/* Quick Identifier Pill Stack */}
            <div className="flex items-center gap-2 flex-wrap">
              {drug.rxNormId && (
                <div className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 shadow-xs">
                  <span className="text-slate-500">RxCUI:</span> <span className="font-mono text-teal-800 font-semibold">{drug.rxNormId}</span>
                </div>
              )}
              {drug.pubchemCid && (
                <div className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 shadow-xs">
                  <span className="text-slate-500">PubChem CID:</span> <span className="font-mono text-purple-800 font-semibold">{drug.pubchemCid}</span>
                </div>
              )}
              <div className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700 shadow-xs">
                <span className="text-slate-500">Verified:</span> <span className="font-mono text-slate-600">{lastVerifiedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY DIFFERENTIATOR: REPURPOSE COMPASS */}
        <section aria-label="Repurpose Compass">
          <RepurposeCompass
            candidate={candidate}
            drugName={drug.genericName}
            defaultExpanded={true}
          />
        </section>

        {/* APPROVED INDICATIONS VS REPURPOSING HYPOTHESIS SEPARATION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current FDA-Approved Indications */}
          <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                Current Approved Indications
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                Authorized Label
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Conditions officially approved by regulatory bodies (e.g., US FDA). These are established indications, distinct from repurposing hypotheses.
            </p>
            <ul className="space-y-2 text-xs text-slate-800">
              {approvedIndications.length > 0 ? (
                approvedIndications.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{ind}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic p-2.5">No specific approved indications retrieved in label index.</li>
              )}
            </ul>
          </div>

          {/* Investigational Repurposing Hypothesis */}
          <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-700" />
                Repurposing Hypothesis Target
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-semibold">
                {candidate.researchState || 'Investigational'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Hypothesis under clinical or scientific investigation for off-label or secondary therapeutic value.
            </p>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-slate-900">{candidate.condition}</div>
              <p className="text-slate-700 text-xs leading-relaxed">
                {candidate.biologicalRationale || `Evaluation of ${drug.genericName} (${drug.drugClass}) targeting ${candidate.condition}.`}
              </p>
              <div className="pt-1 flex items-center gap-3 text-xs text-slate-600 font-mono flex-wrap">
                <span>Highest Phase: <strong className="text-slate-900">{candidate.highestPhase || 'Phase 1'}</strong></span>
                <span>•</span>
                <span>Registered Trials: <strong className="text-slate-900">{trials.length}</strong></span>
                <span>•</span>
                <span>Indexed Citations: <strong className="text-slate-900">{citations.length}</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* MECHANISM OF ACTION & TARGETS */}
        <section className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-700" />
            Biological Mechanism &amp; Pharmacological Class
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500 font-medium">Pharmacological Class</div>
              <div className="text-slate-900 font-semibold">{drug.drugClass || 'Small molecule therapeutic agent'}</div>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 md:col-span-2">
              <div className="text-slate-500 font-medium">Documented Mechanism of Action</div>
              <div className="text-slate-700 leading-relaxed">{drug.mechanismOfAction || 'Mechanism documented in pharmacological literature.'}</div>
            </div>
          </div>
        </section>

        {/* CLINICAL TRIAL EVIDENCE */}
        <section className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-700" />
                Interventional Clinical Trials ({trials.length})
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Registered interventional studies directly mapped to {candidate.condition} from ClinicalTrials.gov.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Source: ClinicalTrials.gov
            </span>
          </div>

          {trials.length === 0 ? (
            <div className="p-6 text-center rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              No registered interventional clinical trials identified for this drug-condition pair.
            </div>
          ) : (
            <div className="space-y-3">
              {trials.map((trial) => (
                <div key={trial.nctId} className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors text-xs space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-teal-800">{trial.nctId}</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-mono text-[10px]">
                          {trial.phase || 'Phase N/A'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                          (trial.status || '').toUpperCase().includes('TERMINATED') || (trial.status || '').toUpperCase().includes('WITHDRAWN')
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}>
                          {trial.status || 'Status Unknown'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900">{trial.title}</h3>
                    </div>

                    <a
                      href={trial.studyUrl || trial.url || `https://clinicaltrials.gov/study/${trial.nctId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium inline-flex items-center gap-1 shrink-0 transition-colors shadow-xs"
                    >
                      <span>View NCT</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-600 font-mono flex-wrap">
                    {trial.enrollment && <span>Enrollment: {trial.enrollment.toLocaleString()} participants</span>}
                    {trial.completionDate && <span>Completion: {trial.completionDate}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PUBLISHED LITERATURE & CITATIONS */}
        <section className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-700" />
                Published Literature &amp; PubMed Citations ({citations.length})
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Peer-reviewed biomedical citations indexed in the National Library of Medicine (PubMed).
              </p>
            </div>

            {/* Citation Action Button */}
            <div className="flex items-center gap-2">
              <PrintSummaryButton label="Print Citations (PDF)" />
            </div>
          </div>

          {citations.length === 0 ? (
            <div className="p-6 text-center rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">No PubMed Citations Directly Indexed</p>
              <p>Registered trial exists or preclinical signal identified, but peer-reviewed outcome articles have not been retrieved.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {citations.map((cite) => (
                <div key={cite.pmid || cite.title} className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors text-xs space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-900 leading-snug">{cite.title}</h3>
                    {cite.url && (
                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium inline-flex items-center gap-1 shrink-0 transition-colors shadow-xs"
                      >
                        <span>PubMed</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
                    {cite.authors && cite.authors.length > 0 && <span>{cite.authors.slice(0, 3).join(', ')}{cite.authors.length > 3 ? ' et al.' : ''}</span>}
                    {cite.journal && <span className="font-medium text-slate-800">{cite.journal}</span>}
                    {cite.pubDate && <span>({cite.pubDate})</span>}
                    {cite.pmid && <span className="font-mono text-teal-800 font-semibold">PMID: {cite.pmid}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SAFETY PROFILE & BOXED WARNINGS */}
        <section className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-700" />
            Safety Context &amp; Regulatory Warnings
          </h2>
          <p className="text-xs text-slate-600">
            Safety parameters documented in official regulatory labels. Investigational repurposing must account for known toxicities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 space-y-2">
              <div className="font-semibold text-rose-950">FDA Warnings &amp; Precautions</div>
              <ul className="space-y-1.5 text-rose-900 text-xs leading-relaxed">
                {(drug.warnings || []).length > 0 ? (
                  drug.warnings.map((w, idx) => <li key={idx}>• {w}</li>)
                ) : (
                  <li className="text-slate-500 italic">No boxed warnings extracted in primary structured label.</li>
                )}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
              <div className="font-semibold text-amber-950">Contraindications</div>
              <ul className="space-y-1.5 text-amber-900 text-xs leading-relaxed">
                {(drug.contraindications || []).length > 0 ? (
                  drug.contraindications.map((c, idx) => <li key={idx}>• {c}</li>)
                ) : (
                  <li className="text-slate-500 italic">No absolute contraindications indexed. Consult complete prescriber monograph.</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* DATA PROVENANCE & FRESHNESS */}
        <section className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Source Verification &amp; Attributable Provenance
            </span>
            <span className="font-mono text-slate-500">Last verified: {lastVerifiedDate}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {sourceList.map((src, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-700 shadow-xs">
                {src.name}: {src.status}
              </span>
            ))}
          </div>
        </section>

        {/* NON-CLINICAL RESEARCH DISCLAIMER */}
        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-950">Strict Non-Clinical Research Disclaimer</div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Repurpose is an open-source evidence workspace for investigating drug-repurposing hypotheses through transparent clinical, biological, regulatory, safety, and literature evidence. This dossier is strictly for academic education and research. It does NOT provide medical advice, diagnosis, treatment recommendations, prescribing guidance, or dose recommendations.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

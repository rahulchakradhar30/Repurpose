'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  Check, 
  FileSpreadsheet, 
  FileText,
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
import { exportToRIS, exportCitationsToCSV, triggerFileDownload } from '@/lib/exportUtils';

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
        updated = [
          ...saved,
          {
            id: pairId,
            drug: drug.genericName,
            condition: candidate.condition,
            drugSlug,
            conditionSlug,
            score: candidate.readinessScore ?? candidate.evidenceScore.totalScore,
            state: candidate.researchState,
            savedAt: new Date().toISOString(),
          }
        ];
        setIsSaved(true);
      }
      localStorage.setItem('repurpose_saved_dossiers', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to update saved notebook dossier:', err);
    }
  };

  const handleExportRIS = () => {
    const risContent = exportToRIS(candidate.citations || [], drug.genericName, candidate.condition);
    const filename = `${drugSlug}_${conditionSlug}_citations.ris`;
    triggerFileDownload(risContent, filename, 'application/x-research-info-systems');
  };

  const handleExportCSV = () => {
    const csvContent = exportCitationsToCSV(candidate.citations || [], drug.genericName, candidate.condition);
    const filename = `${drugSlug}_${conditionSlug}_citations.csv`;
    triggerFileDownload(csvContent, filename, 'text/csv;charset=utf-8;');
  };

  const trials = candidate.clinicalTrials || [];
  const citations = candidate.citations || [];
  const score = candidate.readinessScore ?? candidate.evidenceScore.totalScore;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Breadcrumb & Action Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-200 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
            <span>/</span>
            <Link href={`/drug/${drugSlug}`} className="hover:text-slate-200 transition-colors">
              {drug.genericName}
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium truncate max-w-xs">{candidate.condition}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isSaved 
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' 
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved in Notebook' : 'Save Dossier'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Link' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Drug–Condition Evidence Dossier</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
                {candidate.condition}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 mt-1">
                Investigational drug-repurposing hypothesis for{' '}
                <span className="font-semibold text-indigo-300">{drug.genericName}</span>
                {drug.brandNames && drug.brandNames.length > 0 && (
                  <span className="text-slate-400 text-sm font-normal"> (Brand names: {drug.brandNames.slice(0, 4).join(', ')})</span>
                )}
              </p>
            </div>

            {/* Quick Identifier Pill Stack */}
            <div className="flex items-center gap-2 flex-wrap">
              {drug.rxNormId && (
                <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <span className="text-slate-500">RxCUI:</span> <span className="font-mono text-indigo-400">{drug.rxNormId}</span>
                </div>
              )}
              {drug.pubchemCid && (
                <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <span className="text-slate-500">PubChem CID:</span> <span className="font-mono text-purple-400">{drug.pubchemCid}</span>
                </div>
              )}
              <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <span className="text-slate-500">Verified:</span> <span className="font-mono text-slate-400">{lastVerifiedDate}</span>
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
          <div className="p-5 rounded-xl bg-slate-900/70 border border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Current Approved Indications
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                Authorized Label
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Conditions officially approved by regulatory bodies (e.g., US FDA). These are established indications, distinct from repurposing hypotheses.
            </p>
            <ul className="space-y-2 text-xs text-slate-200">
              {approvedIndications.length > 0 ? (
                approvedIndications.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{ind}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic p-2.5">No specific approved indications retrieved in label index.</li>
              )}
            </ul>
          </div>

          {/* Investigational Repurposing Hypothesis */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-indigo-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Repurposing Hypothesis Target
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60 text-indigo-300">
                {candidate.researchState || 'Investigational'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Hypothesis under clinical or scientific investigation for off-label or secondary therapeutic value.
            </p>
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-slate-200">{candidate.condition}</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {candidate.biologicalRationale || `Evaluation of ${drug.genericName} (${drug.drugClass}) targeting ${candidate.condition}.`}
              </p>
              <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                <span>Highest Phase: {candidate.highestPhase || 'Phase 1'}</span>
                <span>•</span>
                <span>Registered Trials: {trials.length}</span>
                <span>•</span>
                <span>Indexed Citations: {citations.length}</span>
              </div>
            </div>
          </div>
        </section>

        {/* MECHANISM OF ACTION & TARGETS */}
        <section className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            Biological Mechanism & Pharmacological Class
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-slate-400 font-medium">Pharmacological Class</div>
              <div className="text-slate-200 font-semibold">{drug.drugClass || 'Small molecule therapeutic agent'}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1 md:col-span-2">
              <div className="text-slate-400 font-medium">Documented Mechanism of Action</div>
              <div className="text-slate-300 leading-relaxed">{drug.mechanismOfAction || 'Mechanism documented in pharmacological literature.'}</div>
            </div>
          </div>
        </section>

        {/* CLINICAL TRIAL EVIDENCE */}
        <section className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Interventional Clinical Trials ({trials.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Registered interventional studies directly mapped to {candidate.condition} from ClinicalTrials.gov.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Source: ClinicalTrials.gov
            </span>
          </div>

          {trials.length === 0 ? (
            <div className="p-6 text-center rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-400">
              No registered interventional clinical trials identified for this drug-condition pair.
            </div>
          ) : (
            <div className="space-y-3">
              {trials.map((trial) => (
                <div key={trial.nctId} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors text-xs space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-indigo-400">{trial.nctId}</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-950/50 border border-blue-800/60 text-blue-300 font-mono text-[10px]">
                          {trial.phase || 'Phase N/A'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          (trial.status || '').toUpperCase().includes('TERMINATED') || (trial.status || '').toUpperCase().includes('WITHDRAWN')
                            ? 'bg-rose-950/50 border border-rose-800/60 text-rose-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {trial.status || 'Status Unknown'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-200">{trial.title}</h3>
                    </div>

                    <a
                      href={trial.studyUrl || trial.url || `https://clinicaltrials.gov/study/${trial.nctId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium inline-flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <span>View NCT</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono flex-wrap">
                    {trial.enrollment && <span>Enrollment: {trial.enrollment.toLocaleString()} participants</span>}
                    {trial.completionDate && <span>Completion: {trial.completionDate}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PUBLISHED LITERATURE & CITATIONS */}
        <section className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Published Literature & PubMed Citations ({citations.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Peer-reviewed biomedical citations indexed in the National Library of Medicine (PubMed).
              </p>
            </div>

            {/* Citation Export Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportRIS}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                title="Download citations in RIS format for EndNote, Zotero, or Mendeley"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export RIS</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                title="Download citations table as CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {citations.length === 0 ? (
            <div className="p-6 text-center rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">No PubMed Citations Directly Indexed</p>
              <p>Registered trial exists or preclinical signal identified, but peer-reviewed outcome articles have not been retrieved.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {citations.map((cite) => (
                <div key={cite.pmid || cite.title} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors text-xs space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-200 leading-snug">{cite.title}</h3>
                    {cite.url && (
                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium inline-flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <span>PubMed</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                    {cite.authors && cite.authors.length > 0 && <span>{cite.authors.slice(0, 3).join(', ')}{cite.authors.length > 3 ? ' et al.' : ''}</span>}
                    {cite.journal && <span className="font-medium text-slate-300">{cite.journal}</span>}
                    {cite.pubDate && <span>({cite.pubDate})</span>}
                    {cite.pmid && <span className="font-mono text-indigo-400">PMID: {cite.pmid}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SAFETY PROFILE & BOXED WARNINGS */}
        <section className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Safety Context & Regulatory Warnings
          </h2>
          <p className="text-xs text-slate-400">
            Safety parameters documented in official regulatory labels. Investigational repurposing must account for known toxicities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-rose-950/15 border border-rose-900/30 space-y-2">
              <div className="font-semibold text-rose-300">FDA Warnings & Precautions</div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                {(drug.warnings || []).length > 0 ? (
                  drug.warnings.map((w, idx) => <li key={idx}>• {w}</li>)
                ) : (
                  <li className="text-slate-500 italic">No boxed warnings extracted in primary structured label.</li>
                )}
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-950/15 border border-amber-900/30 space-y-2">
              <div className="font-semibold text-amber-300">Contraindications</div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
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
        <section className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Source Verification & Attributable Provenance
            </span>
            <span className="font-mono text-slate-500">Last verified: {lastVerifiedDate}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {sourceList.map((src, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                {src.name}: {src.status}
              </span>
            ))}
          </div>
        </section>

        {/* NON-CLINICAL RESEARCH DISCLAIMER */}
        <footer className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-100">Strict Non-Clinical Research Disclaimer</div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Repurpose is an open-source evidence workspace for investigating drug-repurposing hypotheses through transparent clinical, biological, regulatory, safety, and literature evidence. This dossier is strictly for academic education and research. It does NOT provide medical advice, diagnosis, treatment recommendations, prescribing guidance, or dose recommendations.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

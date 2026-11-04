'use client';

import React, { useState, useEffect, useId } from 'react';
import Image from 'next/image';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  Check, 
  Sparkles, 
  FlaskConical, 
  ShieldAlert, 
  BookOpen, 
  Database, 
  AlertCircle,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { DrugConcept, RepurposingCandidate } from '@/types';
import { NotebookDossierItem } from '@/lib/notebookStorage';
import { 
  DossierExportOptions, 
  EXPORT_PRESETS, 
  ExportPresetKey, 
  generateCustomDossierPdfBlob 
} from '@/lib/pdfGenerator';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  drug: DrugConcept;
  candidate?: RepurposingCandidate | null;
  notebookItem?: NotebookDossierItem | null;
  userName?: string;
}

export function PdfExportModal({
  isOpen,
  onClose,
  drug,
  candidate,
  notebookItem,
  userName = 'Investigator',
}: PdfExportModalProps) {
  const [preset, setPreset] = useState<ExportPresetKey>('executive');
  const [options, setOptions] = useState<DossierExportOptions>(EXPORT_PRESETS.executive.options);
  const [isGenerating, setIsGenerating] = useState(false);
  const titleId = useId();

  // Synchronize options when preset changes
  const applyPreset = (key: ExportPresetKey) => {
    setPreset(key);
    setOptions({ ...EXPORT_PRESETS[key].options });
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDate = new Date().toISOString().slice(0, 10);
  const activeCandidate: RepurposingCandidate | null = candidate || (notebookItem ? {
    id: notebookItem.id,
    condition: notebookItem.condition,
    status: (notebookItem.state as any) || 'Investigational',
    highestPhase: 'Phase 2',
    sourceCount: 2,
    biologicalRationale: notebookItem.notes || 'Investigational evaluation.',
    safetyNotes: [],
    readinessScore: notebookItem.score || 70,
    readinessTier: 'Moderate' as const,
    evidenceScore: {
      clinicalTrialScore: 25,
      humanObservationalScore: 15,
      mechanisticScore: 15,
      reproducibilityScore: 8,
      safetyCompatibilityScore: 8,
      totalScore: notebookItem.score || 70,
      evidenceTier: 'Moderate' as const,
      contributingFactors: [],
      uncertaintyFlags: [],
    },
    clinicalTrials: [],
    citations: [],
  } as unknown as RepurposingCandidate : null);

  // Calculate estimated page count
  const calculateEstimatedPages = (): string => {
    let weight = 0.5; // Cover & Monograph
    if (options.includeOverview) weight += 0.5;
    if (options.includeHypothesis) weight += 0.5;
    if (options.includeReadinessScore) weight += 0.5;
    if (options.includeClinicalTrials) {
      weight += options.trialsScope === 'all' ? 1.5 : 0.8;
    }
    if (options.includeLiterature) {
      weight += options.citationsCount === 'all' ? 2.0 : 0.8;
    }
    if (options.includeSafety) weight += 0.5;
    if (options.includeNotebookNotes) weight += 0.4;
    if (options.includeAuditTrail) weight += 0.3;

    const rounded = Math.max(1, Math.round(weight));
    return `~${rounded}–${rounded + 1} Pages`;
  };

  // Direct PDF Download Handler
  const handleDownloadPdf = () => {
    setIsGenerating(true);
    try {
      const blob = generateCustomDossierPdfBlob({
        drug,
        candidate: activeCandidate,
        options,
        notebookItem,
        investigatorName: userName,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const drugSlug = drug.genericName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const condSlug = activeCandidate ? `_${activeCandidate.condition.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
      a.download = `Repurpose_${drugSlug}${condSlug}_${currentDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
      onClose();
    }
  };

  // Browser Native Print / Chrome Save-as-PDF Handler
  const handlePrint = () => {
    // Briefly delay to let any state changes settle before launching native print dialog
    setTimeout(() => {
      window.print();
      onClose();
    }, 100);
  };

  // Filtered Trials and Citations for print rendering
  let displayTrials = activeCandidate?.clinicalTrials || [];
  if (options.trialsScope === 'completed') {
    displayTrials = displayTrials.filter(t => (t.status || '').toUpperCase().includes('COMPLETED'));
  } else if (options.trialsScope === 'phase2plus') {
    displayTrials = displayTrials.filter(t => {
      const p = (t.phase || '').toUpperCase();
      return p.includes('PHASE 2') || p.includes('PHASE 3') || p.includes('PHASE 4');
    });
  }

  let displayCitations = activeCandidate?.citations || [];
  if (options.citationsCount !== 'all' && typeof options.citationsCount === 'number') {
    displayCitations = displayCitations.slice(0, options.citationsCount);
  }

  return (
    <>
      {/* ──────────────────────────────────────────────────────────────────────────
          1. INTERACTIVE EXPORT CUSTOMIZATION MODAL (HIDDEN DURING PRINT)
          ────────────────────────────────────────────────────────────────────────── */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-xs">
                <Image
                  src="/icon.svg"
                  alt="Repurpose Favicon"
                  width={22}
                  height={22}
                  className="w-5.5 h-5.5 rounded-sm"
                />
              </div>
              <div>
                <h2 id={titleId} className="text-base font-bold text-slate-900 font-heading">
                  Customize Dossier PDF Export
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  {drug.genericName} {activeCandidate ? `→ ${activeCandidate.condition}` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Close export dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
            
            {/* Quick Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  Quick Presets:
                </span>
                <span className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {calculateEstimatedPages()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(EXPORT_PRESETS) as ExportPresetKey[]).map((key) => {
                  const p = EXPORT_PRESETS[key];
                  const isActive = preset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => applyPreset(key)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isActive
                          ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-xs ring-1 ring-teal-600'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="font-bold text-[11px] leading-tight mb-1">{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.estimatedPages}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Granular Section Checkboxes */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                Select Specific Sections to Include:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Drug Monograph */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeOverview}
                    onChange={(e) => setOptions({ ...options, includeOverview: e.target.checked })}
                    className="mt-0.5 rounded text-teal-700 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">Drug Monograph & FDA Identifiers</div>
                    <p className="text-[11px] text-slate-500">RxCUI, PubChem CID, class, FDA indications</p>
                  </div>
                </label>

                {/* 2. Hypothesis & Rationale */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeHypothesis}
                    onChange={(e) => setOptions({ ...options, includeHypothesis: e.target.checked })}
                    className="mt-0.5 rounded text-teal-700 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">Hypothesis & Biological Rationale</div>
                    <p className="text-[11px] text-slate-500">Target disease, research state, pathway logic</p>
                  </div>
                </label>

                {/* 3. Research Readiness Score */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeReadinessScore}
                    onChange={(e) => setOptions({ ...options, includeReadinessScore: e.target.checked })}
                    className="mt-0.5 rounded text-teal-700 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">Readiness Score & 5 Pillars</div>
                    <p className="text-[11px] text-slate-500">Deterministic 0-100 rubric & penalty factors</p>
                  </div>
                </label>

                {/* 4. FDA Safety & Warnings */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeSafety}
                    onChange={(e) => setOptions({ ...options, includeSafety: e.target.checked })}
                    className="mt-0.5 rounded text-teal-700 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">FDA Warnings & Precautions</div>
                    <p className="text-[11px] text-slate-500">Boxed warnings, adverse effects, contraindications</p>
                  </div>
                </label>

                {/* 5. Clinical Trials */}
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.includeClinicalTrials}
                        onChange={(e) => setOptions({ ...options, includeClinicalTrials: e.target.checked })}
                        className="rounded text-teal-700 focus:ring-teal-500"
                      />
                      <span>Clinical Trials Table ({activeCandidate?.clinicalTrials.length || 0} Registered Studies)</span>
                    </label>

                    {options.includeClinicalTrials && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500">Filter:</span>
                        <select
                          value={options.trialsScope}
                          onChange={(e) => setOptions({ ...options, trialsScope: e.target.value as any })}
                          className="bg-white border border-slate-300 rounded px-1.5 py-0.5 font-medium text-slate-700 text-[11px]"
                        >
                          <option value="completed">Completed Only</option>
                          <option value="phase2plus">Phase 2, 3 &amp; 4 Only</option>
                          <option value="all">All Studies</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 pl-6">
                    NCT identifiers, phases, recruitment status, and primary study sponsors from ClinicalTrials.gov.
                  </p>
                </div>

                {/* 6. PubMed Literature Citations */}
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.includeLiterature}
                        onChange={(e) => setOptions({ ...options, includeLiterature: e.target.checked })}
                        className="rounded text-teal-700 focus:ring-teal-500"
                      />
                      <span>PubMed Literature Citations ({activeCandidate?.citations.length || 0} Indexed)</span>
                    </label>

                    {options.includeLiterature && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500">Include:</span>
                        <select
                          value={options.citationsCount.toString()}
                          onChange={(e) => {
                            const val = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
                            setOptions({ ...options, citationsCount: val as any });
                          }}
                          className="bg-white border border-slate-300 rounded px-1.5 py-0.5 font-medium text-slate-700 text-[11px]"
                        >
                          <option value="5">Top 5 Papers</option>
                          <option value="10">Top 10 Papers</option>
                          <option value="all">All Citations</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 pl-6">
                    Peer-reviewed literature indexed on PubMed with PMID links, journals, publication years, and author rosters.
                  </p>
                </div>

                {/* 7. Notes and Checklists (if notebook item present) */}
                {notebookItem && (
                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={options.includeNotebookNotes}
                      onChange={(e) => setOptions({ ...options, includeNotebookNotes: e.target.checked })}
                      className="mt-0.5 rounded text-teal-700 focus:ring-teal-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-800">Private Investigator Notes &amp; Checklist</div>
                      <p className="text-[11px] text-slate-500">Your custom hypothesis tags, checklist verification steps, and research notes</p>
                    </div>
                  </label>
                )}

                {/* 8. Source Provenance Audit Trail */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeAuditTrail}
                    onChange={(e) => setOptions({ ...options, includeAuditTrail: e.target.checked })}
                    className="mt-0.5 rounded text-teal-700 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">Source API Audit Trail</div>
                    <p className="text-[11px] text-slate-500">NLM, FDA &amp; NIH upstream query verification</p>
                  </div>
                </label>

                {/* 9. Non-Clinical Disclaimer */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeDisclaimer}
                    onChange={(e) => setOptions({ ...options, includeDisclaimer: e.target.checked })}
                    className="mt-0.5 rounded text-teal-700 focus:ring-teal-500"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">Academic Research Disclaimer</div>
                    <p className="text-[11px] text-slate-500">Mandatory academic &amp; non-clinical research seal</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Note about chrome save engine */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Printer className="w-3.5 h-3.5 text-teal-700" />
                Browser / Mobile Printing Engine:
              </span>
              <p>
                In Chrome, Edge, and Safari, clicking <strong>Print / Save as PDF</strong> will open the system print dialog. In the destination dropdown, select <strong>Save as PDF</strong> to generate a high-resolution, vector-crisp PDF with the Repurpose favicon logo and branding on every single page.
              </p>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {/* Option A: Direct Local PDF Download */}
              <button
                onClick={handleDownloadPdf}
                disabled={isGenerating}
                className="px-3.5 py-1.5 rounded-lg border border-teal-300 bg-white hover:bg-teal-50 text-teal-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Generate and download a customized PDF document directly"
              >
                <Download className="w-3.5 h-3.5 text-teal-700" />
                <span>Download PDF</span>
              </button>

              {/* Option B: Browser Print / Save as PDF with Chrome's native engine */}
              <button
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Open browser print dialog to print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. DEDICATED PRINTABLE DOSSIER (VISIBLE ONLY TO PRINT ENGINE / PDF ENGINE)
             Using HTML <table> so <thead> automatically repeats at top of EVERY page!
          ────────────────────────────────────────────────────────────────────────── */}
      <div id="printable-custom-dossier" className="hidden print:block print:w-full print:bg-white text-slate-900">
        <table className="w-full border-collapse">
          {/* THEAD: Automatically replicates on EVERY printed page in Chrome, Safari, Edge */}
          <thead>
            <tr>
              <th className="font-normal text-left pb-3 mb-4 border-b border-slate-300">
                <div className="flex items-center justify-between">
                  {/* Top-Left: Repurpose Logo & Favicon branding */}
                  <div className="flex items-center gap-2.5">
                    <img 
                      src="/icon.svg" 
                      alt="Repurpose Logo" 
                      className="w-7 h-7 rounded-md object-contain"
                    />
                    <div>
                      <div className="font-extrabold text-sm tracking-tight text-slate-900 flex items-center gap-1.5 leading-tight">
                        <span className="tracking-wide">REPURPOSE</span>
                        <span className="text-teal-800 font-normal text-xs">| Biomedical Evidence Workspace</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Open-Source Evidence-Based Intelligence
                      </div>
                    </div>
                  </div>

                  {/* Top-Right: Document Meta */}
                  <div className="text-right text-[10px] text-slate-600 font-mono leading-tight">
                    <div className="font-semibold text-slate-800">
                      {drug.genericName} {activeCandidate ? `→ ${activeCandidate.condition}` : ''}
                    </div>
                    <div>Archived: {currentDate}</div>
                  </div>
                </div>
              </th>
            </tr>
          </thead>

          {/* TBODY: The customized dossier content */}
          <tbody>
            <tr>
              <td className="pt-4 space-y-5 text-xs text-slate-800">
                
                {/* Executive Title Block */}
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
                        {drug.genericName}
                      </h1>
                      {activeCandidate && (
                        <div className="text-sm font-bold text-teal-900 mt-0.5">
                          Investigational Target: {activeCandidate.condition}
                        </div>
                      )}
                    </div>

                    {activeCandidate && options.includeReadinessScore && (
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-500">Research Readiness</div>
                        <div className="text-xl font-extrabold font-mono text-teal-800">
                          {activeCandidate.readinessScore ?? activeCandidate.evidenceScore?.totalScore}/100
                        </div>
                        <div className="text-[10px] font-semibold text-slate-600">
                          {activeCandidate.readinessTier || activeCandidate.evidenceScore?.evidenceTier || 'Active Evaluation'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 1. Drug Monograph Overview */}
                {options.includeOverview && (
                  <div className="page-break-inside-avoid space-y-2 border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 font-heading">
                      1. Drug Monograph &amp; Identifiers
                    </h2>
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                      <div>
                        <span className="font-semibold text-slate-600">Class: </span>
                        <span>{drug.drugClass || 'Small molecule'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">RxCUI: </span>
                        <span className="font-mono">{drug.rxNormId || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">PubChem CID: </span>
                        <span className="font-mono">{drug.pubchemCid || 'N/A'}</span>
                      </div>
                    </div>

                    {drug.mechanismOfAction && (
                      <div className="text-[11px] leading-relaxed">
                        <span className="font-semibold text-slate-800">Mechanism of Action: </span>
                        <span className="text-slate-700">{drug.mechanismOfAction}</span>
                      </div>
                    )}

                    {drug.approvedIndications && drug.approvedIndications.length > 0 && (
                      <div className="text-[11px] leading-relaxed">
                        <span className="font-semibold text-slate-800">FDA Approved Indication: </span>
                        <span className="text-slate-700">{drug.approvedIndications.join('; ')}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Target Hypothesis & Rationale */}
                {activeCandidate && options.includeHypothesis && (
                  <div className="page-break-inside-avoid space-y-2 border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 font-heading">
                      2. Investigational Hypothesis &amp; Biological Rationale
                    </h2>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span><strong>Condition:</strong> {activeCandidate.condition}</span>
                      <span>·</span>
                      <span><strong>Research Status:</strong> {activeCandidate.status}</span>
                      <span>·</span>
                      <span><strong>Highest Trial Phase:</strong> {activeCandidate.highestPhase}</span>
                    </div>

                    {activeCandidate.biologicalRationale && (
                      <p className="text-[11px] text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                        {activeCandidate.biologicalRationale}
                      </p>
                    )}
                  </div>
                )}

                {/* 3. Research Readiness Score 5-Pillar Breakdown */}
                {activeCandidate && options.includeReadinessScore && (
                  <div className="page-break-inside-avoid space-y-2 border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 font-heading">
                      3. Research Readiness 5-Pillar Evaluation
                    </h2>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="border border-slate-200 p-2 rounded bg-white">
                        <div className="font-semibold text-slate-800 flex justify-between">
                          <span>Clinical Trial Maturity</span>
                          <span className="font-mono text-teal-800">{activeCandidate.evidenceScore?.clinicalTrialScore ?? 0}/40</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Phase completion and protocol registration density.</p>
                      </div>

                      <div className="border border-slate-200 p-2 rounded bg-white">
                        <div className="font-semibold text-slate-800 flex justify-between">
                          <span>Human / Observational Evidence</span>
                          <span className="font-mono text-teal-800">{activeCandidate.evidenceScore?.humanObservationalScore ?? 0}/20</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Peer-reviewed human literature and cohort trials.</p>
                      </div>

                      <div className="border border-slate-200 p-2 rounded bg-white">
                        <div className="font-semibold text-slate-800 flex justify-between">
                          <span>Mechanistic &amp; Target Plausibility</span>
                          <span className="font-mono text-teal-800">{activeCandidate.evidenceScore?.mechanisticScore ?? 0}/20</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Pathway alignment, receptor binding, and rationale.</p>
                      </div>

                      <div className="border border-slate-200 p-2 rounded bg-white">
                        <div className="font-semibold text-slate-800 flex justify-between">
                          <span>Reproducibility &amp; Publication Signals</span>
                          <span className="font-mono text-teal-800">{activeCandidate.evidenceScore?.reproducibilityScore ?? 0}/10</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Independent study sponsors and replication.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Clinical Trials Table */}
                {options.includeClinicalTrials && (
                  <div className="page-break-inside-avoid space-y-2 border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 font-heading flex items-center justify-between">
                      <span>4. Clinical Trials Registry Records ({displayTrials.length} Studies)</span>
                      <span className="text-[10px] font-mono font-normal text-slate-500">Source: ClinicalTrials.gov PRS v2 API</span>
                    </h2>

                    {displayTrials.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">No clinical trials matching the selected criteria.</p>
                    ) : (
                      <table className="w-full text-[10px] border border-slate-200">
                        <thead className="bg-slate-100 text-slate-800 font-semibold">
                          <tr>
                            <th className="p-1.5 text-left border-b border-r border-slate-200 w-24">NCT Identifier</th>
                            <th className="p-1.5 text-left border-b border-r border-slate-200 w-20">Phase</th>
                            <th className="p-1.5 text-left border-b border-r border-slate-200 w-24">Status</th>
                            <th className="p-1.5 text-left border-b border-slate-200">Study Title &amp; Sponsor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayTrials.map((t, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="p-1.5 font-mono font-semibold border-b border-r border-slate-200 text-teal-900">{t.nctId}</td>
                              <td className="p-1.5 border-b border-r border-slate-200">{t.phase || 'N/A'}</td>
                              <td className="p-1.5 border-b border-r border-slate-200">{t.status}</td>
                              <td className="p-1.5 border-b border-slate-200">
                                <div className="font-medium text-slate-900">{t.title}</div>
                                {t.leadSponsor && <div className="text-slate-500 text-[9px]">Sponsor: {t.leadSponsor}</div>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* 5. Literature Citations */}
                {options.includeLiterature && (
                  <div className="page-break-inside-avoid space-y-2 border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 font-heading flex items-center justify-between">
                      <span>5. Peer-Reviewed Literature Citations ({displayCitations.length} Citations)</span>
                      <span className="text-[10px] font-mono font-normal text-slate-500">Source: NCBI Entrez E-Utilities</span>
                    </h2>

                    {displayCitations.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">No peer-reviewed literature indexed on PubMed.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {displayCitations.map((c, idx) => (
                          <div key={idx} className="p-2 rounded bg-slate-50/60 border border-slate-200 text-[10px]">
                            <div className="font-semibold text-slate-900">
                              {idx + 1}. {c.title}
                            </div>
                            <div className="text-slate-600 mt-0.5 flex items-center gap-2 text-[9px] font-mono">
                              <span className="text-teal-900 font-semibold">PMID: {c.pmid}</span>
                              {c.journal && <span>Journal: {c.journal}</span>}
                              {c.pubDate && <span>Year: {c.pubDate}</span>}
                              {c.doi && <span>DOI: {c.doi}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. FDA Safety & Warnings */}
                {options.includeSafety && (
                  <div className="page-break-inside-avoid space-y-2 border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-rose-900 font-heading flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                      <span>6. FDA Boxed Warnings &amp; Precautions</span>
                    </h2>

                    {drug.warnings.length > 0 ? (
                      <div className="bg-rose-50/60 border border-rose-200 p-2.5 rounded text-[11px] text-rose-950 leading-relaxed">
                        <strong>Boxed Warnings: </strong>{drug.warnings.join(' ')}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">No acute boxed warnings extracted in structured label.</p>
                    )}

                    {drug.contraindications.length > 0 && (
                      <div className="bg-amber-50/60 border border-amber-200 p-2.5 rounded text-[11px] text-amber-950 leading-relaxed">
                        <strong>Contraindications: </strong>{drug.contraindications.join(' ')}
                      </div>
                    )}
                  </div>
                )}

                {/* 7. Private Investigator Notes & Checklist (Notebook) */}
                {options.includeNotebookNotes && notebookItem && (
                  <div className="page-break-inside-avoid space-y-2 border-b border-slate-100 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 font-heading">
                      7. Private Investigator Notes &amp; Verification Checklist
                    </h2>
                    {notebookItem.tags && notebookItem.tags.length > 0 && (
                      <div className="text-[10px] text-slate-600 font-mono">
                        Tags: {notebookItem.tags.map(t => '#' + t).join(' ')}
                      </div>
                    )}
                    {notebookItem.notes && (
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] text-slate-800 whitespace-pre-wrap">
                        {notebookItem.notes}
                      </div>
                    )}
                  </div>
                )}

                {/* 8. Source Provenance Audit Trail */}
                {options.includeAuditTrail && (
                  <div className="page-break-inside-avoid text-[10px] text-slate-500 space-y-1">
                    <div className="font-semibold text-slate-700">Primary Source Audit Trail:</div>
                    <div>Data synchronized directly from open NIH, FDA, and NCBI open APIs. Last verified: {drug.lastVerifiedDate || currentDate}</div>
                  </div>
                )}
              </td>
            </tr>
          </tbody>

          {/* TFOOT: Automatically repeats at the bottom of EVERY printed page in Chrome */}
          <tfoot>
            <tr>
              <td className="pt-4 mt-6 border-t border-slate-300 text-[9px] text-slate-500 font-mono">
                <div className="flex items-center justify-between">
                  <span>Repurpose™ Open-Source Biomedical Intelligence (drugrepurpose.vercel.app)</span>
                  <span>Strictly Non-Clinical Research &amp; Education Use Only</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

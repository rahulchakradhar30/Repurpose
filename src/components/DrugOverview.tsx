'use client';

import { useState } from 'react';
import { ExternalLink, ShieldAlert, CheckCircle2, FileText, Share2, Check, AlertTriangle } from 'lucide-react';
import { DrugConcept } from '@/types';
import { filterDistinctBrandNames } from '@/lib/normalization';

interface DrugOverviewProps {
  drug: DrugConcept;
}

export function DrugOverview({ drug }: DrugOverviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/?drug=${encodeURIComponent(drug.genericName)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link to clipboard:', err);
    }
  };

  const distinctBrandNames = filterDistinctBrandNames(drug.brandNames || [], drug.genericName);

  const fdaSource = drug.sources.find(
    (s) => s.name.toLowerCase().includes('fda') || s.name.toLowerCase().includes('dailymed')
  );
  const originalLabelUrl =
    fdaSource?.url ||
    `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(drug.genericName)}`;

  // Truncate long indications to concise summaries (up to 3 items)
  const displayIndications = (drug.approvedIndications || [])
    .map((ind) => ind.replace(/^INDICATIONS AND USAGE:?\s*/i, '').trim())
    .filter(Boolean)
    .slice(0, 3);

  // Incomplete sources check
  const unavailableSources = (drug.sources || []).filter((s) => s.status !== 'ok');

  return (
    <article className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 mb-6 shadow-xs">
      {/* Top Header & Copy Link Button */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
              Verified Generic
            </span>
            {drug.rxNormId && (
              <a
                href={`https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${drug.rxNormId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-slate-600 hover:text-teal-800 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded transition-colors inline-flex items-center gap-1"
                title="View in NLM RxNav"
              >
                <span>RxCUI: {drug.rxNormId}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
            {drug.pubchemCid && (
              <a
                href={`https://pubchem.ncbi.nlm.nih.gov/compound/${drug.pubchemCid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-slate-600 hover:text-teal-800 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded transition-colors inline-flex items-center gap-1"
                title="View in NCBI PubChem"
              >
                <span>CID: {drug.pubchemCid}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
            <span className="text-[11px] text-slate-400">
              Verified: {drug.lastVerifiedDate}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {drug.genericName}
          </h2>

          {drug.drugClass && (
            <p className="text-xs sm:text-sm font-medium text-slate-700 mt-0.5">
              <span className="text-slate-500">Pharmacological Class:</span> {drug.drugClass}
            </p>
          )}

          {distinctBrandNames.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs text-slate-500">
              <span className="font-medium text-slate-600">Verified Brand Names:</span>
              <span className="font-semibold text-slate-800">{distinctBrandNames.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Copy Link Button (no link text shown on UI) */}
        <button
          onClick={handleCopyLink}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold border transition-colors self-start cursor-pointer ${
            copied
              ? 'bg-teal-50 text-teal-800 border-teal-300'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
          }`}
          aria-label="Copy direct link to this drug"
          title="Copy link to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-teal-700" />
              <span>Link Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Mechanism and Pharmacology */}
      {drug.mechanismOfAction && (
        <div className="py-4 border-b border-slate-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Mechanism of Action & Pharmacology
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {drug.mechanismOfAction}
          </p>
        </div>
      )}

      {/* FDA Approved Indications vs Potential Repurposing Section Notice */}
      <div className="py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Approved Regulatory Indications (FDA / DailyMed)
            </h3>
          </div>
          <a
            href={originalLabelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-800 hover:text-teal-900 hover:underline"
            title="Open official DailyMed drug label insert"
          >
            <span>View original label</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {displayIndications.length > 0 ? (
          <ul className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded p-3">
            {displayIndications.map((ind, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                <span className="leading-snug">{ind}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-200">
            No verified FDA structured product label found for this exact identifier.
          </p>
        )}
      </div>

      {/* Safety & Warning Context */}
      {(drug.warnings.length > 0 || drug.contraindications.length > 0) && (
        <div className="py-4 border-b border-slate-100 bg-amber-50/50 -mx-5 sm:-mx-6 px-5 sm:px-6">
          <div className="flex items-center gap-2 mb-2 text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Safety, Warnings & Contraindications Context
            </h3>
          </div>
          <div className="space-y-2 text-xs text-amber-950">
            {drug.contraindications.length > 0 && (
              <div>
                <span className="font-semibold text-amber-900">Contraindications: </span>
                <span>{drug.contraindications.join(' ')}</span>
              </div>
            )}
            {drug.warnings.length > 0 && (
              <div>
                <span className="font-semibold text-amber-900">Boxed Warnings & Precautions: </span>
                <span>{drug.warnings.join(' ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Incomplete source coverage banner if any source failed */}
      {unavailableSources.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Source Coverage Limitation: </span>
            <span>
              Direct live response from {unavailableSources.map((s) => s.name).join(', ')} is currently incomplete or unindexed. Displayed evidence reflects verified responses from available biomedical repositories.
            </span>
          </div>
        </div>
      )}

      {/* Source Provenance Chips */}
      <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <FileText className="w-3.5 h-3.5" />
          <span className="font-medium">Direct Biomedical Source Provenance:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {drug.sources.map((src, idx) => (
            <a
              key={idx}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                src.status === 'ok'
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
              title={src.statusMessage || `Open ${src.name}`}
            >
              <span>{src.name}</span>
              {src.status === 'ok' && <ExternalLink className="w-3 h-3 text-slate-400" />}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

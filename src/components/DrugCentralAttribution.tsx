import Link from 'next/link';
import { Database, ExternalLink } from 'lucide-react';

export function DrugCentralAttribution({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-slate-800 font-semibold">
        <Database className="w-4 h-4 text-teal-700" />
        <span>DrugCentral Source &amp; License Attribution</span>
      </div>
      <p>
        Drug indications, active structure mappings, and target relationships reference data curated by{' '}
        <strong className="text-slate-800">DrugCentral</strong> (Division of Translational Informatics, Department of Internal Medicine, University of New Mexico).
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-slate-500">
        <span>License:{' '}<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-teal-800 hover:underline font-medium inline-flex items-center gap-0.5">CC BY-SA 4.0<ExternalLink className="w-2.5 h-2.5" /></a></span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>Reference:{' '}<a href="https://drugcentral.org/" target="_blank" rel="noopener noreferrer" className="text-teal-800 hover:underline font-medium inline-flex items-center gap-0.5">drugcentral.org<ExternalLink className="w-2.5 h-2.5" /></a></span>
      </div>
    </div>
  );
}


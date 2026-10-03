import { AlertCircle } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div 
      role="region" 
      aria-label="Clinical Disclaimer" 
      className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-2 px-4"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <p className="leading-tight text-[11px] sm:text-xs">
            <span className="font-semibold text-slate-100">Repurpose:</span> An open-source evidence workspace for investigating drug-repurposing hypotheses through transparent clinical, biological, regulatory, safety, and literature evidence. Strictly for research and education; not medical advice, treatment recommendations, or prescribing guidance.
          </p>
        </div>
      </div>
    </div>
  );
}

import { AlertCircle } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div 
      role="region" 
      aria-label="Clinical Disclaimer" 
      className="bg-slate-100 border-b border-slate-200 text-slate-800 text-xs py-2 px-4"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
          <p className="leading-tight">
            <span className="font-semibold text-slate-900">For education and research only.</span> This tool does not provide medical advice or treatment recommendations. Verify all findings with original literature and qualified healthcare professionals.
          </p>
        </div>
      </div>
    </div>
  );
}

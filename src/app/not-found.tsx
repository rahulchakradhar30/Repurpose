import Link from 'next/link';
import { Search, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-800 border border-amber-200 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Page or Drug Record Not Found
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The requested page does not exist or this drug entity has not yet passed verification thresholds for publication in the public registry.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search Live Biomedical Database</span>
          </Link>

          <Link
            href="/what-is-drug-repurposing"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Read About Drug Repurposing</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
          Repurpose is an open-source educational and research-support platform.
        </div>
      </div>
    </div>
  );
}

import { Search } from 'lucide-react';
import { MicroscopeWatermark } from '@/components/MicroscopeWatermark';

export function HomeSkeleton() {
  return (
    <div className="flex-1 flex flex-col pb-16 md:pb-6 text-slate-900">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 sm:py-6">
        <div className="space-y-8">
          {/* Skeleton Search Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
                Explore Drug Repurposing Evidence
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                Search FDA-approved and investigational drugs to evaluate off-label repurposing trials, biological mechanisms, and transparent evidence scores.
              </p>
            </div>

            <div className="max-w-2xl mx-auto pt-2">
              <div className="relative flex items-center h-12 rounded-lg border border-slate-300 bg-slate-50 px-4">
                <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                <span className="text-sm text-slate-400">Search by drug name or brand synonym...</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500">
              <span>Try:</span>
              {['Metformin', 'Thalidomide', 'Imatinib', 'Azithromycin'].map((drug) => (
                <span key={drug} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                  {drug}
                </span>
              ))}
            </div>
          </div>

          <MicroscopeWatermark />
        </div>
      </main>
    </div>
  );
}


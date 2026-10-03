'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Scale, Check, AlertCircle } from 'lucide-react';
import { DrugConcept, RepurposingCandidate } from '@/types';
import { 
  addCompareItem, 
  removeCompareItem, 
  isDrugInCompare, 
  getCompareItems, 
  subscribeCompareItems,
  CompareItem 
} from '@/lib/compareStorage';

interface CompareDrugButtonProps {
  drug: DrugConcept;
  candidates?: RepurposingCandidate[];
  className?: string;
  showViewLink?: boolean;
}

export function CompareDrugButton({
  drug,
  candidates = [],
  className = '',
  showViewLink = true,
}: CompareDrugButtonProps) {
  const [inCompare, setInCompare] = useState(false);
  const [compareCount, setCompareCount] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const added = isDrugInCompare(drug.genericName);
      setInCompare(added);
      setCompareCount(getCompareItems().length);
    };

    updateStatus();
    const unsubscribe = subscribeCompareItems(updateStatus);
    return () => unsubscribe();
  }, [drug.genericName]);

  const handleToggle = () => {
    const slug = drug.genericName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    if (inCompare) {
      removeCompareItem(drug.genericName);
      setInCompare(false);
      setNotice('Removed from compare');
      setTimeout(() => setNotice(null), 2000);
      return;
    }

    // Candidate selection for the compare item
    const primaryCandidate = candidates && candidates.length > 0 ? candidates[0] : undefined;
    const conditionSlug = primaryCandidate
      ? primaryCandidate.condition.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : 'overview';

    const item: CompareItem = {
      id: slug,
      drug: drug.genericName,
      drugSlug: slug,
      drugConcept: drug,
      conditionSlug,
      candidate: primaryCandidate,
      candidates: candidates,
      lastVerifiedDate: drug.lastVerifiedDate || new Date().toISOString().split('T')[0],
    };

    const res = addCompareItem(item);
    if (res.success) {
      setInCompare(true);
      setNotice('Added to compare');
      setTimeout(() => setNotice(null), 2500);
    } else if (res.reason === 'limit_reached') {
      setNotice('Maximum 3 drugs allowed in comparison');
      setTimeout(() => setNotice(null), 3000);
    } else if (res.reason === 'already_exists') {
      setInCompare(true);
    }
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <button
        onClick={handleToggle}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
          inCompare
            ? 'bg-teal-700 hover:bg-teal-800 text-white border-teal-800 shadow-2xs'
            : 'bg-white hover:bg-teal-50/60 text-teal-800 hover:text-teal-900 border-teal-300 hover:border-teal-400 shadow-2xs'
        }`}
        aria-label={inCompare ? `Remove ${drug.genericName} from comparison` : `Add ${drug.genericName} to comparison`}
        title={inCompare ? 'Click to remove from comparison' : 'Add to side-by-side comparison workspace'}
      >
        {inCompare ? (
          <>
            <Check className="w-4 h-4 text-teal-200" />
            <span>In Compare ({compareCount}/3)</span>
          </>
        ) : (
          <>
            <Scale className="w-4 h-4 text-teal-700" />
            <span>Compare</span>
          </>
        )}
      </button>

      {inCompare && showViewLink && (
        <Link
          href="/compare"
          className="text-xs font-medium text-teal-800 hover:text-teal-950 hover:underline flex items-center gap-1 transition-colors"
          title="Open Compare Workspace"
        >
          <span>View Compare &rarr;</span>
        </Link>
      )}

      {notice && (
        <div 
          role="status"
          className="absolute -bottom-8 left-0 z-20 whitespace-nowrap bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded shadow-lg animate-in fade-in slide-in-from-top-1"
        >
          {notice}
        </div>
      )}
    </div>
  );
}

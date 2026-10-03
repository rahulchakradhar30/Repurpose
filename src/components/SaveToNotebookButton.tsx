'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { DrugConcept, RepurposingCandidate } from '@/types';
import { 
  addOrUpdateNotebookItem, 
  removeNotebookItem, 
  isDossierInNotebook, 
  subscribeNotebookItems,
  NotebookDossierItem
} from '@/lib/notebookStorage';
import { saveDrugResearch, getLocalUser } from '@/lib/firebase/client';

interface SaveToNotebookButtonProps {
  drug: DrugConcept;
  candidate?: RepurposingCandidate;
  className?: string;
  showViewLink?: boolean;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function SaveToNotebookButton({
  drug,
  candidate,
  className = '',
  showViewLink = false,
}: SaveToNotebookButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const drugSlug = slugify(drug.genericName);
  const conditionSlug = candidate ? slugify(candidate.condition) : 'overview';
  const pairId = candidate ? `${drugSlug}__${conditionSlug}` : `${drugSlug}__overview`;

  useEffect(() => {
    const update = () => {
      setIsSaved(isDossierInNotebook(pairId));
    };
    update();
    const unsub = subscribeNotebookItems(update);
    return () => unsub();
  }, [pairId]);

  const handleToggle = async () => {
    if (isSaved) {
      removeNotebookItem(pairId);
      setIsSaved(false);
      setNotice('Removed from Notebook');
      setTimeout(() => setNotice(null), 2000);
      return;
    }

    const item: NotebookDossierItem = {
      id: pairId,
      drug: drug.genericName,
      condition: candidate ? candidate.condition : (drug.approvedIndications?.[0] || 'Investigational Overview'),
      drugSlug,
      conditionSlug,
      score: candidate ? (candidate.readinessScore ?? candidate.evidenceScore?.totalScore ?? 0) : 0,
      state: candidate ? (candidate.researchState || candidate.status || 'Investigational') : 'Investigational',
      savedAt: new Date().toISOString(),
      notes: '',
      tags: ['Prioritized Candidate'],
    };

    addOrUpdateNotebookItem(item);
    setIsSaved(true);
    setNotice('Saved to Notebook (30-day retention)');
    setTimeout(() => setNotice(null), 2500);

    // Sync with Firebase if user is logged in
    try {
      const user = getLocalUser();
      if (user && user.uid) {
        await saveDrugResearch(user.uid, {
          id: pairId,
          drugGenericName: drug.genericName,
          rxNormId: drug.rxNormId,
          conditionFocus: item.condition,
          candidateConditionsCount: 1,
          notes: '',
          tags: item.tags || [],
        });
      }
    } catch {
      // ignore background sync errors
    }
  };

  return (
    <div className={`relative flex items-center gap-1.5 ${className}`}>
      <button
        onClick={handleToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
          isSaved
            ? 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-300 shadow-2xs'
            : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-300 hover:border-slate-400 shadow-2xs'
        }`}
        title={isSaved ? 'Remove from Research Notebook' : 'Save dossier to Research Notebook'}
        aria-label={isSaved ? `Remove ${drug.genericName} dossier from notebook` : `Save ${drug.genericName} dossier to notebook`}
      >
        {isSaved ? (
          <>
            <BookmarkCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Saved in Notebook</span>
          </>
        ) : (
          <>
            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Dossier</span>
          </>
        )}
      </button>

      {isSaved && showViewLink && (
        <Link
          href="/notebook"
          className="text-xs font-medium text-teal-800 hover:text-teal-950 underline transition-colors"
        >
          View Notebook &rarr;
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

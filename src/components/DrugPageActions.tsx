'use client';

import React, { useState } from 'react';
import { DrugConcept, RepurposingCandidate } from '@/types';
import { CompareDrugButton } from './CompareDrugButton';
import { SaveToNotebookButton } from './SaveToNotebookButton';
import { PrintSummaryButton } from './PrintSummaryButton';
import { CopyPageLinkButton } from './CopyPageLinkButton';
import { PdfExportModal } from './PdfExportModal';

interface DrugPageActionsProps {
  drug: DrugConcept;
  candidates: RepurposingCandidate[];
}

export function DrugPageActions({ drug, candidates }: DrugPageActionsProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap no-print">
        <CompareDrugButton drug={drug} candidates={candidates} />
        <SaveToNotebookButton drug={drug} candidate={candidates[0]} showViewLink={true} />
        <PrintSummaryButton label="Export PDF" onClick={() => setIsExportModalOpen(true)} />
        <CopyPageLinkButton label="Copy dossier link" />
      </div>

      <PdfExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        drug={drug}
        candidate={candidates.length > 0 ? candidates[0] : null}
      />
    </>
  );
}

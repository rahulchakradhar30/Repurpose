'use client';

import { useState } from 'react';
import { SavedResearchItem } from '@/types';
import { 
  Bookmark, 
  Trash2, 
  FileSpreadsheet, 
  FileCode, 
  ExternalLink, 
  Calendar, 
  Clock, 
  Edit3, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import { downloadFile } from '@/lib/export';

interface SavedResearchViewProps {
  items: SavedResearchItem[];
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onSelectDrug: (drugName: string) => void;
}

export function SavedResearchView({
  items,
  onDelete,
  onUpdateNotes,
  onSelectDrug,
}: SavedResearchViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  const handleStartEdit = (item: SavedResearchItem) => {
    setEditingId(item.id);
    setEditNoteText(item.notes);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateNotes(id, editNoteText);
    setEditingId(null);
  };

  const exportAllAsCSV = () => {
    if (items.length === 0) return;
    const headers = [
      'Drug Generic Name',
      'RxCUI',
      'Condition Focus',
      'Candidates Identified',
      'Evidence Score',
      'Clinical Trials Count',
      'PubMed Citations Count',
      'Researcher Notes',
      'Saved At',
      'Last Updated',
    ];

    const escapeCSV = (str: string | number | undefined): string => {
      if (str === undefined || str === null) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = items.map((i) => [
      escapeCSV(i.drugGenericName),
      escapeCSV(i.rxNormId || 'N/A'),
      escapeCSV(i.conditionFocus || 'Overview'),
      escapeCSV(i.candidateConditionsCount),
      escapeCSV(i.evidenceSnapshot?.totalScore || 'N/A'),
      escapeCSV(i.evidenceSnapshot?.clinicalTrialsCount || 0),
      escapeCSV(i.evidenceSnapshot?.citationsCount || 0),
      escapeCSV(i.notes),
      escapeCSV(i.savedAt),
      escapeCSV(i.lastUpdated),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    downloadFile(csvContent, `repurpose_saved_research_export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-teal-700" />
            <span>Saved Research & Collections ({items.length})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal drug candidate dossiers, hypotheses, notes, and citation export.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={exportAllAsCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Entire Dossier (CSV)</span>
          </button>
        )}
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-slate-800">
            No saved research yet
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Search for a drug entity to explore candidate indications, then click "Save Candidate" or "Save Drug" to build your research collection.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs transition-all hover:border-slate-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                      {item.drugGenericName}
                    </span>
                    {item.conditionFocus && (
                      <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.conditionFocus}
                      </span>
                    )}
                    {item.rxNormId && (
                      <span className="text-[11px] font-mono text-slate-400">
                        RxCUI: {item.rxNormId}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectDrug(item.drugGenericName)}
                    className="text-sm sm:text-base font-bold text-slate-900 hover:text-teal-800 flex items-center gap-1 text-left group"
                  >
                    <span>{item.conditionFocus ? `${item.conditionFocus} (${item.drugGenericName})` : item.drugGenericName}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-800" />
                  </button>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                    title="Delete item from research"
                    aria-label={`Delete ${item.drugGenericName} research`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Evidence Snapshot Badge */}
              {item.evidenceSnapshot && (
                <div className="py-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-600 border-b border-slate-100">
                  <span className="font-semibold text-slate-700">Snapshot:</span>
                  <span className="bg-teal-50 text-teal-800 font-mono font-bold px-1.5 py-0.5 rounded border border-teal-200">
                    Score: {item.evidenceSnapshot.totalScore}/100
                  </span>
                  <span>Highest Phase: {item.evidenceSnapshot.highestPhase}</span>
                  <span>{item.evidenceSnapshot.clinicalTrialsCount} Trials</span>
                  <span>{item.evidenceSnapshot.citationsCount} Citations</span>
                </div>
              )}

              {/* Research Notes Section */}
              <div className="pt-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-600">
                    Research Notes:
                  </span>
                  {editingId !== item.id && (
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="flex items-center gap-1 text-teal-800 hover:underline"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Notes</span>
                    </button>
                  )}
                </div>

                {editingId === item.id ? (
                  <div className="space-y-2 mt-1">
                    <textarea
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded focus:border-teal-700 focus:outline-hidden"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-teal-700 text-white rounded text-xs font-semibold hover:bg-teal-800"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save Notes</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 bg-slate-50 rounded p-2.5 border border-slate-200 italic">
                    {item.notes || 'No research notes added yet. Click "Edit Notes" to attach hypothesis, assay data, or trial notes.'}
                  </p>
                )}
              </div>

              {/* Metadata footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Saved: {item.savedAt.slice(0, 10)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Updated: {item.lastUpdated.slice(0, 10)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data Ownership & Privacy Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-slate-800 mb-0.5">
            Data Privacy & Ownership Guarantee
          </h3>
          <p className="leading-relaxed">
            All saved drug dossiers, research notes, and search records remain exclusively under your control. When signed into Firebase, strict Firestore security rules prevent cross-user document access. You can export your data at any time via CSV or delete records permanently.
          </p>
        </div>
      </div>
    </div>
  );
}

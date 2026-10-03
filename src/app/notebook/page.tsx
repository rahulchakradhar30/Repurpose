'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookMarked, 
  Trash2, 
  Tag, 
  FileText, 
  CheckSquare, 
  Square, 
  ExternalLink, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Plus, 
  ArrowLeft, 
  Search,
  Clock,
  Printer
} from 'lucide-react';
import { 
  subscribeToAuth, 
  signInWithGoogle, 
  signOutUser 
} from '@/lib/firebase/client';
import { 
  getNotebookItems, 
  saveNotebookItems, 
  subscribeNotebookItems, 
  NotebookDossierItem 
} from '@/lib/notebookStorage';
import { PrintSummaryButton } from '@/components/PrintSummaryButton';

const DEFAULT_CHECKLIST_TEMPLATE = [
  { id: 'trials', label: 'Review full NCT clinical trial records & design parameters' },
  { id: 'outcomes', label: 'Check for published peer-reviewed outcome papers on PubMed' },
  { id: 'safety', label: 'Evaluate FDA boxed warnings & contraindications' },
  { id: 'mechanism', label: 'Verify target & pathway rationale consistency' },
  { id: 'ontology', label: 'Confirm canonical disease ontology normalization' },
  { id: 'compare', label: 'Run side-by-side comparison in Compare Workspace' },
  { id: 'export', label: 'Print or export dossier summary (PDF) for literature review archive' },
];

export default function NotebookPage() {
  const [user, setUser] = useState<{ uid: string; displayName: string | null; isAnonymous: boolean; email?: string | null } | null>(null);
  const [items, setItems] = useState<NotebookDossierItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Subscribe to auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Load from notebook storage (automatically purges items > 30 days old)
  useEffect(() => {
    const loaded = getNotebookItems();
    setItems(loaded);
    if (loaded.length > 0 && !activeItemId) {
      setActiveItemId(loaded[0].id);
    }

    const unsub = subscribeNotebookItems((updated) => {
      setItems(updated);
      if (updated.length > 0 && (!activeItemId || !updated.some(u => u.id === activeItemId))) {
        setActiveItemId(updated[0].id);
      }
    });
    return () => unsub();
  }, [activeItemId]);

  const persistItems = (updated: NotebookDossierItem[]) => {
    saveNotebookItems(updated);
    setSaveStatus('Saved');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const activeItem = items.find(i => i.id === activeItemId) || items[0] || null;

  const handleUpdateNotes = (notes: string) => {
    if (!activeItem) return;
    const updated = items.map(i => i.id === activeItem.id ? { ...i, notes } : i);
    persistItems(updated);
  };

  const handleAddTag = () => {
    if (!activeItem || !newTagInput.trim()) return;
    const tag = newTagInput.trim().replace(/^#/, '');
    const currentTags = activeItem.tags || [];
    if (!currentTags.includes(tag)) {
      const updated = items.map(i => 
        i.id === activeItem.id ? { ...i, tags: [...currentTags, tag] } : i
      );
      persistItems(updated);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeItem) return;
    const currentTags = activeItem.tags || [];
    const updated = items.map(i => 
      i.id === activeItem.id ? { ...i, tags: currentTags.filter(t => t !== tagToRemove) } : i
    );
    persistItems(updated);
  };

  const handleToggleChecklist = (checkId: string) => {
    if (!activeItem) return;
    const currentChecklist = activeItem.checklist || {};
    const updatedChecklist = {
      ...currentChecklist,
      [checkId]: !currentChecklist[checkId],
    };
    const updated = items.map(i => i.id === activeItem.id ? { ...i, checklist: updatedChecklist } : i);
    persistItems(updated);
  };

  const handleDeleteItem = (idToDelete: string) => {
    if (!confirm('Are you sure you want to remove this hypothesis from your Research Notebook?')) return;
    const updated = items.filter(i => i.id !== idToDelete);
    persistItems(updated);
    if (activeItemId === idToDelete) {
      setActiveItemId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleDeleteAllData = () => {
    if (!confirm('WARNING: This will permanently delete all your saved research dossiers, private notes, tags, and checklist states. Proceed?')) return;
    saveNotebookItems([]);
    setItems([]);
    setActiveItemId(null);
  };

  const filteredItems = items.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.drug.toLowerCase().includes(q) ||
      item.condition.toLowerCase().includes(q) ||
      (item.tags || []).some(t => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col pb-16 md:pb-6 text-slate-900">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1 w-full">
        {/* Navigation Breadcrumbs & Header */}
        <div className="space-y-3">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-500 no-print">
            <Link href="/" className="hover:text-teal-800 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Research Notebook</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
                <BookMarked className="w-3.5 h-3.5" />
                <span>Personal Hypothesis Vault</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
                Research Notebook
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-3xl">
                Maintain private investigator notes, track verification steps, and manage hypothesis priority tags.
              </p>
            </div>

            {/* User Auth controls & Print Notebook */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap no-print">
              <PrintSummaryButton label="Print Notebook (PDF)" />

              {user && !user.isAnonymous ? (
                <div className="flex items-center gap-2">
                  <div className="text-right text-xs">
                    <div className="font-semibold text-slate-800">{user.displayName || user.email}</div>
                    <div className="text-teal-700 font-mono text-[10px]">Cloud Synced</div>
                  </div>
                  <button
                    onClick={() => signOutUser()}
                    className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs transition-colors shadow-xs cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await signInWithGoogle();
                      } catch (err) {
                        console.error('Sign in error:', err);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Google</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Assurance & 30-Day Retention Notice */}
        <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950 space-y-2 no-print">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="text-teal-950 font-bold">Strict Research Privacy:</span> Your private notes, custom tags, and checklist dossiers are strictly confidential, locked, and protected with secure end-to-end access controls. Your research data is never shared with third parties or used for tracking.
            </p>
          </div>
          <div className="flex items-start gap-2.5 pt-1.5 border-t border-teal-200/60 text-slate-700 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-semibold text-slate-900">30-Day Data Retention Policy:</span> To protect researcher confidentiality, notebook records and saved dossiers are retained for 30 days and then automatically cleared from all databases and storage. Please use the <strong>Print / Save PDF</strong> button to download or print your research dossiers for permanent local archiving.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-16 text-center rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <BookMarked className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-lg font-semibold text-slate-800">Your Research Notebook is Empty</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Save drug–condition dossiers while exploring hypotheses to maintain private research notes, track study checklists, and organize citation bibliographies.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="px-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Explore Drug Hypotheses</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Saved Dossier List */}
            <div className="lg:col-span-4 space-y-3 no-print">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by drug, disease, or tag..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 shadow-xs"
                />
              </div>

              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {filteredItems.map((item) => {
                  const isSelected = activeItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveItemId(item.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs space-y-1.5 ${
                        isSelected
                          ? 'bg-teal-50 border-teal-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{item.drug}</span>
                        <span className="font-mono text-xs font-semibold text-teal-800">
                          {item.score}/100
                        </span>
                      </div>
                      <div className="text-slate-700 font-medium truncate">{item.condition}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>{item.state}</span>
                        <span>{item.savedAt ? item.savedAt.split('T')[0] : ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Data Deletion Control */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={handleDeleteAllData}
                  className="w-full py-2 px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Notebook Data</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Active Dossier Notebook Details */}
            {activeItem && (
              <div className="lg:col-span-8 space-y-6">
                {/* Dossier Header Card */}
                <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase font-mono text-teal-800 font-semibold">
                        Saved Research Snapshot
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                        {activeItem.drug} ➔ {activeItem.condition}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 no-print flex-wrap">
                      <PrintSummaryButton label="Print Dossier (PDF)" />

                      <Link
                        href={`/evidence/${activeItem.drugSlug}/${activeItem.conditionSlug}`}
                        className="px-3 py-1.5 rounded-lg border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <span>Open Public Dossier</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => handleDeleteItem(activeItem.id)}
                        className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-500 transition-colors shadow-xs cursor-pointer"
                        title="Delete from notebook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono pt-1 text-slate-600 flex-wrap">
                    <span>Readiness: <strong className="text-teal-800 font-bold">{activeItem.score}/100</strong></span>
                    <span>•</span>
                    <span>State: <strong className="text-slate-800">{activeItem.state}</strong></span>
                    <span>•</span>
                    <span>Saved on: {activeItem.savedAt ? activeItem.savedAt.split('T')[0] : 'N/A'}</span>
                    {saveStatus && <span className="text-teal-700 font-sans ml-auto font-medium">{saveStatus}</span>}
                  </div>
                </div>

                {/* Tags Management */}
                <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-teal-700" />
                    Research Tags &amp; Classification
                  </h3>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {(activeItem.tags || []).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-mono flex items-center gap-1.5 font-medium"
                      >
                        <span>#{t}</span>
                        <button
                          onClick={() => handleRemoveTag(t)}
                          className="text-teal-600 hover:text-rose-600 no-print cursor-pointer"
                          aria-label={`Remove tag ${t}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1 no-print">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add tag (e.g. Oncology, High-Priority, Urgent)..."
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-teal-600 w-64 shadow-2xs"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Private Notes Section */}
                <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-700" />
                    Private Investigator Notes
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your notes are locked and visible only to you. Remember to download or print your PDF summary to keep notes beyond the 30-day retention window.
                  </p>
                  <textarea
                    rows={6}
                    value={activeItem.notes || ''}
                    onChange={(e) => handleUpdateNotes(e.target.value)}
                    placeholder="Enter hypotheses notes, dosing considerations, laboratory observations, or mechanism notes here..."
                    className="w-full p-3.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 font-sans leading-relaxed shadow-2xs"
                  />
                </div>

                {/* Evidence Verification Checklist */}
                <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-teal-700" />
                    Systematic Investigation Checklist
                  </h3>
                  <div className="space-y-2">
                    {DEFAULT_CHECKLIST_TEMPLATE.map((step) => {
                      const isChecked = !!(activeItem.checklist && activeItem.checklist[step.id]);
                      return (
                        <div
                          key={step.id}
                          onClick={() => handleToggleChecklist(step.id)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors text-xs ${
                            isChecked
                              ? 'bg-teal-50/50 border-teal-200 text-teal-950'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0 text-teal-700">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-teal-700" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <span className={`leading-relaxed ${isChecked ? 'line-through text-slate-500' : 'font-medium'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

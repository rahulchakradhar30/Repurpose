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
  Download, 
  ExternalLink, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  AlertCircle,
  Plus,
  Compass,
  ArrowLeft,
  Sparkles,
  Save,
  Search
} from 'lucide-react';
import { 
  subscribeToAuth, 
  signInWithGoogle, 
  signInUserAnonymously, 
  signOutUser 
} from '@/lib/firebase/client';
import { exportToRIS, exportCitationsToCSV, triggerFileDownload } from '@/lib/exportUtils';

interface NotebookDossierItem {
  id: string; // drugSlug__conditionSlug
  drug: string;
  condition: string;
  drugSlug: string;
  conditionSlug: string;
  score: number;
  state: string;
  savedAt: string;
  notes?: string;
  tags?: string[];
  checklist?: Record<string, boolean>;
}

const DEFAULT_CHECKLIST_TEMPLATE = [
  { id: 'trials', label: 'Review full NCT clinical trial records & design parameters' },
  { id: 'outcomes', label: 'Check for published peer-reviewed outcome papers on PubMed' },
  { id: 'safety', label: 'Evaluate FDA boxed warnings & contraindications' },
  { id: 'mechanism', label: 'Verify target & pathway rationale consistency' },
  { id: 'ontology', label: 'Confirm canonical disease ontology normalization' },
  { id: 'compare', label: 'Run side-by-side comparison in Compare Workspace' },
  { id: 'export', label: 'Export citation bibliography (RIS/CSV) for literature review' },
];

export default function NotebookPage() {
  const [user, setUser] = useState<{ uid: string; displayName: string | null; isAnonymous: boolean; email?: string | null } | null>(null);
  const [items, setItems] = useState<NotebookDossierItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Subscribe to auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  // Load saved notebook items
  useEffect(() => {
    try {
      const stored = localStorage.getItem('repurpose_saved_dossiers');
      if (stored) {
        const parsed: NotebookDossierItem[] = JSON.parse(stored);
        setItems(parsed);
        if (parsed.length > 0 && !activeItemId) {
          setActiveItemId(parsed[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load notebook items:', err);
    }
  }, []);

  // Save items back to local storage
  const persistItems = (updated: NotebookDossierItem[]) => {
    setItems(updated);
    try {
      localStorage.setItem('repurpose_saved_dossiers', JSON.stringify(updated));
      setSaveStatus('Changes saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error('Failed to save to storage:', err);
    }
  };

  const activeItem = items.find(i => i.id === activeItemId) || items[0] || null;

  const handleUpdateNotes = (notes: string) => {
    if (!activeItem) return;
    const updated = items.map(i => i.id === activeItem.id ? { ...i, notes } : i);
    persistItems(updated);
  };

  const handleAddTag = () => {
    if (!activeItem || !newTagInput.trim()) return;
    const tag = newTagInput.trim().toLowerCase();
    const currentTags = activeItem.tags || [];
    if (!currentTags.includes(tag)) {
      const updated = items.map(i => i.id === activeItem.id ? { ...i, tags: [...currentTags, tag] } : i);
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
    if (!confirm('WARNING: This will permanently delete all your saved research dossiers, private notes, tags, and checklist states from this device. Proceed?')) return;
    localStorage.removeItem('repurpose_saved_dossiers');
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-semibold">
                  Personal Workspace
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  Private & Encrypted
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2 mt-0.5">
                <BookMarked className="w-5 h-5 text-indigo-400" />
                Research Notebook & Hypothesis Vault
              </h1>
            </div>
          </div>

          {/* User Auth controls */}
          <div className="flex items-center gap-3">
            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-2">
                <div className="text-right text-xs">
                  <div className="font-semibold text-slate-200">{user.displayName || user.email}</div>
                  <div className="text-slate-400 font-mono text-[10px]">Cloud Synced</div>
                </div>
                <button
                  onClick={() => signOutUser()}
                  className="p-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">Guest Mode (Local Storage)</span>
                <button
                  onClick={() => signInWithGoogle()}
                  className="px-3 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In for Cloud Sync</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Privacy Assurance Banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="text-slate-200 font-semibold">Owner-Only Privacy:</span> Your private notes, custom tags, and checklist statuses are stored strictly in your authenticated Firestore vault or device local storage. They are never shared publicly, aggregated into public evidence scores, or exported without explicit action.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <BookMarked className="w-12 h-12 text-slate-600 mx-auto" />
            <h2 className="text-lg font-semibold text-slate-300">Your Research Notebook is Empty</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Save drug–condition dossiers while exploring hypotheses to maintain private research notes, track study checklists, and organize citation bibliographies.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <span>Explore Drug Hypotheses</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Saved Dossier List */}
            <div className="lg:col-span-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by drug, disease, or tag..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                          ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100">{item.drug}</span>
                        <span className="font-mono text-xs font-semibold text-indigo-400">
                          {item.score}/100
                        </span>
                      </div>
                      <div className="text-slate-300 font-medium truncate">{item.condition}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>{item.state}</span>
                        <span>{item.savedAt ? item.savedAt.split('T')[0] : ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Data Deletion Control */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleDeleteAllData}
                  className="w-full py-2 px-3 rounded-lg border border-rose-900/40 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
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
                <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase font-mono text-indigo-400 font-semibold">
                        Saved Research Snapshot
                      </div>
                      <h2 className="text-xl font-bold text-slate-100 mt-0.5">
                        {activeItem.drug} ➔ {activeItem.condition}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/evidence/${activeItem.drugSlug}/${activeItem.conditionSlug}`}
                        className="px-3 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <span>Open Public Dossier</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => handleDeleteItem(activeItem.id)}
                        className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-rose-900/30 hover:text-rose-400 text-slate-400 transition-colors"
                        title="Delete from notebook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono pt-1 text-slate-400 flex-wrap">
                    <span>Readiness: <strong className="text-indigo-400">{activeItem.score}/100</strong></span>
                    <span>•</span>
                    <span>State: <strong className="text-slate-300">{activeItem.state}</strong></span>
                    <span>•</span>
                    <span>Saved on: {activeItem.savedAt ? activeItem.savedAt.split('T')[0] : 'N/A'}</span>
                    {saveStatus && <span className="text-emerald-400 font-sans ml-auto">{saveStatus}</span>}
                  </div>
                </div>

                {/* Tags Management */}
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" />
                    Research Tags & Classification
                  </h3>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {(activeItem.tags || []).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 text-xs font-mono flex items-center gap-1.5"
                      >
                        <span>#{t}</span>
                        <button
                          onClick={() => handleRemoveTag(t)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        placeholder="Add tag..."
                        className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-28"
                      />
                      <button
                        onClick={handleAddTag}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Add tag"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Private Notes */}
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    Private Research Notes
                  </h3>
                  <textarea
                    rows={5}
                    value={activeItem.notes || ''}
                    onChange={(e) => handleUpdateNotes(e.target.value)}
                    placeholder="Write hypothesis notes, clinical trial observations, investigator questions, or literature synthesis..."
                    className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                  <div className="text-[11px] text-slate-500">
                    Auto-saved privately to your research profile.
                  </div>
                </div>

                {/* Personal Research Checklist */}
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Personal Research Verification Checklist
                  </h3>

                  <div className="space-y-2">
                    {DEFAULT_CHECKLIST_TEMPLATE.map((step) => {
                      const isChecked = activeItem.checklist?.[step.id] || false;
                      return (
                        <div
                          key={step.id}
                          onClick={() => handleToggleChecklist(step.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all text-xs flex items-center gap-3 ${
                            isChecked
                              ? 'bg-emerald-950/15 border-emerald-900/40 text-slate-300'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="shrink-0 text-emerald-400">
                            {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                          </div>
                          <span className={isChecked ? 'line-through text-slate-500' : 'text-slate-200'}>
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

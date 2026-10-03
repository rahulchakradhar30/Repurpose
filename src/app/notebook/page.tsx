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
  Printer,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  subscribeToAuth, 
  signInWithGoogle, 
  signInWithGoogleRedirect,
  checkRedirectResult,
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
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<{ message: string; code?: string; domain?: string } | null>(null);

  // Subscribe to auth state & check redirect sign-in outcome on mount
  useEffect(() => {
    checkRedirectResult().catch(() => {});

    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      if (currentUser && !currentUser.isAnonymous) {
        setAuthError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        setAuthError({
          message: res.error || 'Sign-in failed. Please try again.',
          code: res.code,
          domain: res.domain || (typeof window !== 'undefined' ? window.location.hostname : undefined),
        });
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setAuthError({
        message: error.message || 'An unexpected error occurred during Google sign-in.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      const res = await signInWithGoogleRedirect();
      if (!res.success) {
        setAuthError({
          message: res.error || 'Failed to initiate redirect sign-in.',
        });
        setIsSigningIn(false);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setAuthError({
        message: error.message || 'An unexpected error occurred during Google sign-in redirect.',
      });
      setIsSigningIn(false);
    }
  };

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
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn}
                    className="px-3 py-1.5 rounded-lg border border-teal-300 bg-teal-50 hover:bg-teal-100 disabled:opacity-60 text-teal-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    title="Sign in with your Google account"
                  >
                    {isSigningIn ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.33 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
                        </svg>
                        <span>Sign In with Google</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Diagnostic Alert for Authentication Errors */}
        {authError && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2.5 no-print animate-in fade-in duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">Google Authentication Status</div>
                  <p className="text-slate-700 leading-relaxed">{authError.message}</p>
                </div>
              </div>
              <button
                onClick={() => setAuthError(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold px-1.5 py-0.5 rounded cursor-pointer"
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>

            {authError.code === 'auth/unauthorized-domain' && authError.domain && (
              <div className="p-3 bg-white/90 rounded-lg border border-amber-200 space-y-2 text-[11px] text-slate-700">
                <div className="font-semibold text-slate-900">Required Firebase Console Step:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>
                    Open{' '}
                    <a
                      href="https://console.firebase.google.com/project/repurpose-6bbab/authentication/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-800 underline font-medium inline-flex items-center gap-0.5"
                    >
                      Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains
                      <ExternalLink className="w-3 h-3 inline ml-0.5" />
                    </a>
                  </li>
                  <li>
                    Click <span className="font-semibold text-slate-800">Add domain</span> and enter:{' '}
                    <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-teal-800 font-bold">
                      {authError.domain}
                    </code>
                  </li>
                  <li>Click Save and retry signing in.</li>
                </ol>
              </div>
            )}

            {authError.code === 'auth/popup-blocked' && (
              <div className="pt-1 flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleGoogleRedirectSignIn}
                  disabled={isSigningIn}
                  className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Try Sign In with Page Redirect</span>
                </button>
                <span className="text-[11px] text-slate-500">
                  (Navigates directly to Google without popup windows)
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[11px] text-slate-600">
              <span>Your research notes and hypotheses are always safely saved locally on your device.</span>
              <button
                onClick={() => setAuthError(null)}
                className="text-teal-800 hover:underline font-medium cursor-pointer"
              >
                Continue in Guest Mode
              </button>
            </div>
          </div>
        )}

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

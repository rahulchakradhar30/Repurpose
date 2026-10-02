'use client';

import { Search, Bookmark, HelpCircle, User as UserIcon, LogOut } from 'lucide-react';

interface HeaderProps {
  currentTab: 'search' | 'saved' | 'about';
  onSelectTab: (tab: 'search' | 'saved' | 'about') => void;
  user: { uid: string; isAnonymous: boolean; displayName: string | null; email?: string | null } | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  savedCount: number;
}

export function Header({
  currentTab,
  onSelectTab,
  user,
  onOpenAuth,
  onSignOut,
  savedCount,
}: HeaderProps) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Wordmark Only */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('search')}
            className="flex items-center gap-2 text-left focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm"
            aria-label="Repurpose Home"
          >
            <span className="font-semibold text-lg tracking-tight text-white">
              Repurpose
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-wider text-teal-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              Evidence Explorer
            </span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onSelectTab('search')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              currentTab === 'search'
                ? 'bg-slate-800 text-teal-300 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Search</span>
          </button>

          <button
            onClick={() => onSelectTab('saved')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors relative ${
              currentTab === 'saved'
                ? 'bg-slate-800 text-teal-300 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Saved Research</span>
            {savedCount > 0 && (
              <span className="bg-teal-700 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('about')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              currentTab === 'about'
                ? 'bg-slate-800 text-teal-300 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>About & Methodology</span>
          </button>
        </nav>

        {/* User / Auth State */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs text-slate-300 max-w-[120px] truncate">
                {user.displayName || (user.isAnonymous ? 'Guest Researcher' : user.email?.split('@')[0])}
              </span>
              <button
                onClick={onSignOut}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white px-2.5 py-1.5 rounded border border-slate-700 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed for mobile-first PWA experience) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40 px-2 py-1 flex items-center justify-around">
        <button
          onClick={() => onSelectTab('search')}
          className={`flex flex-col items-center justify-center touch-target py-1 px-3 rounded text-[11px] font-medium ${
            currentTab === 'search' ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Search</span>
        </button>

        <button
          onClick={() => onSelectTab('saved')}
          className={`flex flex-col items-center justify-center touch-target py-1 px-3 rounded text-[11px] font-medium relative ${
            currentTab === 'saved' ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-5 h-5 mb-0.5" />
          <span>Saved</span>
          {savedCount > 0 && (
            <span className="absolute top-1 right-2 bg-teal-600 text-white text-[9px] font-bold px-1 rounded-full">
              {savedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('about')}
          className={`flex flex-col items-center justify-center touch-target py-1 px-3 rounded text-[11px] font-medium ${
            currentTab === 'about' ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-0.5" />
          <span>About</span>
        </button>
      </div>
    </header>
  );
}

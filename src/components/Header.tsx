'use client';

import { Search, HelpCircle } from 'lucide-react';

interface HeaderProps {
  currentTab: 'search' | 'about';
  onSelectTab: (tab: 'search' | 'about') => void;
}

export function Header({ currentTab, onSelectTab }: HeaderProps) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Wordmark Only */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('search')}
            className="flex items-center gap-2 text-left focus-visible:ring-2 focus-visible:ring-teal-400 rounded-sm cursor-pointer"
            aria-label="Repurpose Home"
          >
            <span className="font-semibold text-lg tracking-tight text-white">
              Repurpose
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-wider text-teal-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Evidence Explorer
            </span>
          </button>
        </div>

        {/* Desktop Navigation (Read-Only) */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => onSelectTab('search')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              currentTab === 'search'
                ? 'bg-slate-800 text-teal-300 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Search</span>
          </button>

          <button
            onClick={() => onSelectTab('about')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              currentTab === 'about'
                ? 'bg-slate-800 text-teal-300 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>About & Methodology</span>
          </button>
        </nav>
      </div>

      {/* Mobile Bottom Navigation Bar (Search & About only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40 px-4 py-1 flex items-center justify-around">
        <button
          onClick={() => onSelectTab('search')}
          className={`flex flex-col items-center justify-center touch-target py-1 px-4 rounded text-xs font-medium cursor-pointer ${
            currentTab === 'search' ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Search</span>
        </button>

        <button
          onClick={() => onSelectTab('about')}
          className={`flex flex-col items-center justify-center touch-target py-1 px-4 rounded text-xs font-medium cursor-pointer ${
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

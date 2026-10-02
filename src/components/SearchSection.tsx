'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Loader2, X } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (drugName: string) => void;
  isLoading: boolean;
  initialQuery?: string;
}

export function SearchSection({
  onSearch,
  isLoading,
  initialQuery = '',
}: SearchSectionProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; rxcui: string }>>([]);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initialQuery if changed externally (e.g. from URL deep link)
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Live autocomplete query to /api/drugs/search (RxNorm)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsAutocompleteLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAutocompleteLoading(true);
      try {
        const res = await fetch(`/api/drugs/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.results || []);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error('Autocomplete fetch error:', err);
      } finally {
        setIsAutocompleteLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault();
        onSearch(query.trim());
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const selected = suggestions[selectedIndex].name;
        setQuery(selected);
        setIsOpen(false);
        onSearch(selected);
      } else if (query.trim()) {
        setIsOpen(false);
        onSearch(query.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (name: string) => {
    setQuery(name);
    setIsOpen(false);
    onSearch(name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      onSearch(query.trim());
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto py-6 px-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Evidence-Based Drug Repurposing Explorer
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Query live biomedical sources across RxNorm, openFDA, PubChem, ClinicalTrials.gov, and PubMed for investigated indications.
        </p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <label htmlFor="drug-search-input" className="sr-only">
            Search drug by generic or brand name
          </label>
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-teal-700" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>
          <input
            id="drug-search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter drug generic or trade name (e.g. Metformin, Imatinib, Thalidomide)..."
            disabled={isLoading}
            autoComplete="off"
            spellCheck="false"
            className="w-full pl-11 pr-24 py-3 bg-white border-2 border-slate-300 rounded-lg text-slate-900 text-sm sm:text-base placeholder-slate-400 shadow-xs focus:border-teal-700 focus:ring-0 focus:outline-hidden transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="absolute right-16 p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs sm:text-sm font-medium rounded-md transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Live Autocomplete Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div 
            role="listbox"
            id="drug-autocomplete-list"
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto"
          >
            <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-medium uppercase tracking-wider text-slate-500 flex justify-between items-center">
              <span>RxNorm Verified Concepts</span>
              {isAutocompleteLoading && <Loader2 className="w-3 h-3 animate-spin text-teal-700" />}
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={`${item.rxcui}-${idx}`}
                role="option"
                aria-selected={selectedIndex === idx}
                onClick={() => handleSelectSuggestion(item.name)}
                className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                  selectedIndex === idx
                    ? 'bg-teal-50 text-teal-900 font-medium'
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{item.name}</span>
                <span className="text-[10px] font-mono text-slate-400 ml-2 shrink-0">
                  RxCUI: {item.rxcui}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

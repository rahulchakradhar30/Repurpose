'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ArrowRight, Loader2, X, Pill, Mic, AlertCircle } from 'lucide-react';
import { searchDrugDirectory, DrugDirectoryEntry } from '@/lib/drugDirectory';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';

interface SearchSuggestionItem {
  name: string;
  genericName: string;
  brandNames?: string[];
  drugClass?: string;
  rxcui?: string;
  matchedOn?: 'generic' | 'brand';
  matchedTerm?: string;
  source?: 'directory' | 'rxnorm';
}

interface SearchSectionProps {
  onSearch: (drugName: string) => void;
  isLoading: boolean;
  initialQuery?: string;
}

/**
 * Highlights the matched characters/prefix in a suggestion name,
 * matching Google / YouTube search autocomplete visual style.
 */
function HighlightMatchedText({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <span>{text}</span>;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return <span>{text}</span>;
  }

  const before = text.slice(0, matchIndex);
  const matched = text.slice(matchIndex, matchIndex + lowerQuery.length);
  const after = text.slice(matchIndex + lowerQuery.length);

  return (
    <span>
      {before}
      <span className="font-semibold text-teal-800 bg-teal-100/70 rounded-xs px-0.5">
        {matched}
      </span>
      {after}
    </span>
  );
}

export function SearchSection({
  onSearch,
  isLoading,
  initialQuery = '',
}: SearchSectionProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestionItem[]>([]);
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

  // Synchronous client-side directory elimination search helper
  const getInstantDirectoryMatches = useCallback((trimmed: string): SearchSuggestionItem[] => {
    if (trimmed.length < 3) return [];
    const dirResults: DrugDirectoryEntry[] = searchDrugDirectory(trimmed, 8);
    return dirResults.map((item) => ({
      name: item.matchedOn === 'brand' && item.matchedTerm ? item.matchedTerm : item.name,
      genericName: item.genericName,
      brandNames: item.brandNames,
      drugClass: item.drugClass,
      rxcui: item.rxcui,
      matchedOn: item.matchedOn || 'generic',
      matchedTerm: item.matchedTerm || item.name,
      source: 'directory' as const,
    }));
  }, []);

  // Handle typing: immediate elimination on every keystroke
  const handleInputChange = useCallback((newVal: string) => {
    setQuery(newVal);
    const trimmed = newVal.trim();

    // Strict 3-character threshold: do not show dropdown for 1 or 2 characters
    if (trimmed.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    // Instant zero-latency prefix elimination for >= 3 characters (Google/YouTube style)
    const instant = getInstantDirectoryMatches(trimmed);
    setSuggestions(instant);
    setIsOpen(true);
    setSelectedIndex(-1);
  }, [getInstantDirectoryMatches]);

  // Voice search hook integration
  const {
    isSupported,
    isListening,
    errorMessage: voiceError,
    startListening,
    stopListening,
    clearError: clearVoiceError,
  } = useVoiceSearch({
    onTranscript: (spokenText) => {
      handleInputChange(spokenText);
      inputRef.current?.focus();
    },
  });

  // Background debounced RxNorm concept enrichment for >= 3 chars
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setIsAutocompleteLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAutocompleteLoading(true);
      try {
        const res = await fetch(`/api/drugs/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          const apiResults: SearchSuggestionItem[] = data.results || [];
          if (apiResults.length > 0) {
            setSuggestions(apiResults);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error('Autocomplete fetch error:', err);
      } finally {
        setIsAutocompleteLoading(false);
      }
    }, 200);

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
        const selected = suggestions[selectedIndex];
        const searchName = selected.name;
        setQuery(searchName);
        setIsOpen(false);
        onSearch(searchName);
      } else if (query.trim()) {
        setIsOpen(false);
        onSearch(query.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (item: SearchSuggestionItem) => {
    const searchName = item.name;
    setQuery(searchName);
    setIsOpen(false);
    onSearch(searchName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      onSearch(query.trim());
    }
  };

  const trimmedQuery = query.trim();
  const showDropdown = isOpen && trimmedQuery.length >= 3;

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
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (trimmedQuery.length >= 3 && suggestions.length > 0) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening... speak drug name now...'
                : 'Enter drug generic or trade name (e.g. Metformin, Imatinib, Thalidomide)...'
            }
            disabled={isLoading}
            autoComplete="off"
            spellCheck="false"
            className={`w-full pl-11 pr-36 py-3 bg-white border-2 rounded-lg text-slate-900 text-sm sm:text-base placeholder-slate-400 shadow-xs focus:ring-0 focus:outline-hidden transition-colors ${
              isListening ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-300 focus:border-teal-700'
            }`}
          />
          <div className="absolute right-1.5 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                aria-label="Clear input"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {isSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                aria-label={isListening ? 'Stop listening' : 'Search drug by voice'}
                aria-pressed={isListening}
                title={isListening ? 'Listening... click to cancel' : 'Search by voice'}
                className={`p-1.5 rounded-md transition-all cursor-pointer relative ${
                  isListening
                    ? 'bg-red-50 text-red-600 border border-red-300 ring-2 ring-red-400/30'
                    : 'text-slate-400 hover:text-teal-700 hover:bg-slate-100'
                }`}
              >
                {isListening ? (
                  <span className="relative flex items-center justify-center">
                    <Mic className="w-4 h-4 text-red-600 animate-bounce" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  </span>
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs sm:text-sm font-medium rounded-md transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Live Voice Status Indicator */}
        {isListening && (
          <div className="mt-2.5 flex items-center justify-center gap-2 text-xs font-medium text-red-700 bg-red-50/90 border border-red-200 py-1 px-3.5 rounded-full animate-pulse w-fit mx-auto shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>Listening... speak a drug name (e.g. Metformin, Aspirin)</span>
            <button
              type="button"
              onClick={stopListening}
              className="ml-1 text-[11px] underline text-red-600 hover:text-red-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Voice Error Notice */}
        {voiceError && (
          <div className="mt-2 flex items-center justify-between text-xs text-amber-800 bg-amber-50 border border-amber-200 py-1.5 px-3 rounded-lg max-w-lg mx-auto">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {voiceError}
            </span>
            <button
              type="button"
              onClick={clearVoiceError}
              className="ml-2 text-amber-600 hover:text-amber-800 font-bold p-0.5 cursor-pointer"
              aria-label="Dismiss voice error"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Live Autocomplete Dropdown with Prefix Elimination */}
        {showDropdown && (
          <div 
            role="listbox"
            id="drug-autocomplete-list"
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto"
          >
            <div className="px-3.5 py-1.5 bg-slate-50 text-[11px] font-medium text-slate-500 flex justify-between items-center border-b border-slate-100">
              <span className="flex items-center gap-1.5">
                <Pill className="w-3 h-3 text-teal-600" />
                {suggestions.length > 0
                  ? `Matching drugs (${suggestions.length}) · type more to narrow`
                  : `No exact matches for "${trimmedQuery}"`}
              </span>
              {isAutocompleteLoading && <Loader2 className="w-3 h-3 animate-spin text-teal-700" />}
            </div>

            {suggestions.length > 0 ? (
              suggestions.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                const isBrand = item.matchedOn === 'brand';

                return (
                  <button
                    key={`${item.rxcui || item.name}-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectSuggestion(item)}
                    className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/90 text-teal-950 font-medium'
                        : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate text-slate-900 font-medium">
                          <HighlightMatchedText text={item.name} query={trimmedQuery} />
                        </span>
                        {isBrand && item.genericName && (
                          <span className="text-[11px] text-slate-500 shrink-0 font-normal">
                            (generic: {item.genericName})
                          </span>
                        )}
                      </div>
                      {item.drugClass && (
                        <span className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                          {item.drugClass}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.rxcui && (
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          RxCUI: {item.rxcui}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs text-slate-500 text-center">
                No indexed drugs starting with &ldquo;{trimmedQuery}&rdquo;. Press Enter to query biomedical registries directly.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

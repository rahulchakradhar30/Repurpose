'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsArticleItem, NewsCategory } from '@/types';
import { 
  ShieldAlert, 
  Calendar, 
  Clock, 
  Building2, 
  FileText, 
  ChevronRight,
  Filter
} from 'lucide-react';

interface NewsClientListProps {
  initialArticles: NewsArticleItem[];
}

const CATEGORIES: NewsCategory[] = [
  'All',
  'FDA Updates',
  'Safety Alerts',
  'Approvals',
  'Clinical Research',
  'Recalls'
];

/**
 * Format date nicely for human readability
 */
function formatNewsDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function NewsClientList({ initialArticles }: NewsClientListProps) {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('All');

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'All') {
      return initialArticles;
    }
    return initialArticles.filter((item) => item.category === selectedCategory);
  }, [initialArticles, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div 
        role="tablist" 
        aria-label="Filter by news category"
        className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar"
      >
        <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Category:</span>
        </span>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Article Count & Notice */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{filteredArticles.length}</strong> verified biomedical updates
        </span>
        <span className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
          Official FDA &amp; PubMed Feeds
        </span>
      </div>

      {/* Vertical Compact Headline Rows */}
      {filteredArticles.length > 0 ? (
        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
          {filteredArticles.map((article) => {
            const hasThumbnail = Boolean(article.thumbnailUrl);

            return (
              <Link
                key={article.slug}
                href={`/news/${article.slug}`}
                className="group flex items-start justify-between gap-4 p-4 sm:p-5 hover:bg-slate-50 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Top Source Badge & Label */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-xs border border-teal-200">
                      <Building2 className="w-3 h-3 text-teal-700" />
                      {article.source}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {article.category}
                    </span>
                  </div>

                  {/* Headline (Limited to two lines) */}
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-teal-800 line-clamp-2 leading-snug transition-colors">
                    {article.title}
                  </h2>

                  {/* Concise Summary Excerpt */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>

                  {/* Bottom Metadata: Date & Provenance */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatNewsDate(article.publishedAt)}
                    </span>
                    <span>&bull;</span>
                    <span className="text-teal-800 font-medium group-hover:underline flex items-center gap-0.5">
                      Read evidence brief
                      <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>

                {/* Right Side Thumbnail (Only when source provided) */}
                {hasThumbnail && article.thumbnailUrl && (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    <Image
                      src={article.thumbnailUrl}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 80px, 96px"
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center border border-slate-200 rounded-xl bg-white shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No updates found in &ldquo;{selectedCategory}&rdquo;
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            No verified regulatory or literature records matched this category filter in the latest cache cycle. Please select another category or check back after the next scheduled feed refresh.
          </p>
          <button
            onClick={() => setSelectedCategory('All')}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Show All Updates
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Search, Bookmark, BookmarkCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useCalculator } from '../../context/CalculatorContext';
import { CALCULATORS, CATEGORIES } from '../../data/calculatorRegistry';
import { CalculatorCategory, CalculatorMeta } from '../../types';

export const CalculatorDirectory: React.FC = () => {
  const {
    activeCategory,
    setActiveCategory,
    setActiveCalculatorId,
    isFavorite,
    toggleFavorite,
    showToast,
  } = useCalculator();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'alpha'>('popular');

  const filtered = CALCULATORS.filter((calc) => {
    const matchesCat = activeCategory === 'all' || calc.category === activeCategory;
    if (!matchesCat) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      calc.name.toLowerCase().includes(q) ||
      calc.shortName.toLowerCase().includes(q) ||
      calc.description.toLowerCase().includes(q) ||
      calc.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }).sort((a, b) => {
    if (sortBy === 'popular') {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Directory Title & Controls */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Calculators Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse and access our complete suite of specialized client-side calculators.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword (e.g. loan, matrix, BMI, integral)..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* Sort order */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-slate-500">Sort:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                  sortBy === 'popular' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Popular First
              </button>
              <button
                onClick={() => setSortBy('alpha')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                  sortBy === 'alpha' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                A to Z
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills (functional filter controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Calculators ({CALCULATORS.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = CALCULATORS.filter((c) => c.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculator Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
            No calculators found matching your search.
          </p>
          <p className="text-xs text-slate-400">Try clearing your search query or selecting a different category.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((calc) => {
            const isFav = isFavorite(calc.id);
            return (
              <div
                key={calc.id}
                className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition-all"
              >
                <div className="space-y-2.5">
                  {/* Card top: unboxed metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="capitalize">{calc.category}</span>
                      {calc.isPopular && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Popular</span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(calc.id);
                        showToast(isFav ? `Removed ${calc.shortName}` : `Bookmarked ${calc.shortName}`);
                      }}
                      className="p-1 text-slate-300 hover:text-amber-500 dark:text-slate-600 dark:hover:text-amber-400 transition-colors"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFav ? <BookmarkCheck className="w-4 h-4 text-amber-500" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {calc.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {calc.description}
                    </p>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">#{calc.id}</span>
                  <button
                    onClick={() => setActiveCalculatorId(calc.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  ArrowRight,
  Calculator,
  Atom,
  Sigma,
  BarChart2,
  TrendingUp,
  Cpu,
  Clock,
  Sparkles,
  History,
} from 'lucide-react';
import { useCalculator } from '../../context/CalculatorContext';
import { CATEGORIES, CALCULATORS } from '../../data/calculatorRegistry';
import { BasicCalculator } from '../calculators/basic/BasicCalculator';
import { ScientificCalculator } from '../calculators/scientific/ScientificCalculator';

export const CategoryGrid: React.FC = () => {
  const { setActiveCategory, setActiveCalculatorId, history } = useCalculator();
  const [featuredTab, setFeaturedTab] = useState<'basic' | 'scientific'>('scientific');

  // Derive unique recently used calculators from history
  const recentCalcIds = Array.from(new Set(history.map((h) => h.calculatorId))).slice(0, 4);
  const recentCalculators = recentCalcIds
    .map((id) => CALCULATORS.find((c) => c.id === id))
    .filter(Boolean) as typeof CALCULATORS;

  const handleCategoryClick = (catId: string) => {
    setActiveCategory(catId as any);
    setActiveCalculatorId('directory');
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'basic':
        return <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'scientific':
        return <Atom className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'advanced':
        return <Sigma className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'statistics':
        return <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'financial':
        return <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'engineering':
        return <Cpu className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'datetime':
        return <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 'everyday':
      default:
        return <Sparkles className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Recently Used Section (if user has run calculations) */}
      {recentCalculators.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Recently Used Calculators
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recentCalculators.map((calc) => (
              <button
                key={calc.id}
                onClick={() => setActiveCalculatorId(calc.id)}
                className="text-left p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-sm transition-all group"
              >
                <span className="text-xs text-slate-400 capitalize">{calc.category}</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mt-0.5">
                  {calc.shortName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {calc.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Featured Interactive Calculator Spotlight */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Instant Workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Jump directly into calculations or toggle between Standard Arithmetic and Transcendental functions.
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setFeaturedTab('scientific')}
              className={`px-4 py-1.5 font-semibold rounded-md transition-colors ${
                featuredTab === 'scientific'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Scientific Engine
            </button>
            <button
              onClick={() => setFeaturedTab('basic')}
              className={`px-4 py-1.5 font-semibold rounded-md transition-colors ${
                featuredTab === 'basic'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Basic Arithmetic
            </button>
          </div>
        </div>

        <div className="bg-slate-100/50 dark:bg-slate-950/40 p-4 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          {featuredTab === 'scientific' ? <ScientificCalculator /> : <BasicCalculator />}
        </div>
      </div>

      {/* Categories Showcase */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Explore by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Organized into 8 dedicated mathematical and practical domains.
            </p>
          </div>

          <button
            onClick={() => setActiveCalculatorId('directory')}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
          >
            <span>View All ({CALCULATORS.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat) => {
            const count = CALCULATORS.filter((c) => c.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="text-left p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center transition-transform group-hover:scale-105">
                    {getCategoryIcon(cat.id)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>{count} calculators</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Calculators Showcase */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Most Popular Calculations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Frequently accessed calculation tools for engineers, scientists, students, and professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {CALCULATORS.filter((c) => c.isPopular).slice(0, 6).map((calc) => (
            <div
              key={calc.id}
              onClick={() => setActiveCalculatorId(calc.id)}
              className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-sm cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">{calc.category}</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mt-1">
                  {calc.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {calc.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

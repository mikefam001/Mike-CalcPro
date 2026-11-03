import React from 'react';
import { Search, Calculator, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { useCalculator } from '../../context/CalculatorContext';

export const HeroSection: React.FC = () => {
  const { setActiveCalculatorId, setSearchModalOpen } = useCalculator();

  return (
    <div className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Precision Browser Computation Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ textWrap: 'balance' }}>
            The Comprehensive All-in-One Calculator Ecosystem
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            From everyday arithmetic and scientific expressions to matrix algebra, calculus, statistical regression,
            amortized loan schedules, and 15 physical conversion dimensions. Completely client-side and free.
          </p>

          {/* Search Trigger Input */}
          <div className="pt-2 max-w-xl mx-auto">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl shadow-sm text-left transition-all group"
            >
              <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                <Search className="w-5 h-5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Search across 25+ calculators (or press ⌘K)...
                </span>
              </div>
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Quick Access Links */}
          <div className="pt-3 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-600 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500">Popular:</span>
            {[
              { id: 'basic', label: 'Basic' },
              { id: 'scientific', label: 'Scientific' },
              { id: 'loan', label: 'Mortgage & EMI' },
              { id: 'matrix', label: 'Matrix Algebra' },
              { id: 'unitconverter', label: 'Unit Converter' },
              { id: 'statistics', label: 'Statistics' },
              { id: 'bmimeter', label: 'BMI & Calorie' },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveCalculatorId(tool.id)}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-200 font-medium transition-colors"
              >
                {tool.label}
              </button>
            ))}
          </div>

          {/* Trust strip */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-6 sm:gap-12 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Client-Side Privacy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant Decimal Precision</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-blue-500" />
              <span>Zero Registration Required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

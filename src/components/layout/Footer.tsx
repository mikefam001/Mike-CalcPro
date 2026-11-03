import React, { useState } from 'react';
import { Calculator, ShieldCheck, Terminal, Trash2 } from 'lucide-react';
import { useCalculator } from '../../context/CalculatorContext';
import { CATEGORIES } from '../../data/calculatorRegistry';

export const Footer: React.FC = () => {
  const { setActiveCalculatorId, setActiveCategory, clearHistory, showToast } = useCalculator();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const handleCategoryNav = (categoryId: string) => {
    setActiveCategory(categoryId as any);
    setActiveCalculatorId('directory');
  };

  const handleClearAllStorage = () => {
    if (window.confirm('Clear all local calculation history and reset preferences?')) {
      clearHistory();
      localStorage.clear();
      showToast('All local calculation data cleared');
    }
  };

  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: App Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white">
                <Calculator className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Mike <span className="text-emerald-600 dark:text-emerald-400">CalcPro</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Engineered as a comprehensive, browser-authoritative mathematical, financial, and scientific computing suite.
              100% client-side computation with zero server tracking.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero data transmission · Offline capable</span>
            </div>
          </div>

          {/* Column 2: Popular Calculators */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Featured Tools
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => setActiveCalculatorId('basic')} className="hover:text-emerald-600 transition-colors">
                  Basic Calculator
                </button>
              </li>
              <li>
                <button onClick={() => setActiveCalculatorId('scientific')} className="hover:text-emerald-600 transition-colors">
                  Scientific Calculator
                </button>
              </li>
              <li>
                <button onClick={() => setActiveCalculatorId('matrix')} className="hover:text-emerald-600 transition-colors">
                  Matrix Algebra
                </button>
              </li>
              <li>
                <button onClick={() => setActiveCalculatorId('loan')} className="hover:text-emerald-600 transition-colors">
                  Mortgage & EMI Loan
                </button>
              </li>
              <li>
                <button onClick={() => setActiveCalculatorId('unitconverter')} className="hover:text-emerald-600 transition-colors">
                  Universal Unit Converter
                </button>
              </li>
              <li>
                <button onClick={() => setActiveCalculatorId('statistics')} className="hover:text-emerald-600 transition-colors">
                  Descriptive Statistics
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Calculator Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Categories
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button onClick={() => handleCategoryNav(cat.id)} className="hover:text-emerald-600 transition-colors">
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Platform, Privacy & Local Data */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Platform & Storage
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculation history and preferences are saved exclusively in your browser’s local storage.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setShortcutsOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Keyboard Shortcuts Guide</span>
              </button>
              <button
                onClick={handleClearAllStorage}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Local Data & Cache</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Mike CalcPro. High-precision client-side computational engine.</p>
          <div className="flex items-center gap-6">
            <span>WCAG 2.2 AA Compliant</span>
            <span>Client-side Decimal.js & Math.js</span>
          </div>
        </div>
      </div>

      {/* Shortcuts Modal */}
      {shortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShortcutsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Global Search</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">⌘K or Ctrl+K</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Calculate / Evaluate</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">Enter or =</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Clear Display</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">Escape or C</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Backspace</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">Backspace</kbd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Basic Operators</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">+ - * / ^ %</kbd>
              </div>
            </div>
            <button
              onClick={() => setShortcutsOpen(false)}
              className="w-full mt-4 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-emerald-600 rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

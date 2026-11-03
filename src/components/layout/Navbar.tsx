import React, { useState } from 'react';
import {
  Search,
  Sun,
  Moon,
  History,
  Menu,
  X,
  Compass,
  BookmarkCheck,
  Calculator as CalcIcon,
} from 'lucide-react';
import { useCalculator } from '../../context/CalculatorContext';
import { CATEGORIES } from '../../data/calculatorRegistry';

export const Navbar: React.FC = () => {
  const {
    activeCalculatorId,
    setActiveCalculatorId,
    setActiveCategory,
    theme,
    toggleTheme,
    history,
    favorites,
    setSearchModalOpen,
    setHistoryDrawerOpen,
  } = useCalculator();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const handleNav = (target: string) => {
    setActiveCalculatorId(target);
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
  };

  const handleCategoryNav = (categoryId: string) => {
    setActiveCategory(categoryId as any);
    setActiveCalculatorId('directory');
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
            aria-label="Mike CalcPro Home"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <CalcIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                Mike <span className="text-emerald-600 dark:text-emerald-400">CalcPro</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                All-in-One Mathematical Suite
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Desktop Navigation Links (single-line, clean unboxed typography) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => handleNav('home')}
            className={`transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap shrink-0 ${
              activeCalculatorId === 'home' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNav('directory')}
            className={`transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap shrink-0 ${
              activeCalculatorId === 'directory' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            All Calculators
          </button>

          {/* Categories dropdown */}
          <div className="relative">
            <button
              onClick={() => setCategoriesDropdownOpen((prev) => !prev)}
              onBlur={() => setTimeout(() => setCategoriesDropdownOpen(false), 200)}
              className="flex items-center gap-1 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap shrink-0"
              aria-expanded={categoriesDropdownOpen}
            >
              <span>Categories</span>
              <span className="text-xs">▾</span>
            </button>

            {categoriesDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryNav(cat.id)}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleNav('basic')}
            className={`transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap shrink-0 ${
              activeCalculatorId === 'basic' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            Basic
          </button>

          <button
            onClick={() => handleNav('scientific')}
            className={`transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap shrink-0 ${
              activeCalculatorId === 'scientific' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            Scientific
          </button>
        </nav>

        {/* Zone 3: Interactive Affordances (Search, History, Theme, Mobile toggle) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Search Button */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200/80 dark:border-slate-700/80"
            aria-label="Search all calculators"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search calculators</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded">
              ⌘K
            </kbd>
          </button>

          {/* History drawer button */}
          <button
            onClick={() => setHistoryDrawerOpen(true)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Calculation History"
            aria-label="View Calculation History"
          >
            <History className="w-4 h-4" />
            {history.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Open Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-2">
            <button
              onClick={() => handleNav('home')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => handleNav('directory')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Directory
            </button>
            <button
              onClick={() => handleNav('basic')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Basic
            </button>
            <button
              onClick={() => handleNav('scientific')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Scientific
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3">
              Browse Categories
            </span>
            <div className="mt-2 space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryNav(cat.id)}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

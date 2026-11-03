import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalculationHistoryItem, CalculatorCategory } from '../types';
import { storage } from '../utils/storage';
import { CALCULATORS } from '../data/calculatorRegistry';

interface CalculatorContextType {
  activeCalculatorId: string;
  setActiveCalculatorId: (id: string) => void;
  activeCategory: CalculatorCategory | 'all';
  setActiveCategory: (cat: CalculatorCategory | 'all') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  history: CalculationHistoryItem[];
  addHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  historyDrawerOpen: boolean;
  setHistoryDrawerOpen: (open: boolean) => void;
  quickExpression: string | null;
  setQuickExpression: (expr: string | null) => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'omnicalc_theme',
  HISTORY: 'omnicalc_history',
  FAVORITES: 'omnicalc_favorites',
  LAST_CALC: 'omnicalc_last_calc',
};

export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme initialization
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = storage.getItem<'light' | 'dark'>(STORAGE_KEYS.THEME, 'light');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    storage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Active view: 'home', 'directory', or a calculator ID (e.g. 'basic', 'scientific', 'loan', etc.)
  const [activeCalculatorId, setActiveCalculatorIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash && (hash === 'home' || hash === 'directory' || CALCULATORS.some((c) => c.id === hash))) {
        return hash;
      }
    }
    return 'home';
  });

  const setActiveCalculatorId = (id: string) => {
    setActiveCalculatorIdState(id);
    if (typeof window !== 'undefined') {
      window.location.hash = `#/${id}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Listen to hash changes for browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash && (hash === 'home' || hash === 'directory' || CALCULATORS.some((c) => c.id === hash))) {
        setActiveCalculatorIdState(hash);
      } else if (!hash) {
        setActiveCalculatorIdState('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [activeCategory, setActiveCategory] = useState<CalculatorCategory | 'all'>('all');

  // History state
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    return storage.getItem<CalculationHistoryItem[]>(STORAGE_KEYS.HISTORY, []);
  });

  const addHistory = (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: CalculationHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 100); // keep up to 100 entries
      storage.setItem(STORAGE_KEYS.HISTORY, updated);
      return updated;
    });
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      storage.setItem(STORAGE_KEYS.HISTORY, updated);
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    storage.setItem(STORAGE_KEYS.HISTORY, []);
  };

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    return storage.getItem<string[]>(STORAGE_KEYS.FAVORITES, ['basic', 'scientific', 'loan', 'unitconverter', 'statistics']);
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      storage.setItem(STORAGE_KEYS.FAVORITES, updated);
      return updated;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  // Modals & Panels
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [quickExpression, setQuickExpression] = useState<string | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 2500);
  };

  // Global hotkeys (Cmd+K or Ctrl+K for search, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setHistoryDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <CalculatorContext.Provider
      value={{
        activeCalculatorId,
        setActiveCalculatorId,
        activeCategory,
        setActiveCategory,
        theme,
        toggleTheme,
        history,
        addHistory,
        deleteHistoryItem,
        clearHistory,
        favorites,
        toggleFavorite,
        isFavorite,
        searchModalOpen,
        setSearchModalOpen,
        historyDrawerOpen,
        setHistoryDrawerOpen,
        quickExpression,
        setQuickExpression,
        toast,
        showToast,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};

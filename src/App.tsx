import React from 'react';
import { CalculatorProvider, useCalculator } from './context/CalculatorContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { CategoryGrid } from './components/home/CategoryGrid';
import { CalculatorDirectory } from './components/directory/CalculatorDirectory';
import { CalculatorWorkspace } from './components/layout/CalculatorWorkspace';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { HistoryDrawer } from './components/common/HistoryDrawer';

const AppContent: React.FC = () => {
  const { activeCalculatorId, toast } = useCalculator();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar />

      {/* Global Modals */}
      <GlobalSearchModal />
      <HistoryDrawer />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeCalculatorId === 'home' ? (
          <>
            <HeroSection />
            <CategoryGrid />
          </>
        ) : activeCalculatorId === 'directory' ? (
          <CalculatorDirectory />
        ) : (
          <CalculatorWorkspace />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <CalculatorProvider>
      <AppContent />
    </CalculatorProvider>
  );
}

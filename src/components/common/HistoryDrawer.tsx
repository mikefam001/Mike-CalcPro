import React from 'react';
import { X, Trash2, Copy, Play, Download, Clock } from 'lucide-react';
import { useCalculator } from '../../context/CalculatorContext';

export const HistoryDrawer: React.FC = () => {
  const {
    historyDrawerOpen,
    setHistoryDrawerOpen,
    history,
    deleteHistoryItem,
    clearHistory,
    setQuickExpression,
    setActiveCalculatorId,
    showToast,
  } = useCalculator();

  if (!historyDrawerOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied "${text}" to clipboard`);
  };

  const handleReuse = (calcId: string, expression: string) => {
    setActiveCalculatorId(calcId);
    setQuickExpression(expression);
    setHistoryDrawerOpen(false);
    showToast(`Loaded expression into ${calcId}`);
  };

  const handleExport = () => {
    if (history.length === 0) return;
    const content = history
      .map(
        (h) =>
          `[${new Date(h.timestamp).toLocaleString()}] ${h.calculatorName}: ${h.expression} = ${h.result}`
      )
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mikecalcpro-history-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported history as text file');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Calculation History</h2>
            <span className="text-xs text-slate-500 font-mono">({history.length})</span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExport}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md transition-colors"
                  title="Export history as file"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={clearHistory}
                  className="p-1.5 text-rose-500 hover:text-rose-700 rounded-md transition-colors"
                  title="Clear all history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => setHistoryDrawerOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
              <Clock className="w-10 h-10 stroke-[1.5] mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No calculations yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Calculations performed in any calculator are automatically remembered locally for reference.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 group"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {item.calculatorName}
                  </span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>

                <div className="font-mono text-xs text-slate-600 dark:text-slate-300 break-all">
                  {item.expression}
                </div>

                <div className="font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums flex items-baseline justify-between">
                  <span>= {item.result}</span>
                </div>

                {item.details && (
                  <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 grid grid-cols-2 gap-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    {Object.entries(item.details).map(([k, v]) => (
                      <div key={k}>
                        <span className="capitalize">{k}: </span>
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    onClick={() => handleCopy(item.result)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded text-xs flex items-center gap-1"
                    title="Copy result"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Copy</span>
                  </button>

                  <button
                    onClick={() => handleReuse(item.calculatorId, item.expression)}
                    className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 rounded text-xs flex items-center gap-1"
                    title="Load into calculator"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Load</span>
                  </button>

                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded text-xs"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 text-center">
          Persisted locally in your browser storage
        </div>
      </div>
    </div>
  );
};

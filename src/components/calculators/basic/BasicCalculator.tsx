import React, { useState, useEffect, useCallback } from 'react';
import {
  Copy,
  RotateCcw,
  Delete,
  Bookmark,
  BookmarkCheck,
  Check,
} from 'lucide-react';
import { evaluateMathExpression } from '../../../utils/mathEngine';
import { useCalculator } from '../../../context/CalculatorContext';

export const BasicCalculator: React.FC = () => {
  const { addHistory, isFavorite, toggleFavorite, quickExpression, setQuickExpression, showToast } =
    useCalculator();

  const [expression, setExpression] = useState('0');
  const [result, setResult] = useState<string | null>(null);
  const [memory, setMemory] = useState<number>(0);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [copied, setCopied] = useState(false);

  // If a quick expression was injected from history
  useEffect(() => {
    if (quickExpression) {
      setExpression(quickExpression);
      setHasCalculated(false);
      setQuickExpression(null);
    }
  }, [quickExpression, setQuickExpression]);

  const handleInput = useCallback(
    (char: string) => {
      if (hasCalculated) {
        if (['+', '-', '×', '÷', '%'].includes(char)) {
          setExpression((prev) => (result !== null ? result + ' ' + char + ' ' : prev + ' ' + char + ' '));
        } else {
          setExpression(char);
        }
        setHasCalculated(false);
        setResult(null);
        return;
      }

      setExpression((prev) => {
        if (prev === '0' && !['.', '+', '-', '×', '÷', '%'].includes(char)) {
          return char;
        }
        if (['+', '-', '×', '÷'].includes(char)) {
          return prev + ' ' + char + ' ';
        }
        return prev + char;
      });
    },
    [hasCalculated, result]
  );

  const handleClear = () => {
    setExpression('0');
    setResult(null);
    setHasCalculated(false);
  };

  const handleBackspace = useCallback(() => {
    if (hasCalculated) {
      handleClear();
      return;
    }
    setExpression((prev) => {
      if (prev.endsWith(' ')) {
        return prev.trimEnd().slice(0, -1).trimEnd();
      }
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  }, [hasCalculated]);

  const handleCalculate = useCallback(() => {
    if (!expression || expression === '0') return;

    const evalRes = evaluateMathExpression(expression);
    if (evalRes.success && evalRes.result) {
      setResult(evalRes.result);
      setHasCalculated(true);
      addHistory({
        calculatorId: 'basic',
        calculatorName: 'Basic Calculator',
        expression,
        result: evalRes.result,
      });
    } else {
      setResult(evalRes.error || 'Error');
      setHasCalculated(true);
    }
  }, [expression, addHistory]);

  const handleToggleSign = () => {
    if (hasCalculated && result) {
      const num = -Number(result);
      setExpression(num.toString());
      setResult(null);
      setHasCalculated(false);
      return;
    }
    setExpression((prev) => {
      if (prev === '0') return prev;
      if (prev.startsWith('-(') && prev.endsWith(')')) {
        return prev.slice(2, -1);
      }
      return `-(${prev})`;
    });
  };

  const handleSquare = () => {
    const target = hasCalculated && result ? result : expression;
    const nextExpr = `(${target})^2`;
    setExpression(nextExpr);
    const evalRes = evaluateMathExpression(nextExpr);
    if (evalRes.success && evalRes.result) {
      setResult(evalRes.result);
      setHasCalculated(true);
      addHistory({
        calculatorId: 'basic',
        calculatorName: 'Basic Calculator',
        expression: nextExpr,
        result: evalRes.result,
      });
    }
  };

  const handleSquareRoot = () => {
    const target = hasCalculated && result ? result : expression;
    const nextExpr = `sqrt(${target})`;
    setExpression(nextExpr);
    const evalRes = evaluateMathExpression(nextExpr);
    if (evalRes.success && evalRes.result) {
      setResult(evalRes.result);
      setHasCalculated(true);
      addHistory({
        calculatorId: 'basic',
        calculatorName: 'Basic Calculator',
        expression: nextExpr,
        result: evalRes.result,
      });
    }
  };

  const handleReciprocal = () => {
    const target = hasCalculated && result ? result : expression;
    const nextExpr = `1/(${target})`;
    setExpression(nextExpr);
    const evalRes = evaluateMathExpression(nextExpr);
    if (evalRes.success && evalRes.result) {
      setResult(evalRes.result);
      setHasCalculated(true);
      addHistory({
        calculatorId: 'basic',
        calculatorName: 'Basic Calculator',
        expression: nextExpr,
        result: evalRes.result,
      });
    }
  };

  // Memory functions
  const handleMemoryClear = () => {
    setMemory(0);
    showToast('Memory Cleared (MC)');
  };

  const handleMemoryRecall = () => {
    handleInput(memory.toString());
    showToast(`Memory Recalled: ${memory} (MR)`);
  };

  const handleMemoryAdd = () => {
    const val = Number(result || expression);
    if (!isNaN(val)) {
      setMemory((prev) => prev + val);
      showToast(`Added to memory: +${val} (M+)`);
    }
  };

  const handleMemorySubtract = () => {
    const val = Number(result || expression);
    if (!isNaN(val)) {
      setMemory((prev) => prev - val);
      showToast(`Subtracted from memory: -${val} (M-)`);
    }
  };

  const handleCopyResult = () => {
    const textToCopy = result !== null ? result : expression;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast(`Copied ${textToCopy}`);
    setTimeout(() => setCopied(false), 1500);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input elsewhere
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        e.preventDefault();
        handleInput(e.key);
      } else if (e.key === '+') {
        e.preventDefault();
        handleInput('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleInput('-');
      } else if (e.key === '*') {
        e.preventDefault();
        handleInput('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleInput('÷');
      } else if (e.key === '%') {
        e.preventDefault();
        handleInput('%');
      } else if (e.key === '(' || e.key === ')') {
        e.preventDefault();
        handleInput(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleCalculate, handleBackspace]);

  const isFav = isFavorite('basic');

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Header toolbar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Basic Calculator</h2>
            <span className="text-xs text-slate-400">· Standard Arithmetic</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleFavorite('basic')}
              className="p-1.5 text-slate-400 hover:text-amber-500 rounded-md transition-colors"
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFav ? <BookmarkCheck className="w-4 h-4 text-amber-500" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              onClick={handleCopyResult}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
              title="Copy current value"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div className="p-6 bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-right flex flex-col justify-end min-h-[120px]">
          {/* Expression line */}
          <div className="font-mono text-sm text-slate-500 dark:text-slate-400 break-all select-all min-h-[1.25rem]">
            {expression}
          </div>

          {/* Active Result or Main Number */}
          <div className="font-mono text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight mt-1 overflow-x-auto select-all">
            {result !== null ? `= ${result}` : expression}
          </div>

          {/* Memory indicator badge */}
          {memory !== 0 && (
            <div className="mt-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              Memory: {memory}
            </div>
          )}
        </div>

        {/* Keypad */}
        <div className="p-4 sm:p-5 space-y-2.5">
          {/* Row 1: Memory & Function operations */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleMemoryClear}
              className="py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              MC
            </button>
            <button
              onClick={handleMemoryRecall}
              className="py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              MR
            </button>
            <button
              onClick={handleMemoryAdd}
              className="py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              M+
            </button>
            <button
              onClick={handleMemorySubtract}
              className="py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              M-
            </button>
          </div>

          {/* Row 2: Secondary arithmetic */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleReciprocal}
              className="py-2.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-mono"
            >
              1/x
            </button>
            <button
              onClick={handleSquare}
              className="py-2.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-mono"
            >
              x²
            </button>
            <button
              onClick={handleSquareRoot}
              className="py-2.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-mono"
            >
              √x
            </button>
            <button
              onClick={() => handleInput('÷')}
              className="py-2.5 text-base font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              ÷
            </button>
          </div>

          {/* Row 3: Clear & Operators */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleClear}
              className="py-3 text-sm font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
            >
              C
            </button>
            <button
              onClick={() => handleInput('(')}
              className="py-3 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-mono"
            >
              (
            </button>
            <button
              onClick={() => handleInput(')')}
              className="py-3 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-mono"
            >
              )
            </button>
            <button
              onClick={() => handleInput('×')}
              className="py-3 text-base font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Row 4: 7, 8, 9, - */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleInput('7')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              7
            </button>
            <button
              onClick={() => handleInput('8')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              8
            </button>
            <button
              onClick={() => handleInput('9')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              9
            </button>
            <button
              onClick={() => handleInput('-')}
              className="py-3.5 text-xl font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              −
            </button>
          </div>

          {/* Row 5: 4, 5, 6, + */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleInput('4')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              4
            </button>
            <button
              onClick={() => handleInput('5')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              5
            </button>
            <button
              onClick={() => handleInput('6')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              6
            </button>
            <button
              onClick={() => handleInput('+')}
              className="py-3.5 text-xl font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              +
            </button>
          </div>

          {/* Row 6: 1, 2, 3, backspace */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleInput('1')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              1
            </button>
            <button
              onClick={() => handleInput('2')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              2
            </button>
            <button
              onClick={() => handleInput('3')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              3
            </button>
            <button
              onClick={handleBackspace}
              className="py-3.5 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Backspace"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Row 7: +/-, 0, ., = */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleToggleSign}
              className="py-3.5 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-mono"
            >
              ±
            </button>
            <button
              onClick={() => handleInput('0')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              0
            </button>
            <button
              onClick={() => handleInput('.')}
              className="py-3.5 text-xl font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              .
            </button>
            <button
              onClick={handleCalculate}
              className="py-3.5 text-xl font-bold rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-600/20"
            >
              =
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

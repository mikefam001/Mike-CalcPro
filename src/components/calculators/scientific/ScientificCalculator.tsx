import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Copy,
  Delete,
  Bookmark,
  BookmarkCheck,
  Check,
  Settings2,
} from 'lucide-react';
import { evaluateMathExpression } from '../../../utils/mathEngine';
import { useCalculator } from '../../../context/CalculatorContext';
import { AngleMode, NumberFormatMode } from '../../../types';

export const ScientificCalculator: React.FC = () => {
  const { addHistory, isFavorite, toggleFavorite, quickExpression, setQuickExpression, showToast } =
    useCalculator();

  const [expression, setExpression] = useState('0');
  const [result, setResult] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const [numberFormat, setNumberFormat] = useState<NumberFormatMode>('standard');
  const [is2nd, setIs2nd] = useState(false);
  const [isHyp, setIsHyp] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quickExpression) {
      setExpression(quickExpression);
      setHasCalculated(false);
      setQuickExpression(null);
    }
  }, [quickExpression, setQuickExpression]);

  const insert = useCallback(
    (text: string, isFunc = false) => {
      if (hasCalculated) {
        if (['+', '-', '×', '÷', '^', '%'].includes(text)) {
          setExpression((prev) => (result !== null ? result + ' ' + text + ' ' : prev + ' ' + text + ' '));
        } else {
          setExpression(isFunc ? `${text}(` : text);
        }
        setHasCalculated(false);
        setResult(null);
        return;
      }

      setExpression((prev) => {
        if (prev === '0' && !['.', '+', '-', '×', '÷', '^', '%'].includes(text)) {
          return isFunc ? `${text}(` : text;
        }
        if (['+', '-', '×', '÷'].includes(text)) {
          return prev + ' ' + text + ' ';
        }
        return isFunc ? `${prev}${text}(` : prev + text;
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

    const evalRes = evaluateMathExpression(expression, {
      angleMode,
      numberFormat,
      precision: 12,
    });

    if (evalRes.success && evalRes.result) {
      setResult(evalRes.result);
      setHasCalculated(true);
      addHistory({
        calculatorId: 'scientific',
        calculatorName: 'Scientific Calculator',
        expression,
        result: evalRes.result,
        details: { mode: angleMode, format: numberFormat },
      });
    } else {
      setResult(evalRes.error || 'Syntax Error');
      setHasCalculated(true);
    }
  }, [expression, angleMode, numberFormat, addHistory]);

  const handleCopyResult = () => {
    const textToCopy = result !== null ? result : expression;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast(`Copied ${textToCopy}`);
    setTimeout(() => setCopied(false), 1500);
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        e.preventDefault();
        insert(e.key);
      } else if (e.key === '+') {
        e.preventDefault();
        insert('+');
      } else if (e.key === '-') {
        e.preventDefault();
        insert('-');
      } else if (e.key === '*') {
        e.preventDefault();
        insert('×');
      } else if (e.key === '/') {
        e.preventDefault();
        insert('÷');
      } else if (e.key === '^') {
        e.preventDefault();
        insert('^');
      } else if (e.key === '(' || e.key === ')') {
        e.preventDefault();
        insert(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [insert, handleCalculate, handleBackspace]);

  const isFav = isFavorite('scientific');

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Header Toolbar */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Scientific Calculator</h2>
            <span className="text-xs text-slate-400">· Real-time Transcendental Engine</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Angle Mode Selector (interactive segmented control) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              {(['deg', 'rad', 'grad'] as AngleMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAngleMode(mode)}
                  className={`px-2.5 py-1 rounded-md font-mono text-[11px] uppercase transition-colors ${
                    angleMode === mode
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Notation mode */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              {(['standard', 'scientific', 'engineering'] as NumberFormatMode[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setNumberFormat(fmt)}
                  className={`px-2 py-1 rounded-md font-mono text-[10px] uppercase transition-colors ${
                    numberFormat === fmt
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {fmt.slice(0, 3)}
                </button>
              ))}
            </div>

            <button
              onClick={() => toggleFavorite('scientific')}
              className="p-1.5 text-slate-400 hover:text-amber-500 rounded-md transition-colors"
              title="Bookmark calculator"
            >
              {isFav ? <BookmarkCheck className="w-4 h-4 text-amber-500" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              onClick={handleCopyResult}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
              title="Copy result"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="p-6 bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-right flex flex-col justify-end min-h-[140px]">
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-mono mb-1">
            <span className="uppercase tracking-wider">
              Mode: {angleMode} · {numberFormat}
            </span>
            <span>{is2nd ? '2ND active' : isHyp ? 'HYP active' : ''}</span>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={expression}
            onChange={(e) => {
              setExpression(e.target.value);
              setHasCalculated(false);
            }}
            className="w-full bg-transparent font-mono text-sm sm:text-base text-slate-600 dark:text-slate-300 text-right focus:outline-none"
            placeholder="Type or click functions..."
          />

          <div className="font-mono text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight mt-2 overflow-x-auto select-all">
            {result !== null ? `= ${result}` : expression}
          </div>
        </div>

        {/* Scientific Keypad Grid */}
        <div className="p-4 sm:p-6 space-y-2">
          {/* Scientific function rows */}
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 text-xs font-mono">
            {/* Toggles */}
            <button
              onClick={() => setIs2nd(!is2nd)}
              className={`py-2 rounded-lg transition-colors font-semibold ${
                is2nd
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              2nd
            </button>
            <button
              onClick={() => setIsHyp(!isHyp)}
              className={`py-2 rounded-lg transition-colors font-semibold ${
                isHyp
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              hyp
            </button>
            <button
              onClick={() => insert(is2nd ? (isHyp ? 'asinh' : 'asin') : isHyp ? 'sinh' : 'sin', true)}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {is2nd ? (isHyp ? 'sinh⁻¹' : 'sin⁻¹') : isHyp ? 'sinh' : 'sin'}
            </button>
            <button
              onClick={() => insert(is2nd ? (isHyp ? 'acosh' : 'acos') : isHyp ? 'cosh' : 'cosh', true)}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {is2nd ? (isHyp ? 'cosh⁻¹' : 'cos⁻¹') : isHyp ? 'cosh' : 'cos'}
            </button>
            <button
              onClick={() => insert(is2nd ? (isHyp ? 'atanh' : 'atan') : isHyp ? 'tanh' : 'tan', true)}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {is2nd ? (isHyp ? 'tanh⁻¹' : 'tan⁻¹') : isHyp ? 'tanh' : 'tan'}
            </button>
            <button
              onClick={() => insert('pi')}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors hidden sm:block font-sans"
            >
              π
            </button>

            {/* Row 2: Logs & Exponents */}
            <button
              onClick={() => insert(is2nd ? '10^' : 'log10', is2nd ? false : true)}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {is2nd ? '10ˣ' : 'log'}
            </button>
            <button
              onClick={() => insert(is2nd ? 'exp' : 'log', true)}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {is2nd ? 'eˣ' : 'ln'}
            </button>
            <button
              onClick={() => insert('^2')}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              x²
            </button>
            <button
              onClick={() => insert('^')}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              xʸ
            </button>
            <button
              onClick={() => insert(is2nd ? 'cbrt' : 'sqrt', true)}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {is2nd ? '∛x' : '√x'}
            </button>
            <button
              onClick={() => insert('e')}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors hidden sm:block italic font-serif"
            >
              e
            </button>

            {/* Row 3: Advanced math functions */}
            <button
              onClick={() => insert('factorial', true)}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              n!
            </button>
            <button
              onClick={() => insert('combinations', true)}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Combinations nCr(n, r)"
            >
              nCr
            </button>
            <button
              onClick={() => insert('permutations', true)}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Permutations nPr(n, r)"
            >
              nPr
            </button>
            <button
              onClick={() => insert('abs', true)}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              |x|
            </button>
            <button
              onClick={() => insert('mod', true)}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              mod
            </button>
            <button
              onClick={() => insert('1.6180339887')}
              className="py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors hidden sm:block font-serif"
              title="Golden Ratio φ"
            >
              φ
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800" />

          {/* Core Arithmetic Keypad */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            <button
              onClick={handleClear}
              className="py-3 text-sm font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
            >
              AC
            </button>
            <button
              onClick={() => insert('(')}
              className="py-3 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-mono"
            >
              (
            </button>
            <button
              onClick={() => insert(')')}
              className="py-3 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-mono"
            >
              )
            </button>
            <button
              onClick={() => insert('%')}
              className="py-3 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-mono hidden sm:block"
            >
              %
            </button>
            <button
              onClick={() => insert('÷')}
              className="py-3 text-lg font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              ÷
            </button>

            {/* 7, 8, 9, x, backspace */}
            <button
              onClick={() => insert('7')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              7
            </button>
            <button
              onClick={() => insert('8')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              8
            </button>
            <button
              onClick={() => insert('9')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              9
            </button>
            <button
              onClick={handleBackspace}
              className="py-3.5 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors hidden sm:flex"
            >
              <Delete className="w-5 h-5" />
            </button>
            <button
              onClick={() => insert('×')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              ×
            </button>

            {/* 4, 5, 6, - */}
            <button
              onClick={() => insert('4')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              4
            </button>
            <button
              onClick={() => insert('5')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              5
            </button>
            <button
              onClick={() => insert('6')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              6
            </button>
            <button
              onClick={() => insert(',')}
              className="py-3.5 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors hidden sm:block font-mono"
              title="Function argument separator comma"
            >
              ,
            </button>
            <button
              onClick={() => insert('-')}
              className="py-3.5 text-xl font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              −
            </button>

            {/* 1, 2, 3, + */}
            <button
              onClick={() => insert('1')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              1
            </button>
            <button
              onClick={() => insert('2')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              2
            </button>
            <button
              onClick={() => insert('3')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              3
            </button>
            <button
              onClick={() => insert('pi')}
              className="py-3.5 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors sm:hidden font-sans"
            >
              π
            </button>
            <button
              onClick={() => insert('+')}
              className="py-3.5 text-xl font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors sm:row-span-1"
            >
              +
            </button>

            {/* 0, ., = */}
            <button
              onClick={() => insert('0')}
              className="py-3.5 text-lg font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              0
            </button>
            <button
              onClick={() => insert('.')}
              className="py-3.5 text-xl font-semibold rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-white hover:bg-slate-50 transition-colors shadow-xs"
            >
              .
            </button>
            <button
              onClick={handleBackspace}
              className="py-3.5 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors sm:hidden"
            >
              <Delete className="w-5 h-5" />
            </button>
            <button
              onClick={() => insert('e')}
              className="py-3.5 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors hidden sm:block italic font-serif"
            >
              e
            </button>
            <button
              onClick={handleCalculate}
              className="py-3.5 text-xl font-bold rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-600/20 col-span-2 sm:col-span-1"
            >
              =
            </button>
          </div>
        </div>

        {/* Instructions Footer */}
        <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Supports full keyboard entry, nested brackets, and multi-parameter functions</span>
          <span className="font-mono">e.g. sin(30) + log10(100)</span>
        </div>
      </div>
    </div>
  );
};

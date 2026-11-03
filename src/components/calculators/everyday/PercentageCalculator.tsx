import React, { useState } from 'react';
import { Percent, ArrowRight } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const PercentageCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  // Op 1: What is P% of X?
  const [p1, setP1] = useState('15');
  const [x1, setX1] = useState('250');

  // Op 2: X is what % of Y?
  const [x2, setX2] = useState('45');
  const [y2, setY2] = useState('180');

  // Op 3: % Change from X to Y?
  const [x3, setX3] = useState('80');
  const [y3, setY3] = useState('120');

  // Op 4: Add/Subtract P% from X
  const [x4, setX4] = useState('100');
  const [p4, setP4] = useState('20');
  const [sign4, setSign4] = useState<'add' | 'sub'>('add');

  // Op 1 Calc
  const res1 = (() => {
    const p = Number(p1);
    const x = Number(x1);
    if (isNaN(p) || isNaN(x)) return '--';
    return formatNumber((p / 100) * x, { maxDecimals: 4 });
  })();

  // Op 2 Calc
  const res2 = (() => {
    const x = Number(x2);
    const y = Number(y2);
    if (isNaN(x) || isNaN(y) || y === 0) return '--';
    return `${formatNumber((x / y) * 100, { maxDecimals: 4 })}%`;
  })();

  // Op 3 Calc
  const res3 = (() => {
    const x = Number(x3);
    const y = Number(y3);
    if (isNaN(x) || isNaN(y) || x === 0) return '--';
    const change = ((y - x) / Math.abs(x)) * 100;
    const direction = change >= 0 ? 'Increase (+)' : 'Decrease (−)';
    return `${formatNumber(Math.abs(change), { maxDecimals: 2 })}% ${direction}`;
  })();

  // Op 4 Calc
  const res4 = (() => {
    const x = Number(x4);
    const p = Number(p4);
    if (isNaN(x) || isNaN(p)) return '--';
    const delta = x * (p / 100);
    const finalVal = sign4 === 'add' ? x + delta : x - delta;
    return formatNumber(finalVal, { maxDecimals: 4 });
  })();

  const saveOp = (opTitle: string, expression: string, result: string) => {
    addHistory({
      calculatorId: 'percentage',
      calculatorName: 'Percentage Calculator',
      expression,
      result,
    });
    showToast(`Saved to history: ${result}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">All-in-One Percentage Calculator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instant calculations for percentages, proportions, percentage changes, and markup additions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: What is P% of X? */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            1. Percentage of a Number
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-700 dark:text-slate-300">What is</span>
            <input
              type="number"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              className="w-16 px-2 py-1 text-center font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">% of</span>
            <input
              type="number"
              value={x1}
              onChange={(e) => setX1(e.target.value)}
              className="w-24 px-2 py-1 text-center font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">?</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center justify-between">
            <span className="text-xs text-slate-500">Result:</span>
            <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {res1}
            </span>
          </div>
        </div>

        {/* Card 2: X is what % of Y? */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            2. Relative Proportion
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="number"
              value={x2}
              onChange={(e) => setX2(e.target.value)}
              className="w-20 px-2 py-1 text-center font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">is what % of</span>
            <input
              type="number"
              value={y2}
              onChange={(e) => setY2(e.target.value)}
              className="w-20 px-2 py-1 text-center font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">?</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center justify-between">
            <span className="text-xs text-slate-500">Result:</span>
            <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {res2}
            </span>
          </div>
        </div>

        {/* Card 3: % Change from X to Y */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            3. Percentage Increase / Decrease
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-700 dark:text-slate-300">Change from</span>
            <input
              type="number"
              value={x3}
              onChange={(e) => setX3(e.target.value)}
              className="w-20 px-2 py-1 text-center font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">to</span>
            <input
              type="number"
              value={y3}
              onChange={(e) => setY3(e.target.value)}
              className="w-20 px-2 py-1 text-center font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">?</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center justify-between">
            <span className="text-xs text-slate-500">Result:</span>
            <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {res3}
            </span>
          </div>
        </div>

        {/* Card 4: Add / Subtract P% */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            4. Add / Subtract Percentage
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="number"
              value={x4}
              onChange={(e) => setX4(e.target.value)}
              className="w-20 px-2 py-1 text-center font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
            />
            <button
              onClick={() => setSign4(sign4 === 'add' ? 'sub' : 'add')}
              className="px-2 py-1 text-xs font-bold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200"
            >
              {sign4 === 'add' ? '+ Add' : '− Subtract'}
            </button>
            <input
              type="number"
              value={p4}
              onChange={(e) => setP4(e.target.value)}
              className="w-16 px-2 py-1 text-center font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">%</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex items-center justify-between">
            <span className="text-xs text-slate-500">Result:</span>
            <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {res4}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

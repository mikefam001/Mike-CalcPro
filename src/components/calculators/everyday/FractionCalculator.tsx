import React, { useState, useMemo } from 'react';
import { Divide } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { gcd, formatNumber } from '../../../utils/mathEngine';

export const FractionCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [w1, setW1] = useState('0');
  const [n1, setN1] = useState('3');
  const [d1, setD1] = useState('4');

  const [operation, setOperation] = useState<'+' | '−' | '×' | '÷'>('+');

  const [w2, setW2] = useState('0');
  const [n2, setN2] = useState('2');
  const [d2, setD2] = useState('5');

  const calculation = useMemo(() => {
    const whole1 = Number(w1) || 0;
    const num1 = Number(n1);
    const den1 = Number(d1);

    const whole2 = Number(w2) || 0;
    const num2 = Number(n2);
    const den2 = Number(d2);

    if (isNaN(num1) || isNaN(den1) || isNaN(num2) || isNaN(den2) || den1 === 0 || den2 === 0) {
      return null;
    }

    // Convert mixed to improper fraction:
    // sign of whole1 matters
    const sign1 = whole1 < 0 ? -1 : 1;
    const improperNum1 = sign1 * (Math.abs(whole1) * den1 + num1);
    const improperDen1 = den1;

    const sign2 = whole2 < 0 ? -1 : 1;
    const improperNum2 = sign2 * (Math.abs(whole2) * den2 + num2);
    const improperDen2 = den2;

    let resNum = 0;
    let resDen = 1;

    if (operation === '+') {
      resNum = improperNum1 * improperDen2 + improperNum2 * improperDen1;
      resDen = improperDen1 * improperDen2;
    } else if (operation === '−') {
      resNum = improperNum1 * improperDen2 - improperNum2 * improperDen1;
      resDen = improperDen1 * improperDen2;
    } else if (operation === '×') {
      resNum = improperNum1 * improperNum2;
      resDen = improperDen1 * improperDen2;
    } else if (operation === '÷') {
      if (improperNum2 === 0) return null; // divide by zero
      resNum = improperNum1 * improperDen2;
      resDen = improperDen1 * improperNum2;
    }

    // Handle negative denominator
    if (resDen < 0) {
      resNum = -resNum;
      resDen = -resDen;
    }

    // Simplify fraction
    const divisor = gcd(Math.abs(resNum), Math.abs(resDen));
    const simpNum = resNum / divisor;
    const simpDen = resDen / divisor;

    // Mixed number
    const mixedWhole = Math.floor(Math.abs(simpNum) / simpDen) * (simpNum < 0 ? -1 : 1);
    const mixedRemainder = Math.abs(simpNum) % simpDen;

    const decimalValue = simpNum / simpDen;
    const percentValue = decimalValue * 100;

    return {
      simplified: `${simpNum}/${simpDen}`,
      simpNum,
      simpDen,
      mixed:
        Math.abs(simpNum) >= simpDen && mixedRemainder > 0
          ? `${mixedWhole} ${mixedRemainder}/${simpDen}`
          : null,
      decimal: formatNumber(decimalValue, { maxDecimals: 6 }),
      percent: `${formatNumber(percentValue, { maxDecimals: 4 })}%`,
    };
  }, [w1, n1, d1, operation, w2, n2, d2]);

  const handleSave = () => {
    if (!calculation) return;
    const f1Str = `${Number(w1) ? `${w1} ` : ''}${n1}/${d1}`;
    const f2Str = `${Number(w2) ? `${w2} ` : ''}${n2}/${d2}`;
    addHistory({
      calculatorId: 'fraction',
      calculatorName: 'Fraction Calculator',
      expression: `${f1Str} ${operation} ${f2Str}`,
      result: `${calculation.simplified} (${calculation.decimal})`,
    });
    showToast('Saved fraction calculation');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Fraction & Mixed Number Arithmetic</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add, subtract, multiply, and divide standard or mixed fractions with irreducible simplification.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          Save to History
        </button>
      </div>

      {/* Fraction Entry Widgets */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          {/* Fraction 1 */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Whole</label>
              <input
                type="number"
                value={w1}
                onChange={(e) => setW1(e.target.value)}
                className="w-14 px-2 py-2 text-center text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                placeholder="0"
              />
            </div>

            <div className="flex flex-col items-center space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Num</label>
              <input
                type="number"
                value={n1}
                onChange={(e) => setN1(e.target.value)}
                className="w-16 px-2 py-1 text-center text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <div className="w-full h-0.5 bg-slate-300 dark:bg-slate-600" />
              <input
                type="number"
                value={d1}
                onChange={(e) => setD1(e.target.value)}
                className="w-16 px-2 py-1 text-center text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Operation Selector */}
          <div className="flex md:flex-col gap-1.5">
            {(['+', '−', '×', '÷'] as const).map((op) => (
              <button
                key={op}
                onClick={() => setOperation(op)}
                className={`w-10 h-10 rounded-lg font-mono text-lg font-bold transition-colors ${
                  operation === op
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {op}
              </button>
            ))}
          </div>

          {/* Fraction 2 */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Whole</label>
              <input
                type="number"
                value={w2}
                onChange={(e) => setW2(e.target.value)}
                className="w-14 px-2 py-2 text-center text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                placeholder="0"
              />
            </div>

            <div className="flex flex-col items-center space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Num</label>
              <input
                type="number"
                value={n2}
                onChange={(e) => setN2(e.target.value)}
                className="w-16 px-2 py-1 text-center text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <div className="w-full h-0.5 bg-slate-300 dark:bg-slate-600" />
              <input
                type="number"
                value={d2}
                onChange={(e) => setD2(e.target.value)}
                className="w-16 px-2 py-1 text-center text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Output Results */}
      {calculation && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 font-medium">Simplified Fraction:</span>
            <div className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              {calculation.simplified}
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 font-medium">Mixed Fraction:</span>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {calculation.mixed || 'None (< 1)'}
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 font-medium">Decimal Equivalent:</span>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {calculation.decimal}
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 font-medium">Percentage:</span>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {calculation.percent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Users, DollarSign } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const TipSplitCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [billAmount, setBillAmount] = useState('78.50');
  const [tipPercent, setTipPercent] = useState('18');
  const [partySize, setPartySize] = useState('3');
  const [roundTotal, setRoundTotal] = useState(false);

  const calculation = useMemo(() => {
    const bill = Number(billAmount);
    const tipPct = Number(tipPercent);
    const people = Math.max(1, Math.floor(Number(partySize)) || 1);

    if (isNaN(bill) || bill < 0 || isNaN(tipPct) || tipPct < 0) return null;

    let tipTotal = bill * (tipPct / 100);
    let finalTotal = bill + tipTotal;

    if (roundTotal) {
      finalTotal = Math.ceil(finalTotal);
      tipTotal = finalTotal - bill;
    }

    const perPersonTotal = finalTotal / people;
    const perPersonTip = tipTotal / people;

    return {
      bill,
      tipTotal,
      finalTotal,
      people,
      perPersonTotal,
      perPersonTip,
    };
  }, [billAmount, tipPercent, partySize, roundTotal]);

  const handleSave = () => {
    if (!calculation) return;
    addHistory({
      calculatorId: 'tipsplit',
      calculatorName: 'Tip & Bill Split',
      expression: `$${billAmount} with ${tipPercent}% tip split by ${partySize}`,
      result: `$${formatNumber(calculation.perPersonTotal, { maxDecimals: 2 })} / person`,
      details: {
        'Total Tip': `$${formatNumber(calculation.tipTotal, { maxDecimals: 2 })}`,
        'Total Bill': `$${formatNumber(calculation.finalTotal, { maxDecimals: 2 })}`,
      },
    });
    showToast('Saved tip calculation');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Tip & Group Bill Splitter</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate server gratuity, split expenses fairly among party members, and round totals.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          Save to History
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Bill Amount ($):</label>
          <input
            type="number"
            step="any"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Tip Percentage (%):</label>
          <div className="flex gap-1.5 mb-1.5">
            {[10, 15, 18, 20, 25].map((pct) => (
              <button
                key={pct}
                onClick={() => setTipPercent(pct.toString())}
                className={`flex-1 py-1 text-xs rounded-md font-semibold transition-colors ${
                  tipPercent === pct.toString()
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
          <input
            type="number"
            step="1"
            value={tipPercent}
            onChange={(e) => setTipPercent(e.target.value)}
            className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            placeholder="Custom %"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Number of People:</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPartySize((p) => Math.max(1, Number(p) - 1).toString())}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={partySize}
              onChange={(e) => setPartySize(e.target.value)}
              className="flex-1 text-center py-2 text-base font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <button
              onClick={() => setPartySize((p) => (Number(p) + 1).toString())}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300"
            >
              +
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="round"
              checked={roundTotal}
              onChange={(e) => setRoundTotal(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="round" className="text-xs text-slate-500 cursor-pointer">
              Round up to whole dollar
            </label>
          </div>
        </div>
      </div>

      {calculation && (
        <div className="space-y-4">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <span className="text-xs text-slate-500 font-medium">Each Person Pays:</span>
            <div className="font-mono text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              ${formatNumber(calculation.perPersonTotal, { maxDecimals: 2 })}
            </div>
            <span className="text-xs text-slate-400 block font-mono">
              Includes ${formatNumber(calculation.perPersonTip, { maxDecimals: 2 })} tip per person
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Total Bill:</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                ${formatNumber(calculation.finalTotal, { maxDecimals: 2 })}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Total Tip Added:</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                ${formatNumber(calculation.tipTotal, { maxDecimals: 2 })}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500 font-medium">Split Count:</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {calculation.people} {calculation.people === 1 ? 'Person' : 'People'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

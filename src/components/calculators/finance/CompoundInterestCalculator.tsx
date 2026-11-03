import React, { useState, useMemo } from 'react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const CompoundInterestCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [principal, setPrincipal] = useState('10000');
  const [annualRate, setAnnualRate] = useState('8');
  const [years, setYears] = useState('10');
  const [frequency, setFrequency] = useState<number>(12); // monthly default
  const [monthlyDeposit, setMonthlyDeposit] = useState('200');

  const calculation = useMemo(() => {
    const P = Number(principal);
    const r = Number(annualRate) / 100;
    const t = Number(years);
    const n = frequency;
    const pmt = Number(monthlyDeposit) || 0;

    if (isNaN(P) || isNaN(r) || isNaN(t) || P < 0 || t <= 0) return null;

    // Compound growth with recurring deposits
    // For each year, track deposits and interest
    const yearlyBreakdown: { year: number; deposits: number; interest: number; balance: number }[] = [];
    let currentBalance = P;
    let totalDeposits = P;

    for (let yr = 1; yr <= t; yr++) {
      let yearlyInterest = 0;
      for (let m = 1; m <= 12; m++) {
        currentBalance += pmt;
        totalDeposits += pmt;
        // compound step: rate applied monthly
        const interestStep = currentBalance * (r / 12);
        currentBalance += interestStep;
        yearlyInterest += interestStep;
      }
      yearlyBreakdown.push({
        year: yr,
        deposits: totalDeposits,
        interest: currentBalance - totalDeposits,
        balance: currentBalance,
      });
    }

    // Simple interest without compounding for comparison: I = P * r * t
    const simpleInterest = P * r * t;
    const simpleTotal = P + simpleInterest;

    return {
      futureValue: currentBalance,
      totalDeposited: totalDeposits,
      totalInterestEarned: currentBalance - totalDeposits,
      simpleInterestTotal: simpleTotal,
      compoundAdvantage: currentBalance - simpleTotal,
      yearlyBreakdown,
    };
  }, [principal, annualRate, years, frequency, monthlyDeposit]);

  const handleSave = () => {
    if (!calculation) return;
    addHistory({
      calculatorId: 'compound',
      calculatorName: 'Compound Interest',
      expression: `$${Number(principal).toLocaleString()} at ${annualRate}% for ${years} yrs (+$${monthlyDeposit}/mo)`,
      result: `$${formatNumber(calculation.futureValue, { maxDecimals: 2 })}`,
      details: {
        'Interest Earned': `$${formatNumber(calculation.totalInterestEarned, { maxDecimals: 0 })}`,
      },
    });
    showToast('Saved compound interest calculation');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Compound Interest Growth Calculator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-frequency compounding, regular deposits, and comparison against simple linear interest.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          Save to History
        </button>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Initial Principal ($):</label>
          <input
            type="number"
            step="500"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Annual Rate (%):</label>
          <input
            type="number"
            step="0.5"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Term (Years):</label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Monthly Deposit ($):</label>
          <input
            type="number"
            step="50"
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Frequency:</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="365">Daily</option>
            <option value="12">Monthly</option>
            <option value="4">Quarterly</option>
            <option value="1">Annually</option>
          </select>
        </div>
      </div>

      {calculation && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Future Portfolio Balance:</span>
              <div className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                ${formatNumber(calculation.futureValue, { maxDecimals: 2 })}
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Total Interest Earned:</span>
              <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                ${formatNumber(calculation.totalInterestEarned, { maxDecimals: 2 })}
              </div>
              <span className="text-[11px] text-slate-400">
                +${formatNumber(calculation.compoundAdvantage, { maxDecimals: 0 })} vs linear simple interest
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Total Principal Deposited:</span>
              <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                ${formatNumber(calculation.totalDeposited, { maxDecimals: 0 })}
              </div>
            </div>
          </div>

          {/* Growth Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Year-by-Year Growth Schedule</h3>
            </div>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold sticky top-0 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Year</th>
                    <th className="py-2.5 px-4 text-right">Total Contributed</th>
                    <th className="py-2.5 px-4 text-right">Accrued Interest</th>
                    <th className="py-2.5 px-4 text-right">Total Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {calculation.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-4 font-semibold text-slate-900 dark:text-white">Year {row.year}</td>
                      <td className="py-2 px-4 text-right">${formatNumber(row.deposits, { maxDecimals: 2 })}</td>
                      <td className="py-2 px-4 text-right text-emerald-600 dark:text-emerald-400">
                        ${formatNumber(row.interest, { maxDecimals: 2 })}
                      </td>
                      <td className="py-2 px-4 text-right font-bold text-slate-900 dark:text-white">
                        ${formatNumber(row.balance, { maxDecimals: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

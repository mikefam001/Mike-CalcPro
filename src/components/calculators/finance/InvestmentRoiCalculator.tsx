import React, { useState, useMemo } from 'react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const InvestmentRoiCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [initialInvestment, setInitialInvestment] = useState('25000');
  const [annualReturnRate, setAnnualReturnRate] = useState('10');
  const [durationYears, setDurationYears] = useState('15');
  const [monthlyContribution, setMonthlyContribution] = useState('300');

  const result = useMemo(() => {
    const P = Number(initialInvestment);
    const r = Number(annualReturnRate) / 100;
    const t = Number(durationYears);
    const pmt = Number(monthlyContribution) || 0;

    if (isNaN(P) || isNaN(r) || isNaN(t) || P < 0 || t <= 0) return null;

    let balance = P;
    let totalInvested = P;

    for (let yr = 1; yr <= t; yr++) {
      for (let m = 1; m <= 12; m++) {
        balance += pmt;
        totalInvested += pmt;
        balance += balance * (r / 12);
      }
    }

    const netProfit = balance - totalInvested;
    const totalRoiPercent = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;
    // Compound Annual Growth Rate (CAGR)
    const cagr = P > 0 ? (Math.pow(balance / P, 1 / t) - 1) * 100 : 0;

    return {
      endingBalance: balance,
      totalInvested,
      netProfit,
      totalRoiPercent,
      cagr,
    };
  }, [initialInvestment, annualReturnRate, durationYears, monthlyContribution]);

  const handleSave = () => {
    if (!result) return;
    addHistory({
      calculatorId: 'investment',
      calculatorName: 'Investment ROI',
      expression: `$${Number(initialInvestment).toLocaleString()} invested at ${annualReturnRate}% for ${durationYears} yrs`,
      result: `$${formatNumber(result.endingBalance, { maxDecimals: 0 })} (+${formatNumber(result.totalRoiPercent, { maxDecimals: 1 })}% ROI)`,
    });
    showToast('Saved investment calculation');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Investment Return & ROI Simulator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compound capital gains, recurring monthly dollar-cost averaging, and CAGR analytics.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          Save to History
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Initial Capital ($):</label>
          <input
            type="number"
            step="1000"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Expected Return (% / yr):</label>
          <input
            type="number"
            step="0.5"
            value={annualReturnRate}
            onChange={(e) => setAnnualReturnRate(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Time Horizon (Years):</label>
          <input
            type="number"
            value={durationYears}
            onChange={(e) => setDurationYears(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Monthly Addition ($):</label>
          <input
            type="number"
            step="50"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Final Portfolio Value:</span>
            <div className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              ${formatNumber(result.endingBalance, { maxDecimals: 0 })}
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Net Profit / Capital Gain:</span>
            <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              ${formatNumber(result.netProfit, { maxDecimals: 0 })}
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Total ROI (%):</span>
            <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              +{formatNumber(result.totalRoiPercent, { maxDecimals: 1 })}%
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Total Out-of-Pocket Invested:</span>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              ${formatNumber(result.totalInvested, { maxDecimals: 0 })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

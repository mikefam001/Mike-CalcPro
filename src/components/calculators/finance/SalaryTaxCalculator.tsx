import React, { useState, useMemo } from 'react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const SalaryTaxCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [grossInput, setGrossInput] = useState('85000');
  const [payPeriod, setPayPeriod] = useState<'annual' | 'monthly' | 'hourly'>('annual');
  const [hourlyHoursPerWeek, setHourlyHoursPerWeek] = useState('40');
  const [stateTaxRate, setStateTaxRate] = useState('5.0'); // %

  const breakdown = useMemo(() => {
    let annualGross = Number(grossInput);
    if (payPeriod === 'monthly') {
      annualGross = annualGross * 12;
    } else if (payPeriod === 'hourly') {
      annualGross = annualGross * Number(hourlyHoursPerWeek) * 52;
    }

    if (isNaN(annualGross) || annualGross <= 0) return null;

    // FICA taxes: Social Security (6.2% up to $168,600 cap) and Medicare (1.45%)
    const ssTax = Math.min(annualGross, 168600) * 0.062;
    const medicareTax = annualGross * 0.0145;
    const ficaTotal = ssTax + medicareTax;

    // Progressive Federal Tax approximation (Standard deduction ~$14,600 single)
    const taxableIncome = Math.max(0, annualGross - 14600);
    let federalTax = 0;
    if (taxableIncome > 0) {
      if (taxableIncome <= 11600) {
        federalTax = taxableIncome * 0.10;
      } else if (taxableIncome <= 47150) {
        federalTax = 1160 + (taxableIncome - 11600) * 0.12;
      } else if (taxableIncome <= 100525) {
        federalTax = 5426 + (taxableIncome - 47150) * 0.22;
      } else if (taxableIncome <= 191950) {
        federalTax = 17168.5 + (taxableIncome - 100525) * 0.24;
      } else {
        federalTax = 39110.5 + (taxableIncome - 191950) * 0.32;
      }
    }

    // State Tax
    const stateTax = taxableIncome * (Number(stateTaxRate) / 100);

    const totalTax = federalTax + stateTax + ficaTotal;
    const netAnnual = annualGross - totalTax;
    const effectiveTaxRate = (totalTax / annualGross) * 100;

    return {
      annualGross,
      federalTax,
      stateTax,
      ficaTotal,
      ssTax,
      medicareTax,
      totalTax,
      netAnnual,
      effectiveTaxRate,
      periods: {
        annual: { gross: annualGross, tax: totalTax, net: netAnnual },
        monthly: { gross: annualGross / 12, tax: totalTax / 12, net: netAnnual / 12 },
        biweekly: { gross: annualGross / 26, tax: totalTax / 26, net: netAnnual / 26 },
        weekly: { gross: annualGross / 52, tax: totalTax / 52, net: netAnnual / 52 },
        hourly: {
          gross: annualGross / (52 * Number(hourlyHoursPerWeek || 40)),
          tax: totalTax / (52 * Number(hourlyHoursPerWeek || 40)),
          net: netAnnual / (52 * Number(hourlyHoursPerWeek || 40)),
        },
      },
    };
  }, [grossInput, payPeriod, hourlyHoursPerWeek, stateTaxRate]);

  const handleSave = () => {
    if (!breakdown) return;
    addHistory({
      calculatorId: 'salary',
      calculatorName: 'Salary & Tax',
      expression: `$${Number(grossInput).toLocaleString()} ${payPeriod}`,
      result: `$${formatNumber(breakdown.periods.monthly.net, { maxDecimals: 0 })} / mo net`,
      details: {
        'Effective Tax Rate': `${breakdown.effectiveTaxRate.toFixed(1)}%`,
        'Annual Net': `$${formatNumber(breakdown.netAnnual, { maxDecimals: 0 })}`,
      },
    });
    showToast('Saved salary breakdown to history');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Salary, Deductions & Take-Home Pay</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Federal income brackets, FICA (Social Security & Medicare), state tax, and pay period breakdown.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Gross Salary Amount ($):</label>
          <input
            type="number"
            step="1000"
            value={grossInput}
            onChange={(e) => setGrossInput(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Frequency:</label>
          <select
            value={payPeriod}
            onChange={(e) => setPayPeriod(e.target.value as any)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="annual">Annual Salary</option>
            <option value="monthly">Monthly Wage</option>
            <option value="hourly">Hourly Rate</option>
          </select>
        </div>

        {payPeriod === 'hourly' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Hours / Week:</label>
            <input
              type="number"
              value={hourlyHoursPerWeek}
              onChange={(e) => setHourlyHoursPerWeek(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">State Tax Estimate (%):</label>
          <input
            type="number"
            step="0.5"
            value={stateTaxRate}
            onChange={(e) => setStateTaxRate(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {breakdown && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Net Take-Home Pay (Annual):</span>
              <div className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                ${formatNumber(breakdown.netAnnual, { maxDecimals: 0 })}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                ${formatNumber(breakdown.periods.monthly.net, { maxDecimals: 0 })} per month
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Total Taxes Withheld:</span>
              <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                ${formatNumber(breakdown.totalTax, { maxDecimals: 0 })}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Effective Tax Rate: {breakdown.effectiveTaxRate.toFixed(1)}%
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Bi-Weekly Paycheck:</span>
              <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                ${formatNumber(breakdown.periods.biweekly.net, { maxDecimals: 0 })}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">26 pay periods / year</span>
            </div>
          </div>

          {/* Paycheck Conversion Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pay Period Breakdown Matrix</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Cadence</th>
                    <th className="py-2.5 px-4 text-right">Gross Pay</th>
                    <th className="py-2.5 px-4 text-right">Taxes Withheld</th>
                    <th className="py-2.5 px-4 text-right">Net Take-Home</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {Object.entries(breakdown.periods).map(([cadence, data]) => (
                    <tr key={cadence} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-semibold capitalize text-slate-900 dark:text-white">
                        {cadence}
                      </td>
                      <td className="py-2.5 px-4 text-right">${formatNumber(data.gross, { maxDecimals: 2 })}</td>
                      <td className="py-2.5 px-4 text-right text-rose-500">${formatNumber(data.tax, { maxDecimals: 2 })}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ${formatNumber(data.net, { maxDecimals: 2 })}
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

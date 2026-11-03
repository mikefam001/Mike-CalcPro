import React, { useState, useMemo } from 'react';
import { Copy, Download, Check, Home, DollarSign } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

interface AmortizationRow {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export const LoanMortgageCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [principal, setPrincipal] = useState('350000');
  const [annualRate, setAnnualRate] = useState('6.5');
  const [termYears, setTermYears] = useState('30');
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState('0');
  const [viewSchedule, setViewSchedule] = useState<'yearly' | 'monthly'>('yearly');

  const [copied, setCopied] = useState(false);

  // Computed Loan details
  const calculation = useMemo(() => {
    const P = Number(principal);
    const rAnnual = Number(annualRate) / 100;
    const years = Number(termYears);
    const extra = Number(extraMonthlyPayment) || 0;

    if (isNaN(P) || isNaN(rAnnual) || isNaN(years) || P <= 0 || years <= 0) {
      return null;
    }

    const nTotalMonths = years * 12;
    const rMonthly = rAnnual / 12;

    // Monthly Payment EMI = P * [r(1+r)^n] / [(1+r)^n - 1]
    let baseMonthlyPayment = 0;
    if (rMonthly === 0) {
      baseMonthlyPayment = P / nTotalMonths;
    } else {
      const factor = Math.pow(1 + rMonthly, nTotalMonths);
      baseMonthlyPayment = (P * rMonthly * factor) / (factor - 1);
    }

    // Generate full amortization schedule
    const schedule: AmortizationRow[] = [];
    let currentBalance = P;
    let totalInterest = 0;
    let totalPaid = 0;
    let actualMonths = 0;

    for (let m = 1; m <= nTotalMonths && currentBalance > 0.01; m++) {
      const interestPayment = currentBalance * rMonthly;
      let principalPayment = baseMonthlyPayment - interestPayment + extra;

      if (principalPayment > currentBalance) {
        principalPayment = currentBalance;
      }

      currentBalance -= principalPayment;
      totalInterest += interestPayment;
      totalPaid += principalPayment + interestPayment;
      actualMonths = m;

      schedule.push({
        month: m,
        year: Math.ceil(m / 12),
        payment: principalPayment + interestPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, currentBalance),
      });
    }

    // Yearly summary
    const yearlyMap: Record<
      number,
      { principalPaid: number; interestPaid: number; totalPaid: number; endBalance: number }
    > = {};

    schedule.forEach((row) => {
      if (!yearlyMap[row.year]) {
        yearlyMap[row.year] = { principalPaid: 0, interestPaid: 0, totalPaid: 0, endBalance: 0 };
      }
      yearlyMap[row.year].principalPaid += row.principal;
      yearlyMap[row.year].interestPaid += row.interest;
      yearlyMap[row.year].totalPaid += row.payment;
      yearlyMap[row.year].endBalance = row.balance;
    });

    return {
      monthlyPayment: baseMonthlyPayment + extra,
      baseMonthlyPayment,
      totalPayment: totalPaid,
      totalInterest,
      schedule,
      yearlyMap,
      payoffYears: (actualMonths / 12).toFixed(1),
    };
  }, [principal, annualRate, termYears, extraMonthlyPayment]);

  const handleExportCSV = () => {
    if (!calculation) return;
    let csv = 'Month,Year,Payment,Principal,Interest,Remaining Balance\n';
    calculation.schedule.forEach((row) => {
      csv += `${row.month},${row.year},${row.payment.toFixed(2)},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.balance.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amortization-schedule-${principal}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported amortization schedule as CSV');
  };

  const handleSaveToHistory = () => {
    if (!calculation) return;
    addHistory({
      calculatorId: 'loan',
      calculatorName: 'Mortgage & Loan EMI',
      expression: `$${Number(principal).toLocaleString()} at ${annualRate}% for ${termYears} yrs`,
      result: `$${formatNumber(calculation.monthlyPayment, { maxDecimals: 2 })} / mo`,
      details: {
        'Total Interest': `$${formatNumber(calculation.totalInterest, { maxDecimals: 0 })}`,
        'Total Cost': `$${formatNumber(calculation.totalPayment, { maxDecimals: 0 })}`,
      },
    });
    showToast('Saved mortgage calculation to history');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Loan, Mortgage & EMI Amortization</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monthly principal & interest breakdown, payoff schedule, and CSV export.
          </p>
        </div>

        <button
          onClick={handleSaveToHistory}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          Save to History
        </button>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Loan Amount ($):
          </label>
          <input
            type="number"
            step="1000"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Interest Rate (% per year):
          </label>
          <input
            type="number"
            step="0.1"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Loan Term (Years):
          </label>
          <select
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="10">10 Years</option>
            <option value="15">15 Years</option>
            <option value="20">20 Years</option>
            <option value="25">25 Years</option>
            <option value="30">30 Years</option>
            <option value="40">40 Years</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Extra Monthly Pay ($):
          </label>
          <input
            type="number"
            step="50"
            value={extraMonthlyPayment}
            onChange={(e) => setExtraMonthlyPayment(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            placeholder="0"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      {calculation && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium block">Monthly Payment (EMI):</span>
              <div className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                ${formatNumber(calculation.monthlyPayment, { maxDecimals: 2 })}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Payoff duration: {calculation.payoffYears} years
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium block">Total Interest Paid:</span>
              <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                ${formatNumber(calculation.totalInterest, { maxDecimals: 0 })}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {((calculation.totalInterest / Number(principal)) * 100).toFixed(1)}% of original principal
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium block">Total Repayment Amount:</span>
              <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                ${formatNumber(calculation.totalPayment, { maxDecimals: 0 })}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Principal + All Interest</span>
            </div>
          </div>

          {/* Visual Breakdown Bar */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Principal: ${Number(principal).toLocaleString()}</span>
              <span>Interest: ${Math.round(calculation.totalInterest).toLocaleString()}</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-600"
                style={{
                  width: `${(Number(principal) / calculation.totalPayment) * 100}%`,
                }}
              />
              <div
                className="h-full bg-amber-500"
                style={{
                  width: `${(calculation.totalInterest / calculation.totalPayment) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Amortization Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Amortization Schedule</h3>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setViewSchedule('yearly')}
                    className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                      viewSchedule === 'yearly' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Annual Summary
                  </button>
                  <button
                    onClick={() => setViewSchedule('monthly')}
                    className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                      viewSchedule === 'monthly' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Monthly Schedule
                  </button>
                </div>
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold sticky top-0 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">{viewSchedule === 'yearly' ? 'Year' : 'Month'}</th>
                    <th className="py-2.5 px-4 text-right">Payment</th>
                    <th className="py-2.5 px-4 text-right">Principal</th>
                    <th className="py-2.5 px-4 text-right">Interest</th>
                    <th className="py-2.5 px-4 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {viewSchedule === 'yearly'
                    ? Object.entries(calculation.yearlyMap).map(([yr, data]) => (
                        <tr key={yr} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-4 font-semibold text-slate-900 dark:text-white">Year {yr}</td>
                          <td className="py-2 px-4 text-right">${data.totalPaid.toFixed(2)}</td>
                          <td className="py-2 px-4 text-right text-emerald-600 dark:text-emerald-400">
                            ${data.principalPaid.toFixed(2)}
                          </td>
                          <td className="py-2 px-4 text-right text-amber-600 dark:text-amber-400">
                            ${data.interestPaid.toFixed(2)}
                          </td>
                          <td className="py-2 px-4 text-right font-bold text-slate-900 dark:text-white">
                            ${data.endBalance.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    : calculation.schedule.slice(0, 120).map((row) => (
                        <tr key={row.month} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-4 text-slate-600 dark:text-slate-400">#{row.month}</td>
                          <td className="py-2 px-4 text-right">${row.payment.toFixed(2)}</td>
                          <td className="py-2 px-4 text-right text-emerald-600 dark:text-emerald-400">
                            ${row.principal.toFixed(2)}
                          </td>
                          <td className="py-2 px-4 text-right text-amber-600 dark:text-amber-400">
                            ${row.interest.toFixed(2)}
                          </td>
                          <td className="py-2 px-4 text-right font-bold text-slate-900 dark:text-white">
                            ${row.balance.toFixed(2)}
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

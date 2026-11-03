import React, { useState, useMemo } from 'react';
import { Calendar, Plus, Minus } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';

export const DateDifferenceCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [mode, setMode] = useState<'diff' | 'addsub'>('diff');

  // Difference mode
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });

  // Add/Subtract mode
  const [baseDate, setBaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [opDirection, setOpDirection] = useState<'add' | 'sub'>('add');
  const [deltaYears, setDeltaYears] = useState('0');
  const [deltaMonths, setDeltaMonths] = useState('3');
  const [deltaDays, setDeltaDays] = useState('15');

  // Computed Date Difference
  const diffResult = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = end.getTime() - start.getTime();
    const totalDays = Math.round(diffMs / msPerDay);

    // Business days count (Mon-Fri)
    let businessDays = 0;
    const cur = new Date(start);
    const isForward = end >= start;
    const step = isForward ? 1 : -1;

    // limit loop to avoid infinite freeze
    const maxSteps = Math.min(Math.abs(totalDays), 10000);
    for (let i = 0; i < maxSteps; i++) {
      cur.setDate(cur.getDate() + step);
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
    }

    // Years, Months, Days breakdown
    let y = end.getFullYear() - start.getFullYear();
    let m = end.getMonth() - start.getMonth();
    let d = end.getDate() - start.getDate();

    if (d < 0) {
      m--;
      const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      d += prevMonthLastDay;
    }
    if (m < 0) {
      y--;
      m += 12;
    }

    return {
      totalDays: Math.abs(totalDays),
      businessDays,
      years: Math.abs(y),
      months: Math.abs(m),
      days: Math.abs(d),
      weeks: (Math.abs(totalDays) / 7).toFixed(1),
      totalHours: Math.abs(totalDays) * 24,
    };
  }, [startDate, endDate]);

  // Computed Add/Sub Result
  const addSubResult = useMemo(() => {
    const d = new Date(baseDate);
    if (isNaN(d.getTime())) return null;

    const sign = opDirection === 'add' ? 1 : -1;
    const yr = Number(deltaYears) || 0;
    const mo = Number(deltaMonths) || 0;
    const da = Number(deltaDays) || 0;

    d.setFullYear(d.getFullYear() + sign * yr);
    d.setMonth(d.getMonth() + sign * mo);
    d.setDate(d.getDate() + sign * da);

    return {
      formatted: d.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      iso: d.toISOString().slice(0, 10),
    };
  }, [baseDate, opDirection, deltaYears, deltaMonths, deltaDays]);

  const handleSaveDiff = () => {
    if (!diffResult) return;
    addHistory({
      calculatorId: 'datediff',
      calculatorName: 'Date Difference',
      expression: `${startDate} to ${endDate}`,
      result: `${diffResult.totalDays} calendar days (${diffResult.years}y ${diffResult.months}m ${diffResult.days}d)`,
      details: { 'Working Days': diffResult.businessDays },
    });
    showToast('Saved date difference to history');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Date Difference & Working Days</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate exact duration between dates, working business days, and future date addition.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setMode('diff')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              mode === 'diff' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Between 2 Dates
          </button>
          <button
            onClick={() => setMode('addsub')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              mode === 'addsub' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Add / Subtract Days
          </button>
        </div>
      </div>

      {mode === 'diff' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {diffResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 font-medium">Total Calendar Days:</span>
                  <div className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                    {diffResult.totalDays.toLocaleString()} days
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    ~{diffResult.weeks} weeks
                  </span>
                </div>

                <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 font-medium">Business / Working Days:</span>
                  <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {diffResult.businessDays.toLocaleString()} days
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Excluding weekends (Mon–Fri)</span>
                </div>

                <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 font-medium">Calendar Breakdown:</span>
                  <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {diffResult.years}y {diffResult.months}m {diffResult.days}d
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    {diffResult.totalHours.toLocaleString()} total hours
                  </span>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSaveDiff}
                  className="px-6 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Save to History
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'addsub' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Base Starting Date:</label>
                <input
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Operation:</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setOpDirection('add')}
                    className={`flex-1 py-1.5 font-semibold rounded-md transition-colors ${
                      opDirection === 'add' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    + Add Time
                  </button>
                  <button
                    onClick={() => setOpDirection('sub')}
                    className={`flex-1 py-1.5 font-semibold rounded-md transition-colors ${
                      opDirection === 'sub' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    − Subtract Time
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Years:</label>
                <input
                  type="number"
                  value={deltaYears}
                  onChange={(e) => setDeltaYears(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Months:</label>
                <input
                  type="number"
                  value={deltaMonths}
                  onChange={(e) => setDeltaMonths(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Days:</label>
                <input
                  type="number"
                  value={deltaDays}
                  onChange={(e) => setDeltaDays(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {addSubResult && (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-500 font-medium">Resulting Target Date:</span>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {addSubResult.formatted}
              </div>
              <span className="text-xs text-slate-400 font-mono">({addSubResult.iso})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

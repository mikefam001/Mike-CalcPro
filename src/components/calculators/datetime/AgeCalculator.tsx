import React, { useState, useMemo } from 'react';
import { Calendar, Cake, Clock } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';

export const AgeCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [birthDate, setBirthDate] = useState('1995-06-15');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().slice(0, 10));

  const ageData = useMemo(() => {
    const birth = new Date(birthDate);
    const target = new Date(targetDate);

    if (isNaN(birth.getTime()) || isNaN(target.getTime()) || target < birth) {
      return null;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonthLast = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
      days += prevMonthLast;
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Total days lived
    const diffMs = target.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 24;
    const totalWeeks = Math.floor(totalDays / 7);

    // Day of week born
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const birthDayName = daysOfWeek[birth.getDay()];

    // Next birthday countdown
    const nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < target) {
      nextBday.setFullYear(nextBday.getFullYear() + 1);
    }
    const daysUntilNextBday = Math.ceil((nextBday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    return {
      years,
      months,
      days,
      totalDays,
      totalHours,
      totalWeeks,
      birthDayName,
      daysUntilNextBday,
    };
  }, [birthDate, targetDate]);

  const handleSave = () => {
    if (!ageData) return;
    addHistory({
      calculatorId: 'age',
      calculatorName: 'Age Chronometer',
      expression: `Born ${birthDate}`,
      result: `${ageData.years} yrs, ${ageData.months} mos, ${ageData.days} days`,
      details: {
        'Total Days Lived': ageData.totalDays.toLocaleString(),
        'Days to Next Birthday': ageData.daysUntilNextBday,
      },
    });
    showToast('Saved age to history');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Precision Chronological Age Calculator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Exact age in years, months, and days, next birthday countdown, and total days lived.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          Save to History
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Date of Birth:</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Calculate Age At Date:</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {ageData && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <span className="text-xs text-slate-500 font-medium">Exact Chronological Age:</span>
            <div className="font-mono text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
              {ageData.years} <span className="text-lg font-normal text-slate-400">years</span> {ageData.months}{' '}
              <span className="text-lg font-normal text-slate-400">months</span> {ageData.days}{' '}
              <span className="text-lg font-normal text-slate-400">days</span>
            </div>
            <span className="text-xs text-slate-400">Born on a {ageData.birthDayName}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Next Birthday In:</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {ageData.daysUntilNextBday} days
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Total Days Lived:</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {ageData.totalDays.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Total Weeks:</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {ageData.totalWeeks.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Total Hours:</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {ageData.totalHours.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Hourglass, Play, Pause, RotateCcw } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';

export const CountdownTimer: React.FC = () => {
  const { showToast } = useCalculator();

  const [eventName, setEventName] = useState('New Year Countdown');
  const [targetDateTime, setTargetDateTime] = useState(() => {
    const nextYear = new Date().getFullYear() + 1;
    return `${nextYear}-01-01T00:00`;
  });

  const [timeLeft, setTimeLeft] = useState<{
    totalMs: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(targetDateTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ totalMs: diff, days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDateTime]);

  const setPreset = (type: 'friday' | 'newyear' | 'tomorrow') => {
    const d = new Date();
    if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
      setEventName('Tomorrow Event');
    } else if (type === 'friday') {
      const day = d.getDay();
      const diff = (5 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      d.setHours(17, 0, 0, 0);
      setEventName('Friday 5:00 PM Weekend');
    } else if (type === 'newyear') {
      d.setFullYear(d.getFullYear() + 1, 0, 1);
      d.setHours(0, 0, 0, 0);
      setEventName('New Year Celebration');
    }
    setTargetDateTime(d.toISOString().slice(0, 16));
    showToast('Updated target countdown');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Live Event Countdown Chronometer</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time ticking countdown to any target milestone, deadline, or celebration.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPreset('tomorrow')}
            className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 text-slate-700 dark:text-slate-300"
          >
            Tomorrow
          </button>
          <button
            onClick={() => setPreset('friday')}
            className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 text-slate-700 dark:text-slate-300"
          >
            Friday 5PM
          </button>
          <button
            onClick={() => setPreset('newyear')}
            className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 text-slate-700 dark:text-slate-300"
          >
            New Year
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Event Name:</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Target Date & Time:</label>
          <input
            type="datetime-local"
            value={targetDateTime}
            onChange={(e) => setTargetDateTime(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Countdown Card */}
      <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{eventName}</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="font-mono text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {timeLeft.days}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1 block">Days</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="font-mono text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tabular-nums">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1 block">Hours</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="font-mono text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tabular-nums">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1 block">Minutes</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="font-mono text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1 block">Seconds</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-mono">Target: {new Date(targetDateTime).toLocaleString()}</p>
      </div>
    </div>
  );
};

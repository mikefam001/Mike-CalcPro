import React, { useState, useEffect } from 'react';
import { Globe, Clock, Sun, Moon } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';

interface CityZone {
  city: string;
  country: string;
  timeZone: string;
}

const CITIES: CityZone[] = [
  { city: 'London', country: 'United Kingdom', timeZone: 'Europe/London' },
  { city: 'New York', country: 'United States (ET)', timeZone: 'America/New_York' },
  { city: 'San Francisco', country: 'United States (PT)', timeZone: 'America/Los_Angeles' },
  { city: 'Paris / Berlin', country: 'Europe (CET)', timeZone: 'Europe/Paris' },
  { city: 'Dubai', country: 'UAE (GST)', timeZone: 'Asia/Dubai' },
  { city: 'Tokyo', country: 'Japan (JST)', timeZone: 'Asia/Tokyo' },
  { city: 'Singapore', country: 'Singapore (SGT)', timeZone: 'Asia/Singapore' },
  { city: 'Sydney', country: 'Australia (AEST)', timeZone: 'Australia/Sydney' },
];

export const WorldTimeConverter: React.FC = () => {
  const [selectedHourOffset, setSelectedHourOffset] = useState<number>(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCityTime = (timeZone: string, hourShift: number) => {
    const d = new Date(now.getTime() + hourShift * 3600 * 1000);
    try {
      const timeStr = d.toLocaleTimeString('en-US', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const hour24 = parseInt(
        d.toLocaleTimeString('en-US', { timeZone, hour: '2-digit', hour12: false }),
        10
      );

      const dateStr = d.toLocaleDateString('en-US', {
        timeZone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const isBusinessHour = hour24 >= 9 && hour24 <= 17;
      const isNight = hour24 < 6 || hour24 >= 22;

      return { timeStr, dateStr, isBusinessHour, isNight, hour24 };
    } catch {
      return { timeStr: '--:--', dateStr: '--', isBusinessHour: false, isNight: false, hour24: 12 };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">World Time & Global Meeting Planner</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare international business hours and find overlapping meeting windows across timezones.
          </p>
        </div>

        {/* Hour adjuster */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Simulate time shift:</span>
          <button
            onClick={() => setSelectedHourOffset((prev) => prev - 1)}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold hover:bg-slate-200"
          >
            −1h
          </button>
          <span className="font-mono font-semibold px-2">
            {selectedHourOffset >= 0 ? `+${selectedHourOffset}` : selectedHourOffset} hrs
          </span>
          <button
            onClick={() => setSelectedHourOffset((prev) => prev + 1)}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold hover:bg-slate-200"
          >
            +1h
          </button>
          {selectedHourOffset !== 0 && (
            <button
              onClick={() => setSelectedHourOffset(0)}
              className="text-emerald-600 dark:text-emerald-400 text-xs ml-1 hover:underline"
            >
              Reset to Now
            </button>
          )}
        </div>
      </div>

      {/* Grid of Cities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {CITIES.map((city) => {
          const info = formatCityTime(city.timeZone, selectedHourOffset);
          return (
            <div
              key={city.city}
              className={`p-5 rounded-xl border transition-colors ${
                info.isBusinessHour
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{city.city}</span>
                {info.isNight ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
              <span className="text-[11px] text-slate-400 block">{city.country}</span>

              <div className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-3 tabular-nums">
                {info.timeStr}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{info.dateStr}</div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                <span
                  className={`font-semibold ${
                    info.isBusinessHour
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {info.isBusinessHour ? '● Business Hours (9-5)' : '○ Outside Work Hours'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

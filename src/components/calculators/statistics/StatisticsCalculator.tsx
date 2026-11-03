import React, { useState } from 'react';
import { Copy, Check, BarChart3, RefreshCw } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const StatisticsCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [rawInput, setRawInput] = useState('12, 15, 18, 22, 24, 25, 26, 28, 30, 32, 45');
  const [dataMode, setDataMode] = useState<'sample' | 'population'>('sample');

  const [stats, setStats] = useState<{
    count: number;
    sum: number;
    mean: number;
    median: number;
    modes: number[];
    min: number;
    max: number;
    range: number;
    variance: number;
    stdDev: number;
    q1: number;
    q3: number;
    iqr: number;
    outliers: number[];
    sortedData: number[];
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const parseNumbers = (text: string): number[] => {
    return text
      .split(/[\s,;\n]+/)
      .map((item) => Number(item.trim()))
      .filter((n) => !isNaN(n) && isFinite(n));
  };

  const handleCalculate = () => {
    const nums = parseNumbers(rawInput);
    if (nums.length < 2) {
      showToast('Please enter at least 2 numbers');
      return;
    }

    const n = nums.length;
    const sorted = [...nums].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    // Median
    const mid = Math.floor(n / 2);
    const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // Modes
    const freq: Record<number, number> = {};
    let maxFreq = 0;
    sorted.forEach((num) => {
      freq[num] = (freq[num] || 0) + 1;
      if (freq[num] > maxFreq) maxFreq = freq[num];
    });
    const modes: number[] = [];
    if (maxFreq > 1) {
      Object.entries(freq).forEach(([k, count]) => {
        if (count === maxFreq) modes.push(Number(k));
      });
    }

    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;

    // Variance & StdDev
    const divisor = dataMode === 'sample' ? n - 1 : n;
    const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / divisor;
    const stdDev = Math.sqrt(variance);

    // Quartiles via standard interpolation
    const getPercentile = (p: number) => {
      const index = p * (n - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    };

    const q1 = getPercentile(0.25);
    const q3 = getPercentile(0.75);
    const iqr = q3 - q1;

    // Outlier detection: < Q1 - 1.5*IQR or > Q3 + 1.5*IQR
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);

    setStats({
      count: n,
      sum,
      mean,
      median,
      modes,
      min,
      max,
      range,
      variance,
      stdDev,
      q1,
      q3,
      iqr,
      outliers,
      sortedData: sorted,
    });

    addHistory({
      calculatorId: 'statistics',
      calculatorName: 'Statistics Analyzer',
      expression: `Dataset (n=${n})`,
      result: `Mean=${formatNumber(mean, { maxDecimals: 2 })}, SD=${formatNumber(stdDev, { maxDecimals: 2 })}`,
    });
  };

  const handleCopyReport = () => {
    if (!stats) return;
    const report = `DESCRIPTIVE STATISTICS SUMMARY (${dataMode})
Sample Size (n): ${stats.count}
Sum: ${formatNumber(stats.sum, { maxDecimals: 4 })}
Mean: ${formatNumber(stats.mean, { maxDecimals: 4 })}
Median: ${formatNumber(stats.median, { maxDecimals: 4 })}
Mode: ${stats.modes.length > 0 ? stats.modes.join(', ') : 'None'}
Min: ${stats.min}
Max: ${stats.max}
Range: ${formatNumber(stats.range, { maxDecimals: 4 })}
Variance: ${formatNumber(stats.variance, { maxDecimals: 4 })}
Standard Deviation: ${formatNumber(stats.stdDev, { maxDecimals: 4 })}
Q1 (25th): ${formatNumber(stats.q1, { maxDecimals: 4 })}
Q3 (75th): ${formatNumber(stats.q3, { maxDecimals: 4 })}
IQR: ${formatNumber(stats.iqr, { maxDecimals: 4 })}
Outliers: ${stats.outliers.length > 0 ? stats.outliers.join(', ') : 'None'}
`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    showToast('Copied statistics report');
    setTimeout(() => setCopied(false), 1500);
  };

  const loadSample = () => {
    setRawInput('68, 72, 75, 78, 82, 84, 85, 85, 88, 90, 92, 95, 98, 105');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Descriptive Statistics & Box Plot</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Full univariate analysis: Mean, Median, Variance, Standard Deviation, Quartiles, and Outliers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSample}
            className="flex items-center gap-1 px-3 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sample Data
          </button>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setDataMode('sample')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                dataMode === 'sample' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Sample (n-1)
            </button>
            <button
              onClick={() => setDataMode('population')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                dataMode === 'population' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Population (N)
            </button>
          </div>
        </div>
      </div>

      {/* Input Textarea */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Enter data values (separated by commas, spaces, or line breaks):
        </label>
        <textarea
          rows={3}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="e.g. 10, 14, 18, 25, 30, 42..."
          className="w-full px-3 py-2 font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Detected {parseNumbers(rawInput).length} numbers
          </span>
          <button
            onClick={handleCalculate}
            className="px-6 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            Calculate Statistics
          </button>
        </div>
      </div>

      {/* Results View */}
      {stats && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Data Summary ({dataMode === 'sample' ? 'Sample Statistics' : 'Population Statistics'})
            </h3>
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Full Report</span>
            </button>
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Mean (Average):</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatNumber(stats.mean, { maxDecimals: 4 })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Median:</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatNumber(stats.median, { maxDecimals: 4 })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Std Deviation ({dataMode === 'sample' ? 's' : 'σ'}):</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatNumber(stats.stdDev, { maxDecimals: 4 })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Variance:</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatNumber(stats.variance, { maxDecimals: 4 })}
              </div>
            </div>
          </div>

          {/* Interactive SVG Box Plot Visualizer */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tukey Box Plot Visualization
            </span>
            <div className="relative w-full h-28 flex items-center justify-center">
              {(() => {
                const min = stats.min;
                const max = stats.max;
                const span = max - min || 1;
                const getX = (val: number) => `${((val - min) / span) * 80 + 10}%`;

                return (
                  <svg className="w-full h-full" viewBox="0 0 500 90">
                    {/* Whiskers */}
                    <line x1="50" y1="45" x2="450" y2="45" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                    {/* Min tick */}
                    <line x1="50" y1="30" x2="50" y2="60" stroke="#64748b" strokeWidth="3" />
                    {/* Max tick */}
                    <line x1="450" y1="30" x2="450" y2="60" stroke="#64748b" strokeWidth="3" />

                    {/* Box (Q1 to Q3) */}
                    {(() => {
                      const q1X = 50 + ((stats.q1 - min) / span) * 400;
                      const q3X = 50 + ((stats.q3 - min) / span) * 400;
                      const medX = 50 + ((stats.median - min) / span) * 400;
                      const boxWidth = Math.max(4, q3X - q1X);

                      return (
                        <g>
                          <rect
                            x={q1X}
                            y="20"
                            width={boxWidth}
                            height="50"
                            fill="#10b981"
                            fillOpacity="0.25"
                            stroke="#059669"
                            strokeWidth="2"
                            rx="4"
                          />
                          {/* Median Line */}
                          <line x1={medX} y1="20" x2={medX} y2="70" stroke="#047857" strokeWidth="3" />
                        </g>
                      );
                    })()}

                    {/* Labels */}
                    <text x="50" y="80" textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="monospace">
                      Min {stats.min}
                    </text>
                    <text x="450" y="80" textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="monospace">
                      Max {stats.max}
                    </text>
                  </svg>
                );
              })()}
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span>Q1: {formatNumber(stats.q1, { maxDecimals: 2 })}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Median (Q2): {formatNumber(stats.median, { maxDecimals: 2 })}
              </span>
              <span>Q3: {formatNumber(stats.q3, { maxDecimals: 2 })}</span>
              <span>IQR: {formatNumber(stats.iqr, { maxDecimals: 2 })}</span>
            </div>
          </div>

          {/* Full Data Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Sample Size (n):</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">{stats.count}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Sum:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {formatNumber(stats.sum, { maxDecimals: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Modes:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {stats.modes.length > 0 ? stats.modes.join(', ') : 'No unique mode'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Outliers (&gt; 1.5×IQR):</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {stats.outliers.length > 0 ? stats.outliers.join(', ') : 'None detected'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

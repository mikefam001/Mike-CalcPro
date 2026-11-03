import React, { useState } from 'react';
import { Copy, Check, TrendingUp, RefreshCw } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

interface DataPoint {
  x: number;
  y: number;
}

export const RegressionCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [rawPairs, setRawPairs] = useState(
    '1, 2.5\n2, 3.8\n3, 6.1\n4, 7.9\n5, 10.2\n6, 12.0\n7, 14.5\n8, 16.2'
  );
  const [predictX, setPredictX] = useState('9');
  const [predictedY, setPredictedY] = useState<string | null>(null);

  const [regression, setRegression] = useState<{
    n: number;
    meanX: number;
    meanY: number;
    slope: number;
    intercept: number;
    r: number;
    rSquared: number;
    points: DataPoint[];
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const parsePairs = (text: string): DataPoint[] => {
    const lines = text.split('\n');
    const result: DataPoint[] = [];
    for (const line of lines) {
      const parts = line.split(/[,\s\t]+/).filter(Boolean);
      if (parts.length >= 2) {
        const x = Number(parts[0]);
        const y = Number(parts[1]);
        if (!isNaN(x) && !isNaN(y)) {
          result.push({ x, y });
        }
      }
    }
    return result;
  };

  const handleCompute = () => {
    const points = parsePairs(rawPairs);
    if (points.length < 3) {
      showToast('Please enter at least 3 valid (x, y) data pairs');
      return;
    }

    const n = points.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (const pt of points) {
      sumX += pt.x;
      sumY += pt.y;
      sumXY += pt.x * pt.y;
      sumX2 += pt.x * pt.x;
      sumY2 += pt.y * pt.y;
    }

    const meanX = sumX / n;
    const meanY = sumY / n;

    // Slope m = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX^2)
    const denomSlope = n * sumX2 - sumX * sumX;
    if (Math.abs(denomSlope) < 1e-12) {
      showToast('All x values are identical; slope is undefined vertical line');
      return;
    }

    const slope = (n * sumXY - sumX * sumY) / denomSlope;
    const intercept = meanY - slope * meanX;

    // Pearson r = (n*sumXY - sumX*sumY) / sqrt((n*sumX2 - sumX^2) * (n*sumY2 - sumY^2))
    const denomR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = denomR !== 0 ? (n * sumXY - sumX * sumY) / denomR : 0;
    const rSquared = r * r;

    setRegression({
      n,
      meanX,
      meanY,
      slope,
      intercept,
      r,
      rSquared,
      points,
    });

    // Compute prediction if predictX is present
    const pX = Number(predictX);
    if (!isNaN(pX)) {
      const pY = slope * pX + intercept;
      setPredictedY(formatNumber(pY, { maxDecimals: 4 }));
    }

    addHistory({
      calculatorId: 'regression',
      calculatorName: 'Linear Regression',
      expression: `Linear Fit (n=${n})`,
      result: `y = ${formatNumber(slope, { maxDecimals: 2 })}x + ${formatNumber(intercept, { maxDecimals: 2 })} (R²=${formatNumber(rSquared, { maxDecimals: 3 })})`,
    });
  };

  const handlePredict = () => {
    if (!regression) return;
    const pX = Number(predictX);
    if (isNaN(pX)) {
      showToast('Please enter a valid numeric X to predict');
      return;
    }
    const pY = regression.slope * pX + regression.intercept;
    setPredictedY(formatNumber(pY, { maxDecimals: 4 }));
  };

  const handleSample = () => {
    setRawInputSample();
  };

  const setRawInputSample = () => {
    setRawPairs('10, 20\n15, 32\n20, 38\n25, 52\n30, 58\n35, 72\n40, 81\n45, 90');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Linear Regression & Correlation</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Least squares line of best fit, Pearson r, R², scatter plot and prediction model.
          </p>
        </div>

        <button
          onClick={handleSample}
          className="flex items-center gap-1 px-3 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Sample Pairs
        </button>
      </div>

      {/* Input section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Enter (X, Y) coordinate points (one pair per line, separated by commas or spaces):
        </label>
        <textarea
          rows={5}
          value={rawPairs}
          onChange={(e) => setRawPairs(e.target.value)}
          placeholder="e.g. 1, 2.5&#10;2, 3.8&#10;3, 6.1..."
          className="w-full px-3 py-2 font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {parsePairs(rawPairs).length} coordinate points parsed
          </span>
          <button
            onClick={handleCompute}
            className="px-6 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            Compute Linear Model
          </button>
        </div>
      </div>

      {/* Results View */}
      {regression && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Regression Model Equation
              </span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                ŷ = {formatNumber(regression.slope, { maxDecimals: 4 })}·x {regression.intercept >= 0 ? '+' : '−'}{' '}
                {formatNumber(Math.abs(regression.intercept), { maxDecimals: 4 })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Correlation (r):</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatNumber(regression.r, { maxDecimals: 4 })}
              </div>
              <span className="text-[10px] text-slate-400">
                {Math.abs(regression.r) > 0.8 ? 'Strong correlation' : 'Moderate correlation'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Determination (R²):</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatNumber(regression.rSquared, { maxDecimals: 4 })}
              </div>
              <span className="text-[10px] text-slate-400">
                {(regression.rSquared * 100).toFixed(1)}% variance explained
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Slope (m):</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatNumber(regression.slope, { maxDecimals: 4 })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Intercept (b):</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatNumber(regression.intercept, { maxDecimals: 4 })}
              </div>
            </div>
          </div>

          {/* Interactive SVG Scatter Plot */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Scatter Plot & Line of Best Fit
            </span>
            <div className="w-full h-56 flex items-center justify-center">
              {(() => {
                const xs = regression.points.map((p) => p.x);
                const ys = regression.points.map((p) => p.y);
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);

                const spanX = maxX - minX || 1;
                const spanY = maxY - minY || 1;

                const padL = 40;
                const padR = 20;
                const padT = 20;
                const padB = 30;
                const w = 460;
                const h = 200;

                const scaleX = (x: number) => padL + ((x - minX) / spanX) * (w - padL - padR);
                const scaleY = (y: number) => h - padB - ((y - minY) / spanY) * (h - padT - padB);

                const lineY1 = regression.slope * minX + regression.intercept;
                const lineY2 = regression.slope * maxX + regression.intercept;

                return (
                  <svg className="w-full h-full" viewBox={`0 0 ${w} ${h}`}>
                    {/* Grid axes */}
                    <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="#cbd5e1" strokeWidth="1" />
                    <line x1={padL} y1={padT} x2={padL} y2={h - padB} stroke="#cbd5e1" strokeWidth="1" />

                    {/* Regression Line */}
                    <line
                      x1={scaleX(minX)}
                      y1={scaleY(lineY1)}
                      x2={scaleX(maxX)}
                      y2={scaleY(lineY2)}
                      stroke="#059669"
                      strokeWidth="2.5"
                    />

                    {/* Data Points */}
                    {regression.points.map((pt, idx) => (
                      <circle
                        key={idx}
                        cx={scaleX(pt.x)}
                        cy={scaleY(pt.y)}
                        r="4"
                        fill="#10b981"
                        stroke="#065f46"
                        strokeWidth="1.5"
                      >
                        <title>{`(${pt.x}, ${pt.y})`}</title>
                      </circle>
                    ))}
                  </svg>
                );
              })()}
            </div>
          </div>

          {/* Predictor */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Predict ŷ for value x:
            </span>
            <input
              type="number"
              step="any"
              value={predictX}
              onChange={(e) => setPredictX(e.target.value)}
              className="w-24 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            <button
              onClick={handlePredict}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200"
            >
              Evaluate
            </button>
            {predictedY !== null && (
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ŷ = {predictedY}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

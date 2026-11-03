import React, { useState } from 'react';
import { Copy, Check, Play, HelpCircle } from 'lucide-react';
import { evaluateMathExpression, formatNumber } from '../../../utils/mathEngine';
import { useCalculator } from '../../../context/CalculatorContext';

export const CalculusCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [activeTab, setActiveTab] = useState<'integral' | 'derivative' | 'summation' | 'series'>('integral');

  // Definite Integral state
  const [intFunc, setIntFunc] = useState('x^2 * sin(x)');
  const [lowerBound, setLowerBound] = useState('0');
  const [upperBound, setUpperBound] = useState('pi');
  const [intResult, setIntResult] = useState<string | null>(null);

  // Derivative state
  const [derivFunc, setDerivFunc] = useState('x^3 - 3*x + 2');
  const [derivPoint, setDerivPoint] = useState('2');
  const [derivResult, setDerivResult] = useState<string | null>(null);
  const [secondDerivResult, setSecondDerivResult] = useState<string | null>(null);

  // Summation state
  const [sumFunc, setSumFunc] = useState('1 / n^2');
  const [sumStart, setSumStart] = useState('1');
  const [sumEnd, setSumEnd] = useState('100');
  const [sumResult, setSumResult] = useState<string | null>(null);

  // Series state (Arithmetic & Geometric)
  const [seriesType, setSeriesType] = useState<'arithmetic' | 'geometric'>('geometric');
  const [firstTermA, setFirstTermA] = useState('2');
  const [diffOrRatio, setDiffOrRatio] = useState('0.5'); // d or r
  const [termsCountN, setTermsCountN] = useState('10');
  const [seriesResult, setSeriesResult] = useState<{
    nthTerm: string;
    sumN: string;
    infiniteSum?: string;
    sequencePreview: string[];
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to safely evaluate f(x)
  const evalFuncAt = (funcStr: string, varName: string, val: number): number => {
    // Replace variable with value
    const expr = funcStr.replace(new RegExp(`\\b${varName}\\b`, 'g'), `(${val})`);
    const res = evaluateMathExpression(expr, { angleMode: 'rad' });
    if (!res.success || res.numericValue === undefined || isNaN(res.numericValue)) {
      throw new Error(`Failed to evaluate expression at ${varName} = ${val}`);
    }
    return res.numericValue;
  };

  // Composite Simpson's 1/3 Rule for definite integrals
  const handleCalculateIntegral = () => {
    setErrorMsg(null);
    try {
      const a = evalFuncAt(lowerBound, 'dummy', 0);
      const b = evalFuncAt(upperBound, 'dummy', 0);

      if (a === b) {
        setIntResult('0');
        return;
      }

      const n = 1000; // subintervals (even number)
      const h = (b - a) / n;

      let sum = evalFuncAt(intFunc, 'x', a) + evalFuncAt(intFunc, 'x', b);
      for (let i = 1; i < n; i++) {
        const x = a + i * h;
        const coef = i % 2 === 0 ? 2 : 4;
        sum += coef * evalFuncAt(intFunc, 'x', x);
      }

      const numericalIntegral = (h / 3) * sum;
      const formatted = formatNumber(numericalIntegral, { maxDecimals: 8 });
      setIntResult(formatted);

      addHistory({
        calculatorId: 'calculus',
        calculatorName: 'Numerical Calculus',
        expression: `∫[${lowerBound} to ${upperBound}] (${intFunc}) dx`,
        result: formatted,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Numerical integration failed. Check formula syntax.');
    }
  };

  // Numerical differentiation (Central difference)
  const handleCalculateDerivative = () => {
    setErrorMsg(null);
    try {
      const x0 = evalFuncAt(derivPoint, 'dummy', 0);
      const h = 1e-6;

      // First derivative: (f(x+h) - f(x-h)) / (2h)
      const fxPlus = evalFuncAt(derivFunc, 'x', x0 + h);
      const fxMinus = evalFuncAt(derivFunc, 'x', x0 - h);
      const fx = evalFuncAt(derivFunc, 'x', x0);

      const fPrime = (fxPlus - fxMinus) / (2 * h);
      // Second derivative: (f(x+h) - 2f(x) + f(x-h)) / (h^2)
      const fDoublePrime = (fxPlus - 2 * fx + fxMinus) / (h * h);

      const formatted1 = formatNumber(fPrime, { maxDecimals: 8 });
      const formatted2 = formatNumber(fDoublePrime, { maxDecimals: 8 });

      setDerivResult(formatted1);
      setSecondDerivResult(formatted2);

      addHistory({
        calculatorId: 'calculus',
        calculatorName: 'Numerical Calculus',
        expression: `d/dx (${derivFunc}) at x=${derivPoint}`,
        result: formatted1,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Derivative calculation failed. Check syntax.');
    }
  };

  // Finite Summation
  const handleCalculateSummation = () => {
    setErrorMsg(null);
    try {
      const start = Math.floor(Number(sumStart));
      const end = Math.floor(Number(sumEnd));

      if (isNaN(start) || isNaN(end) || end < start) {
        throw new Error('Start must be an integer ≤ End index');
      }
      if (end - start > 100000) {
        throw new Error('Range too large (maximum 100,000 terms for client-side responsiveness)');
      }

      let total = 0;
      for (let n = start; n <= end; n++) {
        total += evalFuncAt(sumFunc, 'n', n);
      }

      const formatted = formatNumber(total, { maxDecimals: 8 });
      setSumResult(formatted);

      addHistory({
        calculatorId: 'calculus',
        calculatorName: 'Numerical Calculus',
        expression: `∑[n=${start}..${end}] (${sumFunc})`,
        result: formatted,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Summation failed. Check syntax.');
    }
  };

  // Series generator
  const handleCalculateSeries = () => {
    setErrorMsg(null);
    try {
      const a = Number(firstTermA);
      const dr = Number(diffOrRatio);
      const n = Math.floor(Number(termsCountN));

      if (isNaN(a) || isNaN(dr) || isNaN(n) || n <= 0) {
        throw new Error('Please enter valid numeric parameters (n > 0)');
      }

      const sequence: number[] = [];

      if (seriesType === 'arithmetic') {
        // an = a + (n-1)*d
        // Sn = n/2 * (2a + (n-1)*d)
        const nth = a + (n - 1) * dr;
        const sum = (n / 2) * (2 * a + (n - 1) * dr);

        for (let i = 1; i <= Math.min(n, 6); i++) {
          sequence.push(a + (i - 1) * dr);
        }

        setSeriesResult({
          nthTerm: formatNumber(nth, { maxDecimals: 6 }),
          sumN: formatNumber(sum, { maxDecimals: 6 }),
          sequencePreview: sequence.map((v) => formatNumber(v, { maxDecimals: 4 })),
        });
      } else {
        // Geometric
        // an = a * r^(n-1)
        // Sn = a * (1 - r^n) / (1 - r) if r != 1
        const nth = a * Math.pow(dr, n - 1);
        let sum = 0;
        if (Math.abs(dr - 1) < 1e-12) {
          sum = a * n;
        } else {
          sum = (a * (1 - Math.pow(dr, n))) / (1 - dr);
        }

        let infSum: string | undefined = undefined;
        if (Math.abs(dr) < 1) {
          infSum = formatNumber(a / (1 - dr), { maxDecimals: 8 });
        }

        for (let i = 1; i <= Math.min(n, 6); i++) {
          sequence.push(a * Math.pow(dr, i - 1));
        }

        setSeriesResult({
          nthTerm: formatNumber(nth, { maxDecimals: 6 }),
          sumN: formatNumber(sum, { maxDecimals: 6 }),
          infiniteSum: infSum,
          sequencePreview: sequence.map((v) => formatNumber(v, { maxDecimals: 4 })),
        });
      }

      showToast('Calculated series sequence');
    } catch (err: any) {
      setErrorMsg(err.message || 'Series calculation failed');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast(`Copied ${text}`);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Numerical Calculus & Series</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Adaptive definite integrals, derivatives, discrete summations, and series expansion.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          {[
            { id: 'integral', label: 'Definite Integral' },
            { id: 'derivative', label: 'Derivatives' },
            { id: 'summation', label: 'Summation (Σ)' },
            { id: 'series', label: 'Sequences & Series' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setErrorMsg(null);
              }}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Tab 1: Definite Integral */}
      {activeTab === 'integral' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-serif italic text-4xl text-emerald-600 dark:text-emerald-400">∫</span>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500 w-24">Upper limit b:</label>
                  <input
                    type="text"
                    value={upperBound}
                    onChange={(e) => setUpperBound(e.target.value)}
                    className="w-32 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    placeholder="e.g. pi or 5"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500 w-24">Integrand f(x):</label>
                  <input
                    type="text"
                    value={intFunc}
                    onChange={(e) => setIntFunc(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. x^2 * sin(x)"
                  />
                  <span className="font-mono text-sm text-slate-500">dx</span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500 w-24">Lower limit a:</label>
                  <input
                    type="text"
                    value={lowerBound}
                    onChange={(e) => setLowerBound(e.target.value)}
                    className="w-32 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    placeholder="e.g. 0"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCalculateIntegral}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Evaluate Definite Integral (Simpson&apos;s Rule)
            </button>

            {intResult !== null && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Calculated Numerical Value:</span>
                  <button
                    onClick={() => handleCopy(intResult)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {intResult}
                </div>
                <p className="text-[11px] text-slate-400">
                  Computed via composite Simpson&apos;s 1/3 rule with 1,000 subintervals in radians.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Derivatives */}
      {activeTab === 'derivative' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Function f(x):
                </label>
                <input
                  type="text"
                  value={derivFunc}
                  onChange={(e) => setDerivFunc(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  placeholder="e.g. x^3 - 3*x + 2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Evaluate at point x = x₀:
                </label>
                <input
                  type="text"
                  value={derivPoint}
                  onChange={(e) => setDerivPoint(e.target.value)}
                  className="w-48 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  placeholder="e.g. 2"
                />
              </div>
            </div>

            <button
              onClick={handleCalculateDerivative}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Compute 1st & 2nd Derivatives
            </button>

            {derivResult !== null && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs text-slate-500 font-medium">1st Derivative f&apos;(x₀):</span>
                  <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {derivResult}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs text-slate-500 font-medium">2nd Derivative f&apos;&apos;(x₀):</span>
                  <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {secondDerivResult}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Summation */}
      {activeTab === 'summation' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-serif font-bold text-4xl text-emerald-600 dark:text-emerald-400">∑</span>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500 w-20">Upper n =</label>
                  <input
                    type="number"
                    value={sumEnd}
                    onChange={(e) => setSumEnd(e.target.value)}
                    className="w-32 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500 w-20">Term f(n):</label>
                  <input
                    type="text"
                    value={sumFunc}
                    onChange={(e) => setSumFunc(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    placeholder="e.g. 1 / n^2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500 w-20">Lower n =</label>
                  <input
                    type="number"
                    value={sumStart}
                    onChange={(e) => setSumStart(e.target.value)}
                    className="w-32 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCalculateSummation}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Evaluate Finite Summation
            </button>

            {sumResult !== null && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500">Total Sum:</span>
                <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                  {sumResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Sequences & Series */}
      {activeTab === 'series' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Type:</label>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setSeriesType('geometric')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    seriesType === 'geometric' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Geometric (r)
                </button>
                <button
                  onClick={() => setSeriesType('arithmetic')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    seriesType === 'arithmetic' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Arithmetic (d)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">First Term (a₁):</label>
                <input
                  type="number"
                  step="any"
                  value={firstTermA}
                  onChange={(e) => setFirstTermA(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  {seriesType === 'geometric' ? 'Common Ratio (r):' : 'Common Diff (d):'}
                </label>
                <input
                  type="number"
                  step="any"
                  value={diffOrRatio}
                  onChange={(e) => setDiffOrRatio(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Terms Count (n):</label>
                <input
                  type="number"
                  value={termsCountN}
                  onChange={(e) => setTermsCountN(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleCalculateSeries}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Calculate Sequence & Sums
            </button>

            {seriesResult && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">nth Term (aₙ):</span>
                    <div className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                      {seriesResult.nthTerm}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Sum of First n Terms (Sₙ):</span>
                    <div className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                      {seriesResult.sumN}
                    </div>
                  </div>
                </div>

                {seriesResult.infiniteSum && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Convergent Infinite Sum S_∞ = a / (1 - r):
                    </span>
                    <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                      {seriesResult.infiniteSum}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-xs text-slate-500 block mb-1">First Terms Preview:</span>
                  <div className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                    {seriesResult.sequencePreview.join(', ')} ...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

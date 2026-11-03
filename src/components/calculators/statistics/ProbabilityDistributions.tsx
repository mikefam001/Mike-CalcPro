import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const ProbabilityDistributions: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [activeTab, setActiveTab] = useState<'normal' | 'binomial'>('normal');

  // Normal distribution
  const [meanMu, setMeanMu] = useState('0');
  const [stdSigma, setStdSigma] = useState('1');
  const [valX, setValX] = useState('1.96');
  const [normResult, setNormResult] = useState<{
    zScore: number;
    pdf: number;
    cdfLess: number;
    cdfGreater: number;
  } | null>(null);

  // Binomial distribution
  const [nTrials, setNTrials] = useState('20');
  const [pProb, setPProb] = useState('0.5');
  const [kSuccess, setKSuccess] = useState('10');
  const [binomResult, setBinomResult] = useState<{
    exactP: number;
    cumulLessOrEqual: number;
    cumulGreaterOrEqual: number;
    mean: number;
    variance: number;
    distributionBars: { k: number; p: number }[];
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // Error function approximation for Normal CDF
  const erf = (x: number): number => {
    // Abramowitz and Stegun formula 7.1.26
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
    return sign * y;
  };

  const normalCDF = (x: number, mean: number, sigma: number): number => {
    return 0.5 * (1 + erf((x - mean) / (sigma * Math.sqrt(2))));
  };

  const handleComputeNormal = () => {
    const mu = Number(meanMu);
    const sigma = Number(stdSigma);
    const x = Number(valX);

    if (isNaN(mu) || isNaN(sigma) || isNaN(x)) {
      showToast('Please enter valid numeric parameters');
      return;
    }
    if (sigma <= 0) {
      showToast('Standard deviation σ must be positive (> 0)');
      return;
    }

    const z = (x - mu) / sigma;
    // PDF: (1 / (sigma * sqrt(2*pi))) * exp(-0.5 * z^2)
    const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
    const cdfLess = normalCDF(x, mu, sigma);
    const cdfGreater = 1 - cdfLess;

    setNormResult({
      zScore: z,
      pdf,
      cdfLess,
      cdfGreater,
    });

    addHistory({
      calculatorId: 'probability',
      calculatorName: 'Probability Lab',
      expression: `Normal(μ=${mu}, σ=${sigma}) at X=${x}`,
      result: `P(X ≤ ${x}) = ${formatNumber(cdfLess, { maxDecimals: 4 })}`,
    });
  };

  // Binomial combination nCr helper
  const nCr = (n: number, r: number): number => {
    if (r < 0 || r > n) return 0;
    if (r === 0 || r === n) return 1;
    if (r > n / 2) r = n - r;
    let res = 1;
    for (let i = 1; i <= r; i++) {
      res = (res * (n - i + 1)) / i;
    }
    return res;
  };

  const handleComputeBinomial = () => {
    const n = Math.floor(Number(nTrials));
    const p = Number(pProb);
    const k = Math.floor(Number(kSuccess));

    if (isNaN(n) || isNaN(p) || isNaN(k) || n < 1 || p < 0 || p > 1 || k < 0 || k > n) {
      showToast('Invalid inputs (0 ≤ p ≤ 1, 0 ≤ k ≤ n)');
      return;
    }
    if (n > 150) {
      showToast('Maximum supported trials for discrete display is n=150');
      return;
    }

    // Exact P(X = k) = nCr * p^k * (1-p)^(n-k)
    const calcP = (trialK: number) => nCr(n, trialK) * Math.pow(p, trialK) * Math.pow(1 - p, n - trialK);

    const exactP = calcP(k);
    let cumulLessOrEqual = 0;
    const bars: { k: number; p: number }[] = [];

    for (let i = 0; i <= n; i++) {
      const prob = calcP(i);
      bars.push({ k: i, p: prob });
      if (i <= k) cumulLessOrEqual += prob;
    }

    const cumulGreaterOrEqual = 1 - cumulLessOrEqual + exactP;

    setBinomResult({
      exactP,
      cumulLessOrEqual,
      cumulGreaterOrEqual,
      mean: n * p,
      variance: n * p * (1 - p),
      distributionBars: bars,
    });

    addHistory({
      calculatorId: 'probability',
      calculatorName: 'Probability Lab',
      expression: `Binomial(n=${n}, p=${p}) at k=${k}`,
      result: `P(X = ${k}) = ${formatNumber(exactP, { maxDecimals: 4 })}`,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Probability Distributions Lab</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Normal Gaussian curve, Z-scores, and Binomial distribution with probability mass visualization.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('normal')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              activeTab === 'normal' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Normal (Gaussian)
          </button>
          <button
            onClick={() => setActiveTab('binomial')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              activeTab === 'binomial' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Binomial B(n, p)
          </button>
        </div>
      </div>

      {activeTab === 'normal' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mean (μ):</label>
                <input
                  type="number"
                  step="any"
                  value={meanMu}
                  onChange={(e) => setMeanMu(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Std Dev (σ):</label>
                <input
                  type="number"
                  step="any"
                  value={stdSigma}
                  onChange={(e) => setStdSigma(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Value (X):</label>
                <input
                  type="number"
                  step="any"
                  value={valX}
                  onChange={(e) => setValX(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleComputeNormal}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Compute Normal Distribution & Z-Score
            </button>

            {normResult && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-xs text-slate-500">Standardized Z-Score:</span>
                    <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                      {formatNumber(normResult.zScore, { maxDecimals: 4 })}
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-xs text-slate-500">Density f(X):</span>
                    <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                      {formatNumber(normResult.pdf, { maxDecimals: 5 })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg">
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold block">
                      Left Cumulative P(X ≤ {valX}):
                    </span>
                    <span className="font-mono text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-0.5 block">
                      {formatNumber(normResult.cdfLess * 100, { maxDecimals: 4 })}%
                    </span>
                    <span className="text-[10px] text-slate-500">
                      p-value = {formatNumber(normResult.cdfLess, { maxDecimals: 6 })}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300 font-semibold block">
                      Right Tail P(X &gt; {valX}):
                    </span>
                    <span className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {formatNumber(normResult.cdfGreater * 100, { maxDecimals: 4 })}%
                    </span>
                    <span className="text-[10px] text-slate-500">
                      p-value = {formatNumber(normResult.cdfGreater, { maxDecimals: 6 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'binomial' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Trials (n):</label>
                <input
                  type="number"
                  value={nTrials}
                  onChange={(e) => setNTrials(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Prob of Success (p):</label>
                <input
                  type="number"
                  step="0.05"
                  value={pProb}
                  onChange={(e) => setPProb(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Successes (k):</label>
                <input
                  type="number"
                  value={kSuccess}
                  onChange={(e) => setKSuccess(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleComputeBinomial}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Calculate Binomial Probabilities
            </button>

            {binomResult && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500">P(X = {kSuccess}):</span>
                    <div className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                      {formatNumber(binomResult.exactP, { maxDecimals: 5 })}
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500">P(X ≤ {kSuccess}):</span>
                    <div className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                      {formatNumber(binomResult.cumulLessOrEqual, { maxDecimals: 5 })}
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500">P(X ≥ {kSuccess}):</span>
                    <div className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                      {formatNumber(binomResult.cumulGreaterOrEqual, { maxDecimals: 5 })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-500 px-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Expected Value E[X] = np = {formatNumber(binomResult.mean, { maxDecimals: 2 })}</span>
                  <span>Variance Var[X] = np(1-p) = {formatNumber(binomResult.variance, { maxDecimals: 2 })}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

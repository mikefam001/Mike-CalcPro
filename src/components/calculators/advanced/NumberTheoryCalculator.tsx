import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { gcd, lcm, isPrime, getPrimeFactors } from '../../../utils/mathEngine';

export const NumberTheoryCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [activeTab, setActiveTab] = useState<'gcdlcm' | 'prime'>('gcdlcm');

  // GCD & LCM
  const [numA, setNumA] = useState('48');
  const [numB, setNumB] = useState('180');
  const [gcdResult, setGcdResult] = useState<number | null>(null);
  const [lcmResult, setLcmResult] = useState<number | null>(null);

  // Prime analysis
  const [targetNumber, setTargetNumber] = useState('360');
  const [primeResult, setPrimeResult] = useState<{
    isPrime: boolean;
    factors: number[];
    factorCountMap: Record<number, number>;
    divisors: number[];
    divisorsSum: number;
    totient: number;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleComputeGcdLcm = () => {
    const a = Math.abs(Math.floor(Number(numA)));
    const b = Math.abs(Math.floor(Number(numB)));

    if (isNaN(a) || isNaN(b) || a === 0 || b === 0) {
      showToast('Please enter positive integers');
      return;
    }

    const g = gcd(a, b);
    const l = lcm(a, b);

    setGcdResult(g);
    setLcmResult(l);

    addHistory({
      calculatorId: 'numbertheory',
      calculatorName: 'Number Theory',
      expression: `GCD(${a}, ${b}) and LCM(${a}, ${b})`,
      result: `GCD=${g}, LCM=${l}`,
    });
  };

  const handleComputePrime = () => {
    const n = Math.abs(Math.floor(Number(targetNumber)));
    if (isNaN(n) || n < 1) {
      showToast('Please enter an integer ≥ 1');
      return;
    }
    if (n > 1000000000) {
      showToast('Maximum tested integer is 1,000,000,000');
      return;
    }

    const primeCheck = isPrime(n);
    const factors = getPrimeFactors(n);

    // Group factors by exponent
    const map: Record<number, number> = {};
    for (const f of factors) {
      map[f] = (map[f] || 0) + 1;
    }

    // Find all divisors
    const divisors: number[] = [];
    for (let i = 1; i * i <= n; i++) {
      if (n % i === 0) {
        divisors.push(i);
        if (i * i !== n) divisors.push(n / i);
      }
    }
    divisors.sort((x, y) => x - y);
    const divisorsSum = divisors.reduce((s, v) => s + v, 0);

    // Euler's Totient phi(n) = n * prod(1 - 1/p)
    const uniquePrimes = Object.keys(map).map(Number);
    let totient = n;
    for (const p of uniquePrimes) {
      totient = Math.round(totient * (1 - 1 / p));
    }

    setPrimeResult({
      isPrime: primeCheck,
      factors,
      factorCountMap: map,
      divisors,
      divisorsSum,
      totient,
    });

    addHistory({
      calculatorId: 'numbertheory',
      calculatorName: 'Number Theory',
      expression: `Prime factorization of ${n}`,
      result: primeCheck ? 'Prime' : Object.entries(map).map(([p, e]) => `${p}^${e}`).join(' × '),
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast(`Copied ${text}`);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Number Theory & Prime Lab</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Greatest Common Divisor, Least Common Multiple, Primality test, and Prime Factorization.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('gcdlcm')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              activeTab === 'gcdlcm' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            GCD & LCM
          </button>
          <button
            onClick={() => setActiveTab('prime')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              activeTab === 'prime' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Prime & Factorization
          </button>
        </div>
      </div>

      {activeTab === 'gcdlcm' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">First Integer (A):</label>
                <input
                  type="number"
                  value={numA}
                  onChange={(e) => setNumA(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Second Integer (B):</label>
                <input
                  type="number"
                  value={numB}
                  onChange={(e) => setNumB(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleComputeGcdLcm}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Calculate GCD & LCM
            </button>

            {gcdResult !== null && lcmResult !== null && (
              <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Greatest Common Divisor:</span>
                  <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {gcdResult}
                  </div>
                  <span className="text-[11px] text-slate-400">gcd({numA}, {numB})</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Least Common Multiple:</span>
                  <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {lcmResult}
                  </div>
                  <span className="text-[11px] text-slate-400">lcm({numA}, {numB})</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'prime' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div className="max-w-xl mx-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Enter Positive Integer:</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  placeholder="e.g. 360"
                />
                <button
                  onClick={handleComputePrime}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shrink-0 shadow-xs"
                >
                  Analyze Number
                </button>
              </div>
            </div>

            {primeResult && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Primality Status:</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        primeResult.isPrime
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {primeResult.isPrime ? 'Prime Number' : 'Composite Number'}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      handleCopy(
                        Object.entries(primeResult.factorCountMap)
                          .map(([p, e]) => (e > 1 ? `${p}^${e}` : p))
                          .join(' × ')
                      )
                    }
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Factors
                  </button>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block mb-1">Canonical Prime Factorization:</span>
                  <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {targetNumber} ={' '}
                    {Object.entries(primeResult.factorCountMap)
                      .map(([p, e]) => (e > 1 ? `${p}^${e}` : p))
                      .join(' × ')}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-slate-500 block">Total Divisors d(n):</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                      {primeResult.divisors.length} divisors
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Sum of Divisors σ(n):</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                      {primeResult.divisorsSum}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Euler’s Totient φ(n):</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                      {primeResult.totient} coprime numbers
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block mb-1">Divisors List:</span>
                  <div className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800 break-words">
                    {primeResult.divisors.join(', ')}
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

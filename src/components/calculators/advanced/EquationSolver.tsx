import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const EquationSolver: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [equationType, setEquationType] = useState<'linear' | 'quadratic' | 'system2' | 'system3'>('quadratic');

  // Linear: ax + b = c
  const [linA, setLinA] = useState('2');
  const [linB, setLinB] = useState('5');
  const [linC, setLinC] = useState('15');
  const [linResult, setLinResult] = useState<string | null>(null);

  // Quadratic: ax^2 + bx + c = 0
  const [quadA, setQuadA] = useState('1');
  const [quadB, setQuadB] = useState('-5');
  const [quadC, setQuadC] = useState('6');
  const [quadResult, setQuadResult] = useState<{
    discriminant: number;
    roots: string[];
    vertex: { x: number; y: number };
  } | null>(null);

  // 2x2 System
  // a1*x + b1*y = c1
  // a2*x + b2*y = c2
  const [s2A1, setS2A1] = useState('2');
  const [s2B1, setS2B1] = useState('3');
  const [s2C1, setS2C1] = useState('8');
  const [s2A2, setS2A2] = useState('1');
  const [s2B2, setS2B2] = useState('-1');
  const [s2C2, setS2C2] = useState('1');
  const [s2Result, setS2Result] = useState<{ x: string; y: string } | null>(null);

  // 3x3 System
  const [s3, setS3] = useState<number[][]>([
    [1, 2, -1, 3],
    [2, -1, 1, 1],
    [3, 1, 2, 8],
  ]);
  const [s3Result, setS3Result] = useState<{ x: string; y: string; z: string } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Solve Linear
  const handleSolveLinear = () => {
    setErrorMsg(null);
    const a = Number(linA);
    const b = Number(linB);
    const c = Number(linC);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setErrorMsg('Please enter valid numeric coefficients');
      return;
    }
    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b - c) < 1e-12) {
        setLinResult('Infinite solutions (Identity 0 = 0)');
      } else {
        setLinResult('No solution (Contradiction)');
      }
      return;
    }

    const x = (c - b) / a;
    const formatted = formatNumber(x, { maxDecimals: 6 });
    setLinResult(`x = ${formatted}`);

    addHistory({
      calculatorId: 'equations',
      calculatorName: 'Equation Solver',
      expression: `${linA}x + ${linB} = ${linC}`,
      result: `x = ${formatted}`,
    });
  };

  // Solve Quadratic
  const handleSolveQuadratic = () => {
    setErrorMsg(null);
    const a = Number(quadA);
    const b = Number(quadB);
    const c = Number(quadC);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setErrorMsg('Please enter valid coefficients');
      return;
    }
    if (Math.abs(a) < 1e-12) {
      setErrorMsg('Coefficient "a" cannot be 0 for a quadratic equation (a ≠ 0)');
      return;
    }

    const disc = b * b - 4 * a * c;
    const vertexX = -b / (2 * a);
    const vertexY = c - (b * b) / (4 * a);

    const roots: string[] = [];
    if (disc > 0) {
      const r1 = (-b + Math.sqrt(disc)) / (2 * a);
      const r2 = (-b - Math.sqrt(disc)) / (2 * a);
      roots.push(`x₁ = ${formatNumber(r1, { maxDecimals: 6 })}`);
      roots.push(`x₂ = ${formatNumber(r2, { maxDecimals: 6 })}`);
    } else if (Math.abs(disc) < 1e-12) {
      const r = -b / (2 * a);
      roots.push(`x = ${formatNumber(r, { maxDecimals: 6 })} (Double real root)`);
    } else {
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-disc) / (2 * a);
      const realStr = formatNumber(realPart, { maxDecimals: 5 });
      const imagStr = formatNumber(Math.abs(imagPart), { maxDecimals: 5 });
      roots.push(`x₁ = ${realStr} + ${imagStr}i`);
      roots.push(`x₂ = ${realStr} − ${imagStr}i`);
    }

    setQuadResult({
      discriminant: disc,
      roots,
      vertex: { x: vertexX, y: vertexY },
    });

    addHistory({
      calculatorId: 'equations',
      calculatorName: 'Equation Solver',
      expression: `${quadA}x² + ${quadB}x + ${quadC} = 0`,
      result: roots.join('; '),
    });
  };

  // Solve 2x2 System (Cramer's rule)
  const handleSolveSystem2 = () => {
    setErrorMsg(null);
    const a1 = Number(s2A1);
    const b1 = Number(s2B1);
    const c1 = Number(s2C1);
    const a2 = Number(s2A2);
    const b2 = Number(s2B2);
    const c2 = Number(s2C2);

    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) < 1e-12) {
      setErrorMsg('Determinant is 0: System has either infinite solutions or no solution.');
      setS2Result(null);
      return;
    }

    const detX = c1 * b2 - c2 * b1;
    const detY = a1 * c2 - a2 * c1;

    const x = detX / det;
    const y = detY / det;

    setS2Result({
      x: formatNumber(x, { maxDecimals: 6 }),
      y: formatNumber(y, { maxDecimals: 6 }),
    });

    addHistory({
      calculatorId: 'equations',
      calculatorName: 'Equation Solver',
      expression: `2x2 System: [${s2A1}x + ${s2B1}y = ${s2C1}; ${s2A2}x + ${s2B2}y = ${s2C2}]`,
      result: `x = ${formatNumber(x, { maxDecimals: 4 })}, y = ${formatNumber(y, { maxDecimals: 4 })}`,
    });
  };

  // Solve 3x3 System (Gaussian elimination)
  const handleSolveSystem3 = () => {
    setErrorMsg(null);
    const m = s3.map((row) => [...row]);
    const n = 3;

    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxEl = Math.abs(m[i][i]);
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(m[k][i]) > maxEl) {
          maxEl = Math.abs(m[k][i]);
          maxRow = k;
        }
      }

      if (maxEl < 1e-12) {
        setErrorMsg('Singular 3×3 matrix: No unique solution.');
        setS3Result(null);
        return;
      }

      // Swap rows
      for (let k = i; k < n + 1; k++) {
        const tmp = m[maxRow][k];
        m[maxRow][k] = m[i][k];
        m[i][k] = tmp;
      }

      // Eliminate
      for (let k = i + 1; k < n; k++) {
        const c = -m[k][i] / m[i][i];
        for (let j = i; j < n + 1; j++) {
          if (i === j) {
            m[k][j] = 0;
          } else {
            m[k][j] += c * m[i][j];
          }
        }
      }
    }

    // Back-substitution
    const sol = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      sol[i] = m[i][n] / m[i][i];
      for (let k = i - 1; k >= 0; k--) {
        m[k][n] -= m[k][i] * sol[i];
      }
    }

    setS3Result({
      x: formatNumber(sol[0], { maxDecimals: 6 }),
      y: formatNumber(sol[1], { maxDecimals: 6 }),
      z: formatNumber(sol[2], { maxDecimals: 6 }),
    });

    addHistory({
      calculatorId: 'equations',
      calculatorName: 'Equation Solver',
      expression: '3×3 Linear System',
      result: `x=${formatNumber(sol[0], { maxDecimals: 2 })}, y=${formatNumber(sol[1], { maxDecimals: 2 })}, z=${formatNumber(sol[2], { maxDecimals: 2 })}`,
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
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Algebraic Equation Solver</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Linear equations, quadratic roots with discriminant, and simultaneous multi-variable systems.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          {[
            { id: 'quadratic', label: 'Quadratic ax²' },
            { id: 'linear', label: 'Linear ax+b=c' },
            { id: 'system2', label: '2×2 System' },
            { id: 'system3', label: '3×3 System' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setEquationType(tab.id as any);
                setErrorMsg(null);
              }}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                equationType === tab.id
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

      {/* Quadratic Solver */}
      {equationType === 'quadratic' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="max-w-xl mx-auto space-y-5">
            <div className="text-center">
              <span className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200">
                a·x² + b·x + c = 0
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">a (x² coefficient):</label>
                <input
                  type="number"
                  step="any"
                  value={quadA}
                  onChange={(e) => setQuadA(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">b (x coefficient):</label>
                <input
                  type="number"
                  step="any"
                  value={quadB}
                  onChange={(e) => setQuadB(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">c (constant):</label>
                <input
                  type="number"
                  step="any"
                  value={quadC}
                  onChange={(e) => setQuadC(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleSolveQuadratic}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Solve Quadratic Roots
            </button>

            {quadResult && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-4">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Roots:</span>
                  <div className="mt-1 space-y-1">
                    {quadResult.roots.map((r, i) => (
                      <div key={i} className="font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                        {r}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-slate-500">Discriminant (Δ = b² - 4ac):</span>
                    <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {formatNumber(quadResult.discriminant, { maxDecimals: 4 })}
                      <span className="text-[11px] text-slate-400 ml-1">
                        ({quadResult.discriminant > 0 ? 'Two distinct real roots' : quadResult.discriminant === 0 ? 'One double root' : 'Two complex conjugate roots'})
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Parabola Vertex (h, k):</span>
                    <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      ({formatNumber(quadResult.vertex.x, { maxDecimals: 4 })}, {formatNumber(quadResult.vertex.y, { maxDecimals: 4 })})
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Linear Solver */}
      {equationType === 'linear' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="max-w-xl mx-auto space-y-5">
            <div className="flex items-center justify-center gap-2 font-mono text-lg font-bold text-slate-800 dark:text-slate-200">
              <input
                type="number"
                step="any"
                value={linA}
                onChange={(e) => setLinA(e.target.value)}
                className="w-16 px-2 py-1 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
              />
              <span>· x +</span>
              <input
                type="number"
                step="any"
                value={linB}
                onChange={(e) => setLinB(e.target.value)}
                className="w-16 px-2 py-1 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
              />
              <span>=</span>
              <input
                type="number"
                step="any"
                value={linC}
                onChange={(e) => setLinC(e.target.value)}
                className="w-16 px-2 py-1 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
              />
            </div>

            <button
              onClick={handleSolveLinear}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Solve for x
            </button>

            {linResult && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-500 font-medium">Solution:</span>
                <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                  {linResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2x2 System */}
      {equationType === 'system2' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="max-w-xl mx-auto space-y-5">
            <div className="space-y-3 font-mono text-sm">
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  value={s2A1}
                  onChange={(e) => setS2A1(e.target.value)}
                  className="w-16 px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                />
                <span>x +</span>
                <input
                  type="number"
                  value={s2B1}
                  onChange={(e) => setS2B1(e.target.value)}
                  className="w-16 px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                />
                <span>y =</span>
                <input
                  type="number"
                  value={s2C1}
                  onChange={(e) => setS2C1(e.target.value)}
                  className="w-16 px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                />
              </div>

              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  value={s2A2}
                  onChange={(e) => setS2A2(e.target.value)}
                  className="w-16 px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                />
                <span>x +</span>
                <input
                  type="number"
                  value={s2B2}
                  onChange={(e) => setS2B2(e.target.value)}
                  className="w-16 px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                />
                <span>y =</span>
                <input
                  type="number"
                  value={s2C2}
                  onChange={(e) => setS2C2(e.target.value)}
                  className="w-16 px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                />
              </div>
            </div>

            <button
              onClick={handleSolveSystem2}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Solve 2×2 System (Cramer&apos;s Rule)
            </button>

            {s2Result && (
              <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Variable x:</span>
                  <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {s2Result.x}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Variable y:</span>
                  <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {s2Result.y}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3x3 System */}
      {equationType === 'system3' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="space-y-3 font-mono text-xs">
              {s3.map((row, r) => (
                <div key={r} className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    value={row[0]}
                    onChange={(e) => {
                      const copy = s3.map((rArr) => [...rArr]);
                      copy[r][0] = Number(e.target.value) || 0;
                      setS3(copy);
                    }}
                    className="w-14 px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                  />
                  <span>x +</span>
                  <input
                    type="number"
                    value={row[1]}
                    onChange={(e) => {
                      const copy = s3.map((rArr) => [...rArr]);
                      copy[r][1] = Number(e.target.value) || 0;
                      setS3(copy);
                    }}
                    className="w-14 px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                  />
                  <span>y +</span>
                  <input
                    type="number"
                    value={row[2]}
                    onChange={(e) => {
                      const copy = s3.map((rArr) => [...rArr]);
                      copy[r][2] = Number(e.target.value) || 0;
                      setS3(copy);
                    }}
                    className="w-14 px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                  />
                  <span>z =</span>
                  <input
                    type="number"
                    value={row[3]}
                    onChange={(e) => {
                      const copy = s3.map((rArr) => [...rArr]);
                      copy[r][3] = Number(e.target.value) || 0;
                      setS3(copy);
                    }}
                    className="w-14 px-2 py-1.5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSolveSystem3}
              className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Solve 3×3 Linear System (Gaussian Elimination)
            </button>

            {s3Result && (
              <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                <div>
                  <span className="text-xs text-slate-500 font-medium">x:</span>
                  <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {s3Result.x}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">y:</span>
                  <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {s3Result.y}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">z:</span>
                  <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {s3Result.z}
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

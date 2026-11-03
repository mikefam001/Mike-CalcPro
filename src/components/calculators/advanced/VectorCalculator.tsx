import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const VectorCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [dimension, setDimension] = useState<2 | 3>(3);

  // Vector u
  const [ux, setUx] = useState('3');
  const [uy, setUy] = useState('-2');
  const [uz, setUz] = useState('4');

  // Vector v
  const [vx, setVx] = useState('1');
  const [vy, setVy] = useState('5');
  const [vz, setVz] = useState('-1');

  const [resultVector, setResultVector] = useState<number[] | null>(null);
  const [resultScalar, setResultScalar] = useState<number | null>(null);
  const [operationLabel, setOperationLabel] = useState<string>('');
  const [extraMetrics, setExtraMetrics] = useState<{
    magU: number;
    magV: number;
    angleDeg?: number;
    angleRad?: number;
    unitU: number[];
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const getU = () =>
    dimension === 2
      ? [Number(ux) || 0, Number(uy) || 0]
      : [Number(ux) || 0, Number(uy) || 0, Number(uz) || 0];

  const getV = () =>
    dimension === 2
      ? [Number(vx) || 0, Number(vy) || 0]
      : [Number(vx) || 0, Number(vy) || 0, Number(vz) || 0];

  const calcMagnitude = (vec: number[]) => Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));

  const updateMetrics = (u: number[], v: number[]) => {
    const magU = calcMagnitude(u);
    const magV = calcMagnitude(v);
    let angleDeg: number | undefined = undefined;
    let angleRad: number | undefined = undefined;

    if (magU > 0 && magV > 0) {
      const dot = u.reduce((sum, val, idx) => sum + val * v[idx], 0);
      const cosTheta = Math.min(1, Math.max(-1, dot / (magU * magV)));
      angleRad = Math.acos(cosTheta);
      angleDeg = (angleRad * 180) / Math.PI;
    }

    const unitU = magU > 0 ? u.map((val) => val / magU) : u;
    setExtraMetrics({ magU, magV, angleDeg, angleRad, unitU });
  };

  const handleAdd = () => {
    const u = getU();
    const v = getV();
    const res = u.map((val, idx) => val + v[idx]);
    setResultVector(res);
    setResultScalar(null);
    setOperationLabel('Vector Addition (u + v)');
    updateMetrics(u, v);
    addHistory({
      calculatorId: 'vectors',
      calculatorName: 'Vector Calculator',
      expression: 'u + v',
      result: `[${res.join(', ')}]`,
    });
  };

  const handleSubtract = () => {
    const u = getU();
    const v = getV();
    const res = u.map((val, idx) => val - v[idx]);
    setResultVector(res);
    setResultScalar(null);
    setOperationLabel('Vector Subtraction (u − v)');
    updateMetrics(u, v);
    addHistory({
      calculatorId: 'vectors',
      calculatorName: 'Vector Calculator',
      expression: 'u − v',
      result: `[${res.join(', ')}]`,
    });
  };

  const handleDotProduct = () => {
    const u = getU();
    const v = getV();
    const dot = u.reduce((sum, val, idx) => sum + val * v[idx], 0);
    setResultScalar(dot);
    setResultVector(null);
    setOperationLabel('Dot Product (u · v)');
    updateMetrics(u, v);
    addHistory({
      calculatorId: 'vectors',
      calculatorName: 'Vector Calculator',
      expression: 'u · v',
      result: dot.toString(),
    });
  };

  const handleCrossProduct = () => {
    if (dimension !== 3) {
      showToast('Cross product requires 3D vectors');
      return;
    }
    const u = getU();
    const v = getV();
    // [uy*vz - uz*vy, uz*vx - ux*vz, ux*vy - uy*vx]
    const res = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
    setResultVector(res);
    setResultScalar(null);
    setOperationLabel('Cross Product (u × v)');
    updateMetrics(u, v);
    addHistory({
      calculatorId: 'vectors',
      calculatorName: 'Vector Calculator',
      expression: 'u × v',
      result: `[${res.join(', ')}]`,
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
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2D & 3D Vector Analysis</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vector sums, dot and cross products, magnitudes, unit vectors, and angular separation.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setDimension(2)}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              dimension === 2 ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            2D Vectors
          </button>
          <button
            onClick={() => setDimension(3)}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              dimension === 3 ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            3D Vectors
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vector u */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Vector u</h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-500">x:</label>
              <input
                type="number"
                step="any"
                value={ux}
                onChange={(e) => setUx(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">y:</label>
              <input
                type="number"
                step="any"
                value={uy}
                onChange={(e) => setUy(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            {dimension === 3 && (
              <div>
                <label className="text-xs font-semibold text-slate-500">z:</label>
                <input
                  type="number"
                  step="any"
                  value={uz}
                  onChange={(e) => setUz(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Vector v */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Vector v</h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-500">x:</label>
              <input
                type="number"
                step="any"
                value={vx}
                onChange={(e) => setVx(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">y:</label>
              <input
                type="number"
                step="any"
                value={vy}
                onChange={(e) => setVy(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            {dimension === 3 && (
              <div>
                <label className="text-xs font-semibold text-slate-500">z:</label>
                <input
                  type="number"
                  step="any"
                  value={vz}
                  onChange={(e) => setVz(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Operations Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap gap-2">
        <button
          onClick={handleAdd}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          u + v (Addition)
        </button>
        <button
          onClick={handleSubtract}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          u − v (Subtraction)
        </button>
        <button
          onClick={handleDotProduct}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          u · v (Dot Product)
        </button>
        {dimension === 3 && (
          <button
            onClick={handleCrossProduct}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            u × v (Cross Product)
          </button>
        )}
      </div>

      {/* Results */}
      {(resultVector !== null || resultScalar !== null) && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {operationLabel}
            </span>
          </div>

          <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {resultScalar !== null ? (
              resultScalar
            ) : resultVector ? (
              `⟨${resultVector.map((v) => formatNumber(v, { maxDecimals: 4 })).join(', ')}⟩`
            ) : null}
          </div>

          {extraMetrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Magnitude ||u||:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                  {formatNumber(extraMetrics.magU, { maxDecimals: 4 })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Magnitude ||v||:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                  {formatNumber(extraMetrics.magV, { maxDecimals: 4 })}
                </span>
              </div>
              {extraMetrics.angleDeg !== undefined && (
                <div>
                  <span className="text-slate-500 block">Angle θ:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                    {formatNumber(extraMetrics.angleDeg, { maxDecimals: 2 })}°
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-500 block">Unit Vector û:</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white text-xs truncate block">
                  ⟨{extraMetrics.unitU.map((v) => formatNumber(v, { maxDecimals: 2 })).join(', ')}⟩
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

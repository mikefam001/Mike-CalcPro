import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const ComplexNumberCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  // z1 = a1 + b1*i
  const [a1, setA1] = useState('3');
  const [b1, setB1] = useState('4');

  // z2 = a2 + b2*i
  const [a2, setA2] = useState('1');
  const [b2, setB2] = useState('-2');

  const [result, setResult] = useState<{
    cartesian: string;
    modulus: string;
    argDeg: string;
    argRad: string;
    conjugate: string;
    polar: string;
  } | null>(null);

  const [operationLabel, setOperationLabel] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const getComplexZ1 = () => ({ a: Number(a1) || 0, b: Number(b1) || 0 });
  const getComplexZ2 = () => ({ a: Number(a2) || 0, b: Number(b2) || 0 });

  const formatComplex = (a: number, b: number) => {
    const aStr = formatNumber(a, { maxDecimals: 4 });
    const bStr = formatNumber(Math.abs(b), { maxDecimals: 4 });
    const sign = b >= 0 ? '+' : '−';
    return `${aStr} ${sign} ${bStr}i`;
  };

  const computeProperties = (a: number, b: number, label: string) => {
    const mod = Math.sqrt(a * a + b * b);
    const rad = Math.atan2(b, a);
    const deg = (rad * 180) / Math.PI;

    const cartesian = formatComplex(a, b);
    const resObj = {
      cartesian,
      modulus: formatNumber(mod, { maxDecimals: 6 }),
      argDeg: `${formatNumber(deg, { maxDecimals: 4 })}°`,
      argRad: `${formatNumber(rad, { maxDecimals: 4 })} rad`,
      conjugate: formatComplex(a, -b),
      polar: `${formatNumber(mod, { maxDecimals: 4 })} ∠ ${formatNumber(deg, { maxDecimals: 2 })}°`,
    };

    setResult(resObj);
    setOperationLabel(label);

    addHistory({
      calculatorId: 'complex',
      calculatorName: 'Complex Numbers',
      expression: label,
      result: cartesian,
    });
  };

  // Operations
  const handleAdd = () => {
    const z1 = getComplexZ1();
    const z2 = getComplexZ2();
    computeProperties(z1.a + z2.a, z1.b + z2.b, 'Addition (z₁ + z₂)');
  };

  const handleSubtract = () => {
    const z1 = getComplexZ1();
    const z2 = getComplexZ2();
    computeProperties(z1.a - z2.a, z1.b - z2.b, 'Subtraction (z₁ − z₂)');
  };

  const handleMultiply = () => {
    const z1 = getComplexZ1();
    const z2 = getComplexZ2();
    // (a1*a2 - b1*b2) + (a1*b2 + b1*a2)i
    const a = z1.a * z2.a - z1.b * z2.b;
    const b = z1.a * z2.b + z1.b * z2.a;
    computeProperties(a, b, 'Multiplication (z₁ × z₂)');
  };

  const handleDivide = () => {
    const z1 = getComplexZ1();
    const z2 = getComplexZ2();
    const denom = z2.a * z2.a + z2.b * z2.b;
    if (denom === 0) {
      showToast('Division by zero complex number');
      return;
    }
    const a = (z1.a * z2.a + z1.b * z2.b) / denom;
    const b = (z1.b * z2.a - z1.a * z2.b) / denom;
    computeProperties(a, b, 'Division (z₁ / z₂)');
  };

  const handlePowerZ1 = (pow: number) => {
    const z1 = getComplexZ1();
    const r = Math.sqrt(z1.a * z1.a + z1.b * z1.b);
    const theta = Math.atan2(z1.b, z1.a);
    const rPow = Math.pow(r, pow);
    const thetaPow = theta * pow;
    const a = rPow * Math.cos(thetaPow);
    const b = rPow * Math.sin(thetaPow);
    computeProperties(a, b, `Power (z₁^${pow})`);
  };

  const handleAnalyzeZ1 = () => {
    const z1 = getComplexZ1();
    computeProperties(z1.a, z1.b, 'Single Complex Analysis (z₁)');
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
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Complex Number Arithmetic & Polar Form</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Arithmetic on a + bi, polar coordinates r∠θ, Euler’s modulus and argument calculations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* z1 */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Complex Number z₁</h3>
            <span className="text-xs text-slate-400 font-mono">z = a + bi</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Real Part (a₁):</label>
              <input
                type="number"
                step="any"
                value={a1}
                onChange={(e) => setA1(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Imaginary Part (b₁):</label>
              <input
                type="number"
                step="any"
                value={b1}
                onChange={(e) => setB1(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAnalyzeZ1}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200"
            >
              Analyze z₁ Polar
            </button>
            <button
              onClick={() => handlePowerZ1(2)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200"
            >
              z₁²
            </button>
            <button
              onClick={() => handlePowerZ1(3)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200"
            >
              z₁³
            </button>
          </div>
        </div>

        {/* z2 */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Complex Number z₂</h3>
            <span className="text-xs text-slate-400 font-mono">z = a + bi</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Real Part (a₂):</label>
              <input
                type="number"
                step="any"
                value={a2}
                onChange={(e) => setA2(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Imaginary Part (b₂):</label>
              <input
                type="number"
                step="any"
                value={b2}
                onChange={(e) => setB2(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operations Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap gap-2">
        <button
          onClick={handleAdd}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          z₁ + z₂
        </button>
        <button
          onClick={handleSubtract}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          z₁ − z₂
        </button>
        <button
          onClick={handleMultiply}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          z₁ × z₂
        </button>
        <button
          onClick={handleDivide}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          z₁ / z₂
        </button>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {operationLabel}
            </span>
            <button
              onClick={() => handleCopy(result.cartesian)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Cartesian</span>
            </button>
          </div>

          <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {result.cartesian}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Modulus |z|:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                {result.modulus}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Argument (θ):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                {result.argDeg}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Polar Form:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                {result.polar}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Conjugate (z̄):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                {result.conjugate}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Copy, Check, RotateCcw, ArrowRightLeft } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

type Matrix = number[][];

export const MatrixCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [size, setSize] = useState<number>(3); // 2, 3, or 4
  const [matrixA, setMatrixA] = useState<Matrix>([
    [1, 2, 3],
    [0, 1, 4],
    [5, 6, 0],
  ]);
  const [matrixB, setMatrixB] = useState<Matrix>([
    [2, 0, -1],
    [1, 3, 2],
    [0, -2, 1],
  ]);
  const [scalarK, setScalarK] = useState<number>(2);

  const [resultMatrix, setResultMatrix] = useState<Matrix | null>(null);
  const [resultScalar, setResultScalar] = useState<number | null>(null);
  const [operationName, setOperationName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Resize matrices
  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    const createEmpty = () =>
      Array.from({ length: newSize }, (_, r) =>
        Array.from({ length: newSize }, (_, c) => (r === c ? 1 : 0))
      );
    setMatrixA(createEmpty());
    setMatrixB(createEmpty());
    setResultMatrix(null);
    setResultScalar(null);
    setErrorMsg(null);
  };

  const handleCellChange = (
    which: 'A' | 'B',
    row: number,
    col: number,
    valueStr: string
  ) => {
    const val = Number(valueStr) || 0;
    if (which === 'A') {
      const copy = matrixA.map((r, rIdx) =>
        r.map((c, cIdx) => (rIdx === row && cIdx === col ? val : c))
      );
      setMatrixA(copy);
    } else {
      const copy = matrixB.map((r, rIdx) =>
        r.map((c, cIdx) => (rIdx === row && cIdx === col ? val : c))
      );
      setMatrixB(copy);
    }
  };

  // Operations
  const handleAdd = () => {
    setErrorMsg(null);
    setResultScalar(null);
    const res: Matrix = matrixA.map((r, rIdx) =>
      r.map((val, cIdx) => val + matrixB[rIdx][cIdx])
    );
    setResultMatrix(res);
    setOperationName('Matrix Addition (A + B)');
    addHistory({
      calculatorId: 'matrix',
      calculatorName: 'Matrix Algebra',
      expression: 'A + B',
      result: JSON.stringify(res),
    });
  };

  const handleSubtract = () => {
    setErrorMsg(null);
    setResultScalar(null);
    const res: Matrix = matrixA.map((r, rIdx) =>
      r.map((val, cIdx) => val - matrixB[rIdx][cIdx])
    );
    setResultMatrix(res);
    setOperationName('Matrix Subtraction (A − B)');
    addHistory({
      calculatorId: 'matrix',
      calculatorName: 'Matrix Algebra',
      expression: 'A − B',
      result: JSON.stringify(res),
    });
  };

  const handleMultiply = () => {
    setErrorMsg(null);
    setResultScalar(null);
    const n = size;
    const res: Matrix = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += matrixA[i][k] * matrixB[k][j];
        }
        res[i][j] = sum;
      }
    }
    setResultMatrix(res);
    setOperationName('Matrix Multiplication (A × B)');
    addHistory({
      calculatorId: 'matrix',
      calculatorName: 'Matrix Algebra',
      expression: 'A × B',
      result: JSON.stringify(res),
    });
  };

  // Determinant helper
  const calculateDet = (m: Matrix): number => {
    const n = m.length;
    if (n === 1) return m[0][0];
    if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];

    let det = 0;
    for (let c = 0; c < n; c++) {
      const subMatrix: Matrix = m
        .slice(1)
        .map((row) => row.filter((_, colIdx) => colIdx !== c));
      det += Math.pow(-1, c) * m[0][c] * calculateDet(subMatrix);
    }
    return det;
  };

  const handleDeterminant = () => {
    setErrorMsg(null);
    setResultMatrix(null);
    const det = calculateDet(matrixA);
    setResultScalar(det);
    setOperationName('Determinant det(A)');
    addHistory({
      calculatorId: 'matrix',
      calculatorName: 'Matrix Algebra',
      expression: 'det(A)',
      result: det.toString(),
    });
  };

  const handleTranspose = () => {
    setErrorMsg(null);
    setResultScalar(null);
    const res: Matrix = matrixA[0].map((_, cIdx) => matrixA.map((r) => r[cIdx]));
    setResultMatrix(res);
    setOperationName('Transpose (Aᵀ)');
    addHistory({
      calculatorId: 'matrix',
      calculatorName: 'Matrix Algebra',
      expression: 'Transpose(A)',
      result: JSON.stringify(res),
    });
  };

  const handleInverse = () => {
    setErrorMsg(null);
    setResultScalar(null);
    const det = calculateDet(matrixA);
    if (Math.abs(det) < 1e-12) {
      setErrorMsg('Matrix A is singular (det(A) = 0). It has no inverse.');
      setResultMatrix(null);
      return;
    }

    const n = size;
    if (n === 2) {
      const inv: Matrix = [
        [matrixA[1][1] / det, -matrixA[0][1] / det],
        [-matrixA[1][0] / det, matrixA[0][0] / det],
      ];
      setResultMatrix(inv);
    } else {
      // General Adjugate / Det
      const adj: Matrix = Array.from({ length: n }, () => Array(n).fill(0));
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const sub: Matrix = matrixA
            .filter((_, r) => r !== i)
            .map((row) => row.filter((_, c) => c !== j));
          const cofactor = Math.pow(-1, i + j) * calculateDet(sub);
          adj[j][i] = cofactor / det; // note transpose (j, i)
        }
      }
      setResultMatrix(adj);
    }
    setOperationName('Inverse (A⁻¹)');
    addHistory({
      calculatorId: 'matrix',
      calculatorName: 'Matrix Algebra',
      expression: 'Inverse(A)',
      result: `det=${det.toFixed(4)}`,
    });
  };

  const handleScalarMultiply = () => {
    setErrorMsg(null);
    setResultScalar(null);
    const res: Matrix = matrixA.map((r) => r.map((c) => c * scalarK));
    setResultMatrix(res);
    setOperationName(`Scalar Multiply (${scalarK} × A)`);
    addHistory({
      calculatorId: 'matrix',
      calculatorName: 'Matrix Algebra',
      expression: `${scalarK} × A`,
      result: JSON.stringify(res),
    });
  };

  const handleSwapAB = () => {
    const temp = matrixA;
    setMatrixA(matrixB);
    setMatrixB(temp);
    showToast('Swapped Matrix A and Matrix B');
  };

  const handleCopyResult = () => {
    let text = '';
    if (resultScalar !== null) {
      text = resultScalar.toString();
    } else if (resultMatrix !== null) {
      text = resultMatrix.map((r) => r.join('\t')).join('\n');
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied result to clipboard');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Configuration bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Matrix Linear Algebra</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Square matrices up to 4×4 with determinants, matrix inversion, and dot products.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span>Dimensions:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
              {[2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSizeChange(s)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    size === s
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {s}×{s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSwapAB}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Swap Matrix A and B"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Swap A ⇄ B</span>
          </button>
        </div>
      </div>

      {/* Matrices Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matrix A */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Matrix A</h3>
            <span className="text-xs text-slate-400 font-mono">{size}×{size}</span>
          </div>

          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          >
            {matrixA.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`A-${r}-${c}`}
                  type="number"
                  step="any"
                  value={val}
                  onChange={(e) => handleCellChange('A', r, c, e.target.value)}
                  className="w-full text-center py-2.5 font-mono text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white tabular-nums"
                />
              ))
            )}
          </div>
        </div>

        {/* Matrix B */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Matrix B</h3>
            <span className="text-xs text-slate-400 font-mono">{size}×{size}</span>
          </div>

          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          >
            {matrixB.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`B-${r}-${c}`}
                  type="number"
                  step="any"
                  value={val}
                  onChange={(e) => handleCellChange('B', r, c, e.target.value)}
                  className="w-full text-center py-2.5 font-mono text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white tabular-nums"
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Operations Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Compute Operation
        </h3>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            A + B
          </button>
          <button
            onClick={handleSubtract}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            A − B
          </button>
          <button
            onClick={handleMultiply}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            A × B
          </button>
          <button
            onClick={handleDeterminant}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            det(A)
          </button>
          <button
            onClick={handleInverse}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            A⁻¹ (Inverse)
          </button>
          <button
            onClick={handleTranspose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Aᵀ (Transpose)
          </button>

          {/* Scalar k multiply */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-slate-500">k =</span>
            <input
              type="number"
              value={scalarK}
              onChange={(e) => setScalarK(Number(e.target.value) || 0)}
              className="w-14 px-2 py-1 text-xs text-center font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
            />
            <button
              onClick={handleScalarMultiply}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              k × A
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {(resultMatrix !== null || resultScalar !== null || errorMsg !== null) && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Calculation Output
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {operationName}
              </h3>
            </div>

            {(resultMatrix || resultScalar !== null) && (
              <button
                onClick={handleCopyResult}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Result</span>
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {resultScalar !== null && (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
              <span className="font-mono text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                {formatNumber(resultScalar, { maxDecimals: 8 })}
              </span>
            </div>
          )}

          {resultMatrix !== null && (
            <div
              className="grid gap-2 max-w-lg mx-auto p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800"
              style={{ gridTemplateColumns: `repeat(${resultMatrix[0].length}, minmax(0, 1fr))` }}
            >
              {resultMatrix.map((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`res-${r}-${c}`}
                    className="py-3 px-2 text-center font-mono text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white tabular-nums"
                  >
                    {formatNumber(val, { maxDecimals: 4 })}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

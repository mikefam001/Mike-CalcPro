import React, { useState, useMemo } from 'react';
import { ShoppingBag, CheckCircle, TrendingDown } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

interface UnitOption {
  id: string;
  name: string;
  toBase: number; // base: grams for weight, ml for liquid, 1 for counts
}

const UNIT_TYPES: Record<string, UnitOption[]> = {
  weight: [
    { id: 'oz', name: 'Ounces (oz)', toBase: 28.3495 },
    { id: 'lb', name: 'Pounds (lb)', toBase: 453.592 },
    { id: 'g', name: 'Grams (g)', toBase: 1 },
    { id: 'kg', name: 'Kilograms (kg)', toBase: 1000 },
  ],
  liquid: [
    { id: 'floz', name: 'Fluid Ounces (fl oz)', toBase: 29.5735 },
    { id: 'ml', name: 'Milliliters (mL)', toBase: 1 },
    { id: 'l', name: 'Liters (L)', toBase: 1000 },
    { id: 'gal', name: 'Gallons (gal)', toBase: 3785.41 },
  ],
  count: [
    { id: 'unit', name: 'Pieces / Count', toBase: 1 },
  ],
};

export const UnitPriceCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [dimensionType, setDimensionType] = useState<'weight' | 'liquid' | 'count'>('weight');

  // Item A
  const [nameA, setNameA] = useState('Option A (Standard Pack)');
  const [priceA, setPriceA] = useState('4.99');
  const [qtyA, setQtyA] = useState('16');
  const [unitA, setUnitA] = useState('oz');

  // Item B
  const [nameB, setNameB] = useState('Option B (Bulk Pack)');
  const [priceB, setPriceB] = useState('11.49');
  const [qtyB, setQtyB] = useState('48');
  const [unitB, setUnitB] = useState('oz');

  const comparison = useMemo(() => {
    const pA = Number(priceA);
    const qA = Number(qtyA);
    const pB = Number(priceB);
    const qB = Number(qtyB);

    if (isNaN(pA) || isNaN(qA) || isNaN(pB) || isNaN(qB) || qA <= 0 || qB <= 0 || pA <= 0 || pB <= 0) {
      return null;
    }

    const unitList = UNIT_TYPES[dimensionType];
    const uDefA = unitList.find((u) => u.id === unitA) || unitList[0];
    const uDefB = unitList.find((u) => u.id === unitB) || unitList[0];

    const baseQtyA = qA * uDefA.toBase;
    const baseQtyB = qB * uDefB.toBase;

    const unitCostA = pA / baseQtyA; // cost per base unit
    const unitCostB = pB / baseQtyB;

    // Display unit price per selected unit of A
    const pricePerUnitA = pA / qA;
    // Normalized to unit A
    const normalizedPricePerUnitB = unitCostB * uDefA.toBase;

    const cheaper = unitCostA < unitCostB ? 'A' : unitCostB < unitCostA ? 'B' : 'equal';
    const percentSavings =
      cheaper === 'A'
        ? ((unitCostB - unitCostA) / unitCostB) * 100
        : cheaper === 'B'
        ? ((unitCostA - unitCostB) / unitCostA) * 100
        : 0;

    return {
      pricePerUnitA,
      normalizedPricePerUnitB,
      cheaper,
      percentSavings,
      unitNameA: uDefA.name,
    };
  }, [dimensionType, priceA, qtyA, unitA, priceB, qtyB, unitB]);

  const handleSave = () => {
    if (!comparison) return;
    const best = comparison.cheaper === 'A' ? nameA : comparison.cheaper === 'B' ? nameB : 'Equal value';
    addHistory({
      calculatorId: 'unitprice',
      calculatorName: 'Unit Price Comparison',
      expression: `${nameA} ($${priceA}/${qtyA}${unitA}) vs ${nameB} ($${priceB}/${qtyB}${unitB})`,
      result: `${best} is ${comparison.percentSavings.toFixed(1)}% cheaper`,
    });
    showToast('Saved comparison to history');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Unit Price & Grocery Value Comparison</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare packages and sizes to identify the real cost per ounce, pound, or gram and avoid supermarket tricks.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          {(['weight', 'liquid', 'count'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setDimensionType(type);
                setUnitA(UNIT_TYPES[type][0].id);
                setUnitB(UNIT_TYPES[type][0].id);
              }}
              className={`px-3 py-1 font-semibold rounded-md capitalize transition-colors ${
                dimensionType === type ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Item A */}
        <div
          className={`p-5 rounded-xl border transition-colors ${
            comparison?.cheaper === 'A'
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <input
              type="text"
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
              className="text-sm font-bold bg-transparent text-slate-900 dark:text-white border-b border-dashed border-slate-300 dark:border-slate-700 focus:outline-none"
            />
            {comparison?.cheaper === 'A' && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Best Deal
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-500">Price ($):</label>
              <input
                type="number"
                step="0.01"
                value={priceA}
                onChange={(e) => setPriceA(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Quantity:</label>
              <input
                type="number"
                step="any"
                value={qtyA}
                onChange={(e) => setQtyA(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Unit:</label>
              <select
                value={unitA}
                onChange={(e) => setUnitA(e.target.value)}
                className="w-full mt-1 px-2 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {UNIT_TYPES[dimensionType].map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {comparison && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Unit Cost:</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                ${formatNumber(comparison.pricePerUnitA, { maxDecimals: 4 })}{' '}
                <span className="text-xs font-normal text-slate-400">/ {unitA}</span>
              </div>
            </div>
          )}
        </div>

        {/* Item B */}
        <div
          className={`p-5 rounded-xl border transition-colors ${
            comparison?.cheaper === 'B'
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <input
              type="text"
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              className="text-sm font-bold bg-transparent text-slate-900 dark:text-white border-b border-dashed border-slate-300 dark:border-slate-700 focus:outline-none"
            />
            {comparison?.cheaper === 'B' && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Best Deal
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-500">Price ($):</label>
              <input
                type="number"
                step="0.01"
                value={priceB}
                onChange={(e) => setPriceB(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Quantity:</label>
              <input
                type="number"
                step="any"
                value={qtyB}
                onChange={(e) => setQtyB(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Unit:</label>
              <select
                value={unitB}
                onChange={(e) => setUnitB(e.target.value)}
                className="w-full mt-1 px-2 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {UNIT_TYPES[dimensionType].map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {comparison && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Normalized Cost:</span>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                ${formatNumber(comparison.normalizedPricePerUnitB, { maxDecimals: 4 })}{' '}
                <span className="text-xs font-normal text-slate-400">/ {unitA}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {comparison && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs font-medium text-slate-500">Value Assessment:</span>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {comparison.cheaper === 'equal'
                ? 'Both options offer identical value per unit.'
                : `${comparison.cheaper === 'A' ? nameA : nameB} is ${comparison.percentSavings.toFixed(1)}% cheaper per ${unitA}!`}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            Save Comparison
          </button>
        </div>
      )}
    </div>
  );
};

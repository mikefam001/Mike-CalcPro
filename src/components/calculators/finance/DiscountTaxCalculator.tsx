import React, { useState, useMemo } from 'react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const DiscountTaxCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [price, setPrice] = useState('120');
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [discountValue, setDiscountValue] = useState('25');
  const [taxRate, setTaxRate] = useState('8.5'); // %

  const calculation = useMemo(() => {
    const P = Number(price);
    const dVal = Number(discountValue);
    const tax = Number(taxRate) / 100;

    if (isNaN(P) || P < 0 || isNaN(dVal) || dVal < 0) return null;

    let discountAmount = 0;
    if (discountType === 'percent') {
      discountAmount = P * (dVal / 100);
    } else {
      discountAmount = dVal;
    }

    const discountedPrice = Math.max(0, P - discountAmount);
    const taxAmount = discountedPrice * tax;
    const finalTotal = discountedPrice + taxAmount;
    const totalSavings = P > 0 ? discountAmount : 0;
    const effectiveDiscountPercent = P > 0 ? (discountAmount / P) * 100 : 0;

    return {
      originalPrice: P,
      discountAmount,
      discountedPrice,
      taxAmount,
      finalTotal,
      totalSavings,
      effectiveDiscountPercent,
    };
  }, [price, discountType, discountValue, taxRate]);

  const handleSave = () => {
    if (!calculation) return;
    addHistory({
      calculatorId: 'discount',
      calculatorName: 'Discount & Tax',
      expression: `$${price} with ${discountValue}${discountType === 'percent' ? '%' : '$'} discount + ${taxRate}% tax`,
      result: `$${formatNumber(calculation.finalTotal, { maxDecimals: 2 })}`,
      details: {
        Savings: `$${formatNumber(calculation.totalSavings, { maxDecimals: 2 })}`,
      },
    });
    showToast('Saved discount calculation');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Discount, Sales Tax & Margin Calculator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate consumer checkout totals, dollar savings, and sales tax additions.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          Save to History
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Original Retail Price ($):</label>
          <input
            type="number"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-500">Discount:</label>
            <div className="flex text-[11px] gap-1">
              <button
                onClick={() => setDiscountType('percent')}
                className={`font-semibold ${discountType === 'percent' ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                % Percent
              </button>
              <span>|</span>
              <button
                onClick={() => setDiscountType('amount')}
                className={`font-semibold ${discountType === 'amount' ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                $ Flat Off
              </button>
            </div>
          </div>
          <input
            type="number"
            step="1"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Sales Tax (%):</label>
          <input
            type="number"
            step="0.1"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {calculation && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Final Out-of-Pocket Price:</span>
            <div className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              ${formatNumber(calculation.finalTotal, { maxDecimals: 2 })}
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Total Discount Saved:</span>
            <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              ${formatNumber(calculation.totalSavings, { maxDecimals: 2 })}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Effective discount: {calculation.effectiveDiscountPercent.toFixed(1)}% off
            </span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Sales Tax Added:</span>
            <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              ${formatNumber(calculation.taxAmount, { maxDecimals: 2 })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

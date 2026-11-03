import React, { useState, useMemo } from 'react';
import { ArrowRightLeft, Info } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  rateToUSD: number; // base rate relative to 1 USD
}

const DEFAULT_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rateToUSD: 1.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', rateToUSD: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rateToUSD: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rateToUSD: 154.5 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rateToUSD: 1.39 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rateToUSD: 1.52 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rateToUSD: 0.88 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rateToUSD: 84.4 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rateToUSD: 7.23 },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', rateToUSD: 20.1 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rateToUSD: 1.34 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', rateToUSD: 1.68 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rateToUSD: 5.76 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rateToUSD: 17.8 },
];

export const CurrencyConverter: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [currencies, setCurrencies] = useState<CurrencyInfo[]>(DEFAULT_CURRENCIES);
  const [amount, setAmount] = useState('1000');
  const [fromCode, setFromCode] = useState('USD');
  const [toCode, setToCode] = useState('EUR');
  const [customRateOverride, setCustomRateOverride] = useState<string>('');

  const fromCurr = currencies.find((c) => c.code === fromCode) || currencies[0];
  const toCurr = currencies.find((c) => c.code === toCode) || currencies[1];

  // Effective rate: 1 From = X To
  const standardRate = toCurr.rateToUSD / fromCurr.rateToUSD;
  const effectiveRate = customRateOverride ? Number(customRateOverride) || standardRate : standardRate;

  const convertedAmount = useMemo(() => {
    const val = Number(amount);
    if (isNaN(val) || val < 0) return 0;
    return val * effectiveRate;
  }, [amount, effectiveRate]);

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
    setCustomRateOverride('');
  };

  const handleSave = () => {
    addHistory({
      calculatorId: 'currency',
      calculatorName: 'Currency Converter',
      expression: `${amount} ${fromCode} to ${toCode} (rate: ${effectiveRate.toFixed(4)})`,
      result: `${toCurr.symbol}${formatNumber(convertedAmount, { maxDecimals: 2 })} ${toCode}`,
    });
    showToast('Saved currency conversion');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Multi-Currency Converter</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Client-side currency conversion with transparent customizable exchange rates.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          Save to History
        </button>
      </div>

      {/* Mandatory Offline Notice */}
      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          <strong>Rate Transparency Notice:</strong> All calculations run 100% locally in your browser. The rates shown
          are baseline reference values. For foreign exchange or bank-specific transactions, you can edit the conversion
          rate below to match your card provider.
        </p>
      </div>

      {/* Converter Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Amount input */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-500">Amount:</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-mono text-slate-400">{fromCurr.symbol}</span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-base font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <select
              value={fromCode}
              onChange={(e) => {
                setFromCode(e.target.value);
                setCustomRateOverride('');
              }}
              className="w-full mt-2 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-transform active:scale-95"
              title="Swap Currencies"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Target Currency */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-500">Converted Output:</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-mono text-slate-400">{toCurr.symbol}</span>
              <div className="w-full pl-8 pr-3 py-2 text-base font-mono font-bold bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300">
                {formatNumber(convertedAmount, { maxDecimals: 2 })}
              </div>
            </div>
            <select
              value={toCode}
              onChange={(e) => {
                setToCode(e.target.value);
                setCustomRateOverride('');
              }}
              className="w-full mt-2 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rate Customizer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-mono">
            <span>Exchange Rate:</span>
            <span>1 {fromCode} =</span>
            <input
              type="number"
              step="any"
              placeholder={standardRate.toFixed(4)}
              value={customRateOverride}
              onChange={(e) => setCustomRateOverride(e.target.value)}
              className="w-24 px-2 py-1 text-center text-xs font-mono font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
            />
            <span>{toCode}</span>
          </div>

          {customRateOverride && (
            <button
              onClick={() => setCustomRateOverride('')}
              className="text-xs text-rose-500 hover:underline"
            >
              Reset to Standard Baseline
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

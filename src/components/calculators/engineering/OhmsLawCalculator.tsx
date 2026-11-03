import React, { useState } from 'react';
import { Zap, RotateCcw } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const OhmsLawCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [voltage, setVoltage] = useState('12'); // V
  const [current, setCurrent] = useState('2'); // A
  const [resistance, setResistance] = useState('6'); // Ω
  const [power, setPower] = useState('24'); // W

  const [activeKnowns, setActiveKnowns] = useState<'VI' | 'VR' | 'VP' | 'IR' | 'IP' | 'RP'>('VI');

  const handleCompute = (knownPair: 'VI' | 'VR' | 'VP' | 'IR' | 'IP' | 'RP') => {
    setActiveKnowns(knownPair);
    let v = Number(voltage);
    let i = Number(current);
    let r = Number(resistance);
    let p = Number(power);

    try {
      if (knownPair === 'VI') {
        if (i === 0) throw new Error('Current cannot be zero');
        r = v / i;
        p = v * i;
        setResistance(formatNumber(r, { maxDecimals: 4 }));
        setPower(formatNumber(p, { maxDecimals: 4 }));
      } else if (knownPair === 'VR') {
        if (r === 0) throw new Error('Resistance cannot be zero');
        i = v / r;
        p = (v * v) / r;
        setCurrent(formatNumber(i, { maxDecimals: 4 }));
        setPower(formatNumber(p, { maxDecimals: 4 }));
      } else if (knownPair === 'VP') {
        if (v === 0) throw new Error('Voltage cannot be zero');
        i = p / v;
        r = (v * v) / p;
        setCurrent(formatNumber(i, { maxDecimals: 4 }));
        setResistance(formatNumber(r, { maxDecimals: 4 }));
      } else if (knownPair === 'IR') {
        v = i * r;
        p = i * i * r;
        setVoltage(formatNumber(v, { maxDecimals: 4 }));
        setPower(formatNumber(p, { maxDecimals: 4 }));
      } else if (knownPair === 'IP') {
        if (i === 0) throw new Error('Current cannot be zero');
        v = p / i;
        r = p / (i * i);
        setVoltage(formatNumber(v, { maxDecimals: 4 }));
        setResistance(formatNumber(r, { maxDecimals: 4 }));
      } else if (knownPair === 'RP') {
        if (r === 0) throw new Error('Resistance cannot be zero');
        v = Math.sqrt(p * r);
        i = Math.sqrt(p / r);
        setVoltage(formatNumber(v, { maxDecimals: 4 }));
        setCurrent(formatNumber(i, { maxDecimals: 4 }));
      }

      addHistory({
        calculatorId: 'ohmslaw',
        calculatorName: 'Ohm’s Law',
        expression: `Circuit: ${knownPair}`,
        result: `${formatNumber(v, { maxDecimals: 2 })}V, ${formatNumber(i, { maxDecimals: 2 })}A, ${formatNumber(r, { maxDecimals: 2 })}Ω, ${formatNumber(p, { maxDecimals: 2 })}W`,
      });
      showToast('Calculated circuit parameters');
    } catch (err: any) {
      showToast(err.message || 'Calculation error');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Ohm’s Law & Electrical Power</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Analyze DC electrical circuits: Voltage (V), Current (I), Resistance (R), and Dissipated Power (P).
          </p>
        </div>
      </div>

      {/* Select known parameters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Select the two known quantities to solve for the other two:
        </label>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: 'VI', label: 'Voltage (V) & Current (I)' },
            { id: 'VR', label: 'Voltage (V) & Resistance (R)' },
            { id: 'VP', label: 'Voltage (V) & Power (P)' },
            { id: 'IR', label: 'Current (I) & Resistance (R)' },
            { id: 'IP', label: 'Current (I) & Power (P)' },
            { id: 'RP', label: 'Resistance (R) & Power (P)' },
          ].map((pair) => (
            <button
              key={pair.id}
              onClick={() => handleCompute(pair.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeKnowns === pair.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {pair.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Quantities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Voltage */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Voltage (V)</span>
            <span className="text-[11px] text-emerald-600 font-mono">Volts</span>
          </div>
          <input
            type="number"
            step="any"
            value={voltage}
            onChange={(e) => setVoltage(e.target.value)}
            className="w-full text-2xl font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
          />
          <span className="text-[10px] text-slate-400 block font-mono">V = I · R = P / I = √(P · R)</span>
        </div>

        {/* Current */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Current (I)</span>
            <span className="text-[11px] text-emerald-600 font-mono">Amperes</span>
          </div>
          <input
            type="number"
            step="any"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full text-2xl font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
          />
          <span className="text-[10px] text-slate-400 block font-mono">I = V / R = P / V = √(P / R)</span>
        </div>

        {/* Resistance */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Resistance (R)</span>
            <span className="text-[11px] text-emerald-600 font-mono">Ohms (Ω)</span>
          </div>
          <input
            type="number"
            step="any"
            value={resistance}
            onChange={(e) => setResistance(e.target.value)}
            className="w-full text-2xl font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
          />
          <span className="text-[10px] text-slate-400 block font-mono">R = V / I = V² / P = P / I²</span>
        </div>

        {/* Power */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Power (P)</span>
            <span className="text-[11px] text-emerald-600 font-mono">Watts (W)</span>
          </div>
          <input
            type="number"
            step="any"
            value={power}
            onChange={(e) => setPower(e.target.value)}
            className="w-full text-2xl font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
          />
          <span className="text-[10px] text-slate-400 block font-mono">P = V · I = I² · R = V² / R</span>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => handleCompute(activeKnowns)}
          className="px-8 py-3 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
        >
          Recalculate Circuit Values
        </button>
      </div>
    </div>
  );
};

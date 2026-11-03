import React, { useState, useMemo } from 'react';
import { Navigation, Users } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const FuelCostCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [unitSystem, setUnitSystem] = useState<'us' | 'metric'>('us');
  const [distance, setDistance] = useState('320'); // miles or km
  const [fuelEconomy, setFuelEconomy] = useState('28'); // MPG or L/100km
  const [fuelPrice, setFuelPrice] = useState('3.65'); // $ per gallon or liter
  const [passengers, setPassengers] = useState('2');

  const calculation = useMemo(() => {
    const dist = Number(distance);
    const econ = Number(fuelEconomy);
    const price = Number(fuelPrice);
    const count = Math.max(1, Math.floor(Number(passengers)) || 1);

    if (isNaN(dist) || isNaN(econ) || isNaN(price) || dist <= 0 || econ <= 0 || price <= 0) {
      return null;
    }

    let fuelNeeded = 0;
    if (unitSystem === 'us') {
      // distance in miles, MPG -> gallons
      fuelNeeded = dist / econ;
    } else {
      // distance in km, L/100km -> liters
      fuelNeeded = (dist / 100) * econ;
    }

    const totalCost = fuelNeeded * price;
    const costPerPassenger = totalCost / count;

    return {
      fuelNeeded,
      totalCost,
      costPerPassenger,
      count,
      fuelUnit: unitSystem === 'us' ? 'gallons' : 'liters',
      distanceUnit: unitSystem === 'us' ? 'miles' : 'km',
    };
  }, [unitSystem, distance, fuelEconomy, fuelPrice, passengers]);

  const handleSave = () => {
    if (!calculation) return;
    addHistory({
      calculatorId: 'fuelcost',
      calculatorName: 'Fuel & Trip Cost',
      expression: `${distance} ${calculation.distanceUnit} at ${fuelEconomy} ${unitSystem === 'us' ? 'MPG' : 'L/100km'} ($${fuelPrice}/unit)`,
      result: `$${formatNumber(calculation.totalCost, { maxDecimals: 2 })} total ($${formatNumber(calculation.costPerPassenger, { maxDecimals: 2 })}/person)`,
    });
    showToast('Saved fuel calculation');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Fuel Economy & Road Trip Cost Calculator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate total trip fuel gallons/liters, trip expenditure, and carpool passenger splits.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setUnitSystem('us')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              unitSystem === 'us' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            US (Miles, MPG, Gallons)
          </button>
          <button
            onClick={() => setUnitSystem('metric')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              unitSystem === 'metric' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Metric (KM, L/100km, Liters)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Trip Distance ({unitSystem === 'us' ? 'Miles' : 'KM'}):
          </label>
          <input
            type="number"
            step="any"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Fuel Economy ({unitSystem === 'us' ? 'MPG' : 'L / 100km'}):
          </label>
          <input
            type="number"
            step="any"
            value={fuelEconomy}
            onChange={(e) => setFuelEconomy(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Fuel Price ({unitSystem === 'us' ? '$/Gallon' : '$/Liter'}):
          </label>
          <input
            type="number"
            step="0.01"
            value={fuelPrice}
            onChange={(e) => setFuelPrice(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Carpool Passengers:</label>
          <input
            type="number"
            min="1"
            value={passengers}
            onChange={(e) => setPassengers(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {calculation && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Total Fuel Cost:</span>
              <div className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                ${formatNumber(calculation.totalCost, { maxDecimals: 2 })}
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Cost Per Passenger:</span>
              <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                ${formatNumber(calculation.costPerPassenger, { maxDecimals: 2 })}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Split across {calculation.count} person(s)
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Total Fuel Required:</span>
              <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {formatNumber(calculation.fuelNeeded, { maxDecimals: 1 })}{' '}
                <span className="text-sm font-normal text-slate-400">{calculation.fuelUnit}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleSave}
              className="px-6 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Save to History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

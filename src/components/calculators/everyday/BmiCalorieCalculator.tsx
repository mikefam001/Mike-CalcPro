import React, { useState, useMemo } from 'react';
import { Heart, Activity, Info } from 'lucide-react';
import { useCalculator } from '../../../context/CalculatorContext';
import { formatNumber } from '../../../utils/mathEngine';

export const BmiCalorieCalculator: React.FC = () => {
  const { addHistory, showToast } = useCalculator();

  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('28');

  // Height & Weight
  const [heightCm, setHeightCm] = useState('175');
  const [weightKg, setWeightKg] = useState('72');

  const [heightFeet, setHeightFeet] = useState('5');
  const [heightInches, setHeightInches] = useState('9');
  const [weightLbs, setWeightLbs] = useState('160');

  // Activity level multiplier
  const [activity, setActivity] = useState<number>(1.375); // light exercise

  const calculation = useMemo(() => {
    let hMeters = 0;
    let wKg = 0;

    if (unitSystem === 'metric') {
      hMeters = Number(heightCm) / 100;
      wKg = Number(weightKg);
    } else {
      const totalInches = Number(heightFeet) * 12 + Number(heightInches);
      hMeters = totalInches * 0.0254;
      wKg = Number(weightLbs) * 0.45359237;
    }

    const a = Number(age);
    if (isNaN(hMeters) || isNaN(wKg) || isNaN(a) || hMeters <= 0 || wKg <= 0 || a <= 0) {
      return null;
    }

    // BMI = weight(kg) / height(m)^2
    const bmi = wKg / (hMeters * hMeters);

    let category = '';
    let categoryColor = '';
    if (bmi < 18.5) {
      category = 'Underweight';
      categoryColor = 'text-amber-500';
    } else if (bmi < 24.9) {
      category = 'Normal Healthy Weight';
      categoryColor = 'text-emerald-600 dark:text-emerald-400';
    } else if (bmi < 29.9) {
      category = 'Overweight';
      categoryColor = 'text-amber-600';
    } else {
      category = 'Obesity Category';
      categoryColor = 'text-rose-600';
    }

    // Healthy weight range (BMI 18.5 - 24.9)
    const minHealthyKg = 18.5 * (hMeters * hMeters);
    const maxHealthyKg = 24.9 * (hMeters * hMeters);

    // BMR via Mifflin-St Jeor Equation
    // Men: 10*weight(kg) + 6.25*height(cm) - 5*age + 5
    // Women: 10*weight(kg) + 6.25*height(cm) - 5*age - 161
    const hCm = hMeters * 100;
    const bmr =
      gender === 'male'
        ? 10 * wKg + 6.25 * hCm - 5 * a + 5
        : 10 * wKg + 6.25 * hCm - 5 * a - 161;

    // TDEE = BMR * Activity
    const tdee = bmr * activity;

    return {
      bmi,
      category,
      categoryColor,
      bmr,
      tdee,
      mildLoss: tdee - 250,
      moderateLoss: tdee - 500,
      mildGain: tdee + 250,
      healthyRange:
        unitSystem === 'metric'
          ? `${minHealthyKg.toFixed(1)} – ${maxHealthyKg.toFixed(1)} kg`
          : `${(minHealthyKg * 2.20462).toFixed(1)} – ${(maxHealthyKg * 2.20462).toFixed(1)} lbs`,
    };
  }, [unitSystem, gender, age, heightCm, weightKg, heightFeet, heightInches, weightLbs, activity]);

  const handleSave = () => {
    if (!calculation) return;
    addHistory({
      calculatorId: 'bmimeter',
      calculatorName: 'BMI & Calories',
      expression: `BMI & Daily TDEE (${gender}, age ${age})`,
      result: `BMI: ${calculation.bmi.toFixed(1)} (${calculation.category}) · TDEE: ${Math.round(calculation.tdee)} kcal`,
    });
    showToast('Saved health calculations');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">BMI & TDEE Calorie Requirement Estimator</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            WHO Body Mass Index, Mifflin-St Jeor basal metabolic rate, and daily caloric targets.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setUnitSystem('metric')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              unitSystem === 'metric' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Metric (cm, kg)
          </button>
          <button
            onClick={() => setUnitSystem('imperial')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              unitSystem === 'imperial' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Imperial (ft, lbs)
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Biological Gender:</label>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setGender('male')}
              className={`flex-1 py-1.5 font-semibold rounded-md transition-colors ${
                gender === 'male' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender('female')}
              className={`flex-1 py-1.5 font-semibold rounded-md transition-colors ${
                gender === 'female' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Female
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Age (Years):</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        {unitSystem === 'metric' ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Height (cm):</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Weight (kg):</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Height (ft &amp; in):</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="ft"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  className="w-1/2 px-2 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="in"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  className="w-1/2 px-2 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Weight (lbs):</label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </>
        )}
      </div>

      {/* Activity level */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Daily Physical Activity Level:
        </label>
        <select
          value={activity}
          onChange={(e) => setActivity(Number(e.target.value))}
          className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
        >
          <option value="1.2">Sedentary (Little or no exercise, desk job)</option>
          <option value="1.375">Light Activity (Exercise 1–3 days/week)</option>
          <option value="1.55">Moderate Activity (Exercise 3–5 days/week)</option>
          <option value="1.725">Very Active (Hard exercise 6–7 days/week)</option>
          <option value="1.9">Extra Active (Athlete or physical job)</option>
        </select>
      </div>

      {calculation && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium block">Body Mass Index (BMI):</span>
              <div className="font-mono text-4xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {calculation.bmi.toFixed(1)}
              </div>
              <span className={`text-xs font-bold mt-1 block ${calculation.categoryColor}`}>
                {calculation.category}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Healthy Range: {calculation.healthyRange}
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium block">Daily Maintenance TDEE:</span>
              <div className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                {Math.round(calculation.tdee)} <span className="text-base font-normal">kcal/day</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                To maintain current body weight at your activity level
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 font-medium block">Basal Metabolic Rate (BMR):</span>
              <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {Math.round(calculation.bmr)} <span className="text-base font-normal">kcal/day</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Calories burned at rest for vital metabolic function
              </span>
            </div>
          </div>

          {/* Goal Targets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Mild Weight Loss (~0.5 lb / wk)
              </span>
              <div className="font-mono text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1 tabular-nums">
                {Math.round(calculation.mildLoss)} kcal/day
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900">
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                Moderate Weight Loss (~1 lb / wk)
              </span>
              <div className="font-mono text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1 tabular-nums">
                {Math.round(calculation.moderateLoss)} kcal/day
              </div>
            </div>

            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Lean Muscle Gain
              </span>
              <div className="font-mono text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1 tabular-nums">
                {Math.round(calculation.mildGain)} kcal/day
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleSave}
              className="px-6 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Save Health Calculations to History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

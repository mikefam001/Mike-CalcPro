import React from 'react';
import { ArrowLeft, Bookmark, BookmarkCheck, Share2, Sparkles } from 'lucide-react';
import { useCalculator } from '../../context/CalculatorContext';
import { CALCULATORS, CATEGORIES } from '../../data/calculatorRegistry';

// Calculators
import { BasicCalculator } from '../calculators/basic/BasicCalculator';
import { ScientificCalculator } from '../calculators/scientific/ScientificCalculator';
import { MatrixCalculator } from '../calculators/advanced/MatrixCalculator';
import { CalculusCalculator } from '../calculators/advanced/CalculusCalculator';
import { EquationSolver } from '../calculators/advanced/EquationSolver';
import { ComplexNumberCalculator } from '../calculators/advanced/ComplexNumberCalculator';
import { VectorCalculator } from '../calculators/advanced/VectorCalculator';
import { NumberTheoryCalculator } from '../calculators/advanced/NumberTheoryCalculator';
import { StatisticsCalculator } from '../calculators/statistics/StatisticsCalculator';
import { ProbabilityDistributions } from '../calculators/statistics/ProbabilityDistributions';
import { RegressionCalculator } from '../calculators/statistics/RegressionCalculator';
import { LoanMortgageCalculator } from '../calculators/finance/LoanMortgageCalculator';
import { CompoundInterestCalculator } from '../calculators/finance/CompoundInterestCalculator';
import { InvestmentRoiCalculator } from '../calculators/finance/InvestmentRoiCalculator';
import { SalaryTaxCalculator } from '../calculators/finance/SalaryTaxCalculator';
import { DiscountTaxCalculator } from '../calculators/finance/DiscountTaxCalculator';
import { CurrencyConverter } from '../calculators/finance/CurrencyConverter';
import { UnitConverter } from '../calculators/engineering/UnitConverter';
import { OhmsLawCalculator } from '../calculators/engineering/OhmsLawCalculator';
import { DateDifferenceCalculator } from '../calculators/datetime/DateDifferenceCalculator';
import { AgeCalculator } from '../calculators/datetime/AgeCalculator';
import { WorldTimeConverter } from '../calculators/datetime/WorldTimeConverter';
import { CountdownTimer } from '../calculators/datetime/CountdownTimer';
import { TipSplitCalculator } from '../calculators/everyday/TipSplitCalculator';
import { PercentageCalculator } from '../calculators/everyday/PercentageCalculator';
import { BmiCalorieCalculator } from '../calculators/everyday/BmiCalorieCalculator';
import { FuelCostCalculator } from '../calculators/everyday/FuelCostCalculator';
import { FractionCalculator } from '../calculators/everyday/FractionCalculator';
import { UnitPriceCalculator } from '../calculators/everyday/UnitPriceCalculator';

export const CalculatorWorkspace: React.FC = () => {
  const { activeCalculatorId, setActiveCalculatorId, setActiveCategory, isFavorite, toggleFavorite, showToast } =
    useCalculator();

  const currentCalc = CALCULATORS.find((c) => c.id === activeCalculatorId);
  const currentCategory = currentCalc ? CATEGORIES.find((cat) => cat.id === currentCalc.category) : null;
  const isFav = currentCalc ? isFavorite(currentCalc.id) : false;

  const renderCalculator = () => {
    switch (activeCalculatorId) {
      case 'basic':
        return <BasicCalculator />;
      case 'scientific':
        return <ScientificCalculator />;
      case 'matrix':
        return <MatrixCalculator />;
      case 'calculus':
        return <CalculusCalculator />;
      case 'equations':
        return <EquationSolver />;
      case 'complex':
        return <ComplexNumberCalculator />;
      case 'vectors':
        return <VectorCalculator />;
      case 'numbertheory':
        return <NumberTheoryCalculator />;
      case 'statistics':
        return <StatisticsCalculator />;
      case 'probability':
        return <ProbabilityDistributions />;
      case 'regression':
        return <RegressionCalculator />;
      case 'loan':
        return <LoanMortgageCalculator />;
      case 'compound':
        return <CompoundInterestCalculator />;
      case 'investment':
        return <InvestmentRoiCalculator />;
      case 'salary':
        return <SalaryTaxCalculator />;
      case 'discount':
        return <DiscountTaxCalculator />;
      case 'currency':
        return <CurrencyConverter />;
      case 'unitconverter':
        return <UnitConverter />;
      case 'ohmslaw':
        return <OhmsLawCalculator />;
      case 'datediff':
        return <DateDifferenceCalculator />;
      case 'age':
        return <AgeCalculator />;
      case 'worldtime':
        return <WorldTimeConverter />;
      case 'countdown':
        return <CountdownTimer />;
      case 'tipsplit':
        return <TipSplitCalculator />;
      case 'percentage':
        return <PercentageCalculator />;
      case 'bmimeter':
        return <BmiCalorieCalculator />;
      case 'fuelcost':
        return <FuelCostCalculator />;
      case 'fraction':
        return <FractionCalculator />;
      case 'unitprice':
        return <UnitPriceCalculator />;
      default:
        return <ScientificCalculator />;
    }
  };

  if (!currentCalc) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Calculator not found</h2>
        <button
          onClick={() => setActiveCalculatorId('home')}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Metadata strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <button
              onClick={() => setActiveCalculatorId('home')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => {
                setActiveCategory(currentCalc.category);
                setActiveCalculatorId('directory');
              }}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors capitalize"
            >
              {currentCategory?.name || currentCalc.category}
            </button>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
              {currentCalc.shortName}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currentCalc.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            {currentCalc.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => {
              toggleFavorite(currentCalc.id);
              showToast(isFav ? `Removed ${currentCalc.shortName}` : `Bookmarked ${currentCalc.shortName}`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isFav ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isFav ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          <button
            onClick={() => setActiveCalculatorId('directory')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Tools</span>
          </button>
        </div>
      </div>

      {/* Main Calculator Workspace */}
      <div className="py-2">{renderCalculator()}</div>
    </div>
  );
};

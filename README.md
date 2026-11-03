# Mike CalcPro — All-in-One Mathematical & Scientific Calculation Platform

A comprehensive, high-precision, client-side calculator web platform built with React 19, TypeScript, Tailwind CSS, Math.js, and Decimal.js.

---

## 1. Project Overview & Architectural Principles

Mike CalcPro brings together basic arithmetic, scientific computing, advanced matrix & calculus operations, descriptive statistics, financial modeling, unit conversions, date/time chronometry, and practical everyday tools into a single, cohesive web platform.

### Key Pillars:
- **Zero Server Tracking / Privacy First**: 100% of calculations execute in the browser. No input or equation is ever sent across the wire.
- **High-Precision Arithmetic**: Uses `mathjs` for robust syntax parsing and expression evaluation with `Decimal.js` for arbitrary-precision financial operations, preventing floating-point rounding artifacts (`0.1 + 0.2 = 0.3`).
- **No Evaluation Hacks**: Expressions are never evaluated via `eval()`. A safe, tokenized syntax engine enforces operator precedence, parentheses, and domain constraints.
- **Design System & Anti-Slop Disciplined**: Clean typography (`Plus Jakarta Sans` and `JetBrains Mono`), unboxed metadata, dual-theme (Light & Dark), and fully responsive across mobile, tablet, and desktop viewports.
- **Graceful Persistence**: Local calculation history and favorite bookmarks are saved in browser `localStorage` with an in-memory fallback if storage is disabled.

---

## 2. Calculator Modules

### A. Standard & Scientific
- **Basic Calculator**: Full arithmetic (+, −, ×, ÷, %, √x, x², 1/x, ±), parentheses, memory registers (MC, MR, M+, M-), keyboard listener, and continuous calculations.
- **Scientific Calculator**: Trigonometry (`sin`, `cos`, `tan`, `cot`, `sec`, `csc`), inverse & hyperbolic functions, logarithms (`log10`, `ln`, `log2`), powers & roots (`xʸ`, `∛x`, `√x`), factorials (`n!`), permutations (`nPr`), combinations (`nCr`), constants (π, e, φ), degree/radian/gradian angle modes, and scientific/engineering notation formats.

### B. Advanced Mathematics
- **Matrix Algebra**: 2×2, 3×3, and 4×4 square matrices with addition, subtraction, multiplication, determinants `det(A)`, matrix inverse `A⁻¹`, transpose `Aᵀ`, and scalar multiplication.
- **Numerical Calculus & Series**: Definite integration via composite Simpson’s 1/3 rule with 1,000 subintervals; 1st and 2nd numerical derivatives; finite discrete summations (Σ); and arithmetic & geometric series expansions with convergent infinite sums.
- **Equation Solver**: Linear equations `ax + b = c`, quadratic equations with real/complex roots & parabola vertex coordinates, and 2×2 / 3×3 simultaneous linear systems solved via Cramer's rule and Gaussian elimination.
- **Complex Numbers**: Complex arithmetic on `a + bi`, modulus `|z|`, polar coordinates `r ∠ θ`, conjugate `z̄`, and power roots.
- **Vector Analysis**: 2D and 3D vector algebra, dot products, cross products, magnitudes, unit vectors, and angular separation.
- **Number Theory**: Greatest Common Divisor (GCD), Least Common Multiple (LCM), primality test, canonical prime factorization, and divisor sum functions.

### C. Statistics & Probability
- **Descriptive Statistics**: Sample and population variance, standard deviation, mean, median, modes, quartiles (Q1, Q3), interquartile range (IQR), outlier detection, and an interactive SVG Tukey box plot.
- **Probability Distributions**: Gaussian Normal distribution with Z-score lookup, PDF density, and CDF tail probabilities; Binomial distribution with discrete trials, cumulative probabilities, and distribution visualizer.
- **Linear Regression & Correlation**: Pearson correlation coefficient `r`, coefficient of determination `R²`, line of best fit `y = mx + b`, predictions, and an interactive SVG scatter plot with plotted regression line.

### D. Financial & Wealth
- **Loan, Mortgage & EMI**: Monthly payment calculation, total interest paid, principal vs. interest breakdown, and a full month-by-month & annual amortization table with CSV download.
- **Compound Interest**: Flexible compounding frequencies (daily, monthly, quarterly, annual), regular monthly deposits, and comparison against linear simple interest.
- **Investment ROI**: Capital gains simulation, annualized CAGR yield, and dollar-cost averaging projections.
- **Salary & Tax Breakdown**: Net take-home pay, progressive federal tax brackets, FICA deductions (Social Security and Medicare), and state tax estimates across 5 pay cadences (annual, monthly, bi-weekly, weekly, hourly).
- **Discount & Sales Tax**: Consumer checkout calculator with percentage/flat discounts, sales tax additions, and profit margin analysis.
- **Multi-Currency Converter**: Transparent client-side currency converter supporting 14 global currencies with user-editable custom exchange rate overrides.

### E. Engineering & Conversions
- **Universal Unit Converter**: 9 rich physical categories (Length, Mass, Temperature, Area, Volume, Speed, Pressure, Energy, Data Storage) with real-time multi-unit equivalent matrix.
- **Ohm’s Law & Power**: DC circuit solver for Voltage (V), Current (I), Resistance (R), and Power (P).

### F. Date & Time Chronometry
- **Date Difference**: Duration between calendar dates in years, months, days, weeks, and total working business days (excluding weekends).
- **Age Chronometer**: Precision age in years, months, and days, total days lived, and countdown to next birthday.
- **World Time Converter**: Global meeting coordinator displaying live times and working hour windows (9 AM – 5 PM) across major global hubs.
- **Event Countdown**: Live ticking chronometer with second-by-second updates for deadlines and milestones.

### G. Everyday Practical Tools
- **Tip & Bill Split**: Restaurant bill splitting with tip percentage presets, custom tips, and whole-dollar rounding.
- **Percentage Suite**: 4-in-1 tool for percentage of a number, relative proportion, percentage increase/decrease, and markup addition.
- **BMI & Calories**: Body Mass Index with WHO classifications, Mifflin-St Jeor BMR, and daily TDEE maintenance/weight loss caloric targets.
- **Fuel & Trip Cost**: Road trip fuel consumption, cost calculations, and carpool splits.
- **Fraction Calculator**: Arithmetic (+, −, ×, ÷) on standard and mixed fractions with step-by-step reduction to lowest terms.
- **Unit Price Compare**: Direct grocery package comparison to find the best deal and percentage savings per ounce, pound, or gram.

---

## 3. Technology Stack

- **Framework**: React 19 (TypeScript 7)
- **Build Tool**: Vite 8 with `@tailwindcss/vite`
- **Styling**: Tailwind CSS v4 with custom dark mode variant (`@custom-variant dark`)
- **Mathematical Computation**: Math.js 14 and Decimal.js 10
- **Icons**: Lucide React
- **Architecture**: Context API (`CalculatorContext`), safe LocalStorage wrapper, modular calculator directory registry.

---

## 4. Getting Started & Development

### Prerequisites
Node.js 18+ and npm.

### Installation
```bash
# Clone the repository and install dependencies
npm install
```

### Local Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### Type Checking & Linting
```bash
npm run lint
```

### Production Build
```bash
npm run build
```
The compiled static assets will be output to the `dist/` folder, ready for zero-configuration static hosting.

### Preview Production Build
```bash
npm run preview
```

---

## 5. Deployment Guide

Because OmniCalc Pro is an entirely client-side single page application with no backend or database dependency, it can be deployed to any static web hosting provider:

- **Vercel**: Run `vercel` or connect your GitHub repository.
- **Netlify**: Set build command to `npm run build` and publish directory to `dist`.
- **GitHub Pages**: Build with `npm run build` and push the `dist/` directory to the `gh-pages` branch.
- **Cloudflare Pages / AWS S3**: Deploy the `dist/` directory directly.

---

## 6. How to Add a New Calculator

The architecture is built for clean extensibility:

1. **Create the Calculator Component**:
   Create a new file in `src/components/calculators/<category>/<MyNewCalculator>.tsx`. Use `useCalculator()` hook for history tracking and toast feedback.

2. **Register in Calculator Registry**:
   Open `src/data/calculatorRegistry.ts` and append an entry to `CALCULATORS`:
   ```typescript
   {
     id: 'mynewcalculator',
     name: 'My New Calculator',
     shortName: 'New Calculator',
     category: 'financial', // or 'basic', 'scientific', 'advanced', etc.
     description: 'Calculates XYZ with high precision.',
     keywords: ['new', 'xyz', 'math'],
     icon: 'Calculator',
   }
   ```

3. **Mount in Workspace**:
   Open `src/components/layout/CalculatorWorkspace.tsx` and import your component, adding a case to `renderCalculator()`:
   ```typescript
   case 'mynewcalculator':
     return <MyNewCalculator />;
   ```
   The new calculator will instantly appear in Global Search (⌘K), the Directory, Category listings, and the workspace router.

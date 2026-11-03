import { all, create } from 'mathjs';
import Decimal from 'decimal.js';
import { AngleMode, NumberFormatMode } from '../types';

// Create a customized mathjs instance
const math = create(all, {
  number: 'number',
  precision: 64,
});

// Configure Decimal.js
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export interface EvalResult {
  success: boolean;
  result?: string;
  numericValue?: number;
  error?: string;
}

/**
 * Format a number cleanly without floating point precision jitter.
 * E.g., 0.1 + 0.2 becomes 0.3 instead of 0.30000000000000004.
 */
export function formatNumber(
  val: number | string | Decimal,
  options?: {
    mode?: NumberFormatMode;
    maxDecimals?: number;
    useGrouping?: boolean;
  }
): string {
  const { mode = 'standard', maxDecimals = 10, useGrouping = true } = options || {};

  if (typeof val === 'string') {
    const num = Number(val);
    if (isNaN(num)) return val;
    val = num;
  }

  const numVal = typeof val === 'number' ? val : (val as Decimal).toNumber();

  if (!isFinite(numVal)) {
    if (isNaN(numVal)) return 'NaN';
    return numVal > 0 ? 'Infinity' : '-Infinity';
  }

  if (mode === 'scientific') {
    return numVal.toExponential(6);
  }

  if (mode === 'engineering') {
    if (numVal === 0) return '0';
    const exp = Math.floor(Math.log10(Math.abs(numVal)) / 3) * 3;
    const mantissa = numVal / Math.pow(10, exp);
    return `${mantissa.toFixed(4)}e${exp >= 0 ? '+' : ''}${exp}`;
  }

  // Standard formatting
  // Handle clean rounding to eliminate floating artifacts
  const dec = new Decimal(numVal);
  const rounded = dec.toDecimalPlaces(maxDecimals);

  if (useGrouping) {
    const parts = rounded.toString().split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  }

  return rounded.toString();
}

/**
 * Replace trigonometric calls according to current angle mode (deg, rad, grad).
 */
function transformTrigForAngleMode(expr: string, angleMode: AngleMode): string {
  if (angleMode === 'rad') return expr;

  // Conversion factors:
  // deg -> rad: * (pi / 180)
  // grad -> rad: * (pi / 200)
  const factor = angleMode === 'deg' ? '(pi/180)' : '(pi/200)';
  const invFactor = angleMode === 'deg' ? '(180/pi)' : '(200/pi)';

  let transformed = expr;

  // Direct functions: sin, cos, tan, cot, sec, csc
  // Replace sin(...) with sin((...) * factor)
  const directFunctions = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc'];
  for (const fn of directFunctions) {
    const regex = new RegExp(`\\b${fn}\\(([^()]+|\\([^()]*\\))*\\)`, 'g');
    transformed = transformed.replace(regex, (match) => {
      // Don't transform sinh, cosh, etc.
      if (match.startsWith(`${fn}h`)) return match;
      const inner = match.substring(fn.length + 1, match.length - 1);
      return `${fn}((${inner}) * ${factor})`;
    });
  }

  // Inverse functions: asin, acos, atan, acot, asec, acsc
  // Replace asin(...) with (asin(...) * invFactor)
  const invFunctions = ['asin', 'acos', 'atan', 'acot', 'asec', 'acsc'];
  for (const fn of invFunctions) {
    const regex = new RegExp(`\\b${fn}\\(([^()]+|\\([^()]*\\))*\\)`, 'g');
    transformed = transformed.replace(regex, (match) => {
      return `((${match}) * ${invFactor})`;
    });
  }

  return transformed;
}

/**
 * Pre-processes expressions from user keypad/text input into valid mathjs syntax.
 * Replaces symbols like × with *, ÷ with /, π with pi, √ with sqrt, etc.
 */
export function sanitizeExpression(expr: string): string {
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/√\(/g, 'sqrt(')
    .replace(/√([0-9a-zA-Z]+)/g, 'sqrt($1)')
    .replace(/(\d+)%/g, '($1/100)')
    .replace(/\^/g, '^')
    .trim();
}

/**
 * Safe evaluation of mathematical expressions.
 * Does NOT use JavaScript eval. Uses Math.js parser.
 */
export function evaluateMathExpression(
  expression: string,
  options?: {
    angleMode?: AngleMode;
    numberFormat?: NumberFormatMode;
    precision?: number;
  }
): EvalResult {
  const { angleMode = 'deg', numberFormat = 'standard', precision = 10 } = options || {};

  try {
    if (!expression || !expression.trim()) {
      return { success: false, error: 'Empty expression' };
    }

    const sanitized = sanitizeExpression(expression);
    const trigAdjusted = transformTrigForAngleMode(sanitized, angleMode);

    // Evaluate in mathjs
    const evaluated = math.evaluate(trigAdjusted);

    if (evaluated === undefined || evaluated === null) {
      return { success: false, error: 'Calculation returned undefined' };
    }

    // Handle complex numbers
    if (typeof evaluated === 'object' && evaluated.isComplex) {
      const re = formatNumber(evaluated.re, { mode: numberFormat, maxDecimals: precision });
      const im = formatNumber(Math.abs(evaluated.im), { mode: numberFormat, maxDecimals: precision });
      const sign = evaluated.im >= 0 ? '+' : '-';
      return {
        success: true,
        result: `${re} ${sign} ${im}i`,
        numericValue: evaluated.re,
      };
    }

    // Handle matrices/arrays
    if (Array.isArray(evaluated) || (evaluated && evaluated.isMatrix)) {
      const arr = evaluated.toArray ? evaluated.toArray() : evaluated;
      return {
        success: true,
        result: JSON.stringify(arr),
      };
    }

    const num = Number(evaluated);
    if (isNaN(num)) {
      return { success: false, error: 'Invalid calculation result (NaN)' };
    }

    const formatted = formatNumber(num, { mode: numberFormat, maxDecimals: precision });
    return {
      success: true,
      result: formatted,
      numericValue: num,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid mathematical syntax';
    // Provide clean, friendly explanations for common errors
    if (message.includes('Division by zero') || message.includes('Cannot divide by zero')) {
      return { success: false, error: 'Cannot divide by zero' };
    }
    if (message.includes('Parenthesis') || message.includes('Unclosed')) {
      return { success: false, error: 'Mismatched parentheses' };
    }
    if (message.includes('Unexpected type') || message.includes('Undefined symbol')) {
      return { success: false, error: 'Undefined variable or symbol' };
    }
    return { success: false, error: message };
  }
}

/**
 * High-precision operations using Decimal.js for financial accuracy.
 */
export const highPrecisionMath = {
  add: (a: number | string, b: number | string) => new Decimal(a).plus(b).toString(),
  sub: (a: number | string, b: number | string) => new Decimal(a).minus(b).toString(),
  mul: (a: number | string, b: number | string) => new Decimal(a).times(b).toString(),
  div: (a: number | string, b: number | string) => {
    const d = new Decimal(b);
    if (d.isZero()) throw new Error('Cannot divide by zero');
    return new Decimal(a).dividedBy(d).toString();
  },
  pow: (base: number | string, exp: number | string) => new Decimal(base).pow(exp).toString(),
};

/**
 * Prime test and prime factorization.
 */
export function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function getPrimeFactors(n: number): number[] {
  const factors: number[] = [];
  let d = 2;
  let num = Math.abs(Math.floor(n));
  while (num > 1) {
    while (num % d === 0) {
      factors.push(d);
      num /= d;
    }
    d++;
    if (d * d > num) {
      if (num > 1) factors.push(num);
      break;
    }
  }
  return factors;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

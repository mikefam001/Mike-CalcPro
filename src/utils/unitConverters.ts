import Decimal from 'decimal.js';

// Configure Decimal.js for high precision (40 decimal places)
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export class UnitConversionError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'CONVERSION_ERROR') {
    super(message);
    this.name = 'UnitConversionError';
    this.code = code;
    Object.setPrototypeOf(this, UnitConversionError.prototype);
  }
}

export type LengthUnit =
  | 'm'
  | 'km'
  | 'cm'
  | 'mm'
  | 'um'
  | 'nm'
  | 'in'
  | 'ft'
  | 'yd'
  | 'mi'
  | 'nmi'
  | 'ly';

export type MassUnit =
  | 'kg'
  | 'g'
  | 'mg'
  | 'ug'
  | 't'
  | 'lb'
  | 'oz'
  | 'st'
  | 'ct'
  | 'ton_us'
  | 'ton_uk';

export type TemperatureUnit = 'c' | 'f' | 'k' | 'r';

export type UnitCategoryType = 'length' | 'mass' | 'temperature';

export interface UnitMetadata {
  id: string;
  name: string;
  symbol: string;
  category: UnitCategoryType;
}

/**
 * Exact conversion factors to SI Base units using Decimal.js representation.
 */

// BASE UNIT: Meter (m)
export const LENGTH_BASE_UNIT: LengthUnit = 'm';
export const LENGTH_CONVERSION_FACTORS: Record<LengthUnit, Decimal> = {
  m: new Decimal(1),
  km: new Decimal(1000),
  cm: new Decimal('0.01'),
  mm: new Decimal('0.001'),
  um: new Decimal('0.000001'),
  nm: new Decimal('0.000000001'),
  in: new Decimal('0.0254'), // exact international definition
  ft: new Decimal('0.3048'), // 12 * 0.0254 exact
  yd: new Decimal('0.9144'), // 3 * 0.3048 exact
  mi: new Decimal('1609.344'), // 1760 * 0.9144 exact
  nmi: new Decimal(1852), // exact international nautical mile
  ly: new Decimal('9460730472580800'), // light-year in meters (IAU exact)
};

// BASE UNIT: Kilogram (kg)
export const MASS_BASE_UNIT: MassUnit = 'kg';
export const MASS_CONVERSION_FACTORS: Record<MassUnit, Decimal> = {
  kg: new Decimal(1),
  g: new Decimal('0.001'),
  mg: new Decimal('0.000001'),
  ug: new Decimal('0.000000001'),
  t: new Decimal(1000), // metric ton
  lb: new Decimal('0.45359237'), // exact international avoirdupois pound
  oz: new Decimal('0.028349523125'), // 0.45359237 / 16 exact
  st: new Decimal('6.35029318'), // 14 lb exact
  ct: new Decimal('0.0002'), // carat (200 mg) exact
  ton_us: new Decimal('907.18474'), // 2000 lb exact
  ton_uk: new Decimal('1016.0469088'), // 2240 lb exact
};

// BASE UNIT: Kelvin (K)
export const TEMPERATURE_BASE_UNIT: TemperatureUnit = 'k';

export const LENGTH_METADATA: Record<LengthUnit, UnitMetadata> = {
  m: { id: 'm', name: 'Meter', symbol: 'm', category: 'length' },
  km: { id: 'km', name: 'Kilometer', symbol: 'km', category: 'length' },
  cm: { id: 'cm', name: 'Centimeter', symbol: 'cm', category: 'length' },
  mm: { id: 'mm', name: 'Millimeter', symbol: 'mm', category: 'length' },
  um: { id: 'um', name: 'Micrometer', symbol: 'µm', category: 'length' },
  nm: { id: 'nm', name: 'Nanometer', symbol: 'nm', category: 'length' },
  in: { id: 'in', name: 'Inch', symbol: 'in', category: 'length' },
  ft: { id: 'ft', name: 'Foot', symbol: 'ft', category: 'length' },
  yd: { id: 'yd', name: 'Yard', symbol: 'yd', category: 'length' },
  mi: { id: 'mi', name: 'Mile', symbol: 'mi', category: 'length' },
  nmi: { id: 'nmi', name: 'Nautical Mile', symbol: 'nmi', category: 'length' },
  ly: { id: 'ly', name: 'Light Year', symbol: 'ly', category: 'length' },
};

export const MASS_METADATA: Record<MassUnit, UnitMetadata> = {
  kg: { id: 'kg', name: 'Kilogram', symbol: 'kg', category: 'mass' },
  g: { id: 'g', name: 'Gram', symbol: 'g', category: 'mass' },
  mg: { id: 'mg', name: 'Milligram', symbol: 'mg', category: 'mass' },
  ug: { id: 'ug', name: 'Microgram', symbol: 'µg', category: 'mass' },
  t: { id: 't', name: 'Metric Ton', symbol: 't', category: 'mass' },
  lb: { id: 'lb', name: 'Pound', symbol: 'lb', category: 'mass' },
  oz: { id: 'oz', name: 'Ounce', symbol: 'oz', category: 'mass' },
  st: { id: 'st', name: 'Stone', symbol: 'st', category: 'mass' },
  ct: { id: 'ct', name: 'Carat', symbol: 'ct', category: 'mass' },
  ton_us: { id: 'ton_us', name: 'Short Ton (US)', symbol: 'ton (US)', category: 'mass' },
  ton_uk: { id: 'ton_uk', name: 'Long Ton (UK)', symbol: 'ton (UK)', category: 'mass' },
};

export const TEMPERATURE_METADATA: Record<TemperatureUnit, UnitMetadata> = {
  c: { id: 'c', name: 'Celsius', symbol: '°C', category: 'temperature' },
  f: { id: 'f', name: 'Fahrenheit', symbol: '°F', category: 'temperature' },
  k: { id: 'k', name: 'Kelvin', symbol: 'K', category: 'temperature' },
  r: { id: 'r', name: 'Rankine', symbol: '°R', category: 'temperature' },
};

/**
 * Validates and converts numeric input (number, string, or Decimal) into a safe Decimal.
 */
function validateNumericInput(val: unknown, paramName: string = 'value'): Decimal {
  if (val === null || val === undefined) {
    throw new UnitConversionError(`Input ${paramName} cannot be null or undefined.`, 'INVALID_INPUT');
  }

  if (typeof val === 'number') {
    if (isNaN(val)) {
      throw new UnitConversionError(`Input ${paramName} cannot be NaN.`, 'NAN_VALUE');
    }
    if (!isFinite(val)) {
      throw new UnitConversionError(`Input ${paramName} cannot be Infinity or -Infinity.`, 'INFINITE_VALUE');
    }
    return new Decimal(val);
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '') {
      throw new UnitConversionError(`Input ${paramName} string cannot be empty.`, 'EMPTY_STRING');
    }
    try {
      const dec = new Decimal(trimmed);
      if (dec.isNaN()) {
        throw new UnitConversionError(`Input ${paramName} string "${val}" is not a valid number.`, 'INVALID_NUMBER_STRING');
      }
      return dec;
    } catch {
      throw new UnitConversionError(`Input ${paramName} string "${val}" could not be parsed as a number.`, 'PARSE_ERROR');
    }
  }

  if (val instanceof Decimal) {
    if (val.isNaN()) {
      throw new UnitConversionError(`Input ${paramName} Decimal is NaN.`, 'NAN_VALUE');
    }
    return val;
  }

  throw new UnitConversionError(
    `Invalid type for ${paramName}: expected number, numeric string, or Decimal, received ${typeof val}.`,
    'TYPE_ERROR'
  );
}

/**
 * High-precision length conversion.
 * Base SI unit: Meter (m)
 *
 * @param value The numerical quantity to convert (number, string, or Decimal)
 * @param from Source length unit
 * @param to Target length unit
 * @returns Result as Decimal instance
 */
export function convertLength(
  value: number | string | Decimal,
  from: LengthUnit | string,
  to: LengthUnit | string
): Decimal {
  const decValue = validateNumericInput(value, 'value');
  const fromKey = from.toLowerCase() as LengthUnit;
  const toKey = to.toLowerCase() as LengthUnit;

  const fromFactor = LENGTH_CONVERSION_FACTORS[fromKey];
  if (!fromFactor) {
    throw new UnitConversionError(
      `Unsupported source length unit "${from}". Supported: ${Object.keys(LENGTH_CONVERSION_FACTORS).join(', ')}`,
      'UNSUPPORTED_UNIT'
    );
  }

  const toFactor = LENGTH_CONVERSION_FACTORS[toKey];
  if (!toFactor) {
    throw new UnitConversionError(
      `Unsupported target length unit "${to}". Supported: ${Object.keys(LENGTH_CONVERSION_FACTORS).join(', ')}`,
      'UNSUPPORTED_UNIT'
    );
  }

  if (fromKey === toKey) {
    return decValue;
  }

  // Convert: value * fromFactor / toFactor
  const inMeters = decValue.times(fromFactor);
  return inMeters.dividedBy(toFactor);
}

/**
 * High-precision mass / weight conversion.
 * Base SI unit: Kilogram (kg)
 *
 * @param value The numerical quantity to convert (number, string, or Decimal)
 * @param from Source mass unit
 * @param to Target mass unit
 * @returns Result as Decimal instance
 */
export function convertMass(
  value: number | string | Decimal,
  from: MassUnit | string,
  to: MassUnit | string
): Decimal {
  const decValue = validateNumericInput(value, 'value');
  const fromKey = from.toLowerCase() as MassUnit;
  const toKey = to.toLowerCase() as MassUnit;

  const fromFactor = MASS_CONVERSION_FACTORS[fromKey];
  if (!fromFactor) {
    throw new UnitConversionError(
      `Unsupported source mass unit "${from}". Supported: ${Object.keys(MASS_CONVERSION_FACTORS).join(', ')}`,
      'UNSUPPORTED_UNIT'
    );
  }

  const toFactor = MASS_CONVERSION_FACTORS[toKey];
  if (!toFactor) {
    throw new UnitConversionError(
      `Unsupported target mass unit "${to}". Supported: ${Object.keys(MASS_CONVERSION_FACTORS).join(', ')}`,
      'UNSUPPORTED_UNIT'
    );
  }

  if (fromKey === toKey) {
    return decValue;
  }

  // Convert: value * fromFactor / toFactor
  const inKilograms = decValue.times(fromFactor);
  return inKilograms.dividedBy(toFactor);
}

/**
 * High-precision temperature conversion with physical absolute zero validation.
 * Base SI unit: Kelvin (K)
 *
 * Relationships:
 * - K = C + 273.15
 * - C = (F - 32) * 5/9
 * - R = K * 1.8 = F + 459.67
 *
 * @param value Temperature value (number, string, or Decimal)
 * @param from Source temperature unit ('c', 'f', 'k', 'r')
 * @param to Target temperature unit ('c', 'f', 'k', 'r')
 * @returns Result as Decimal instance
 */
export function convertTemperature(
  value: number | string | Decimal,
  from: TemperatureUnit | string,
  to: TemperatureUnit | string
): Decimal {
  const decValue = validateNumericInput(value, 'value');
  const fromKey = from.toLowerCase() as TemperatureUnit;
  const toKey = to.toLowerCase() as TemperatureUnit;

  const validUnits: TemperatureUnit[] = ['c', 'f', 'k', 'r'];
  if (!validUnits.includes(fromKey)) {
    throw new UnitConversionError(
      `Unsupported source temperature unit "${from}". Supported: ${validUnits.join(', ')}`,
      'UNSUPPORTED_UNIT'
    );
  }
  if (!validUnits.includes(toKey)) {
    throw new UnitConversionError(
      `Unsupported target temperature unit "${to}". Supported: ${validUnits.join(', ')}`,
      'UNSUPPORTED_UNIT'
    );
  }

  if (fromKey === toKey) {
    return decValue;
  }

  const C_TO_K_OFFSET = new Decimal('273.15');
  const FIVE_NINTHS = new Decimal(5).dividedBy(9);
  const NINE_FIFTHS = new Decimal(9).dividedBy(5);
  const F_OFFSET = new Decimal(32);

  // Step 1: Convert source temperature to Base Kelvin (K)
  let inKelvin: Decimal;
  switch (fromKey) {
    case 'k':
      inKelvin = decValue;
      break;
    case 'c':
      inKelvin = decValue.plus(C_TO_K_OFFSET);
      break;
    case 'f':
      // K = (F - 32) * 5/9 + 273.15
      inKelvin = decValue.minus(F_OFFSET).times(FIVE_NINTHS).plus(C_TO_K_OFFSET);
      break;
    case 'r':
      // K = R * 5/9
      inKelvin = decValue.times(FIVE_NINTHS);
      break;
    default:
      throw new UnitConversionError(`Unhandled temperature unit "${fromKey}"`, 'UNSUPPORTED_UNIT');
  }

  // Validate physically possible temperatures (>= Absolute Zero, 0 K)
  // Allow an epsilon for tiny numerical float boundaries
  if (inKelvin.lessThan(new Decimal('-0.000000000001'))) {
    throw new UnitConversionError(
      `Temperature ${decValue.toString()} ${fromKey.toUpperCase()} is below absolute zero (0 K). Temperatures below absolute zero are physically impossible.`,
      'BELOW_ABSOLUTE_ZERO'
    );
  }

  // Clamp near-zero negative to exact 0
  if (inKelvin.isNegative()) {
    inKelvin = new Decimal(0);
  }

  // Step 2: Convert from Kelvin to Target Unit
  switch (toKey) {
    case 'k':
      return inKelvin;
    case 'c':
      return inKelvin.minus(C_TO_K_OFFSET);
    case 'f':
      // F = (K - 273.15) * 9/5 + 32
      return inKelvin.minus(C_TO_K_OFFSET).times(NINE_FIFTHS).plus(F_OFFSET);
    case 'r':
      // R = K * 9/5
      return inKelvin.times(NINE_FIFTHS);
    default:
      throw new UnitConversionError(`Unhandled temperature unit "${toKey}"`, 'UNSUPPORTED_UNIT');
  }
}

/**
 * Universal multi-category conversion dispatcher.
 *
 * @param category 'length' | 'mass' | 'temperature'
 * @param value Number, string, or Decimal
 * @param from Source unit string
 * @param to Target unit string
 * @returns Result as Decimal
 */
export function convertUnit(
  category: UnitCategoryType,
  value: number | string | Decimal,
  from: string,
  to: string
): Decimal {
  switch (category) {
    case 'length':
      return convertLength(value, from as LengthUnit, to as LengthUnit);
    case 'mass':
      return convertMass(value, from as MassUnit, to as MassUnit);
    case 'temperature':
      return convertTemperature(value, from as TemperatureUnit, to as TemperatureUnit);
    default:
      throw new UnitConversionError(
        `Unknown category "${category}". Supported: length, mass, temperature.`,
        'INVALID_CATEGORY'
      );
  }
}

/**
 * Helper to format converted Decimal to a human-readable clean string with controlled precision.
 */
export function formatConvertedValue(
  value: Decimal,
  options?: {
    maxDecimals?: number;
    useGrouping?: boolean;
    scientific?: boolean;
  }
): string {
  const { maxDecimals = 10, useGrouping = true, scientific = false } = options || {};

  if (scientific) {
    return value.toExponential(6);
  }

  const rounded = value.toDecimalPlaces(maxDecimals);

  if (useGrouping) {
    const parts = rounded.toString().split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  }

  return rounded.toString();
}

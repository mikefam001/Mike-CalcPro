export type CalculatorCategory =
  | 'basic'
  | 'scientific'
  | 'advanced'
  | 'statistics'
  | 'financial'
  | 'engineering'
  | 'datetime'
  | 'everyday';

export interface CalculatorMeta {
  id: string;
  name: string;
  shortName: string;
  category: CalculatorCategory;
  description: string;
  keywords: string[];
  icon: string;
  isPopular?: boolean;
  badge?: string;
}

export interface CalculationHistoryItem {
  id: string;
  calculatorId: string;
  calculatorName: string;
  timestamp: number;
  expression: string;
  result: string;
  details?: Record<string, string | number>;
}

export type AngleMode = 'deg' | 'rad' | 'grad';

export type NumberFormatMode = 'standard' | 'scientific' | 'engineering';

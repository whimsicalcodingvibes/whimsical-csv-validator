// Configuration types
export interface Config {
  delimiter: string;
  hasHeader: boolean;
  failFast: boolean;
}

// CSV data types
export interface CSVData {
  headers: string[];
  rows: string[][];
  rowCount: number;
}

// Rule types
export enum RuleType {
  REQUIRED = "required",
  NOT_EMPTY = "notEmpty",
  REGEX = "regex",
  MIN_LENGTH = "minLength",
  MAX_LENGTH = "maxLength",
  MIN = "min",
  MAX = "max",
  IN = "in",
  NOT_IN = "notIn",
  DATE_FORMAT = "dateFormat",
  EMAIL = "email",
  CUSTOM = "custom",
}

export interface ValidationRule {
  column: string | number;
  type: RuleType | string; // Allow string to support custom rule types
  value?: any;
  message?: string;
}

export interface ValidationRules {
  rules: ValidationRule[];
  settings?: {
    strictHeaders?: boolean;
    requiredColumns?: string[];
  };
}

// Error and report types
export interface ValidationError {
  rowNumber: number;
  column: string | number;
  value: string;
  rule: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  errors: ValidationError[];
  timestamp: string;
  inputFile: string;
  rulesFile: string;
}

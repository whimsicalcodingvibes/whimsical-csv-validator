import {
  CSVData,
  ValidationRules,
  ValidationError,
  Config,
  RuleType,
} from "./types";
import { validators } from "./validators";

/**
 * Validates CSV data against specified rules.
 * @param csvData - The CSV data to validate.
 * @param rules - The validation rules to apply.
 * @param config - Configuration options for validation.
 * @returns An array of validation errors.
 */
export function validateCSV(
  csvData: CSVData,
  rules: ValidationRules,
  config: Config
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if headers are required by rules but missing in CSV
  if (rules.settings?.strictHeaders && csvData.headers.length === 0) {
    throw new Error(
      "CSV is missing headers, but rules require strict header validation"
    );
  }

  // Validate required columns exist in headers
  if (rules.settings?.requiredColumns && csvData.headers.length > 0) {
    for (const column of rules.settings.requiredColumns) {
      if (!csvData.headers.includes(column)) {
        errors.push({
          rowNumber: 0,
          column,
          value: "",
          rule: "requiredColumn",
          message: `Required column "${column}" is missing from CSV headers`,
        });
      }
    }

    // Stop if required columns are missing and failFast is enabled
    if (errors.length > 0 && config.failFast) {
      return errors;
    }
  }

  // Process each row
  for (let rowIndex = 0; rowIndex < csvData.rows.length; rowIndex++) {
    const row = csvData.rows[rowIndex];
    const rowNumber = rowIndex + (config.hasHeader ? 2 : 1); // +2 if has header (1-based + header row)

    // Apply each rule
    for (const rule of rules.rules) {
      let columnIndex: number;
      let columnName: string;

      // Determine column index and name
      if (typeof rule.column === "number") {
        columnIndex = rule.column;
        columnName = csvData.headers[columnIndex] || `Column ${columnIndex}`;
      } else {
        columnName = rule.column;
        columnIndex = csvData.headers.indexOf(columnName);

        // Skip rules for non-existent columns unless strictHeaders is enabled
        if (columnIndex === -1) {
          if (rules.settings?.strictHeaders) {
            errors.push({
              rowNumber,
              column: columnName,
              value: "",
              rule: rule.type,
              message: `Column "${columnName}" specified in rule does not exist in CSV`,
            });

            if (config.failFast) {
              return errors;
            }
          }
          continue;
        }
      }

      const cellValue = row[columnIndex] || "";

      // Validate cell against rule
      // Safely check if validator exists for this rule type
      const validator = validators[rule.type as keyof typeof validators];
      if (!validator) {
        errors.push({
          rowNumber,
          column: columnName,
          value: cellValue,
          rule: rule.type,
          message: `Unknown rule type: ${rule.type}`,
        });
        continue;
      }

      // Use type assertion to call the validator with the rule value
      // This is needed because TypeScript can't infer the correct type for all possible validators
      const isValid = validator(cellValue, rule.value as any);
      if (!isValid) {
        errors.push({
          rowNumber,
          column: columnName,
          value: cellValue,
          rule: rule.type,
          message:
            rule.message ||
            getDefaultErrorMessage(rule.type, rule.value, columnName),
        });

        if (config.failFast) {
          return errors;
        }
      }
    }
  }

  return errors;
}
/**
 * Filters out invalid rows from the CSV data based on validation errors.
 * @param csvData - The original CSV data.
 * @param errors - The validation errors.
 * @returns A new CSVData object with only valid rows.
 */
export function getValidRows(
  csvData: CSVData,
  errors: ValidationError[]
): CSVData {

  const invalidRowNumbers = new Set<number>();
  errors.forEach((error) => {

    if (error.rowNumber > 0) {
      invalidRowNumbers.add(error.rowNumber);
    }
  });

  // Filter out invalid rows
  const validRows = csvData.rows.filter((_, index) => {
    // Convert 0-based index to 1-based row number (+2 if has header)
    const rowNumber = index + (csvData.headers.length > 0 ? 2 : 1);
    return !invalidRowNumbers.has(rowNumber);
  });

  return {
    headers: csvData.headers,
    rows: validRows,
    rowCount: validRows.length,
  };
}

/**
 * Generates a default error message based on the rule type and value.
 * @param ruleType - The type of validation rule.
 * @param ruleValue - The value associated with the validation rule.
 * @param column - The name of the column being validated.
 * @returns A default error message.
 */
function getDefaultErrorMessage(
  ruleType: string,
  ruleValue: any,
  column: string
): string {
  switch (ruleType) {
    case RuleType.REQUIRED:
      return `Column "${column}" is required`;
    case RuleType.NOT_EMPTY:
      return `Column "${column}" cannot be empty`;
    case RuleType.REGEX:
      return `Value in column "${column}" does not match pattern: ${ruleValue}`;
    case RuleType.MIN_LENGTH:
      return `Value in column "${column}" must be at least ${ruleValue} characters long`;
    case RuleType.MAX_LENGTH:
      return `Value in column "${column}" must be at most ${ruleValue} characters long`;
    case RuleType.MIN:
      return `Value in column "${column}" must be at least ${ruleValue}`;
    case RuleType.MAX:
      return `Value in column "${column}" must be at most ${ruleValue}`;
    case RuleType.IN:
      return `Value in column "${column}" must be one of: ${ruleValue.join(
        ", "
      )}`;
    case RuleType.NOT_IN:
      return `Value in column "${column}" must not be one of: ${ruleValue.join(
        ", "
      )}`;
    case RuleType.DATE_FORMAT:
      return `Value in column "${column}" must be a date in format: ${ruleValue}`;
    case RuleType.EMAIL:
      return `Value in column "${column}" must be a valid email address`;
    default:
      return `Validation failed for column "${column}"`;
  }
}

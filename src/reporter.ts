import { ValidationError, ValidationResult, CSVData } from "./types";
import { relative } from "path";

/**
 * Generates a validation report based on the validation results.
 * @param errors - An array of validation errors.
 * @param csvData - The CSV data that was validated.
 * @param inputFile - The path to the input CSV file.
 * @param rulesFile - The path to the JSON rules file.
 * @returns A structured validation report.
 */
export function generateReport(
  errors: ValidationError[],
  csvData: CSVData,
  inputFile?: string,
  rulesFile?: string
): ValidationResult {
  const result: ValidationResult = {
    valid: errors.length === 0,
    totalRows: csvData.rowCount,
    validRows: csvData.rowCount - countUniqueInvalidRows(errors),
    errors,
    timestamp: new Date().toISOString(),
    inputFile: inputFile ? relative(process.cwd(), inputFile) : "unknown",
    rulesFile: rulesFile ? relative(process.cwd(), rulesFile) : "unknown",
  };

  return result;
}

function countUniqueInvalidRows(errors: ValidationError[]): number {
  const uniqueRowNumbers = new Set<number>();
  errors.forEach((error) => uniqueRowNumbers.add(error.rowNumber));
  return uniqueRowNumbers.size;
}

export { ValidationResult };

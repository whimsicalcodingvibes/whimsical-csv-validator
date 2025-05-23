#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync, writeFileSync } from "fs";
import chalk from "chalk";
import { validateCSV, getValidRows } from "./validator";
import { parseCSV } from "./parser";
import { parseRules } from "./rules";
import { ValidationResult, generateReport } from "./reporter";
import { Config } from "./types";
import { formatCSV } from "./formatter";

const program = new Command();

program
  .name("csv-validator")
  .description("Validate CSV data against user-defined JSON rules")
  .version("1.0.0")
  .requiredOption("-i, --input <path>", "Path to input CSV file")
  .requiredOption("-r, --rules <path>", "Path to JSON validation rules")
  .option(
    "-o, --output <path>",
    "Path to output validation report in JSON format"
  )
  .option(
    "-v, --valid-output <path>",
    "Path to export valid rows to a new CSV file"
  )
  .option("-s, --summary", "Print a summary report to console", false)
  .option("-f, --fail-fast", "Stop validation on first error", false)
  .option("-d, --delimiter <char>", "CSV delimiter character", ",")
  .option("-h, --header", "CSV contains header row", true)
  .parse(process.argv);

const options = program.opts();

try {
  // Read input files
  const csvContent = readFileSync(options.input, "utf8");
  const rulesContent = readFileSync(options.rules, "utf8");

  // Parse files
  const config: Config = {
    delimiter: options.delimiter,
    hasHeader: options.header,
    failFast: options.failFast,
  };

  const csvData = parseCSV(csvContent, config);
  const rules = parseRules(rulesContent);

  // Validate CSV against rules
  const validationErrors = validateCSV(csvData, rules, config);

  // Generate and output report
  const report = generateReport(
    validationErrors,
    csvData,
    options.input,
    options.rules
  );

  if (options.output) {
    writeFileSync(options.output, JSON.stringify(report, null, 2));
    console.log(chalk.green(`Validation report saved to ${options.output}`));
  }

  // Export valid rows if requested
  if (options.validOutput) {
    const validRows = getValidRows(csvData, validationErrors);
    const validCsv = formatCSV(validRows, config.delimiter);
    writeFileSync(options.validOutput, validCsv);
    console.log(chalk.green(`Valid rows exported to ${options.validOutput}`));
  }

  if (options.summary || !options.output) {
    printSummary(report);
  }

  // Exit with error code if validation failed
  if (!report.valid) {
    process.exit(1);
  }
} catch (error: unknown) {
  // Properly type the error for TypeScript
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(chalk.red("Error:"), errorMessage);
  process.exit(1);
}

function printSummary(report: ValidationResult): void {
  console.log("\n" + chalk.bold("CSV Validation Summary"));
  console.log("----------------------");
  console.log(
    `Status: ${report.valid ? chalk.green("VALID") : chalk.red("INVALID")}`
  );
  console.log(`Rows processed: ${report.totalRows}`);
  console.log(`Valid rows: ${report.validRows}`);
  console.log(
    `Invalid rows: ${
      report.errors.length > 0 ? report.totalRows - report.validRows : 0
    }`
  );

  if (report.errors.length > 0) {
    console.log("\n" + chalk.bold("Validation Errors:"));
    report.errors.forEach((error, idx) => {
      console.log(`\n${chalk.red(`Error #${idx + 1}:`)}`);
      console.log(`Row: ${error.rowNumber}`);
      console.log(`Column: ${error.column}`);
      console.log(`Value: "${error.value}"`);
      console.log(`Rule: ${error.rule}`);
      console.log(`Message: ${error.message}`);
    });
  }
}

#!/usr/bin/env node

import { Command } from "commander";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "fs";
import { join, basename, dirname } from "path";
import chalk from "chalk";
import { validateCSV, getValidRows } from "./validator";
import { parseCSV } from "./parser";
import { parseRules } from "./rules";
import { generateReport } from "./reporter";
import { formatCSV } from "./formatter";
import { Config } from "./types";

const program = new Command();

program
  .name("csv-validator-batch")
  .description(
    "Batch validate multiple CSV files against JSON validation rules"
  )
  .version("1.0.0")
  .requiredOption(
    "-i, --input <directory>",
    "Directory containing input CSV files"
  )
  .requiredOption("-r, --rules <path>", "Path to JSON validation rules file")
  .requiredOption("-o, --output <directory>", "Directory for output files")
  .option(
    "-p, --pattern <pattern>",
    "File pattern to match (e.g. *.csv)",
    "*.csv"
  )
  .option("-s, --summary", "Print a summary report to console", false)
  .option("-f, --fail-fast", "Stop validation on first error", false)
  .option("-d, --delimiter <char>", "CSV delimiter character", ",")
  .option("-h, --header", "CSV contains header row", true)
  .parse(process.argv);

const options = program.opts();

// Create output directory if it doesn't exist
if (!existsSync(options.output)) {
  try {
    mkdirSync(options.output, { recursive: true });
    console.log(chalk.green(`Created output directory: ${options.output}`));
  } catch (error) {
    console.error(
      chalk.red(`Failed to create output directory: ${options.output}`)
    );
    process.exit(1);
  }
}

// Read rules file
let rules;
try {
  const rulesContent = readFileSync(options.rules, "utf8");
  rules = parseRules(rulesContent);
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(chalk.red(`Error reading rules file: ${errorMessage}`));
  process.exit(1);
}

// Get all CSV files in input directory
const filePattern = options.pattern.replace("*", "");
const files = readdirSync(options.input).filter((file) =>
  file.endsWith(filePattern)
);

if (files.length === 0) {
  console.error(chalk.yellow(`No matching files found in ${options.input}`));
  process.exit(0);
}

console.log(chalk.blue(`Found ${files.length} files to process.`));

// Process each file
let successCount = 0;
let failCount = 0;

for (const file of files) {
  const inputPath = join(options.input, file);
  const fileBaseName = basename(file, filePattern);
  const reportPath = join(options.output, `${fileBaseName}-report.json`);
  const validDataPath = join(options.output, `${fileBaseName}-valid.csv`);

  console.log(chalk.blue(`\nProcessing: ${file}`));

  try {
    // Read CSV file
    const csvContent = readFileSync(inputPath, "utf8");

    // Parse and validate
    const config: Config = {
      delimiter: options.delimiter,
      hasHeader: options.header,
      failFast: options.failFast,
    };

    const csvData = parseCSV(csvContent, config);
    const validationErrors = validateCSV(csvData, rules, config);

    // Generate report
    const report = generateReport(
      validationErrors,
      csvData,
      inputPath,
      options.rules
    );

    // Save report
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`  Validation report saved to ${reportPath}`));

    // Save valid data
    const validRows = getValidRows(csvData, validationErrors);
    const validCsv = formatCSV(validRows, config.delimiter);
    writeFileSync(validDataPath, validCsv);
    console.log(chalk.green(`  Valid rows exported to ${validDataPath}`));

    // Print summary if requested
    if (options.summary) {
      console.log(chalk.bold(`\n  Summary for ${file}:`));
      console.log(
        `  Status: ${
          report.valid ? chalk.green("VALID") : chalk.red("INVALID")
        }`
      );
      console.log(`  Rows processed: ${report.totalRows}`);
      console.log(`  Valid rows: ${report.validRows}`);
      console.log(
        `  Invalid rows: ${
          report.errors.length > 0 ? report.totalRows - report.validRows : 0
        }`
      );
    }

    if (report.valid) {
      successCount++;
    } else {
      failCount++;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`  Error processing ${file}: ${errorMessage}`));
    failCount++;
  }
}

console.log(chalk.blue(`\nBatch processing complete.`));
console.log(`Files processed: ${files.length}`);
console.log(`Success: ${chalk.green(successCount)}`);
console.log(`Failed: ${chalk.red(failCount)}`);

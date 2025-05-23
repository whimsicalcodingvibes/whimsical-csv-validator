import { CSVData, Config } from "./types";
import { parse } from "csv-parse/sync";

/**
 * Parses CSV content into structured data.
 * @param content - The CSV content to parse.
 * @param config - Configuration options for parsing.
 * @returns An object containing headers and rows of the CSV data.
 */
export function parseCSV(content: string, config: Config): CSVData {
  try {
    const options = {
      delimiter: config.delimiter,
      columns: config.hasHeader,
      skip_empty_lines: true,
      trim: true,
    };

    const records = parse(content, options);

    if (config.hasHeader) {
      // If CSV has headers, parse returns an array of objects
      const headers = Object.keys(records[0] || {});
      const rows: string[][] = records.map((record: Record<string, string>) =>
        headers.map((header: string) => record[header])
      );

      return {
        headers,
        rows,
        rowCount: records.length,
      };
    } else {
      // If CSV has no headers, parse returns an array of arrays
      return {
        headers: [],
        rows: records,
        rowCount: records.length,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse CSV: ${errorMessage}`);
  }
}

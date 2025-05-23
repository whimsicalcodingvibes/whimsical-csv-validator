import { CSVData } from "./types";

/**
 * Formats CSV data into a string.
 * @param csvData - The CSV data to format.
 * @param delimiter - The delimiter to use (default is comma).
 * @returns The formatted CSV string.
 */
export function formatCSV(csvData: CSVData, delimiter: string = ","): string {
  const lines: string[] = [];

  // Add headers if they exist
  if (csvData.headers.length > 0) {
    lines.push(
      csvData.headers
        .map((header) => formatCSVField(header, delimiter))
        .join(delimiter)
    );
  }

  // Add data rows
  csvData.rows.forEach((row) => {
    lines.push(
      row.map((field) => formatCSVField(field, delimiter)).join(delimiter)
    );
  });

  return lines.join("\n");
}

function formatCSVField(value: string, delimiter: string): string {
  // Determine if the field needs to be quoted
  const needsQuoting =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r");

  if (!needsQuoting) {
    return value;
  }

  // Double any existing quotes and wrap in quotes
  return `"${value.replace(/"/g, '""')}"`;
}

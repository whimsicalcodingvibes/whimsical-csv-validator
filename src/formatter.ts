import { CSVData } from "./types";

/**
 * Formats CSV data into a string.
 * @param csvData - The CSV data to format.
 * @param delimiter - The delimiter to use (default is comma).
 * @returns The formatted CSV string.
 */
export function formatCSV(csvData: CSVData, delimiter: string = ","): string {
  const lines: string[] = [];
  if (csvData.headers.length > 0) {
    lines.push(
      csvData.headers
        .map((header) => formatCSVField(header, delimiter))
        .join(delimiter)
    );
  }

  csvData.rows.forEach((row) => {
    lines.push(
      row.map((field) => formatCSVField(field, delimiter)).join(delimiter)
    );
  });

  return lines.join("\n");
}

function formatCSVField(value: string, delimiter: string): string {
  const needsQuoting =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r");

  if (!needsQuoting) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}

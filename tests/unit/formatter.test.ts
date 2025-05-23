import { CSVData } from "./../../src/types";
describe("Formatter", () => {
  describe("formatCSV", () => {
    it("should format CSV data with headers correctly", () => {
      const csvData: CSVData = {
        headers: ["name", "age", "email"],
        rows: [
          ["John Doe", "30", "john@example.com"],
          ["Jane Smith", "25", "jane@example.com"],
        ],
        rowCount: 2,
      };

      const result = formatCSV(csvData);
      expect(result).toBe(
        "name,age,email\nJohn Doe,30,john@example.com\nJane Smith,25,jane@example.com"
      );
    });

    it("should format CSV data without headers correctly", () => {
      const csvData: CSVData = {
        headers: [],
        rows: [
          ["John Doe", "30", "john@example.com"],
          ["Jane Smith", "25", "jane@example.com"],
        ],
        rowCount: 2,
      };

      const result = formatCSV(csvData);
      expect(result).toBe(
        "John Doe,30,john@example.com\nJane Smith,25,jane@example.com"
      );
    });

    it("should handle custom delimiters", () => {
      const csvData: CSVData = {
        headers: ["name", "age", "email"],
        rows: [
          ["John Doe", "30", "john@example.com"],
          ["Jane Smith", "25", "jane@example.com"],
        ],
        rowCount: 2,
      };

      const result = formatCSV(csvData, ";");
      expect(result).toBe(
        "name;age;email\nJohn Doe;30;john@example.com\nJane Smith;25;jane@example.com"
      );
    });
    it("should properly quote fields with delimiters", () => {
      const csvData: CSVData = {
        headers: ["name", "address", "notes"],
        rows: [
          ["John Doe", "123 Main St, Apt 4", "No comments"],
          ["Jane Smith", "456 Oak Ave", "Called on Tuesday, will follow up"],
        ],
        rowCount: 2,
      };

      const result = formatCSV(csvData);
      expect(result).toBe(
        'name,address,notes\nJohn Doe,"123 Main St, Apt 4",No comments\nJane Smith,456 Oak Ave,"Called on Tuesday, will follow up"'
      );
    });

    it("should properly quote fields with double quotes", () => {
      const csvData: CSVData = {
        headers: ["name", "comment"],
        rows: [
          ["John Doe", 'He said "hello"'],
          ["Jane Smith", "Normal comment"],
        ],
        rowCount: 2,
      };

      const result = formatCSV(csvData);
      expect(result).toBe(
        'name,comment\nJohn Doe,"He said ""hello"""\nJane Smith,Normal comment'
      );
    });

    it("should properly quote fields with newlines", () => {
      const csvData: CSVData = {
        headers: ["name", "bio"],
        rows: [
          ["John Doe", "Line 1\nLine 2"],
          ["Jane Smith", "Single line bio"],
        ],
        rowCount: 2,
      };

      const result = formatCSV(csvData);
      expect(result).toBe(
        'name,bio\nJohn Doe,"Line 1\nLine 2"\nJane Smith,Single line bio'
      );
    });
  });
});
function formatCSV(csvData: CSVData, delimiter: string = ","): string {
  const headers =
    csvData.headers.length > 0 ? csvData.headers.join(delimiter) + "\n" : "";
  const rows = csvData.rows
    .map((row) =>
      row
        .map((field) =>
          field.includes(delimiter) ||
          field.includes('"') ||
          field.includes("\n")
            ? `"${field.replace(/"/g, '""')}"`
            : field
        )
        .join(delimiter)
    )
    .join("\n");
  return headers + rows;
}

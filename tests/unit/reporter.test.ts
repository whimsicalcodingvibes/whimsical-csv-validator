import { CSVData, ValidationError } from "../../src/types";
import { generateReport } from "../../src/reporter";

describe("Reporter", () => {
  describe("generateReport", () => {
    it("should generate a valid report for data with no errors", () => {
      const csvData: CSVData = {
        headers: ["name", "age", "email"],
        rows: [
          ["John Doe", "30", "john@example.com"],
          ["Jane Smith", "25", "jane@example.com"],
        ],
        rowCount: 2,
      };

      const errors: ValidationError[] = [];
      const inputFile = "data/input.csv";
      const rulesFile = "data/rules.json";

      const report = generateReport(errors, csvData, inputFile, rulesFile);

      expect(report.valid).toBe(true);
      expect(report.totalRows).toBe(2);
      expect(report.validRows).toBe(2);
      expect(report.errors).toEqual([]);
      expect(report.inputFile).toBeDefined();
      expect(report.rulesFile).toBeDefined();
      expect(report.timestamp).toBeDefined();
    });

    it("should generate a report for data with errors", () => {
      const csvData: CSVData = {
        headers: ["name", "age", "email"],
        rows: [
          ["John Doe", "30", "john@example.com"],
          ["Jane Smith", "25", "invalid-email"],
          ["", "22", "bob@example.com"],
        ],
        rowCount: 3,
      };

      const errors: ValidationError[] = [
        {
          rowNumber: 2,
          column: "email",
          value: "invalid-email",
          rule: "email",
          message: "Invalid email format",
        },
        {
          rowNumber: 3,
          column: "name",
          value: "",
          rule: "required",
          message: "Value is required",
        },
      ];

      const report = generateReport(errors, csvData, "input.csv", "rules.json");

      expect(report.valid).toBe(false);
      expect(report.totalRows).toBe(3);
      expect(report.validRows).toBe(1);
      expect(report.errors).toEqual(errors);
    });

    it("should handle multiple errors in the same row", () => {
      const csvData: CSVData = {
        headers: ["name", "age", "email"],
        rows: [
          ["John Doe", "30", "john@example.com"],
          ["", "invalid", ""],
        ],
        rowCount: 2,
      };

      const errors: ValidationError[] = [
        {
          rowNumber: 2,
          column: "name",
          value: "",
          rule: "required",
          message: "Value is required",
        },
        {
          rowNumber: 2,
          column: "age",
          value: "invalid",
          rule: "number",
          message: "Value must be a number",
        },
        {
          rowNumber: 2,
          column: "email",
          value: "",
          rule: "required",
          message: "Value is required",
        },
      ];

      const report = generateReport(errors, csvData);

      expect(report.valid).toBe(false);
      expect(report.totalRows).toBe(2);
      // Should be 1 since all errors are in the same row
      expect(report.validRows).toBe(1);
      expect(report.errors.length).toBe(3);
    });

    it("should handle undefined input and rules files", () => {
      const csvData: CSVData = {
        headers: ["name"],
        rows: [["John"]],
        rowCount: 1,
      };

      const report = generateReport([], csvData);

      expect(report.inputFile).toBe("unknown");
      expect(report.rulesFile).toBe("unknown");
    });
  });
});

import { readFileSync } from "fs";
import { generateReport } from "../../src/reporter";
import { Config } from "../../src/types";
import { parseRules } from "../../src/rules";
import { getValidRows, validateCSV } from "../../src/validator";
import { formatCSV } from "../../src/formatter";
import { parseCSV } from "../../src/parser";

describe("Integration Tests", () => {
  describe("CSV Validation Workflow", () => {
    it("should validate CSV data against rules and generate report", () => {
      // Sample CSV data
      const csvContent =
        "name,age,email\nJohn Doe,30,john@example.com\nJane,25,jane@invalid";

      // Sample rules
      const rulesContent = JSON.stringify({
        rules: [
          { column: "name", type: "required" },
          { column: "name", type: "minLength", value: 3 },
          { column: "age", type: "min", value: 18 },
          { column: "email", type: "email" },
        ],
      });

      // Config
      const config: Config = {
        delimiter: ",",
        hasHeader: true,
        failFast: false,
      };

      // 1. Parse CSV
      const csvData = parseCSV(csvContent, config);

      // 2. Parse rules
      const rules = parseRules(rulesContent);

      // 3. Validate CSV against rules
      const errors = validateCSV(csvData, rules, config);

      // 4. Generate report
      const report = generateReport(
        errors,
        csvData,
        "test.csv",
        "test-rules.json"
      ); // 5. Get valid rows
      const validData = getValidRows(csvData, errors);

      // 6. Format valid rows
      const formattedValidData = formatCSV(validData);

      // Assertions
      expect(csvData.headers).toEqual(["name", "age", "email"]);
      expect(csvData.rowCount).toBe(2);

      // Validate errors
      expect(errors.length).toBe(1);
      expect(errors[0].column).toBe("email");
      expect(errors[0].value).toBe("jane@invalid");

      // Validate report
      expect(report.valid).toBe(false);
      expect(report.totalRows).toBe(2);
      expect(report.validRows).toBe(1); // Validate valid rows
      expect(validData.rows.length).toBe(1);
      expect(validData.rows[0][0]).toBe("John Doe");

      // Validate formatted valid data
      expect(formattedValidData).toBe(
        "name,age,email\nJohn Doe,30,john@example.com"
      );
    });
  });
});

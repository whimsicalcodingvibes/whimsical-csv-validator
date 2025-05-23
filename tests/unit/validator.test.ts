import { CSVData, ValidationRules, RuleType, Config } from "../../src/types";
import { validateCSV } from "../../src/validator";

describe("Validator", () => {
  describe("validateCSV", () => {
    let config: Config;
    let csvData: CSVData;

    beforeEach(() => {
      config = {
        delimiter: ",",
        hasHeader: true,
        failFast: false,
      };

      csvData = {
        headers: ["name", "age", "email"],
        rows: [
          ["John Doe", "30", "john@example.com"],
          ["Jane Smith", "25", "jane@example.com"],
          ["Bob Johnson", "", "bob@invalid"],
          ["", "22", ""],
        ],
        rowCount: 4,
      };
    });

    it("should validate successfully with no errors when all data is valid", () => {
      const rules: ValidationRules = {
        rules: [
          { column: "name", type: RuleType.REQUIRED },
          { column: "age", type: RuleType.MIN, value: 18 },
          { column: "email", type: RuleType.EMAIL },
        ],
      };

      const partialData: CSVData = {
        ...csvData,
        rows: csvData.rows.slice(0, 2),
        rowCount: 2,
      };

      const errors = validateCSV(partialData, rules, config);
      expect(errors).toEqual([]);
    });

    it("should catch required field errors", () => {
      const rules: ValidationRules = {
        rules: [{ column: "name", type: RuleType.REQUIRED }],
      };

      const errors = validateCSV(csvData, rules, config);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        rowNumber: 5,
        column: "name",
        rule: RuleType.REQUIRED,
      });
    });

    it("should catch email format errors", () => {
      const rules: ValidationRules = {
        rules: [{ column: "email", type: RuleType.EMAIL }],
      };

      const errors = validateCSV(csvData, rules, config);

      expect(errors[0]).toMatchObject({
        rowNumber: 4,
        column: "email",
        value: "bob@invalid",
        rule: RuleType.EMAIL,
      });
    });

    it("should validate numeric constraints", () => {
      const rules: ValidationRules = {
        rules: [{ column: "age", type: RuleType.MIN, value: 25 }],
      };

      const errors = validateCSV(csvData, rules, config);

      // Row 4 has age less than 25
      expect(errors.length).toBeGreaterThan(0);
      const ageError = errors.find(
        (e) => e.column === "age" && e.rowNumber === 4
      );
      expect(ageError).toBeDefined();
    });

    it("should check for missing required columns", () => {
      const rules: ValidationRules = {
        rules: [],
        settings: {
          strictHeaders: true,
          requiredColumns: ["name", "age", "email", "address"],
        },
      };

      const errors = validateCSV(csvData, rules, config);

      expect(errors.length).toBe(1);
      expect(errors[0]).toMatchObject({
        rowNumber: 0,
        column: "address",
        rule: "requiredColumn",
      });
    });

    it("should stop on first error when failFast is enabled", () => {
      const failFastConfig: Config = {
        ...config,
        failFast: true,
      };

      const rules: ValidationRules = {
        rules: [
          { column: "name", type: RuleType.REQUIRED },
          { column: "email", type: RuleType.EMAIL },
        ],
      };

      const errors = validateCSV(csvData, rules, failFastConfig);

      // Should stop after finding the first error
      expect(errors.length).toBe(1);
    });
  });
});

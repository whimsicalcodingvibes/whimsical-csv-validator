import { parseCSV } from "../../src/parser";
import { Config } from "../../src/types";

describe("Parser", () => {
  describe("parseCSV", () => {
    it("should parse CSV with headers correctly", () => {
      const csvContent =
        "name,age,email\nJohn,30,john@example.com\nJane,25,jane@example.com";
      const config: Config = {
        delimiter: ",",
        hasHeader: true,
        failFast: false,
      };

      const result = parseCSV(csvContent, config);

      expect(result.headers).toEqual(["name", "age", "email"]);
      expect(result.rows).toEqual([
        ["John", "30", "john@example.com"],
        ["Jane", "25", "jane@example.com"],
      ]);
      expect(result.rowCount).toBe(2);
    });

    it("should parse CSV without headers correctly", () => {
      const csvContent = "John,30,john@example.com\nJane,25,jane@example.com";
      const config: Config = {
        delimiter: ",",
        hasHeader: false,
        failFast: false,
      };

      const result = parseCSV(csvContent, config);

      expect(result.headers).toEqual([]);
      expect(result.rows).toEqual([
        ["John", "30", "john@example.com"],
        ["Jane", "25", "jane@example.com"],
      ]);
      expect(result.rowCount).toBe(2);
    });

    it("should handle custom delimiters", () => {
      const csvContent =
        "name;age;email\nJohn;30;john@example.com\nJane;25;jane@example.com";
      const config: Config = {
        delimiter: ";",
        hasHeader: true,
        failFast: false,
      };

      const result = parseCSV(csvContent, config);

      expect(result.headers).toEqual(["name", "age", "email"]);
      expect(result.rows).toEqual([
        ["John", "30", "john@example.com"],
        ["Jane", "25", "jane@example.com"],
      ]);
    });

    it("should throw an error for invalid CSV", () => {
      const csvContent = "name,age,email\nJohn,30,john@example.com\nJane,25";
      const config: Config = {
        delimiter: ",",
        hasHeader: true,
        failFast: false,
      };

      expect(() => parseCSV(csvContent, config)).toThrow();
    });
  });
});

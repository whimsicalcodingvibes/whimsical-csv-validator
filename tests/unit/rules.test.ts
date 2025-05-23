import { parseRules } from "../../src/rules";


describe("Rules Parser", () => {
  describe("parseRules", () => {
    it("should parse valid rules JSON correctly", () => {
      const rulesJson = `{
        "rules": [
          {
            "column": "name",
            "type": "required",
            "message": "Name is required"
          },
          {
            "column": "email",
            "type": "email",
            "message": "Invalid email format"
          }
        ],
        "settings": {
          "strictHeaders": true,
          "requiredColumns": ["name", "email"]
        }
      }`;

      const result = parseRules(rulesJson);

      expect(result.rules).toHaveLength(2);
      expect(result.rules[0]).toMatchObject({
        column: "name",
        type: "required",
        message: "Name is required",
      });
      expect(result.settings).toMatchObject({
        strictHeaders: true,
        requiredColumns: ["name", "email"],
      });
    });

    it("should throw error for invalid JSON", () => {
      const invalidJson = `{
        "rules": [
          {
            "column": "name",
            "type": "required"
          },
        ] // Invalid trailing comma
      }`;

      expect(() => parseRules(invalidJson)).toThrow(
        "Failed to parse JSON rules"
      );
    });

    it("should throw error when rules array is missing", () => {
      const missingRulesJson = `{
        "settings": {
          "strictHeaders": true
        }
      }`;

      expect(() => parseRules(missingRulesJson)).toThrow(
        'missing or invalid "rules" array'
      );
    });

    it("should throw error when rules is not an array", () => {
      const invalidRulesJson = `{
        "rules": {
          "column": "name",
          "type": "required"
        }
      }`;

      expect(() => parseRules(invalidRulesJson)).toThrow(
        'missing or invalid "rules" array'
      );
    });

    it("should throw error when a rule is missing a column property", () => {
      const missingColumnJson = `{
        "rules": [
          {
            "type": "required",
            "message": "Name is required"
          }
        ]
      }`;

      expect(() => parseRules(missingColumnJson)).toThrow(
        'missing required "column" property'
      );
    });

    it("should throw error when a rule is missing a type property", () => {
      const missingTypeJson = `{
        "rules": [
          {
            "column": "name",
            "message": "Name is required"
          }
        ]
      }`;

      expect(() => parseRules(missingTypeJson)).toThrow(
        'missing required "type" property'
      );
    });

    it("should handle rules with additional properties", () => {
      const rulesWithExtra = `{
        "rules": [
          {
            "column": "age",
            "type": "min",
            "value": 18,
            "message": "Must be at least 18 years old",
            "severity": "error",
            "customFlag": true
          }
        ]
      }`;

      const result = parseRules(rulesWithExtra);

      expect(result.rules[0]).toMatchObject({
        column: "age",
        type: "min",
        value: 18,
        message: "Must be at least 18 years old",
        severity: "error",
        customFlag: true,
      });
    });
  });
});

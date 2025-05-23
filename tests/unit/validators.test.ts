import { validators } from "../../src/validators";

describe("Validators", () => {
  describe("required", () => {
    it("should return true for defined values", () => {
      expect(validators.required("test")).toBe(true);
      expect(validators.required("0")).toBe(true);
      expect(validators.required(" ")).toBe(true);
    });

    it("should return false for undefined or null values", () => {
      expect(validators.required(undefined as unknown as string)).toBe(false);
      expect(validators.required(null as unknown as string)).toBe(false);
    });
  });

  describe("notEmpty", () => {
    it("should return true for non-empty values", () => {
      expect(validators.notEmpty("test")).toBe(true);
      expect(validators.notEmpty("0")).toBe(true);
    });

    it("should return false for empty, undefined, or null values", () => {
      expect(validators.notEmpty("")).toBe(false);
      expect(validators.notEmpty(" ")).toBe(false);
      expect(validators.notEmpty(undefined as unknown as string)).toBe(false);
      expect(validators.notEmpty(null as unknown as string)).toBe(false);
    });
  });

  describe("regex", () => {
    it("should return true for values matching the pattern", () => {
      expect(validators.regex("test", "^t.*t$")).toBe(true);
      expect(validators.regex("123", "\\d+")).toBe(true);
      expect(
        validators.regex("john@example.com", "^[\\w.-]+@[\\w.-]+\\.\\w+$")
      ).toBe(true);
    });

    it("should return false for values not matching the pattern", () => {
      expect(validators.regex("test", "^a.*t$")).toBe(false);
      expect(validators.regex("abc", "\\d+")).toBe(false);
      expect(validators.regex("", "\\d+")).toBe(false);
      expect(validators.regex(undefined as unknown as string, "\\d+")).toBe(
        false
      );
    });
  });

  describe("minLength", () => {
    it("should return true for values with length >= min", () => {
      expect(validators.minLength("test", 4)).toBe(true);
      expect(validators.minLength("test", 3)).toBe(true);
      expect(validators.minLength("test", 0)).toBe(true);
    });

    it("should return false for values with length < min", () => {
      expect(validators.minLength("test", 5)).toBe(false);
      expect(validators.minLength("", 1)).toBe(false);
      expect(validators.minLength(undefined as unknown as string, 1)).toBe(
        false
      );
    });
  });
  describe("maxLength", () => {
    it("should return true for values with length <= max", () => {
      expect(validators.maxLength("test", 4)).toBe(true);
      expect(validators.maxLength("test", 5)).toBe(true);
      expect(validators.maxLength("", 0)).toBe(true);

      expect(validators.maxLength(undefined as unknown as string, 0)).toBe(
        true
      );
    });

    it("should return false for values with length > max", () => {
      expect(validators.maxLength("test", 3)).toBe(false);
    });
  });

  describe("min", () => {
    it("should return true for values >= min", () => {
      expect(validators.min("5", 5)).toBe(true);
      expect(validators.min("10", 5)).toBe(true);
      expect(validators.min("5.5", 5)).toBe(true);
    });

    it("should return false for values < min", () => {
      expect(validators.min("4", 5)).toBe(false);
      expect(validators.min("", 0)).toBe(false);
      expect(validators.min("abc", 5)).toBe(false);
    });
  });

  describe("max", () => {
    it("should return true for values <= max", () => {
      expect(validators.max("5", 5)).toBe(true);
      expect(validators.max("4", 5)).toBe(true);
      expect(validators.max("4.5", 5)).toBe(true);
    });

    it("should return false for values > max", () => {
      expect(validators.max("6", 5)).toBe(false);
      expect(validators.max("abc", 5)).toBe(false);
    });
  });

  describe("inList", () => {
    it("should return true for values in the list", () => {
      expect(validators.in("apple", ["apple", "banana", "orange"])).toBe(true);
    });

    it("should return false for values not in the list", () => {
      expect(validators.in("grape", ["apple", "banana", "orange"])).toBe(false);
      expect(validators.in("", ["apple", "banana", "orange"])).toBe(false);
    });
  });

  describe("notInList", () => {
    it("should return true for values not in the list", () => {
      expect(validators.notIn("grape", ["apple", "banana", "orange"])).toBe(
        true
      );
    });

    it("should return false for values in the list", () => {
      expect(validators.notIn("apple", ["apple", "banana", "orange"])).toBe(
        false
      );
      expect(validators.notIn("", [])).toBe(true);
    });
  });

  describe("dateFormat", () => {
    it("should return true for valid dates in the specified format", () => {
      expect(validators.dateFormat("2023-01-01", "yyyy-MM-dd")).toBe(true);
    });

    it("should return false for invalid dates or wrong format", () => {
      expect(validators.dateFormat("2023/01/01", "yyyy-MM-dd")).toBe(false);
      expect(validators.dateFormat("2023-02-30", "yyyy-MM-dd")).toBe(false);
      expect(validators.dateFormat("", "yyyy-MM-dd")).toBe(false);
    });
  });

  describe("email", () => {
    it("should return true for valid email addresses", () => {
      expect(validators.email("john@example.com")).toBe(true);
      expect(validators.email("john.doe+test@example.co.uk")).toBe(true);
    });

    it("should return false for invalid email addresses", () => {
      expect(validators.email("john@example")).toBe(false);
      expect(validators.email("john.example.com")).toBe(false);
      expect(validators.email("")).toBe(false);
    });
  });
});

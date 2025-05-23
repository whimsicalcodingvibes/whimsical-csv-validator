import { RuleType } from "./types";
import { parseISO, isValid } from "date-fns";

// Define validator function types
type SimpleValidator = (value: string) => boolean;
type ValueValidator<T> = (value: string, ruleValue: T) => boolean;

/**
 * Required value validator
 * @param value - The value to validate.
 * @returns True if the value is defined, not null, and not an empty string, false otherwise.
 */
export function required(value: string): boolean {
  return value !== undefined && value !== null && value !== "";
}

/**
 * Validates if the value is not empty.
 * @param value - The value to validate.
 * @returns True if the value is not empty, false otherwise.
 */
export function notEmpty(value: string): boolean {
  return value !== undefined && value !== null && value.trim() !== "";
}

/**
 * Validates if the value matches the given regex pattern.
 * @param value - The value to validate.
 * @param pattern - The regex pattern to match against.
 * @returns True if the value matches the pattern, false otherwise.
 */
export function regex(value: string, pattern: string): boolean {
  if (!value) return false;
  const regex = new RegExp(pattern);
  return regex.test(value);
}

/**
 * Validates if the value's length is greater than or equal to the specified minimum.
 * @param value - The value to validate.
 * @param min - The minimum length.
 * @returns True if the value's length is greater than or equal to min, false otherwise.
 */
export function minLength(value: string, min: number): boolean {
  if (!value) return false;
  return value.length >= min;
}

/**
 * Validates if the value's length is less than or equal to the specified maximum.
 * @param value - The value to validate.
 * @param max - The maximum length.
 * @returns True if the value's length is less than or equal to max, false otherwise.
 */
export function maxLength(value: string, max: number): boolean {
  if (!value) return true; // Empty values pass max length check
  return value.length <= max;
}

/**
 * Validates if the value is greater than or equal to the specified minimum.
 * @param value - The value to validate.
 * @param min - The minimum value.
 * @returns True if the value is greater than or equal to min, false otherwise.
 */
export function min(value: string, min: number): boolean {
  if (!value) return false;
  const numValue = Number(value);
  return !isNaN(numValue) && numValue >= min;
}

/**
 * Validates if the value is less than or equal to the specified maximum.
 * @param value - The value to validate.
 * @param max - The maximum value.
 * @returns True if the value is less than or equal to max, false otherwise.
 */
export function max(value: string, max: number): boolean {
  if (!value) return true; // Empty values pass max check
  const numValue = Number(value);
  return !isNaN(numValue) && numValue <= max;
}

/**
 * Validates if the value is in the specified list.
 * @param value - The value to validate.
 * @param list - The list of valid values.
 * @returns True if the value is in the list, false otherwise.
 */
export function in_(value: string, list: string[]): boolean {
  if (!value) return false;
  return list.includes(value);
}

/**
 * Validates if the value is not in the specified list.
 * @param value - The value to validate.
 * @param list - The list of invalid values.
 * @returns True if the value is not in the list, false otherwise.
 */
export function notIn(value: string, list: string[]): boolean {
  if (!value) return true; // Empty values pass not-in check
  return !list.includes(value);
}

/**
 * Validates if the value is a valid date in the specified format.
 * @param value - The value to validate.
 * @param format - The date format to validate against.
 * @returns True if the value is a valid date, false otherwise.
 */
export function dateFormat(value: string, format: string): boolean {
  if (!value) return false;
  try {
    // Simple implementation - just checks if it's a valid date
    const date = parseISO(value);
    return isValid(date);
  } catch {
    return false;
  }
}

/**
 * Validates if the value is a valid email address.
 * @param value - The value to validate.
 * @returns True if the value is a valid email, false otherwise.
 */
export function email(value: string): boolean {
  if (!value) return false;
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Validates if the value passes a custom validation function.
 * @param value - The value to validate.
 * @param customValidator - The custom validation function.
 * @returns True if the value passes the custom validation, false otherwise.
 */
export function custom(value: string, customValidator: any): boolean {
  if (typeof customValidator === "function") {
    return customValidator(value);
  }
  return true;
}

// Map rule types to validator functions
// Using type any for validator functions to simplify the interface
// Each specific validator handles its own proper typing internally
export const validators: Record<
  RuleType,
  (value: string, ruleValue?: any) => boolean
> = {
  [RuleType.REQUIRED]: required,
  [RuleType.NOT_EMPTY]: notEmpty,
  [RuleType.REGEX]: regex,
  [RuleType.MIN_LENGTH]: minLength,
  [RuleType.MAX_LENGTH]: maxLength,
  [RuleType.MIN]: min,
  [RuleType.MAX]: max,
  [RuleType.IN]: in_,
  [RuleType.NOT_IN]: notIn,
  [RuleType.DATE_FORMAT]: dateFormat,
  [RuleType.EMAIL]: email,
  [RuleType.CUSTOM]: custom,
};

import { ValidationRules } from "./types";

/**
 * Parses and validates the JSON rules file.
 * @param content - The content of the JSON rules file.
 * @returns The parsed validation rules.
 * @throws Error if the JSON is invalid or the rules are not in the expected format.
 */
export function parseRules(content: string): ValidationRules {
  try {
    const rules = JSON.parse(content);

    // Basic validation of the rules schema
    if (!rules.rules || !Array.isArray(rules.rules)) {
      throw new Error('Invalid rules format: missing or invalid "rules" array');
    }

    // Validate each rule has required properties
    interface Rule {
      column: string;
      type: string;
      [key: string]: any; // For any additional properties rules might have
    }

    rules.rules.forEach((rule: Rule, index: number) => {
      if (rule.column === undefined) {
        throw new Error(
          `Rule at index ${index} is missing required "column" property`
        );
      }
      if (!rule.type) {
        throw new Error(
          `Rule at index ${index} is missing required "type" property`
        );
      }
    });

    return rules;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse JSON rules: ${error.message}`);
    }
    throw error;
  }
}

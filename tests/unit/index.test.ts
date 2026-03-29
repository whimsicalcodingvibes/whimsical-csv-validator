import * as fs from "fs";
import * as validator from "../../src/validator";
import * as parser from "../../src/parser";
import * as rules from "../../src/rules";
import * as reporter from "../../src/reporter";
import * as formatter from "../../src/formatter";

// Mocking the modules
jest.mock("fs");
jest.mock("../../src/validator");
jest.mock("../../src/parser");
jest.mock("../../src/rules");
jest.mock("../../src/reporter");
jest.mock("../../src/formatter");
jest.mock("commander", () => {
  // Create a mock function for opts that we can set in each test
  const optsMock = jest.fn();

  const mockCommand = {
    name: jest.fn().mockReturnThis(),
    description: jest.fn().mockReturnThis(),
    version: jest.fn().mockReturnThis(),
    requiredOption: jest.fn().mockReturnThis(),
    option: jest.fn().mockReturnThis(),
    parse: jest.fn().mockReturnThis(),
    opts: optsMock,
  };

  return {
    Command: jest.fn(() => mockCommand),
    mockOptsImplementation: (optsValue: any) => {
      optsMock.mockReturnValue(optsValue);
    },
  };
});

// Store original process.exit and console methods
const originalExit = process.exit;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe("CSV Validator CLI", () => {
  // Setup mocks before tests
  beforeEach(() => {
    // Mock process.exit to not exit tests
    process.exit = jest.fn() as any;

    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();

    // Reset mocks
    jest.resetAllMocks();

    // Setup common mock returns
    (fs.readFileSync as jest.Mock).mockImplementation((path) => {
      if (path.includes("rules")) {
        return '{"rules": {}}';
      }
      return "a,b,c\n1,2,3";
    });

    // Mock parser, validator and formatter returns
    (parser.parseCSV as jest.Mock).mockReturnValue({
      headers: ["a", "b", "c"],
      rows: [["1", "2", "3"]],
      rowCount: 1,
    });
    (validator.validateCSV as jest.Mock).mockReturnValue([]);
    (validator.getValidRows as jest.Mock).mockReturnValue([["1", "2", "3"]]);
    (rules.parseRules as jest.Mock).mockReturnValue({ columns: {} });
    (reporter.generateReport as jest.Mock).mockReturnValue({
      valid: true,
      totalRows: 1,
      validRows: 1,
      errors: [],
    });
    (formatter.formatCSV as jest.Mock).mockReturnValue("a,b,c\n1,2,3");
  });

  // Restore original functions after tests
  afterEach(() => {
    process.exit = originalExit;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  test("should validate CSV successfully and generate output files", async () => {
    // Mock commander options
    const mockOpts = {
      input: "test-input.csv",
      rules: "test-rules.json",
      output: "report.json",
      validOutput: "valid-data.csv",
      delimiter: ",",
      header: true,
      failFast: false,
      summary: true,
    };

    jest.requireMock("commander").Command().opts.mockReturnValue(mockOpts);

    // Import the index module
    await import("../../src/index");

    // Verify the files were read
    expect(fs.readFileSync).toHaveBeenCalledWith("test-input.csv", "utf8");
    expect(fs.readFileSync).toHaveBeenCalledWith("test-rules.json", "utf8");

    // Verify processing steps were called correctly
    expect(parser.parseCSV).toHaveBeenCalled();
    expect(rules.parseRules).toHaveBeenCalled();
    expect(validator.validateCSV).toHaveBeenCalled();
    // Verify report generation and output
    expect(reporter.generateReport).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "report.json",
      expect.any(String)
    );

    // Verify valid data output
    expect(validator.getValidRows).toHaveBeenCalled();
    expect(formatter.formatCSV).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "valid-data.csv",
      "a,b,c\n1,2,3"
    );

    // Verify summary was logged
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Validation completed")
    );
  });

  test("should handle validation errors and exit with error code on failures", async () => {
    // Mock commander options
    const mockOpts = {
      input: "test-input.csv",
      rules: "test-rules.json",
      output: "report.json",
      delimiter: ",",
      header: true,
      failFast: false,
      summary: true,
    };

    jest.requireMock("commander").Command().opts.mockReturnValue(mockOpts);

    // Set up validation errors
    (validator.validateCSV as jest.Mock).mockReturnValue([
      {
        rowNumber: 1,
        column: "a",
        rule: "required",
        message: "Value is required",
      },
    ]);

    (reporter.generateReport as jest.Mock).mockReturnValue({
      valid: false,
      totalRows: 1,
      validRows: 0,
      errors: [
        {
          rowNumber: 1,
          column: "a",
          rule: "required",
          message: "Value is required",
        },
      ],
    });

    // Import the index module
    await import("../../src/index");

    // Verify the error handling
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Validation failed")
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  test("should handle file reading errors", async () => {
    // Mock commander options
    const mockOpts = {
      input: "test-input.csv",
      rules: "test-rules.json",
      output: "report.json",
      delimiter: ",",
      header: true,
      failFast: false,
    };

    jest.requireMock("commander").Command().opts.mockReturnValue(mockOpts);

    // Force an error when reading files
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("File not found");
    });

    // Import the index module
    await import("../../src/index");

    // Verify error handling
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Error:")
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  // Add more test cases to improve coverage
});

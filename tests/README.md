# CSV Validator Tests

This directory contains tests for the CSV Validator library.

## Overview

The test suite uses Jest and TypeScript to test the functionality of the CSV validation library. The tests cover the core modules of the library, ensuring that each component works as expected both individually and when integrated together.

## Test Structure

- **Unit Tests**: Tests for individual modules in isolation
- **Integration Tests**: Tests that verify multiple modules working together

## Test Files

- `formatter.test.ts` - Tests for CSV formatting functionality
- `parser.test.ts` - Tests for CSV parsing functionality
- `validator.test.ts` - Tests for validation logic
- `validators.test.ts` - Tests for individual validation rules
- `reporter.test.ts` - Tests for report generation
- `rules.test.ts` - Tests for rule parsing and validation
- `integration.test.ts` - End-to-end tests for the complete workflow

## Running Tests

To run the tests, use:

```bash
npm test
```

## Coverage

The test suite aims to cover:

1. Happy path - Verifying functionality with valid inputs
2. Error handling - Ensuring proper error messages for invalid inputs
3. Edge cases - Testing boundary conditions and special cases

## Adding Tests

When adding new features to the library, please ensure:

1. Add unit tests for any new modules or functions
2. Update integration tests if the workflow changes
3. Verify both success and failure cases

## Test Data

Test data is generated within the test files to ensure tests are independent and do not rely on external files.

# CSV Validator

A TypeScript CLI tool for validating CSV data against user-defined JSON validation rules.

## About

CSV Validator is a powerful command-line utility designed to validate and clean CSV data files according to customizable validation rules. Perfect for data engineers, analysts, and developers who work with CSV data and need to ensure data quality before processing.

## Features

- Validate CSV data against custom JSON rules
- Export only valid rows to a new CSV file
- Generate detailed validation reports
- Process individual files or entire directories in batch
- Support for various validation rules (required, regex, min/max, etc.)
- Customizable delimiter and CSV format options
- Strict header validation
- Detailed error reporting

## Installation

To install the CSV Validator, clone this repository and run the following command:

```bash
# Install globally
npm install -g .

# Verify installation
csv-validator --version
```

## Usage

### Single File Validation

```bash
csv-validator --input <csv-file> --rules <rules-file> [options]
```

#### Required Arguments

- `-i, --input <path>`: Path to the input CSV file
- `-r, --rules <path>`: Path to the JSON validation rules file

#### Optional Arguments

- `-o, --output <path>`: Path to save the validation report (JSON format)
- `-v, --valid-output <path>`: Path to export valid rows to a new CSV file
- `-s, --summary`: Print a summary report to console (default: false)
- `-f, --fail-fast`: Stop validation on first error (default: false)
- `-d, --delimiter <char>`: CSV delimiter character (default: ',')
- `-h, --header`: CSV contains header row (default: true)
- `--version`: Show version number
- `--help`: Show help

### Batch Processing

Process multiple CSV files at once:

```bash
csv-validator-batch --input <directory> --rules <rules-file> --output <directory> [options]
```

#### Required Arguments

- `-i, --input <directory>`: Directory containing input CSV files
- `-r, --rules <path>`: Path to JSON validation rules file
- `-o, --output <directory>`: Directory for output files

#### Optional Arguments

- `-p, --pattern <pattern>`: File pattern to match (default: '*.csv')
- `-s, --summary`: Print a summary report to console (default: false)
- `-f, --fail-fast`: Stop validation on first error (default: false)
- `-d, --delimiter <char>`: CSV delimiter character (default: ',')
- `-h, --header`: CSV contains header row (default: true)

## Examples

### Basic Validation

```bash
# Basic validation
csv-validator -i data.csv -r rules.json

# Save validation report to a file
csv-validator -i data.csv -r rules.json -o report.json

# Export valid rows to a new CSV file
csv-validator -i data.csv -r rules.json -v valid-data.csv

# Custom delimiter and print summary
csv-validator -i data.csv -r rules.json -d ';' -s

# Validate CSV without headers
csv-validator -i data.csv -r rules.json --no-header

# Complete example with all options
csv-validator -i data.csv -r rules.json -o report.json -v valid-data.csv -s -d ',' 
```

### Batch Processing

```bash
# Process all CSV files in a directory
csv-validator-batch -i ./data -r rules.json -o ./output

# Custom settings
csv-validator-batch -i ./data -r rules.json -o ./output -p ".csv" -d ";" -s
```

### Integration with npm Scripts

Add to your package.json:
```json
"scripts": {
  "validate": "csv-validator -i ./examples/input.csv -r ./examples/rules.json -o ./output/report.json -v ./output/valid-data.csv",
  "batch-validate": "csv-validator-batch -i ./data -r ./rules.json -o ./output -s"
}
```

Then run:
```bash
npm run validate
npm run batch-validate
```

### Shell Script for Batch Processing

```bash
#!/bin/bash
for file in ./data/*.csv; do
  filename=$(basename "$file" .csv)
  csv-validator -i "$file" -r ./rules.json -o "./output/$filename-report.json" -v "./output/$filename-valid.csv"
done
```

## JSON Rules Format

The rules file should be a JSON file with the following structure:

```json
{
  "rules": [
    {
      "column": "columnName",
      "type": "ruleType",
      "value": "ruleValue",
      "message": "Custom error message"
    }
  ],
  "settings": {
    "strictHeaders": true,
    "requiredColumns": ["column1", "column2"]
  }
}
```

### Rule Types

- `required`: Field must exist and not be null
- `notEmpty`: Field must not be empty
- `regex`: Field must match the regex pattern
- `minLength`: Field must be at least X characters long
- `maxLength`: Field must be at most X characters long
- `min`: Numeric field must be >= X
- `max`: Numeric field must be <= X
- `in`: Field value must be in the provided list
- `notIn`: Field value must not be in the provided list
- `dateFormat`: Field must be a valid date
- `email`: Field must be a valid email address

## Sample Files

The package includes sample files in the `examples` directory:

- `input.csv`: Sample CSV data
- `rules.json`: Sample validation rules

## Validation Report Structure

The JSON validation report includes:

```json
{
  "valid": false,
  "totalRows": 7,
  "validRows": 3,
  "errors": [
    {
      "rowNumber": 3,
      "column": "email",
      "value": "bob.johnson@example",
      "rule": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2025-05-16T09:32:08Z",
  "inputFile": "examples/input.csv",
  "rulesFile": "examples/rules.json"
}
```

## Troubleshooting

- **File not found errors**: Ensure that all file paths are correct and directories exist
- **Permission issues**: Check file permissions on input and output directories
- **CSV parsing errors**: Verify that your CSV is properly formatted and uses the correct delimiter
- **JSON rule errors**: Validate your rules.json file against the expected schema

## Performance Considerations

- For very large files, consider using the batch processor to handle files in parallel
- The `--fail-fast` option can improve performance by stopping validation on the first error
- The tool uses streaming CSV parsing for efficient memory usage



## Testing

The project includes a comprehensive test suite using Jest. The tests cover:

- Unit tests for individual components
- Integration tests for the full validation workflow

To run the tests:

```bash
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
For more information about the test suite, see the [Tests README](./tests/README.md).

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines on how to contribute.

Contributors are expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md).

When contributing, please ensure:
1. All tests pass before submitting a pull request
2. New functionality is covered by tests
3. Documentation is updated as needed

## Support

For support inquiries, please:
- Open an issue on the GitHub repository
- Email: hi@whimsicalcodingvibes.com

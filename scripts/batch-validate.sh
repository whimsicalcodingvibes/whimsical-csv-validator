#!/bin/bash

# Set variables
INPUT_DIR="./data"
RULES_FILE="./rules.json"
OUTPUT_DIR="./output"
DELIMITER=","

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Process all CSV files in the input directory
echo "Starting batch validation process..."
echo "Input directory: $INPUT_DIR"
echo "Rules file: $RULES_FILE"
echo "Output directory: $OUTPUT_DIR"

csv-validator-batch \
  -i "$INPUT_DIR" \
  -r "$RULES_FILE" \
  -o "$OUTPUT_DIR" \
  -p ".csv" \
  -d "$DELIMITER" \
  -s

# Check exit code
if [ $? -eq 0 ]; then
  echo "Batch validation completed successfully."
else
  echo "Batch validation failed."
fi
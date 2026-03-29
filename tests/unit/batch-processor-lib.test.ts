import * as fs from 'fs';
import * as path from 'path';
import { createProgram, processBatch } from '../../src/batch-processor-lib';
import * as validator from '../../src/validator';
import * as parser from '../../src/parser';
import * as rules from '../../src/rules';
import * as reporter from '../../src/reporter';
import * as formatter from '../../src/formatter';

// Mocking the modules
jest.mock('fs');
jest.mock('path');
jest.mock('../../src/validator');
jest.mock('../../src/parser');
jest.mock('../../src/rules');
jest.mock('../../src/reporter');
jest.mock('../../src/formatter');

describe('Batch Processor Library', () => {
  // Store original console methods
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Reset mocks
    jest.resetAllMocks();
    
    // Setup common mock returns
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockImplementation((path) => {
      if (path.includes('rules')) {
        return '{"rules": {}}';
      }
      return 'a,b,c\n1,2,3';
    });
    (fs.readdirSync as jest.Mock).mockReturnValue(['file1.csv', 'file2.csv']);
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (path.basename as jest.Mock).mockImplementation((file) => file.split('/').pop());
    
    // Mock parser, validator and formatter returns
    (parser.parseCSV as jest.Mock).mockReturnValue({
      headers: ['a', 'b', 'c'],
      rows: [['1', '2', '3']],
      rowCount: 1
    });
    (validator.validateCSV as jest.Mock).mockReturnValue([]);
    (validator.getValidRows as jest.Mock).mockReturnValue([
      ['1', '2', '3']
    ]);
    (rules.parseRules as jest.Mock).mockReturnValue({ columns: {} });
    (reporter.generateReport as jest.Mock).mockReturnValue({ 
      valid: true,
      totalRows: 1,
      validRows: 1,
      errors: []
    });
    (formatter.formatCSV as jest.Mock).mockReturnValue('a,b,c\n1,2,3');
  });
  
  // Restore original functions after tests
  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('createProgram', () => {
    test('should create a commander program with the correct options', () => {
      const program = createProgram();
      
      // Check the program has been created with expected methods
      expect(program.name).toBeDefined();
      expect(program.description).toBeDefined();
      expect(program.version).toBeDefined();
      expect(program.requiredOption).toBeDefined();
      expect(program.option).toBeDefined();
    });
  });

  describe('processBatch', () => {
    test('should process multiple CSV files successfully', () => {
      // Setup test parameters
      const options = {
        input: '/input',
        rules: '/rules.json',
        output: '/output',
        pattern: '*.csv',
        summary: true,
        delimiter: ',',
        header: true,
        failFast: false
      };
      
      // Run function
      processBatch(options);
      
      // Verify directory was checked
      expect(fs.existsSync).toHaveBeenCalledWith('/input');
      expect(fs.existsSync).toHaveBeenCalledWith('/rules.json');
      
      // Verify output directory was created if not exists
      expect(fs.existsSync).toHaveBeenCalledWith('/output');
      
      // Verify files were processed
      expect(fs.readFileSync).toHaveBeenCalledWith('/rules.json', 'utf8');
      expect(fs.readFileSync).toHaveBeenCalledTimes(3); // rules + 2 CSV files
      
      // Verify output was written
      expect(fs.writeFileSync).toHaveBeenCalledTimes(4); // 2 files x 2 outputs (report + valid data)
      
      // Verify summary logging
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Batch processing completed'));
    });
    
    test('should create output directory if it does not exist', () => {
      // Setup test parameters
      const options = {
        input: '/input',
        rules: '/rules.json',
        output: '/output',
        pattern: '*.csv',
        summary: true,
        delimiter: ',',
        header: true,
        failFast: false
      };
      
      // Mock output directory doesn't exist
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true)  // input directory
        .mockReturnValueOnce(true)  // rules file
        .mockReturnValueOnce(false); // output directory
      
      // Run function
      processBatch(options);
      
      // Verify directory was created
      expect(fs.mkdirSync).toHaveBeenCalledWith('/output', { recursive: true });
    });
    
    test('should handle errors when reading rules file', () => {
      // Setup test parameters
      const options = {
        input: '/input',
        rules: '/rules.json',
        output: '/output',
        pattern: '*.csv',
        summary: true,
        delimiter: ',',
        header: true,
        failFast: false
      };
      
      // Force error reading rules
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Rules file not found');
      });
      
      // Run function
      processBatch(options);
      
      // Verify error handling
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error:'));
    });
    
    test('should handle cases when no files are found', () => {
      // Setup test parameters
      const options = {
        input: '/input',
        rules: '/rules.json',
        output: '/output',
        pattern: '*.csv',
        summary: true,
        delimiter: ',',
        header: true,
        failFast: false
      };
      
      // Return empty file list
      (fs.readdirSync as jest.Mock).mockReturnValueOnce([]);
      
      // Run function
      processBatch(options);
      
      // Verify warning
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No CSV files found'));
    });
    
    test('should handle file processing errors', () => {
      // Setup test parameters
      const options = {
        input: '/input',
        rules: '/rules.json',
        output: '/output',
        pattern: '*.csv',
        summary: true,
        delimiter: ',',
        header: true,
        failFast: true
      };
      
      // Force error on second file
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => '{"rules": {}}') // Rules
        .mockImplementationOnce(() => 'a,b,c\n1,2,3') // First file
        .mockImplementationOnce(() => { throw new Error('File read error'); }); // Second file
      
      // Run function
      processBatch(options);
      
      // Verify error handling and fail-fast behavior
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error processing'));
    });
  });
});

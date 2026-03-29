import * as fs from 'fs';
import * as path from 'path';
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
jest.mock('commander', () => {
  const mockCommand = {
    name: jest.fn().mockReturnThis(),
    description: jest.fn().mockReturnThis(),
    version: jest.fn().mockReturnThis(),
    requiredOption: jest.fn().mockReturnThis(),
    option: jest.fn().mockReturnThis(),
    parse: jest.fn().mockReturnThis(),
    opts: jest.fn(),
  };
  return {
    Command: jest.fn(() => mockCommand),
  };
});

// Store original process.exit and console methods
const originalExit = process.exit;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Batch Processor', () => {
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
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockImplementation((path) => {
      if (path.includes('rules')) {
        return '{"rules": {}}';
      }
      return 'a,b,c\n1,2,3';
    });
    (fs.readdirSync as jest.Mock).mockReturnValue(['file1.csv', 'file2.csv']);
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (path.basename as jest.Mock).mockImplementation((file, ext) => file.replace(ext, ''));
    
    // Mock parser, validator and formatter returns
    (parser.parseCSV as jest.Mock).mockReturnValue([
      { a: '1', b: '2', c: '3' }
    ]);
    (validator.validateCSV as jest.Mock).mockReturnValue([]);
    (validator.getValidRows as jest.Mock).mockReturnValue([
      { a: '1', b: '2', c: '3' }
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
    process.exit = originalExit;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  test('should process CSV files successfully', async () => {
    // Mock commander options
    const mockOpts = {
      input: '/input',
      rules: '/rules.json',
      output: '/output',
      delimiter: ',',
      header: true,
      failFast: false,
      pattern: '*.csv',
      summary: true
    };
    
    // Set up commanderMock to return our mockOpts
    jest.requireMock('commander').Command().opts.mockReturnValue(mockOpts);
    
    // Import the batch-processor (which will execute it due to Commander)
    await import('../../src/batch-processor');
    
    // Check that files were processed
    expect(fs.readdirSync).toHaveBeenCalledWith('/input');
    expect(parser.parseCSV).toHaveBeenCalledTimes(2); // For 2 files
    expect(validator.validateCSV).toHaveBeenCalledTimes(2);
    expect(reporter.generateReport).toHaveBeenCalledTimes(2);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(4); // 2 reports + 2 valid CSV files
    
    // Verify console logs for summary
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Batch processing complete'));
  });

  test('should create output directory if it does not exist', async () => {
    // Mock output directory as non-existent
    (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
    
    // Mock commander options
    const mockOpts = {
      input: '/input',
      rules: '/rules.json',
      output: '/output',
      delimiter: ',',
      header: true,
      failFast: false,
      pattern: '*.csv',
      summary: false
    };
    
    jest.requireMock('commander').Command().opts.mockReturnValue(mockOpts);
    
    // Import the batch-processor
    await import('../../src/batch-processor');
    
    // Check that directory was created
    expect(fs.mkdirSync).toHaveBeenCalledWith('/output', { recursive: true });
  });

  test('should handle errors when reading rules file', async () => {
    // Mock rules file read error
    (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Cannot read file');
    });
    
    // Mock commander options
    const mockOpts = {
      input: '/input',
      rules: '/rules.json',
      output: '/output',
      delimiter: ',',
      header: true,
      failFast: false,
      pattern: '*.csv',
      summary: false
    };
    
    jest.requireMock('commander').Command().opts.mockReturnValue(mockOpts);
    
    // Import the batch-processor
    await import('../../src/batch-processor');
    
    // Verify error handling
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error reading rules file'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  test('should handle cases when no files are found', async () => {
    // Mock empty directory
    (fs.readdirSync as jest.Mock).mockReturnValueOnce([]);
    
    // Mock commander options
    const mockOpts = {
      input: '/input',
      rules: '/rules.json',
      output: '/output',
      delimiter: ',',
      header: true,
      failFast: false,
      pattern: '*.csv',
      summary: false
    };
    
    jest.requireMock('commander').Command().opts.mockReturnValue(mockOpts);
    
    // Import the batch-processor
    await import('../../src/batch-processor');
    
    // Verify error handling
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('No matching files found'));
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  test('should handle errors when processing individual files', async () => {
    // Mock error when processing a file
    (parser.parseCSV as jest.Mock).mockImplementationOnce(() => {
      throw new Error('CSV parsing error');
    });
    
    // Mock commander options
    const mockOpts = {
      input: '/input',
      rules: '/rules.json',
      output: '/output',
      delimiter: ',',
      header: true,
      failFast: false,
      pattern: '*.csv',
      summary: false
    };
    
    jest.requireMock('commander').Command().opts.mockReturnValue(mockOpts);
    
    // Import the batch-processor
    await import('../../src/batch-processor');
    
    // Check that processing continued after error
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error processing file1.csv'));
    expect(parser.parseCSV).toHaveBeenCalledTimes(2); // Still tried to process the second file
  });
});

# Contributing to CSV Validator

Thank you for considering contributing to CSV Validator! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:
- Check the issue tracker to see if the bug has already been reported.
- If not, create a new issue with a descriptive title and clear description.
- Include steps to reproduce, expected behavior, and actual behavior.
- Add any relevant screenshots or error messages.

### Suggesting Features

Feature suggestions are always welcome! To suggest a feature:
- Check if the feature has already been suggested in the issues.
- If not, create a new issue with a descriptive title.
- Clearly describe the feature and its potential benefits.
- Tag it as a feature request.

### Pull Requests

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/your-bug-fix
   ```
3. Make your changes following our coding standards.
4. Write tests for your changes if applicable.
5. Run existing tests to ensure they pass:
   ```bash
   npm test
   ```
6. Commit your changes with a descriptive commit message:
   ```bash
   git commit -m "Add feature: your feature name"
   ```
7. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
8. Create a pull request to the main repository's main branch.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/whimsicalcodingvibes/whimsical-csv-validator.git
   cd whimsical-csv-validator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Coding Standards

- Use TypeScript features appropriately.
- Follow the existing code style in the project.
- Add comments for complex logic.
- Write unit tests for new functionality.

## License

By contributing to CSV Validator, you agree that your contributions will be licensed under the project's MIT License.

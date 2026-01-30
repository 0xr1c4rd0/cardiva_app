# /tdd Command

Test-Driven Development workflow for implementing features.

## Usage

```
/tdd [feature description]
```

## Workflow

I will guide you through the TDD cycle:

### Step 1: RED - Write Failing Test

1. Create a test file if it doesn't exist
2. Write a test that describes expected behavior
3. Run the test to confirm it FAILS
4. Commit: `test: add failing test for [feature]`

### Step 2: GREEN - Make It Pass

1. Write the MINIMAL code to make the test pass
2. No extra features, no optimization
3. Run the test to confirm it PASSES
4. Commit: `feat: implement [feature]`

### Step 3: REFACTOR - Clean Up

1. Improve code quality while keeping tests green
2. Remove duplication
3. Improve naming
4. Run tests after each change
5. Commit: `refactor: improve [feature] implementation`

### Step 4: VERIFY - Check Coverage

1. Verify 80%+ test coverage
2. Add edge case tests if needed
3. Document the implementation

## Example

```
/tdd confidence score formatter

Step 1: Create test
- File: lib/utils/__tests__/format-confidence.test.ts
- Test: formatConfidence(0.9523) returns "95.23%"

Step 2: Implement
- File: lib/utils/format-confidence.ts
- Minimal implementation to pass test

Step 3: Refactor
- Add TypeScript types
- Handle edge cases

Step 4: Verify
- Coverage check
- Add edge case tests
```

## Testing Tools

- **Playwright** - E2E tests (`npm run test`)
- **Vitest** - Unit tests (if configured)

## Commands

```bash
npm run test              # Run all tests
npm run test:ui           # Interactive UI
npm run test -- --watch   # Watch mode
```

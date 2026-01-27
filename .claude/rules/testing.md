# Testing Rules

## Minimum Coverage: 80%

All new features MUST have test coverage of at least 80%.

## Test Types (ALL required for features)

1. **Unit Tests** - Individual functions, utilities, components
2. **Integration Tests** - API endpoints, database operations
3. **E2E Tests** - Critical user flows (Playwright)

## Test-Driven Development (TDD) - MANDATORY

For new features, follow RED-GREEN-REFACTOR:

```
1. RED:      Write test first - it should FAIL
2. GREEN:    Write minimal implementation to pass
3. REFACTOR: Clean up while keeping tests green
4. VERIFY:   Ensure 80%+ coverage
```

### TDD Example

```typescript
// Step 1: RED - Write failing test
describe('formatConfidence', () => {
  it('formats confidence score with 4 decimal places', () => {
    expect(formatConfidence(0.9523)).toBe('95.23%')
  })

  it('handles edge cases', () => {
    expect(formatConfidence(0)).toBe('0.00%')
    expect(formatConfidence(1)).toBe('100.00%')
  })
})

// Step 2: GREEN - Write minimal implementation
function formatConfidence(score: number): string {
  return `${(score * 100).toFixed(2)}%`
}

// Step 3: REFACTOR - Clean up if needed
// Step 4: VERIFY - Run tests, check coverage
```

## E2E Testing with Playwright

### Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('RFP Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to upload page
    await page.goto('/rfps')
  })

  test('uploads PDF and shows processing status', async ({ page }) => {
    // Arrange
    const fileInput = page.locator('input[type="file"]')

    // Act
    await fileInput.setInputFiles('./fixtures/test-rfp.pdf')

    // Assert
    await expect(page.getByText('A processar')).toBeVisible()
  })
})
```

### Critical Flows to Test

1. **Authentication**
   - Login with valid credentials
   - Login with invalid credentials
   - Registration flow
   - Password reset

2. **RFP Processing**
   - PDF upload
   - Processing status updates
   - Match review interface

3. **Match Management**
   - Accept/reject suggestions
   - Bulk operations
   - Export functionality

4. **Admin Functions**
   - User approval
   - Settings management

## Testing Commands

```bash
npm run test          # Run all E2E tests
npm run test:ui       # Interactive Playwright UI
npm run test:headed   # Run with visible browser
npm run test:debug    # Debug mode
```

## Test File Naming

- `*.spec.ts` - E2E tests (Playwright)
- `*.test.ts` - Unit/integration tests
- Place tests next to the code they test or in `__tests__/` folder

## Mocking Guidelines

1. **Mock external services** - Supabase, n8n webhooks
2. **Use fixtures** - Consistent test data in `fixtures/` folder
3. **Reset state** - Clean up after each test

```typescript
// Good: Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
}
```

## Troubleshooting Test Failures

1. Check test isolation (no shared state)
2. Verify mocks are correct
3. Check async/await usage
4. **Fix implementation, not tests** (unless tests are wrong)

## Pre-Commit Checklist

Before committing any code:
- [ ] All tests pass locally
- [ ] New code has tests
- [ ] Coverage meets 80% threshold
- [ ] No skipped tests without justification

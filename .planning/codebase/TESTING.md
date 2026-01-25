# Testing Patterns

**Analysis Date:** 2026-01-25

## Test Framework

**Runner:**
- Playwright 1.57.0
- Config: `playwright.config.ts`

**Assertion Library:**
- Playwright's built-in `expect` from `@playwright/test`

**Run Commands:**
```bash
npm run test              # Run all tests
npm run test:ui           # Interactive Playwright test UI
npm run test:headed       # Run tests with visible browser
npm run test:phase1       # Run phase-01 foundation tests only
npm run test:phase2       # Run phase-02 authentication tests only
npm run test:phase3       # Run phase-03 inventory tests only
```

## Test File Organization

**Location:**
- Separate `e2e/` directory at project root (not co-located with source)
- All tests are end-to-end tests validating full user workflows

**Naming:**
- Pattern: `phase-{number}-{feature}.spec.ts`
- Examples: `phase-01-foundation.spec.ts`, `phase-02-authentication.spec.ts`, `phase-03-inventory.spec.ts`
- `.spec.ts` extension for all test files

**Structure:**
```
e2e/
├── phase-01-foundation.spec.ts
├── phase-02-authentication.spec.ts
├── phase-03-inventory.spec.ts
└── phase-08-bulk-operations.spec.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { test, expect } from '@playwright/test'

/**
 * Phase 2: Authentication Tests
 *
 * Success Criteria:
 * 1. User can register with email/password and account is created in disabled state
 * 2. User can log in with email/password after admin approval
 * 3. User session persists across browser refresh and navigation
 * 4. User can log out from any page in the application
 * 5. User can reset password via email link
 * 6. Admin users can access admin-only features; regular users cannot
 */

test.describe('Phase 2: Authentication', () => {
  test.describe('SC-01: Registration', () => {
    test('should display registration page', async ({ page }) => {
      await page.goto('/register')
      await page.waitForLoadState('networkidle')

      const heading = page.locator('[data-slot="card-title"]').first()
      await expect(heading).toContainText(/register|sign up|create|account/i)
    })
  })
})
```

**Patterns:**
- **Outer describe**: Phase-level grouping with success criteria documentation
- **Inner describe**: Feature/Success Criteria grouping (e.g., "SC-01: Registration")
- **Individual tests**: Specific assertion about one behavior
- **JSDoc header**: Documents phase purpose and success criteria

## Mocking

**Framework:** Not currently used - tests run against real Supabase instance

**Patterns:**
- No mocking observed in current test suite
- Tests interact with real database and authentication
- Session management via `page.context().clearCookies()` for isolation

**What to Mock:**
- (Not applicable - no mocking currently implemented)

**What NOT to Mock:**
- Authentication flows (tested against real Supabase)
- Database operations (tested end-to-end)
- Page navigation and routing

## Fixtures and Factories

**Test Data:**
- No dedicated fixtures or factory files detected
- Inline test data in test files:
```typescript
test('should show error for invalid credentials', async ({ page }) => {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // Fill with invalid credentials
  await page.fill('input[type="email"], input[name="email"]', 'invalid@example.com')
  await page.fill('input[type="password"]', 'wrongpassword123')

  await page.locator('button[type="submit"]').click()
  await page.waitForTimeout(2000)

  const url = page.url()
  expect(url).toContain('login')
})
```

**Location:**
- No separate fixtures directory
- Test data created inline within test cases
- Cookie clearing for session isolation: `await page.context().clearCookies()`

## Coverage

**Requirements:** None enforced - no coverage reporting configured

**View Coverage:**
- Not configured in `package.json` or `playwright.config.ts`

## Test Types

**Unit Tests:**
- Not used - no unit test framework configured (e.g., Jest, Vitest)
- All testing is E2E via Playwright

**Integration Tests:**
- Not used - E2E tests cover integration scenarios
- Database, auth, and UI tested together in E2E flows

**E2E Tests:**
- Primary testing approach - Playwright for full user workflows
- Test structure follows phase-based feature delivery
- Browser: Chrome/Chromium only (configured in `playwright.config.ts`)
- Base URL: `http://localhost:3000`
- Screenshots: Only on failure
- Traces: On first retry
- Retries: 2 in CI, 0 locally

## Common Patterns

**Async Testing:**
```typescript
test('should load the homepage successfully', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
})
```

**Waiting Strategies:**
```typescript
// Wait for network to be idle
await page.waitForLoadState('networkidle')

// Wait for specific timeout (anti-pattern, but used)
await page.waitForTimeout(2000)

// Wait for element visibility
await expect(registerLink).toBeVisible()
```

**Element Selection:**
```typescript
// By data attribute (recommended pattern)
const heading = page.locator('[data-slot="card-title"]').first()

// By input type or name
const emailInput = page.locator('input[type="email"], input[name="email"]')

// By button type
const submitButton = page.locator('button[type="submit"]')

// By href pattern
const loginLink = page.locator('a[href*="login"]')
```

**Error Testing:**
```typescript
test('should show validation errors for empty form submission', async ({ page }) => {
  await page.goto('/register')
  await page.waitForLoadState('networkidle')

  // Click submit without filling form
  const submitButton = page.locator('button[type="submit"]')
  await submitButton.click()

  // Wait for validation - HTML5 validation or custom error
  await page.waitForTimeout(500)

  // Check for invalid state on required fields
  const emailInput = page.locator('input[type="email"], input[name="email"]')
  const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
  expect(isInvalid).toBe(true)
})
```

**Error Collection:**
```typescript
test('should render Next.js app without errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // Filter out known non-critical errors
  const criticalErrors = errors.filter(
    (e) => !e.includes('ResizeObserver') && !e.includes('hydration')
  )
  expect(criticalErrors).toHaveLength(0)
})
```

**Regex Matching:**
```typescript
// Flexible text matching for localized content
const heading = page.locator('[data-slot="card-title"]').first()
await expect(heading).toContainText(/log\s*in|sign in|welcome/i)
```

**Session Isolation:**
```typescript
test('should redirect unauthenticated users from dashboard to login', async ({ page }) => {
  // Clear any existing session
  await page.context().clearCookies()

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // Should be redirected to login
  const url = page.url()
  expect(url).toContain('login')
})
```

## Testing Philosophy

**Current Approach:**
- E2E-first testing strategy (no unit or integration tests)
- Tests validate user-facing functionality and workflows
- Phase-based organization matches project delivery phases
- Success criteria documented in test file headers
- Tests assume real backend (Supabase) is available

**Coverage Gaps:**
- No unit tests for business logic or utility functions
- No integration tests for API routes or Server Actions
- No component-level testing (e.g., React Testing Library)
- Limited test coverage - only foundation, auth, and inventory features tested

**Recommended Additions:**
- Add Vitest or Jest for unit testing utilities, validation logic, helpers
- Add React Testing Library for component testing
- Add API route testing for Server Actions and route handlers
- Implement test fixtures and factories for reusable test data
- Add coverage reporting to identify untested code paths

---

*Testing analysis: 2026-01-25*

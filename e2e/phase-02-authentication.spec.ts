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

      // Check page title - CardTitle renders as div with data-slot="card-title"
      // Portuguese: "Criar Conta"
      const heading = page.locator('[data-slot="card-title"]').first()
      await expect(heading).toContainText(/register|sign up|create|account|criar|conta/i)
    })

    test('should have email input field', async ({ page }) => {
      await page.goto('/register')
      await page.waitForLoadState('networkidle')

      const emailInput = page.locator('input[type="email"], input[name="email"]')
      await expect(emailInput).toBeVisible()
    })

    test('should have password input field', async ({ page }) => {
      await page.goto('/register')
      await page.waitForLoadState('networkidle')

      const passwordInput = page.locator('input[type="password"]').first()
      await expect(passwordInput).toBeVisible()
    })

    test('should have submit button', async ({ page }) => {
      await page.goto('/register')
      await page.waitForLoadState('networkidle')

      const submitButton = page.locator('button[type="submit"]')
      await expect(submitButton).toBeVisible()
    })

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

    test('should have link to login page', async ({ page }) => {
      await page.goto('/register')
      await page.waitForLoadState('networkidle')

      const loginLink = page.locator('a[href*="login"]')
      await expect(loginLink).toBeVisible()
    })
  })

  test.describe('SC-02: Login', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // CardTitle renders as div with data-slot="card-title"
      // Portuguese: "Iniciar Sessão"
      const heading = page.locator('[data-slot="card-title"]').first()
      await expect(heading).toContainText(/log\s*in|sign in|welcome|iniciar|sessão/i)
    })

    test('should have email input field', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      const emailInput = page.locator('input[type="email"], input[name="email"]')
      await expect(emailInput).toBeVisible()
    })

    test('should have password input field', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      const passwordInput = page.locator('input[type="password"]')
      await expect(passwordInput).toBeVisible()
    })

    test('should have submit button', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      const submitButton = page.locator('button[type="submit"]')
      await expect(submitButton).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Fill with invalid credentials
      await page.fill('input[type="email"], input[name="email"]', 'invalid@example.com')
      await page.fill('input[type="password"]', 'wrongpassword123')

      // Submit form
      await page.locator('button[type="submit"]').click()

      // Wait for error message
      await page.waitForTimeout(2000)

      // Check for error indication (either error message or still on login page)
      const url = page.url()
      expect(url).toContain('login')
    })

    test('should have link to registration page', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      const registerLink = page.locator('a[href*="register"]')
      await expect(registerLink).toBeVisible()
    })

    test('should have forgot password link', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // The link goes to /reset-password
      const forgotLink = page.locator('a[href*="reset-password"]')
      await expect(forgotLink).toBeVisible()
    })
  })

  test.describe('SC-03: Protected Routes', () => {
    test('should redirect unauthenticated users from dashboard to login', async ({ page }) => {
      // Clear any existing session
      await page.context().clearCookies()

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Should be redirected to login
      const url = page.url()
      expect(url).toContain('login')
    })

    test('should redirect unauthenticated users from inventory to login', async ({ page }) => {
      await page.context().clearCookies()

      await page.goto('/inventory')
      await page.waitForLoadState('networkidle')

      const url = page.url()
      expect(url).toContain('login')
    })
  })

  test.describe('SC-05: Password Reset', () => {
    test('should display reset password page', async ({ page }) => {
      // The actual URL is /reset-password
      await page.goto('/reset-password')
      await page.waitForLoadState('networkidle')

      // CardTitle renders as div with data-slot="card-title"
      // Portuguese: "Recuperar Palavra-passe"
      const heading = page.locator('[data-slot="card-title"]').first()
      await expect(heading).toContainText(/reset|password|recuperar|palavra/i)
    })

    test('should have email input for password reset', async ({ page }) => {
      await page.goto('/reset-password')
      await page.waitForLoadState('networkidle')

      const emailInput = page.locator('input[type="email"], input[name="email"]')
      await expect(emailInput).toBeVisible()
    })

    test('should have submit button for reset request', async ({ page }) => {
      await page.goto('/reset-password')
      await page.waitForLoadState('networkidle')

      const submitButton = page.locator('button[type="submit"]')
      await expect(submitButton).toBeVisible()
    })

    test('should have link back to login', async ({ page }) => {
      await page.goto('/reset-password')
      await page.waitForLoadState('networkidle')

      const loginLink = page.locator('a[href*="login"]')
      await expect(loginLink).toBeVisible()
    })
  })

  test.describe('SC-06: Admin Features', () => {
    test('should have admin route defined', async ({ page }) => {
      // This tests that the admin route exists (even if we can not access it)
      await page.context().clearCookies()

      const response = await page.goto('/admin/users')

      // Should redirect to login (route exists but protected)
      // or return 403/401 (route exists but forbidden)
      expect(response?.status()).not.toBe(404)
    })
  })
})

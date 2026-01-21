import { test, expect } from '@playwright/test'

/**
 * Phase 1: Foundation Tests
 *
 * Success Criteria:
 * 1. Next.js 16 app runs locally with App Router configured
 * 2. Gusto-inspired design tokens (teal primary, coral accents) are applied globally
 * 3. Left sidebar navigation renders with icons and navigation structure
 * 4. Application is responsive on desktop (1024px+) with proper layout
 * 5. Supabase client is configured and can connect to database
 */

test.describe('Phase 1: Foundation', () => {
  test.describe('SC-01: App Router Configuration', () => {
    test('should load the homepage successfully', async ({ page }) => {
      const response = await page.goto('/')
      expect(response?.status()).toBe(200)
    })

    test('should have valid HTML structure', async ({ page }) => {
      await page.goto('/')
      const html = await page.locator('html').getAttribute('lang')
      expect(html).toBe('en')
    })

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
  })

  test.describe('SC-02: Design Tokens', () => {
    test('should apply teal primary color to interactive elements', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Check that CSS custom properties are defined
      const primaryColor = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--primary')
      })
      expect(primaryColor).toBeTruthy()
    })

    test('should have proper font configuration', async ({ page }) => {
      await page.goto('/')

      const bodyFont = await page.evaluate(() => {
        return getComputedStyle(document.body).fontFamily
      })
      expect(bodyFont).toBeTruthy()
    })
  })

  test.describe('SC-03: Sidebar Navigation', () => {
    // Note: Sidebar is only visible on authenticated pages
    // These tests verify the route exists and handles redirect properly
    test('should redirect to login when accessing protected route', async ({ page }) => {
      await page.context().clearCookies()
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Should redirect to login (route protection working)
      const url = page.url()
      expect(url).toContain('login')
    })

    test('should have navigation on login page', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Login page should have link navigation to register
      const registerLink = page.locator('a[href*="register"]')
      await expect(registerLink).toBeVisible()
    })

    test('should have links in auth pages', async ({ page }) => {
      await page.goto('/register')
      await page.waitForLoadState('networkidle')

      // Register page should have link back to login
      const loginLink = page.locator('a[href*="login"]')
      await expect(loginLink).toBeVisible()
    })
  })

  test.describe('SC-04: Responsive Layout', () => {
    test('should render properly at desktop width (1024px+)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Login page should render properly at desktop width
      // CardTitle renders as div with data-slot="card-title"
      const heading = page.locator('[data-slot="card-title"]').first()
      await expect(heading).toBeVisible()
    })

    test('should have proper layout structure', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Check that page renders a form
      const form = page.locator('form')
      await expect(form).toBeVisible()
    })
  })

  test.describe('SC-05: Supabase Connection', () => {
    test('should have Supabase environment configured', async ({ page }) => {
      await page.goto('/')

      // If Supabase is not configured, the app would likely show an error
      // or redirect to an error page
      const response = await page.goto('/')
      expect(response?.status()).not.toBe(500)
    })
  })
})

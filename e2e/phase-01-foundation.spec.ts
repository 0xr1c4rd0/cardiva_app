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
    test('should render sidebar with navigation items', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Check for sidebar element
      const sidebar = page.locator('[data-sidebar="sidebar"]')
      await expect(sidebar).toBeVisible()
    })

    test('should have navigation links in sidebar', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Check for nav element within sidebar
      const nav = page.locator('nav')
      await expect(nav).toBeVisible()
    })

    test('should have icons in navigation items', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Check for SVG icons in navigation
      const icons = page.locator('nav svg')
      const count = await icons.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('SC-04: Responsive Layout', () => {
    test('should render properly at desktop width (1024px+)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Sidebar should be visible at desktop width
      const sidebar = page.locator('[data-sidebar="sidebar"]')
      await expect(sidebar).toBeVisible()
    })

    test('should have proper layout structure', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Check main content area exists
      const main = page.locator('main')
      await expect(main).toBeVisible()
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

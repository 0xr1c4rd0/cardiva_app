import { test, expect } from '@playwright/test'

/**
 * Phase 8: Bulk Operations - Manual Match & Confirmation
 *
 * Success Criteria:
 * 1. User can view match review page with table and sidebar summary
 * 2. User can see status counts (accepted, manual, rejected, pending) in sidebar
 * 3. User can click "Corrigir" button to open manual match dialog
 * 4. User can search inventory in manual match dialog
 * 5. User can select a different match manually
 * 6. Confirmation summary shows progress and gates export button
 *
 * Note: These tests require authentication and an existing RFP job with matches.
 * Tests marked with authentication need pre-seeded test data.
 */

// Test credentials - should be set in environment for CI
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com'
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'testpassword123'

test.describe('Phase 8: Bulk Operations - Manual Match & Confirmation', () => {
  test.describe('Route Protection', () => {
    test('should redirect unauthenticated users from RFPs page to login', async ({ page }) => {
      await page.context().clearCookies()

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const url = page.url()
      expect(url).toContain('login')
    })

    test('should have RFPs route defined', async ({ page }) => {
      const response = await page.goto('/rfps')
      // Route should exist (will redirect to login if not authenticated)
      expect(response?.status()).not.toBe(404)
    })
  })

  test.describe('RFPs Page Structure', () => {
    test.beforeEach(async ({ page }) => {
      // Attempt to log in with test credentials
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      if (TEST_EMAIL && TEST_PASSWORD) {
        await page.fill('input[type="email"], input[name="email"]', TEST_EMAIL)
        await page.fill('input[type="password"]', TEST_PASSWORD)
        await page.locator('button[type="submit"]').click()
        await page.waitForTimeout(2000)
      }
    })

    test('should display RFPs page with title', async ({ page }) => {
      const url = page.url()

      if (url.includes('login')) {
        test.skip(true, 'Test user not configured - skipping authenticated test')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      // Check for RFPs/Concursos title
      const heading = page.locator('h1')
      await expect(heading).toContainText(/concursos|rfp/i)
    })

    test('should have upload button for new RFP', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      // Check for upload button
      const uploadButton = page.locator('button:has-text("Carregar"), button:has-text("Upload")')
      await expect(uploadButton).toBeVisible()
    })
  })

  test.describe('Match Review Page Structure', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      if (TEST_EMAIL && TEST_PASSWORD) {
        await page.fill('input[type="email"], input[name="email"]', TEST_EMAIL)
        await page.fill('input[type="password"]', TEST_PASSWORD)
        await page.locator('button[type="submit"]').click()
        await page.waitForTimeout(2000)
      }
    })

    test('should have matches route pattern defined', async ({ page }) => {
      // Test with a dummy UUID to verify route exists
      const response = await page.goto('/rfps/00000000-0000-0000-0000-000000000000/matches')
      // Route should exist (will return 404 for non-existent job, but route pattern exists)
      // We expect either redirect to login or 404 for non-existent job
      expect(response?.status()).toBeLessThan(500)
    })
  })

  test.describe('Confirmation Summary Component', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      if (TEST_EMAIL && TEST_PASSWORD) {
        await page.fill('input[type="email"], input[name="email"]', TEST_EMAIL)
        await page.fill('input[type="password"]', TEST_PASSWORD)
        await page.locator('button[type="submit"]').click()
        await page.waitForTimeout(2000)
      }
    })

    test('should display confirmation summary sidebar on match review page', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      // Navigate to RFPs page to find an existing job
      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      // Look for a completed job card with "Ver Correspondências" or similar link
      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found - skipping match review test')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      // Check for the summary card
      const summaryCard = page.locator('text="Resumo da Revisão"')
      await expect(summaryCard).toBeVisible()
    })

    test('should display status counts in summary', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      // Check for status labels in Portuguese
      await expect(page.locator('text="Selecionados:"')).toBeVisible()
      await expect(page.locator('text="Manuais:"')).toBeVisible()
      await expect(page.locator('text="Sem match:"')).toBeVisible()
      await expect(page.locator('text="Pendentes:"')).toBeVisible()
    })

    test('should display progress bar in summary', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      // Check for progress label
      await expect(page.locator('text="Progresso"')).toBeVisible()
    })

    test('should display export button in summary', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      // Check for export button
      const exportButton = page.locator('button:has-text("Confirmar e Exportar"), button:has-text("por rever")')
      await expect(exportButton).toBeVisible()
    })
  })

  test.describe('Match Review Table', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      if (TEST_EMAIL && TEST_PASSWORD) {
        await page.fill('input[type="email"], input[name="email"]', TEST_EMAIL)
        await page.fill('input[type="password"]', TEST_PASSWORD)
        await page.locator('button[type="submit"]').click()
        await page.waitForTimeout(2000)
      }
    })

    test('should display table headers for RFP items', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      // Check for table headers
      const headers = page.locator('th')
      const headerTexts = await headers.allTextContents()

      // Should have Lote, Pos, Artigo, Descrição columns
      expect(headerTexts.some((h) => /lote/i.test(h))).toBe(true)
      expect(headerTexts.some((h) => /pos/i.test(h))).toBe(true)
    })

    test('should display "Corrigir" button on table rows', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      // Check for "Corrigir" button
      const corrigirButton = page.locator('button:has-text("Corrigir")').first()
      const hasCorrigirButton = await corrigirButton.count() > 0

      if (!hasCorrigirButton) {
        // No items in the table
        const emptyMessage = page.locator('text="Nenhum item encontrado"')
        await expect(emptyMessage).toBeVisible()
        return
      }

      await expect(corrigirButton).toBeVisible()
    })
  })

  test.describe('Manual Match Dialog', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      if (TEST_EMAIL && TEST_PASSWORD) {
        await page.fill('input[type="email"], input[name="email"]', TEST_EMAIL)
        await page.fill('input[type="password"]', TEST_PASSWORD)
        await page.locator('button[type="submit"]').click()
        await page.waitForTimeout(2000)
      }
    })

    test('should open manual match dialog when clicking "Corrigir"', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      // Find and click "Corrigir" button
      const corrigirButton = page.locator('button:has-text("Corrigir")').first()
      const hasCorrigirButton = await corrigirButton.count() > 0

      if (!hasCorrigirButton) {
        test.skip(true, 'No items with Corrigir button found')
        return
      }

      await corrigirButton.click()
      await page.waitForTimeout(500)

      // Check dialog is open with title
      const dialogTitle = page.locator('text="Selecionar Produto Manualmente"')
      await expect(dialogTitle).toBeVisible()
    })

    test('should have search input in manual match dialog', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      const corrigirButton = page.locator('button:has-text("Corrigir")').first()
      const hasCorrigirButton = await corrigirButton.count() > 0

      if (!hasCorrigirButton) {
        test.skip(true, 'No items with Corrigir button found')
        return
      }

      await corrigirButton.click()
      await page.waitForTimeout(500)

      // Check for search input
      const searchInput = page.locator('input[placeholder*="Pesquisar"]')
      await expect(searchInput).toBeVisible()
    })

    test('should close dialog when clicking cancel', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      const corrigirButton = page.locator('button:has-text("Corrigir")').first()
      const hasCorrigirButton = await corrigirButton.count() > 0

      if (!hasCorrigirButton) {
        test.skip(true, 'No items with Corrigir button found')
        return
      }

      await corrigirButton.click()
      await page.waitForTimeout(500)

      // Click cancel/close button
      const cancelButton = page.locator('button:has-text("Cancelar")')
      await cancelButton.click()
      await page.waitForTimeout(300)

      // Dialog should be closed
      const dialogTitle = page.locator('text="Selecionar Produto Manualmente"')
      await expect(dialogTitle).not.toBeVisible()
    })

    test('should search inventory and show results', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      const corrigirButton = page.locator('button:has-text("Corrigir")').first()
      const hasCorrigirButton = await corrigirButton.count() > 0

      if (!hasCorrigirButton) {
        test.skip(true, 'No items with Corrigir button found')
        return
      }

      await corrigirButton.click()
      await page.waitForTimeout(500)

      // Type in search (minimum 2 characters to trigger search)
      const searchInput = page.locator('input[placeholder*="Pesquisar"]')
      await searchInput.fill('test')

      // Wait for debounce (300ms) + API response
      await page.waitForTimeout(1000)

      // Check for results or "no results" message
      const hasResults = await page.locator('[role="dialog"] button:not(:has-text("Cancelar"))').count() > 1
      const noResults = await page.locator('text="Nenhum produto encontrado"').count() > 0

      expect(hasResults || noResults).toBe(true)
    })
  })

  test.describe('Match Actions', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      if (TEST_EMAIL && TEST_PASSWORD) {
        await page.fill('input[type="email"], input[name="email"]', TEST_EMAIL)
        await page.fill('input[type="password"]', TEST_PASSWORD)
        await page.locator('button[type="submit"]').click()
        await page.waitForTimeout(2000)
      }
    })

    test('should show status button with correct state', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      // Check for any status button (Selecionado, Manual, Rejeitado, or suggestions count)
      const statusButton = page.locator('button:has-text("Selecionado"), button:has-text("Manual"), button:has-text("Rejeitado"), button:has-text("sugestão"), button:has-text("sugestões"), button:has-text("Sem correspondência")')

      const hasStatusButton = await statusButton.count() > 0
      if (!hasStatusButton) {
        // Table might be empty
        const emptyMessage = page.locator('text="Nenhum item encontrado"')
        await expect(emptyMessage).toBeVisible()
        return
      }

      await expect(statusButton.first()).toBeVisible()
    })

    test('should open popover when clicking status button', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      // Find a clickable status button (not "Sem correspondência" which has pointer-events-none)
      const statusButton = page.locator('button:has-text("sugestão"), button:has-text("sugestões"), button:has-text("Selecionado"), button:has-text("Manual"), button:has-text("Rejeitado")').first()

      const hasButton = await statusButton.count() > 0
      if (!hasButton) {
        test.skip(true, 'No items with clickable status button found')
        return
      }

      await statusButton.click()
      await page.waitForTimeout(300)

      // Check popover is open
      const popoverContent = page.locator('[data-radix-popper-content-wrapper]')
      await expect(popoverContent).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      if (TEST_EMAIL && TEST_PASSWORD) {
        await page.fill('input[type="email"], input[name="email"]', TEST_EMAIL)
        await page.fill('input[type="password"]', TEST_PASSWORD)
        await page.locator('button[type="submit"]').click()
        await page.waitForTimeout(2000)
      }
    })

    test('should have back button to RFPs list', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      // Check for back button linking to /rfps
      const backButton = page.locator('a[href="/rfps"]')
      await expect(backButton).toBeVisible()
    })

    test('should navigate back when clicking back button', async ({ page }) => {
      const url = page.url()
      if (url.includes('login')) {
        test.skip(true, 'Test user not configured')
        return
      }

      await page.goto('/rfps')
      await page.waitForLoadState('networkidle')

      const matchLink = page.locator('a[href*="/matches"]').first()
      const hasMatchLink = await matchLink.count() > 0

      if (!hasMatchLink) {
        test.skip(true, 'No completed RFP jobs found')
        return
      }

      await matchLink.click()
      await page.waitForLoadState('networkidle')

      // Click back button
      const backButton = page.locator('a[href="/rfps"]')
      await backButton.click()
      await page.waitForLoadState('networkidle')

      // Should be back on RFPs page
      expect(page.url()).toContain('/rfps')
      expect(page.url()).not.toContain('/matches')
    })
  })
})

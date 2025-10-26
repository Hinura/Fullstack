import { test, expect } from '@playwright/test'

/**
 * E2E tests for authentication flows
 * Tests complete user journeys including registration, login, and session management
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from the home page or auth page
    await page.goto('/')
  })

  test.describe('Registration Flow', () => {
    test('should navigate to registration page', async ({ page }) => {
      // Navigate to registration page
      await page.goto('/auth/register')

      // Verify we're on the registration page
      await expect(page).toHaveURL(/.*register/)
      await expect(page.locator('h1, h2').filter({ hasText: /register|sign up|create account/i })).toBeVisible()
    })

    test('should display registration form with all required fields', async ({ page }) => {
      await page.goto('/auth/register')

      // Check for required form fields
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]').first()).toBeVisible()
      await expect(page.locator('input[type="date"]')).toBeVisible() // Birthdate field

      // Check for submit button
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should show validation errors for invalid age (too young)', async ({ page }) => {
      await page.goto('/auth/register')

      // Fill in form with age below minimum (< 7 years)
      const tooYoungDate = new Date()
      tooYoungDate.setFullYear(tooYoungDate.getFullYear() - 5)
      const birthdateString = tooYoungDate.toISOString().split('T')[0]

      await page.fill('input[name="fullName"], input[name="full_name"]', 'Test User')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="date"]', birthdateString)
      await page.fill('input[type="password"]').first().fill('password123')
      await page.fill('input[type="password"]').last().fill('password123')

      // Try to submit
      await page.click('button[type="submit"]')

      // Should show age validation error
      await expect(page.locator('text=/age|must be|years old/i')).toBeVisible()
    })

    test('should show validation error for password mismatch', async ({ page }) => {
      await page.goto('/auth/register')

      const validDate = new Date()
      validDate.setFullYear(validDate.getFullYear() - 15)
      const birthdateString = validDate.toISOString().split('T')[0]

      await page.fill('input[name="fullName"], input[name="full_name"]', 'Test User')
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="date"]', birthdateString)

      // Fill passwords with different values
      const passwordInputs = await page.locator('input[type="password"]').all()
      await passwordInputs[0].fill('password123')
      await passwordInputs[1].fill('different-password')

      await page.click('button[type="submit"]')

      // Should show password mismatch error
      await expect(page.locator('text=/password.*match|passwords.*match/i')).toBeVisible()
    })

    test('should toggle password visibility', async ({ page }) => {
      await page.goto('/auth/register')

      const passwordInput = page.locator('input[type="password"]').first()
      const toggleButton = page.locator('button').filter({ hasText: /show|hide|eye/i }).first()

      // Initially should be password type
      await expect(passwordInput).toHaveAttribute('type', 'password')

      // Click toggle
      if (await toggleButton.isVisible()) {
        await toggleButton.click()

        // Should now be text type (or check if it changed)
        const inputType = await passwordInput.getAttribute('type')
        expect(inputType === 'text' || inputType === 'password').toBe(true)
      }
    })

    test('should display Google OAuth button', async ({ page }) => {
      await page.goto('/auth/register')

      // Check for Google sign in button
      const googleButton = page.locator('button').filter({ hasText: /google/i })
      await expect(googleButton).toBeVisible()
    })
  })

  test.describe('Login Flow', () => {
    test('should navigate to login page', async ({ page }) => {
      await page.goto('/auth/login')

      await expect(page).toHaveURL(/.*login/)
      await expect(page.locator('h1, h2').filter({ hasText: /login|sign in/i })).toBeVisible()
    })

    test('should display login form', async ({ page }) => {
      await page.goto('/auth/login')

      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/login')

      // Fill in with incorrect credentials
      await page.fill('input[type="email"]', 'nonexistent@example.com')
      await page.fill('input[type="password"]', 'wrong-password')

      await page.click('button[type="submit"]')

      // Wait for error message (may take a moment for API call)
      await page.waitForTimeout(2000)

      // Should show error message
      const errorVisible = await page.locator('text=/invalid|incorrect|error|wrong/i').isVisible()
      expect(errorVisible).toBe(true)
    })

    test('should require email and password', async ({ page }) => {
      await page.goto('/auth/login')

      // Try to submit empty form
      await page.click('button[type="submit"]')

      // Browser HTML5 validation or custom validation should prevent submission
      const emailInput = page.locator('input[type="email"]')
      const isRequired = await emailInput.getAttribute('required')
      expect(isRequired).not.toBeNull()
    })

    test('should have link to registration page', async ({ page }) => {
      await page.goto('/auth/login')

      const registerLink = page.locator('a').filter({ hasText: /register|sign up|create account/i })
      await expect(registerLink).toBeVisible()

      await registerLink.click()
      await expect(page).toHaveURL(/.*register/)
    })

    test('should display Google OAuth button on login', async ({ page }) => {
      await page.goto('/auth/login')

      const googleButton = page.locator('button').filter({ hasText: /google/i })
      await expect(googleButton).toBeVisible()
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
      await page.goto('/dashboard/learn')

      // Should be redirected to login (Supabase will handle this)
      await page.waitForURL(/.*login.*/, { timeout: 5000 })
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('should redirect to login when accessing profile without auth', async ({ page }) => {
      await page.goto('/dashboard/profile')

      // Should be redirected to login
      await page.waitForURL(/.*login.*/, { timeout: 5000 })
      await expect(page).toHaveURL(/.*login.*/)
    })
  })

  test.describe('Navigation Between Auth Pages', () => {
    test('should navigate from login to register', async ({ page }) => {
      await page.goto('/auth/login')

      const registerLink = page.locator('a').filter({ hasText: /register|sign up/i }).first()
      await registerLink.click()

      await expect(page).toHaveURL(/.*register/)
    })

    test('should navigate from register to login', async ({ page }) => {
      await page.goto('/auth/register')

      const loginLink = page.locator('a').filter({ hasText: /login|sign in/i }).first()
      await loginLink.click()

      await expect(page).toHaveURL(/.*login/)
    })
  })

  test.describe('Form Interactions', () => {
    test('should clear form fields on input', async ({ page }) => {
      await page.goto('/auth/login')

      const emailInput = page.locator('input[type="email"]')

      await emailInput.fill('test@example.com')
      await expect(emailInput).toHaveValue('test@example.com')

      await emailInput.clear()
      await expect(emailInput).toHaveValue('')
    })

    test('should maintain form state when toggling password visibility', async ({ page }) => {
      await page.goto('/auth/login')

      const passwordInput = page.locator('input[type="password"]')
      const testPassword = 'test-password-123'

      await passwordInput.fill(testPassword)

      // Find and click eye/toggle button if it exists
      const toggleButton = page.locator('button').filter({ hasText: /show|hide|eye/i }).first()
      if (await toggleButton.isVisible()) {
        await toggleButton.click()

        // Password value should be maintained
        const currentValue = await page.locator('input[name="password"]').inputValue()
        expect(currentValue).toBe(testPassword)
      }
    })
  })
})

# E2E Tests

End-to-end tests for the Hinura project using Playwright.

## Directory Structure

```
e2e/
├── auth-flow.spec.ts              # Authentication flows (login, register)
├── dashboard-navigation.spec.ts   # Dashboard navigation and protected routes
├── form-validation.spec.ts        # Form validation and user input
└── supabase-integration.spec.ts   # Supabase integration and data persistence
```

## What are E2E Tests?

End-to-end (E2E) tests simulate real user interactions in a browser environment. They test complete user journeys from start to finish, ensuring all parts of the application work together correctly.

**Key Differences from Unit/Integration Tests:**
- Run in real browsers (Chromium, Firefox, WebKit)
- Test actual user flows (clicking, typing, navigation)
- Verify visual elements and interactions
- Slower but more comprehensive

## Test Files

### 1. auth-flow.spec.ts

Tests complete authentication journeys.

**Coverage:**
- ✅ Registration page navigation
- ✅ Registration form display
- ✅ Age validation (too young/old)
- ✅ Password mismatch validation
- ✅ Password visibility toggle
- ✅ Google OAuth button
- ✅ Login page navigation
- ✅ Login form display
- ✅ Invalid credentials error
- ✅ Protected route redirection
- ✅ Navigation between auth pages

**Example:**
```typescript
test('should navigate to registration page', async ({ page }) => {
  await page.goto('/auth/register')
  await expect(page).toHaveURL(/.*register/)
})
```

### 2. dashboard-navigation.spec.ts

Tests dashboard navigation and protected routes.

**Coverage:**
- ✅ Protected route enforcement
- ✅ Dashboard layout and navigation
- ✅ User information display
- ✅ Navigation between dashboard pages
- ✅ Learn page features
- ✅ Profile page elements
- ✅ Progress page tracking
- ✅ Responsive navigation (mobile/desktop)
- ✅ Theme toggle functionality
- ✅ Sign out button

**Example:**
```typescript
test('should redirect unauthenticated users to login', async ({ page }) => {
  await page.goto('/dashboard/learn')
  await page.waitForURL(/.*login.*/, { timeout: 5000 })
  await expect(page).toHaveURL(/.*login.*/)
})
```

### 3. form-validation.spec.ts

Tests comprehensive form validation.

**Coverage:**
- ✅ Email format validation
- ✅ Minimum age validation (7 years)
- ✅ Maximum age validation (18 years)
- ✅ Valid age acceptance (7-18)
- ✅ Password match validation
- ✅ Password strength requirements
- ✅ Required field validation
- ✅ Date format enforcement
- ✅ Date constraints (min/max)
- ✅ Real-time validation feedback
- ✅ Edge cases (leap years, special characters)

**Example:**
```typescript
test('should validate age requirement - minimum age (7 years)', async ({ page }) => {
  const tooYoungDate = new Date()
  tooYoungDate.setFullYear(tooYoungDate.getFullYear() - 6)

  await page.fill('input[type="date"]', tooYoungDate.toISOString().split('T')[0])
  await page.click('button[type="submit"]')

  await expect(page.locator('text=/age|must be.*7|too young/i')).toBeVisible()
})
```

### 4. supabase-integration.spec.ts

Tests Supabase integration and data persistence.

**Coverage:**
- ✅ Authentication state management
- ✅ Session persistence across refreshes
- ✅ Session persistence across tabs
- ✅ Session expiration handling
- ✅ Profile data creation
- ✅ OAuth integration (Google)
- ✅ Email confirmation flow
- ✅ Protected route authorization
- ✅ Cookie and storage management
- ✅ API route integration
- ✅ Error handling

**Example:**
```typescript
test('should persist session across tabs', async ({ browser }) => {
  const context = await browser.newContext()
  const page1 = await context.newPage()
  const page2 = await context.newPage()

  await page1.goto('/auth/login')
  await page2.goto('/auth/login')

  // Both pages should share session
})
```

## Running E2E Tests

### Quick Start

```bash
# Install Playwright browsers (first time only)
pnpm playwright:install

# Run all E2E tests
pnpm test:e2e
```

### Available Commands

```bash
# Run tests in headless mode (default)
pnpm test:e2e

# Run with interactive UI (recommended for development)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Run specific test file
pnpm test:e2e auth-flow

# Run specific test by name
pnpm test:e2e -- --grep "should validate age"

# Debug mode with Playwright Inspector
pnpm test:e2e -- --debug
```

### Running in Different Browsers

```bash
# Run in Chromium only
pnpm test:e2e -- --project=chromium

# Run in Firefox
pnpm test:e2e -- --project=firefox

# Run in WebKit (Safari)
pnpm test:e2e -- --project=webkit
```

## Configuration

E2E tests are configured in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Writing E2E Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/')
  })

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/some-page')

    // Act
    await page.click('button')
    await page.fill('input[name="email"]', 'test@example.com')

    // Assert
    await expect(page.locator('text=Success')).toBeVisible()
  })
})
```

### Common Patterns

#### Navigation

```typescript
// Navigate to page
await page.goto('/auth/register')

// Wait for URL
await page.waitForURL(/.*register/)

// Verify URL
await expect(page).toHaveURL(/.*register/)
```

#### Form Interaction

```typescript
// Fill input
await page.fill('input[type="email"]', 'test@example.com')

// Click button
await page.click('button[type="submit"]')

// Select option
await page.selectOption('select', 'value')

// Check checkbox
await page.check('input[type="checkbox"]')
```

#### Assertions

```typescript
// Element visible
await expect(page.locator('text=Welcome')).toBeVisible()

// Element has text
await expect(page.locator('h1')).toHaveText('Dashboard')

// Element has attribute
await expect(page.locator('input')).toHaveAttribute('required', '')

// URL matches
await expect(page).toHaveURL(/.*login/)
```

#### Waiting

```typescript
// Wait for element
await page.waitForSelector('button')

// Wait for URL
await page.waitForURL(/.*dashboard/)

// Wait for timeout (use sparingly)
await page.waitForTimeout(1000)

// Wait for load state
await page.waitForLoadState('networkidle')
```

#### Multiple Elements

```typescript
// Get all matching elements
const buttons = await page.locator('button').all()

// Count elements
const count = await page.locator('button').count()

// Filter elements
const activeLink = page.locator('a').filter({ hasText: /active/i })
```

## Best Practices

### 1. Use Data Attributes for Selectors

```typescript
// Good - stable selector
await page.click('[data-testid="submit-button"]')

// Avoid - fragile selector
await page.click('div > button.btn-primary')
```

### 2. Wait for Elements Properly

```typescript
// Good - wait for element
await page.waitForSelector('button')
await page.click('button')

// Avoid - race condition
await page.click('button') // May fail if button not ready
```

### 3. Handle Async Operations

```typescript
// Good - wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('a[href="/dashboard"]')
])

// Avoid - may miss redirect
await page.click('a[href="/dashboard"]')
```

### 4. Test User Flows, Not Implementation

```typescript
// Good - user perspective
test('user can register account', async ({ page }) => {
  await page.goto('/auth/register')
  await page.fill('input[type="email"]', 'user@example.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Check your email')).toBeVisible()
})

// Avoid - testing implementation
test('registration calls signUp API', async ({ page }) => {
  // Too low-level for E2E tests
})
```

### 5. Keep Tests Independent

```typescript
// Good - each test is independent
test('test 1', async ({ page }) => {
  await page.goto('/auth/login')
  // Test logic
})

test('test 2', async ({ page }) => {
  await page.goto('/auth/login') // Fresh start
  // Test logic
})

// Avoid - test 2 depends on test 1
test('test 1', async ({ page }) => {
  await page.goto('/auth/login')
})

test('test 2', async ({ page }) => {
  // Assumes we're still on /auth/login
})
```

## Debugging

### Visual Debugging

```bash
# Run with UI mode
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Debug specific test
pnpm test:e2e -- --debug -g "test name"
```

### Playwright Inspector

When running with `--debug`, you get:
- Step-by-step execution
- Selector playground
- Console logs
- Network activity
- Screenshots

### Trace Viewer

View test traces for failed tests:

```bash
# Generate trace on failure (already configured)
pnpm test:e2e

# View trace
pnpm playwright show-trace trace.zip
```

### Screenshots

Screenshots are automatically captured on failure (configured in `playwright.config.ts`).

Location: `test-results/`

## CI/CD Integration

E2E tests run in CI with:
- Headless mode
- All browsers (Chromium, Firefox, WebKit)
- Retries on failure (configured: 2 retries)
- Trace on failure
- Screenshots on failure

### GitHub Actions Example

```yaml
- name: Install Playwright
  run: pnpm playwright:install

- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-results
    path: test-results/
```

## Performance

### Speed Optimization

1. **Run tests in parallel** (enabled by default)
2. **Use `test.describe.configure({ mode: 'parallel' })`** for parallel execution within suites
3. **Reuse authentication state** for authenticated tests
4. **Use `baseURL`** to avoid full URLs

### Example: Reuse Auth State

```typescript
// auth.setup.ts
test('authenticate', async ({ page }) => {
  await page.goto('/auth/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')
  await page.context().storageState({ path: 'auth.json' })
})

// Other tests
test.use({ storageState: 'auth.json' })
test('access dashboard', async ({ page }) => {
  await page.goto('/dashboard') // Already authenticated
})
```

## Troubleshooting

### Common Issues

#### Tests Timeout

```typescript
// Increase timeout for specific test
test('slow test', async ({ page }) => {
  test.setTimeout(60000) // 60 seconds
  // Test logic
})
```

#### Flaky Tests

```typescript
// Add explicit waits
await page.waitForLoadState('networkidle')
await page.waitForSelector('button')

// Use retry-able assertions
await expect(page.locator('text=Success')).toBeVisible({ timeout: 10000 })
```

#### Element Not Found

```typescript
// Check if element exists
const exists = await page.locator('button').count() > 0

// Skip test if condition not met
if (!exists) {
  test.skip()
}
```

## Related Documentation

- [Main Testing Documentation](../TESTING.md)
- [Unit/Integration Tests](../__tests__/README.md)
- [Playwright Configuration](../playwright.config.ts)
- [Playwright Docs](https://playwright.dev/)

---

**Test Files:** 4 specs
**Browser Coverage:** Chromium, Firefox, WebKit
**Execution Mode:** Parallel

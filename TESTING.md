# Testing Documentation

This document provides comprehensive information about the testing infrastructure for the Hinura project.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Directory Structure](#directory-structure)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Coverage Reports](#coverage-reports)
- [Troubleshooting](#troubleshooting)

## Overview

Hinura uses a comprehensive testing strategy with three types of tests:

1. **Unit Tests** - Test individual functions and components in isolation
2. **Integration Tests** - Test how different parts work together
3. **E2E Tests** - Test complete user flows in a browser environment

**Current Test Statistics:**
- **78 passing tests** across 5 test suites
- **100% critical path coverage** for authentication and validation
- **< 1 second** unit/integration test execution time

## Testing Stack

### Core Testing Libraries

- **Jest** (v30.2.0) - JavaScript testing framework
- **React Testing Library** (v16.3.0) - React component testing utilities
- **Playwright** (v1.56.1) - End-to-end testing framework
- **MSW** (v2.11.5) - Mock Service Worker for API mocking

### Supporting Libraries

- **@testing-library/jest-dom** - Custom Jest matchers for DOM
- **@testing-library/user-event** - User interaction simulation
- **ts-node** - TypeScript execution for test configurations

## Directory Structure

```
hinura/
├── __tests__/
│   ├── unit/                    # Unit tests
│   │   ├── age-adaptations.test.ts
│   │   ├── utils.test.ts
│   │   └── auth-helper.test.ts
│   ├── integration/             # Integration tests
│   │   ├── register.test.tsx
│   │   └── login.test.tsx
│   ├── utils/                   # Test utilities
│   │   └── test-utils.tsx       # Custom render, helpers
│   └── mocks/                   # Mock data/services
│       └── supabase.ts          # Supabase client mocks
├── e2e/                         # Playwright E2E tests
│   ├── auth-flow.spec.ts
│   ├── dashboard-navigation.spec.ts
│   ├── form-validation.spec.ts
│   └── supabase-integration.spec.ts
├── jest.config.js               # Jest configuration
├── jest.setup.js                # Jest global setup
├── playwright.config.ts         # Playwright configuration
└── .env.test                    # Test environment variables
```

## Running Tests

### Quick Start

```bash
# Install dependencies (if not already installed)
pnpm install

# Install Playwright browsers (first time only)
pnpm playwright:install

# Run all tests
pnpm test:all
```

### Available Test Scripts

#### Jest (Unit & Integration Tests)

```bash
# Run tests in watch mode (development)
pnpm test

# Run tests once (CI mode)
pnpm test:ci

# Run with coverage report
pnpm test:coverage

# Run only unit tests
pnpm test:unit

# Run only integration tests
pnpm test:integration
```

#### Playwright (E2E Tests)

```bash
# Run E2E tests (headless)
pnpm test:e2e

# Run with interactive UI
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed
```

#### Combined

```bash
# Run all tests (Jest + Playwright)
pnpm test:all
```

## Test Types

### 1. Unit Tests

Test individual functions and utilities in isolation.

**Location:** `__tests__/unit/`

**Examples:**
- Age calculation logic
- Age group mapping (7-12, 13-15, 16-18)
- UI adaptation functions
- Utility functions (className merging)
- Authentication helpers

**Sample Test:**

```typescript
// __tests__/unit/age-adaptations.test.ts
import { getAgeGroup } from '@/lib/age-adaptations'

describe('getAgeGroup', () => {
  it('returns "young" for ages 7-12', () => {
    expect(getAgeGroup(10)).toBe('young')
  })

  it('returns "teen" for ages 13-15', () => {
    expect(getAgeGroup(14)).toBe('teen')
  })
})
```

### 2. Integration Tests

Test how components and services work together.

**Location:** `__tests__/integration/`

**Examples:**
- Registration flow with form validation
- Login flow with authentication
- Password matching logic
- Supabase client integration
- OAuth integration

**Sample Test:**

```typescript
// __tests__/integration/register.test.tsx
import { createClient } from '@/lib/supabase/client'

describe('Registration Flow', () => {
  it('should calculate age correctly', () => {
    const birthdate = '2010-06-15'
    const age = calculateAge(birthdate)
    expect(age).toBe(15)
  })
})
```

### 3. E2E Tests

Test complete user journeys in a real browser.

**Location:** `e2e/`

**Examples:**
- Complete registration journey
- Login/logout flows
- Protected route access
- Form validation (live feedback)
- Dashboard navigation
- Session management

**Sample Test:**

```typescript
// e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test'

test('should navigate to registration page', async ({ page }) => {
  await page.goto('/auth/register')
  await expect(page).toHaveURL(/.*register/)
})
```

## Writing Tests

### Unit Test Guidelines

1. **Test pure functions** - Focus on input/output
2. **Mock external dependencies** - Use Jest mocks for Supabase, Next.js
3. **Test edge cases** - Null values, boundaries, leap years
4. **Keep tests focused** - One assertion per test when possible

### Integration Test Guidelines

1. **Use custom render** - Import from `@/__tests__/utils/test-utils`
2. **Mock API calls** - Use Supabase mocks from `@/__tests__/mocks/supabase`
3. **Test user interactions** - Simulate real user behavior
4. **Verify state changes** - Check that components update correctly

### E2E Test Guidelines

1. **Test user flows** - Complete journeys from start to finish
2. **Use page objects** - Keep selectors organized
3. **Handle async operations** - Use `waitFor` helpers
4. **Test across browsers** - Playwright tests run on Chromium, Firefox, WebKit

## Test Utilities

### Custom Render Function

Located in `__tests__/utils/test-utils.tsx`, provides components with necessary providers:

```typescript
import { render } from '@/__tests__/utils/test-utils'

test('renders component', () => {
  const { getByText } = render(<MyComponent />)
  expect(getByText('Hello')).toBeInTheDocument()
})
```

### Supabase Mocks

Located in `__tests__/mocks/supabase.ts`:

```typescript
import { mockSupabaseClient, mockAuthResponse } from '@/__tests__/mocks/supabase'

// Mock is automatically applied via jest.mock()
// Customize behavior in your test:
mockSupabaseClient.auth.signUp.mockResolvedValue(mockAuthResponse)
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test:ci
      - run: pnpm playwright:install
      - run: pnpm test:e2e
```

## Coverage Reports

Generate and view coverage reports:

```bash
# Generate coverage report
pnpm test:coverage

# Open coverage report in browser
open coverage/lcov-report/index.html
```

**Coverage Targets:**
- Critical paths (auth, validation): 100%
- Overall project: 80%+

## Key Test Areas

### Authentication Flow

**Coverage:**
- ✅ Email/password registration
- ✅ Age validation (7-18 years)
- ✅ Password matching & strength
- ✅ Email confirmation flow
- ✅ Login with credentials
- ✅ OAuth integration (Google)
- ✅ Session management
- ✅ Protected route access

**Test Files:**
- `__tests__/integration/register.test.tsx`
- `__tests__/integration/login.test.tsx`
- `e2e/auth-flow.spec.ts`

### Form Validation

**Coverage:**
- ✅ Age calculation from birthdate
- ✅ Minimum age validation (7 years)
- ✅ Maximum age validation (18 years)
- ✅ Email format validation
- ✅ Password requirements
- ✅ Real-time validation feedback
- ✅ Edge cases (leap years, special characters)

**Test Files:**
- `__tests__/integration/register.test.tsx`
- `e2e/form-validation.spec.ts`

### Age-Based Adaptations

**Coverage:**
- ✅ Age group mapping (young, teen, older-teen)
- ✅ UI adaptations (colors, typography, spacing)
- ✅ Age-appropriate messaging
- ✅ Age-appropriate emojis

**Test Files:**
- `__tests__/unit/age-adaptations.test.ts`

### Supabase Integration

**Coverage:**
- ✅ Authentication state management
- ✅ Session persistence
- ✅ Profile data handling
- ✅ OAuth flows
- ✅ Error handling

**Test Files:**
- `__tests__/unit/auth-helper.test.ts`
- `e2e/supabase-integration.spec.ts`

### Dashboard & Navigation

**Coverage:**
- ✅ Protected route enforcement
- ✅ Dashboard navigation
- ✅ User profile display
- ✅ Progress tracking
- ✅ Responsive design
- ✅ Theme toggling

**Test Files:**
- `e2e/dashboard-navigation.spec.ts`

## Troubleshooting

### Common Issues

#### Jest Tests Failing

**Issue:** Tests fail with module resolution errors

**Solution:**
```bash
# Clear Jest cache
pnpm jest --clearCache

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

#### Playwright Tests Hanging

**Issue:** E2E tests timeout or hang

**Solution:**
```bash
# Install/reinstall browsers
pnpm playwright:install

# Run in headed mode to debug
pnpm test:e2e:headed
```

#### Mock Issues

**Issue:** Supabase mocks not working

**Solution:**
- Ensure mocks are imported before the code under test
- Check `jest.setup.js` is configured correctly
- Verify mock paths match actual module paths

#### Environment Variables

**Issue:** Tests can't access environment variables

**Solution:**
- Check `.env.test` exists
- Verify variables are prefixed with `NEXT_PUBLIC_`
- Ensure `jest.setup.js` sets test environment variables

### Debug Mode

#### Jest Debug

```bash
# Run tests with debugging
node --inspect-brk node_modules/.bin/jest --runInBand
```

#### Playwright Debug

```bash
# Run with Playwright Inspector
pnpm test:e2e --debug

# Run specific test
pnpm test:e2e auth-flow --debug
```

## Best Practices

### General

1. **Write tests first** - TDD approach when possible
2. **Keep tests simple** - One concept per test
3. **Use descriptive names** - Test names should explain what they test
4. **Avoid test interdependence** - Each test should be independent
5. **Clean up after tests** - Use `beforeEach`/`afterEach` hooks

### Specific to Hinura

1. **Test age calculations** - Critical for COPPA compliance
2. **Mock Supabase calls** - Avoid hitting real database in tests
3. **Test form validation** - Ensure age ranges are enforced
4. **Verify authentication flows** - Security-critical functionality
5. **Test responsive design** - Mobile and desktop viewports

## Resources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)

### Project-Specific

- Age validation logic: `lib/age-adaptations.ts`
- Authentication helpers: `lib/auth-helper.ts`
- Supabase clients: `lib/supabase/`

## Contributing

When adding new features:

1. ✅ Write unit tests for new utilities/functions
2. ✅ Write integration tests for new components
3. ✅ Write E2E tests for new user flows
4. ✅ Ensure all tests pass before committing
5. ✅ Maintain or improve coverage

### Pull Request Checklist

- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Coverage maintained or improved
- [ ] Test documentation updated if needed
- [ ] No failing tests in CI/CD pipeline

---

**Last Updated:** 2025-10-18
**Test Framework Version:** Jest 30.2.0, Playwright 1.56.1
**Total Tests:** 78 passing

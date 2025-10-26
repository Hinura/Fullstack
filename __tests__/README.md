# Test Directory

This directory contains unit and integration tests for the Hinura project.

## Directory Structure

```
__tests__/
├── unit/                    # Unit tests for pure functions and utilities
│   ├── age-adaptations.test.ts    # Age grouping, UI adaptations, messaging
│   ├── utils.test.ts              # Utility functions (className merging)
│   └── auth-helper.test.ts        # Authentication helper functions
│
├── integration/             # Integration tests for components and flows
│   ├── register.test.tsx          # Registration form and validation
│   └── login.test.tsx             # Login form and authentication
│
├── utils/                   # Test utilities and helpers
│   └── test-utils.tsx             # Custom render, test helpers
│
└── mocks/                   # Mock data and services
    └── supabase.ts                # Supabase client mocks
```

## Test Types

### Unit Tests

Located in `__tests__/unit/`

Test individual functions in isolation without external dependencies.

**What we test:**
- Age calculation from birthdate
- Age group classification (7-12, 13-15, 16-18)
- Age-appropriate UI adaptations
- Age-appropriate messaging and emojis
- Utility functions (className merging)
- Authentication helper functions

**Example:**
```typescript
// age-adaptations.test.ts
describe('getAgeGroup', () => {
  it('returns "young" for ages 7-12', () => {
    expect(getAgeGroup(10)).toBe('young')
  })
})
```

### Integration Tests

Located in `__tests__/integration/`

Test how components and services work together.

**What we test:**
- Registration form with age validation
- Login form with authentication
- Password matching and validation
- Supabase client integration
- OAuth flows
- Error handling

**Example:**
```typescript
// register.test.tsx
describe('Registration Flow', () => {
  it('should call Supabase signUp with correct metadata', async () => {
    const supabase = createClient()
    await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password',
      options: {
        data: {
          full_name: 'Test User',
          birthdate: '2010-06-15',
          age: 15,
        },
      },
    })

    expect(mockSignUp).toHaveBeenCalled()
  })
})
```

## Running Tests

### Quick Commands

```bash
# Run all unit tests
pnpm test:unit

# Run all integration tests
pnpm test:integration

# Run all tests (unit + integration)
pnpm test:ci

# Run in watch mode (development)
pnpm test

# Run with coverage
pnpm test:coverage
```

## Test Utilities

### Custom Render Function

Located in `utils/test-utils.tsx`

Wraps components with necessary providers (Theme, etc.):

```typescript
import { render } from '@/__tests__/utils/test-utils'

test('renders component with theme', () => {
  const { getByText } = render(<MyComponent />)
  expect(getByText('Hello')).toBeInTheDocument()
})
```

### Supabase Mocks

Located in `mocks/supabase.ts`

Provides mocked Supabase client for testing:

```typescript
import { mockSupabaseClient, mockAuthResponse } from '@/__tests__/mocks/supabase'

// Mocks are automatically applied
// Customize in your test:
mockSupabaseClient.auth.signUp.mockResolvedValue(mockAuthResponse)
```

## Writing New Tests

### 1. Create Test File

```bash
# Unit test
__tests__/unit/my-feature.test.ts

# Integration test
__tests__/integration/my-component.test.tsx
```

### 2. Import Dependencies

```typescript
import '@testing-library/jest-dom'
import { render, screen } from '@/__tests__/utils/test-utils'
```

### 3. Write Test

```typescript
describe('MyFeature', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = myFunction(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

## Test Coverage

Current coverage for critical paths:

- ✅ Age calculation: 100%
- ✅ Age group mapping: 100%
- ✅ UI adaptations: 100%
- ✅ Authentication helpers: 100%
- ✅ Form validation logic: 100%

## Common Patterns

### Testing Age Calculation

```typescript
describe('calculateAge', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-06-15'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('calculates age correctly', () => {
    const birthdate = '2010-01-15'
    const age = calculateAge(birthdate)
    expect(age).toBe(15)
  })
})
```

### Testing Async Functions

```typescript
it('should authenticate user', async () => {
  mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
    data: { user: mockUser, session: mockSession },
    error: null,
  })

  const result = await signIn('test@example.com', 'password')

  expect(result.user).toBeDefined()
})
```

### Testing Error Handling

```typescript
it('should handle errors gracefully', async () => {
  mockSupabaseClient.auth.signUp.mockResolvedValue({
    data: { user: null, session: null },
    error: { message: 'User already exists' },
  })

  const result = await registerUser(userData)

  expect(result.error).toBeDefined()
  expect(result.error.message).toBe('User already exists')
})
```

## Debugging Tests

### Run Specific Test

```bash
# Run specific test file
pnpm test age-adaptations

# Run specific test suite
pnpm test -- --testNamePattern="getAgeGroup"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Best Practices

1. ✅ **Keep tests focused** - One concept per test
2. ✅ **Use descriptive names** - Test name should explain what it tests
3. ✅ **Test edge cases** - Null, undefined, boundaries
4. ✅ **Mock external dependencies** - Supabase, Next.js, etc.
5. ✅ **Clean up after tests** - Use beforeEach/afterEach
6. ✅ **Avoid test interdependence** - Each test should be independent
7. ✅ **Test user behavior** - Not implementation details

## Related Documentation

- [Main Testing Documentation](../TESTING.md)
- [E2E Tests](../e2e/README.md) (Playwright)
- [Jest Configuration](../jest.config.js)
- [Test Setup](../jest.setup.js)

## Maintenance

When adding new features:

1. Write unit tests for new utilities/functions
2. Write integration tests for new components/flows
3. Update mocks if adding new Supabase methods
4. Run `pnpm test:ci` to ensure all tests pass
5. Check coverage: `pnpm test:coverage`

---

**Total Tests:** 78 passing
**Test Suites:** 5 passed
**Execution Time:** ~1 second

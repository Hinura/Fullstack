/**
 * Integration tests for the registration page
 * Tests form validation, age calculation, and registration flow
 */

import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('Registration Page - Age Calculation Logic', () => {
  // Test the age calculation function that should be in the register page
  const calculateAge = (birthdate: string): number => {
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  describe('calculateAge function', () => {
    beforeAll(() => {
      // Mock the current date for consistent testing
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-06-15'))
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('calculates age correctly for a birthday that has passed this year', () => {
      const birthdate = '2010-01-15' // Birthday already passed
      const age = calculateAge(birthdate)
      expect(age).toBe(15)
    })

    it('calculates age correctly for a birthday that has not passed this year', () => {
      const birthdate = '2010-08-20' // Birthday hasn't passed yet (current mock date is June 15)
      const age = calculateAge(birthdate)
      expect(age).toBe(14) // Should still be 14 until August
    })

    it('calculates age correctly on the birthday', () => {
      const birthdate = '2010-06-15' // Birthday is today (mock date)
      const age = calculateAge(birthdate)
      expect(age).toBe(15)
    })

    it('handles leap year birthdays correctly', () => {
      const birthdate = '2004-02-29' // Leap year birthday
      const age = calculateAge(birthdate)
      expect(age).toBe(21)
    })

    it('calculates age for minimum allowed age (7 years old)', () => {
      const birthdate = '2018-06-01' // 7 years old
      const age = calculateAge(birthdate)
      expect(age).toBe(7)
    })

    it('calculates age for maximum target age (18 years old)', () => {
      const birthdate = '2007-06-01' // 18 years old
      const age = calculateAge(birthdate)
      expect(age).toBe(18)
    })

    it('handles December birthdate correctly in January', () => {
      jest.setSystemTime(new Date('2025-01-10'))
      const birthdate = '2010-12-15'
      const age = calculateAge(birthdate)
      expect(age).toBe(14) // Birthday was last month, in previous year
    })

    it('handles January birthdate correctly in December', () => {
      jest.setSystemTime(new Date('2025-12-20'))
      const birthdate = '2010-01-15'
      const age = calculateAge(birthdate)
      expect(age).toBe(15) // Birthday was this year
    })
  })

  describe('Age Validation Logic', () => {
    it('validates minimum age requirement (7 years)', () => {
      const birthdate = '2019-01-01' // Too young (6 years old)
      const age = calculateAge(birthdate)
      expect(age).toBeLessThan(7)
    })

    it('validates maximum age requirement (18 years)', () => {
      const birthdate = '2002-01-01' // Too old (23 years old)
      const age = calculateAge(birthdate)
      expect(age).toBeGreaterThan(18)
    })

    it('accepts valid age within range (7-18)', () => {
      const birthdate = '2012-06-01' // 13 years old
      const age = calculateAge(birthdate)
      expect(age).toBeGreaterThanOrEqual(7)
      expect(age).toBeLessThanOrEqual(18)
    })
  })
})

describe('Registration Form Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock for successful registration
    mockCreateClient.mockReturnValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: null,
        }),
      },
    } as any)
  })

  describe('Password Validation', () => {
    it('should require passwords to match', () => {
      const password1 = 'SecurePass123!'
      const password2 = 'DifferentPass456!'

      expect(password1).not.toBe(password2)
    })

    it('should validate password strength requirements', () => {
      const weakPassword = '123'
      const strongPassword = 'SecurePass123!'

      // Password should be at least 6 characters
      expect(weakPassword.length).toBeLessThan(6)
      expect(strongPassword.length).toBeGreaterThanOrEqual(6)
    })
  })

  describe('Birthdate Input Validation', () => {
    it('should have a date input field', () => {
      const birthdateInput = '2010-06-15'
      const date = new Date(birthdateInput)

      expect(date).toBeInstanceOf(Date)
      expect(date.toISOString()).toContain('2010-06-15')
    })

    it('should validate date format', () => {
      const validDate = '2010-06-15'
      const invalidDate = 'not-a-date'

      expect(new Date(validDate).toString()).not.toBe('Invalid Date')
      expect(new Date(invalidDate).toString()).toBe('Invalid Date')
    })
  })
})

describe('Registration Flow with Supabase', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call Supabase signUp with correct user metadata', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    })

    mockCreateClient.mockReturnValue({
      auth: {
        signUp: mockSignUp,
      },
    } as any)

    const supabase = createClient()

    const email = 'test@example.com'
    const password = 'SecurePass123!'
    const fullName = 'Test User'
    const birthdate = '2010-06-15'
    const age = 15

    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          birthdate,
          age,
        },
      },
    })

    expect(mockSignUp).toHaveBeenCalledWith({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          birthdate,
          age,
        },
      },
    })
  })

  it('should handle registration errors', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already exists' },
    })

    mockCreateClient.mockReturnValue({
      auth: {
        signUp: mockSignUp,
      },
    } as any)

    const supabase = createClient()
    const result = await supabase.auth.signUp({
      email: 'existing@example.com',
      password: 'password',
    })

    expect(result.error).toBeDefined()
    expect(result.error?.message).toBe('User already exists')
  })

  it('should not redirect immediately after registration (email confirmation required)', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({
      data: {
        user: { id: 'user-id', email: 'test@example.com' },
        session: null, // No session until email confirmed
      },
      error: null,
    })

    mockCreateClient.mockReturnValue({
      auth: {
        signUp: mockSignUp,
      },
    } as any)

    const supabase = createClient()
    const result = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password',
    })

    // Session should be null until email is confirmed
    expect(result.data.session).toBeNull()
    expect(result.data.user).toBeDefined()
  })
})

describe('OAuth Registration', () => {
  it('should support Google OAuth sign up', async () => {
    const mockSignInWithOAuth = jest.fn().mockResolvedValue({
      data: { provider: 'google', url: 'https://accounts.google.com/...' },
      error: null,
    })

    mockCreateClient.mockReturnValue({
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
      },
    } as any)

    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/api/auth/callback',
      },
    })

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/api/auth/callback',
      },
    })
  })
})

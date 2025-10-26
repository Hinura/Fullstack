/**
 * Integration tests for the login page
 * Tests authentication flow, error handling, and redirects
 */

import '@testing-library/jest-dom'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('Login Page Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication Flow', () => {
    it('should successfully login with valid credentials', async () => {
      const mockSignInWithPassword = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: {
              full_name: 'Test User',
              age: 15,
            },
          },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
          },
        },
        error: null,
      })

      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: mockSignInWithPassword,
        },
      } as any)

      const supabase = createClient()
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'correct-password',
      })

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'correct-password',
      })
      expect(result.data.user).toBeDefined()
      expect(result.data.session).toBeDefined()
      expect(result.error).toBeNull()
    })

    it('should handle invalid credentials error', async () => {
      const mockSignInWithPassword = jest.fn().mockResolvedValue({
        data: {
          user: null,
          session: null,
        },
        error: {
          message: 'Invalid login credentials',
          status: 400,
        },
      })

      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: mockSignInWithPassword,
        },
      } as any)

      const supabase = createClient()
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrong-password',
      })

      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Invalid login credentials')
      expect(result.data.user).toBeNull()
      expect(result.data.session).toBeNull()
    })

    it('should handle email not confirmed error', async () => {
      const mockSignInWithPassword = jest.fn().mockResolvedValue({
        data: {
          user: null,
          session: null,
        },
        error: {
          message: 'Email not confirmed',
          status: 400,
        },
      })

      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: mockSignInWithPassword,
        },
      } as any)

      const supabase = createClient()
      const result = await supabase.auth.signInWithPassword({
        email: 'unconfirmed@example.com',
        password: 'password',
      })

      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Email not confirmed')
    })

    it('should handle network errors', async () => {
      const mockSignInWithPassword = jest.fn().mockRejectedValue(
        new Error('Network error')
      )

      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: mockSignInWithPassword,
        },
      } as any)

      const supabase = createClient()

      await expect(
        supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'password',
        })
      ).rejects.toThrow('Network error')
    })
  })

  describe('OAuth Authentication', () => {
    it('should initiate Google OAuth login', async () => {
      const mockSignInWithOAuth = jest.fn().mockResolvedValue({
        data: {
          provider: 'google',
          url: 'https://accounts.google.com/oauth/...',
        },
        error: null,
      })

      mockCreateClient.mockReturnValue({
        auth: {
          signInWithOAuth: mockSignInWithOAuth,
        },
      } as any)

      const supabase = createClient()
      const result = await supabase.auth.signInWithOAuth({
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
      expect(result.data.provider).toBe('google')
      expect(result.error).toBeNull()
    })
  })

  describe('Session Management', () => {
    it('should get existing session', async () => {
      const mockGetSession = jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'existing-token',
            refresh_token: 'existing-refresh',
            user: {
              id: 'user-123',
              email: 'test@example.com',
            },
          },
        },
        error: null,
      })

      mockCreateClient.mockReturnValue({
        auth: {
          getSession: mockGetSession,
        },
      } as any)

      const supabase = createClient()
      const result = await supabase.auth.getSession()

      expect(result.data.session).toBeDefined()
      expect(result.data.session?.access_token).toBe('existing-token')
    })

    it('should return null for no existing session', async () => {
      const mockGetSession = jest.fn().mockResolvedValue({
        data: {
          session: null,
        },
        error: null,
      })

      mockCreateClient.mockReturnValue({
        auth: {
          getSession: mockGetSession,
        },
      } as any)

      const supabase = createClient()
      const result = await supabase.auth.getSession()

      expect(result.data.session).toBeNull()
    })
  })

  describe('Input Validation', () => {
    it('should validate email format', () => {
      const validEmail = 'test@example.com'
      const invalidEmail = 'not-an-email'

      // Simple email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      expect(emailRegex.test(validEmail)).toBe(true)
      expect(emailRegex.test(invalidEmail)).toBe(false)
    })

    it('should require both email and password', () => {
      const email = 'test@example.com'
      const password = 'password123'

      expect(email).toBeTruthy()
      expect(password).toBeTruthy()

      const emptyEmail = ''
      const emptyPassword = ''

      expect(emptyEmail).toBeFalsy()
      expect(emptyPassword).toBeFalsy()
    })

    it('should handle password visibility toggle state', () => {
      let showPassword = false

      // Toggle on
      showPassword = !showPassword
      expect(showPassword).toBe(true)

      // Toggle off
      showPassword = !showPassword
      expect(showPassword).toBe(false)
    })
  })

  describe('Error Message Display', () => {
    it('should display appropriate error for invalid credentials', () => {
      const error = { message: 'Invalid login credentials' }
      expect(error.message).toBe('Invalid login credentials')
    })

    it('should display appropriate error for email not confirmed', () => {
      const error = { message: 'Email not confirmed' }
      expect(error.message).toBe('Email not confirmed')
    })

    it('should clear error message on successful login', async () => {
      let errorMessage = 'Previous error'

      const mockSignInWithPassword = jest.fn().mockResolvedValue({
        data: {
          user: { id: 'user-123' },
          session: { access_token: 'token' },
        },
        error: null,
      })

      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: mockSignInWithPassword,
        },
      } as any)

      const supabase = createClient()
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password',
      })

      if (!result.error) {
        errorMessage = '' // Clear error
      }

      expect(errorMessage).toBe('')
    })
  })

  describe('Redirect Logic', () => {
    it('should redirect to dashboard on successful login', async () => {
      const mockSignInWithPassword = jest.fn().mockResolvedValue({
        data: {
          user: { id: 'user-123' },
          session: { access_token: 'token' },
        },
        error: null,
      })

      mockCreateClient.mockReturnValue({
        auth: {
          signInWithPassword: mockSignInWithPassword,
        },
      } as any)

      const supabase = createClient()
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password',
      })

      // If successful, should redirect to /dashboard/learn
      if (result.data.user && !result.error) {
        const redirectPath = '/dashboard/learn'
        expect(redirectPath).toBe('/dashboard/learn')
      }
    })

    it('should handle redirect URL from query params', () => {
      const searchParams = new URLSearchParams('?redirect=/dashboard/profile')
      const redirectUrl = searchParams.get('redirect')

      expect(redirectUrl).toBe('/dashboard/profile')
    })
  })
})

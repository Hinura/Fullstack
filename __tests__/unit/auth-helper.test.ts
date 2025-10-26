import { getUser, signOut, requireAuth } from '@/lib/auth-helper'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('Auth Helper', () => {
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
  const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUser', () => {
    it('returns user when authenticated', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          age: 15,
        },
      }

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      } as any)

      const user = await getUser()

      expect(user).toEqual(mockUser)
      expect(mockCreateClient).toHaveBeenCalled()
    })

    it('returns null when not authenticated', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      } as any)

      const user = await getUser()

      expect(user).toBeNull()
    })

    it('handles authentication errors gracefully', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Auth error' },
          }),
        },
      } as any)

      const user = await getUser()

      expect(user).toBeNull()
    })
  })

  describe('signOut', () => {
    it('calls signOut and redirects to login', async () => {
      const mockSignOut = jest.fn().mockResolvedValue({})

      mockCreateClient.mockResolvedValue({
        auth: {
          signOut: mockSignOut,
        },
      } as any)

      // Mock redirect to throw (this is how Next.js redirect works)
      mockRedirect.mockImplementation(() => {
        throw new Error('NEXT_REDIRECT')
      })

      await expect(signOut()).rejects.toThrow('NEXT_REDIRECT')

      expect(mockCreateClient).toHaveBeenCalled()
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })

    it('handles signOut errors', async () => {
      const mockSignOut = jest.fn().mockRejectedValue(new Error('Sign out failed'))

      mockCreateClient.mockResolvedValue({
        auth: {
          signOut: mockSignOut,
        },
      } as any)

      await expect(signOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('requireAuth', () => {
    it('returns user when authenticated', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
        },
      }

      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      } as any)

      const user = await requireAuth()

      expect(user).toEqual(mockUser)
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('redirects to login when not authenticated', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      } as any)

      // Mock redirect to throw (this is how Next.js redirect works)
      mockRedirect.mockImplementation(() => {
        throw new Error('NEXT_REDIRECT')
      })

      await expect(requireAuth()).rejects.toThrow('NEXT_REDIRECT')

      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })

    it('redirects when user is undefined', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: undefined },
            error: null,
          }),
        },
      } as any)

      mockRedirect.mockImplementation(() => {
        throw new Error('NEXT_REDIRECT')
      })

      await expect(requireAuth()).rejects.toThrow('NEXT_REDIRECT')

      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })
  })
})

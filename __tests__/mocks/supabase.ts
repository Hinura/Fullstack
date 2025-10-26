/**
 * Mock Supabase client for testing
 */

export const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
  })),
}

// Mock successful authentication response
export const mockAuthResponse = {
  data: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User',
        age: 15,
        birthdate: '2010-01-01',
      },
    },
    session: {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
    },
  },
  error: null,
}

// Mock error response
export const mockAuthError = {
  data: { user: null, session: null },
  error: {
    message: 'Invalid credentials',
    status: 400,
  },
}

// Mock user profile
export const mockUserProfile = {
  id: 'test-user-id',
  username: 'testuser',
  full_name: 'Test User',
  birthdate: '2010-01-01',
  age: 15,
  points: 100,
  current_level: 5,
  streak_days: 3,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

/**
 * Mock the Supabase client module
 */
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => mockSupabaseClient),
}))

export const resetSupabaseMocks = () => {
  jest.clearAllMocks()
}

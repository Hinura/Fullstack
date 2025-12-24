// lib/auth-config.ts
// Centralized authentication configuration

export const AUTH_ROUTES = {
  // Public routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CONFIRMED: '/auth/confirmed',

  // Protected routes
  DASHBOARD: '/dashboard',
  ASSESSMENT: '/dashboard/assessment',
  LEARN: '/dashboard/learn',
  PRACTICE: '/dashboard/practice',
  PROGRESS: '/dashboard/progress',
} as const

export const AUTH_REDIRECTS = {
  // After successful login/register
  DEFAULT_AUTH_SUCCESS: AUTH_ROUTES.DASHBOARD,

  // New user flows
  NEW_USER_CONFIRMED: AUTH_ROUTES.CONFIRMED,
  NEW_USER_WITH_ASSESSMENT: `${AUTH_ROUTES.DASHBOARD}?welcome=true&new_user=true`,

  // Existing user flows
  USER_WITHOUT_ASSESSMENT: AUTH_ROUTES.ASSESSMENT,
  USER_WITH_ASSESSMENT: AUTH_ROUTES.DASHBOARD,

  // When logged out
  UNAUTHENTICATED: AUTH_ROUTES.LOGIN,
} as const

export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES]
export type AuthRedirect = typeof AUTH_REDIRECTS[keyof typeof AUTH_REDIRECTS]

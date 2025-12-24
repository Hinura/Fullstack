// lib/error-handler.ts
// Type-safe error handling utilities

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'AUTH_ERROR')
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR')
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

/**
 * Get safe error object for API responses
 * (Never expose stack traces or sensitive data in production)
 */
export function toErrorResponse(error: unknown) {
  const isDev = process.env.NODE_ENV === 'development'

  if (isAppError(error)) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      ...(isDev && { stack: error.stack })
    }
  }

  // Unknown error - return generic message
  return {
    error: isDev ? getErrorMessage(error) : 'Internal server error',
    code: 'INTERNAL_ERROR',
    statusCode: 500
  }
}

// Usage in catch blocks:
// Instead of: catch (e: any)
// Use: catch (error: unknown) {
//   const response = toErrorResponse(error)
//   return NextResponse.json(response, { status: response.statusCode })
// }

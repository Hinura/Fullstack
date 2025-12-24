// lib/logger.ts
// Centralized logging utility

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  userId?: string
  path?: string
  [key: string]: unknown
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  info(message: string, context?: LogContext) {
    if (this.isDev) {
      console.log(this.formatMessage('info', message, context))
    }
    // In production, send to logging service (e.g., Sentry, Datadog)
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context))
    // In production, send to logging service
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    }

    console.error(this.formatMessage('error', message, errorContext))
    // In production, send to error tracking service (e.g., Sentry)
  }

  debug(message: string, context?: LogContext) {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }
}

export const logger = new Logger()

// Usage:
// logger.info('User logged in', { userId: user.id })
// logger.error('Failed to save data', error, { userId: user.id, path: '/api/save' })

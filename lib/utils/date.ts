// lib/utils/date.ts
// Date utility functions

/**
 * Get date N days ago from now
 */
export function getDateDaysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

/**
 * Get date N days from now
 */
export function getDateDaysFromNow(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateYMD(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return formatDateYMD(date) === formatDateYMD(today)
}

/**
 * Get start of week (Monday)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  const weekStart = new Date(date)
  weekStart.setDate(diff)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

/**
 * Calculate age from birthdate
 */
export function calculateAge(birthdate: string | Date): number {
  const today = new Date()
  const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

// REPLACE THIS:
// const weekStartDate = new Date()
// weekStartDate.setDate(weekStartDate.getDate() - 7)
//
// WITH THIS:
// import { getDateDaysAgo } from '@/lib/utils/date'
// const weekStartDate = getDateDaysAgo(7)

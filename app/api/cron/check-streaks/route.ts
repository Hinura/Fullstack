import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * Daily Streak Check Cron Job
 *
 * This endpoint checks for inactive users and manages their streaks:
 * - If user was inactive yesterday AND has a freeze available: use the freeze
 * - If user was inactive yesterday AND no freeze available: reset streak to 0
 * - Updates highest_streak when appropriate
 *
 * Should be called once per day (at 01:00 UTC)
 *
 * Security: Requires CRON_SECRET environment variable to prevent unauthorized access
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      logger.error('Unauthorized cron attempt', undefined, { path: '/api/cron/check-streaks' })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get yesterday's date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayDate = yesterday.toISOString().split('T')[0]

    // Get today's date for logging
    const today = new Date().toISOString().split('T')[0]

    logger.info('Running streak check', { today, yesterdayDate })

    // Find users who were NOT active yesterday and have an active streak
    // (last_activity_date is older than yesterday AND streak_days > 0)
    const { data: inactiveUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, streak_days, streak_freeze_available, highest_streak, last_activity_date')
      .lt('last_activity_date', yesterdayDate)
      .gt('streak_days', 0)

    if (fetchError) {
      logger.error('Failed to fetch inactive users', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch inactive users', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      logger.info('No inactive users found')
      return NextResponse.json({
        success: true,
        message: 'No inactive users to process',
        freezesUsed: 0,
        streaksReset: 0
      })
    }

    logger.info('Found inactive users to process', { count: inactiveUsers.length })

    let freezesUsed = 0
    let streaksReset = 0

    // Process each inactive user
    for (const user of inactiveUsers) {
      if (user.streak_freeze_available) {
        // Use the freeze to maintain streak
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            streak_freeze_available: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) {
          logger.error('Failed to use freeze', updateError, { userId: user.id })
        } else {
          freezesUsed++
          logger.info('Used streak freeze', { userId: user.id, streakDays: user.streak_days })
        }
      } else {
        // No freeze available, reset streak
        const updateData: {
          streak_days: number
          highest_streak?: number
          updated_at: string
        } = {
          streak_days: 0,
          updated_at: new Date().toISOString()
        }

        // Update highest_streak if current streak was higher
        if (user.streak_days > (user.highest_streak || 0)) {
          updateData.highest_streak = user.streak_days
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id)

        if (updateError) {
          logger.error('Failed to reset streak', updateError, { userId: user.id })
        } else {
          streaksReset++
          logger.info('Reset streak', { userId: user.id, previousStreak: user.streak_days })
        }
      }
    }

    logger.info('Streak check complete', { freezesUsed, streaksReset })

    return NextResponse.json({
      success: true,
      message: 'Streak check completed successfully',
      usersProcessed: inactiveUsers.length,
      freezesUsed,
      streaksReset,
      checkDate: today
    })

  } catch (error) {
    logger.error('Cron job failed', error, { path: '/api/cron/check-streaks' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Allow POST as well for testing purposes
export async function POST(request: Request) {
  return GET(request)
}

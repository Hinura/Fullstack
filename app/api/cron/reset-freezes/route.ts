import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Weekly Streak Freeze Reset Cron Job
 *
 * This endpoint resets the streak_freeze_available flag for all users
 * Should be called once per week (Monday at 00:01)
 *
 * Security: Requires CRON_SECRET environment variable to prevent unauthorized access
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      console.error('Unauthorized cron attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Calculate the date 6 days ago (to catch anyone who hasn't had a reset in a week)
    const sixDaysAgo = new Date()
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6)
    const sixDaysAgoDate = sixDaysAgo.toISOString().split('T')[0]

    // Get current date for logging
    const today = new Date().toISOString().split('T')[0]

    // Update all users whose last freeze reset was more than 6 days ago
    // or who have never had a freeze reset
    const { data, error } = await supabase
      .from('profiles')
      .update({
        streak_freeze_available: true,
        streak_freeze_last_reset: today
      })
      .lt('streak_freeze_last_reset', sixDaysAgoDate)
      .select('id')

    if (error) {
      console.error('Freeze reset error:', error)
      return NextResponse.json(
        { error: 'Failed to reset freezes', details: error.message },
        { status: 500 }
      )
    }

    const updatedCount = data?.length || 0

    console.log(`Successfully reset streak freezes for ${updatedCount} users on ${today}`)

    return NextResponse.json({
      success: true,
      message: 'Streak freezes reset successfully',
      updatedUsers: updatedCount,
      resetDate: today
    })

  } catch (error) {
    console.error('Cron job error:', error)
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

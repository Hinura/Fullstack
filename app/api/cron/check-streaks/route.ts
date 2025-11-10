import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
      console.error('Unauthorized cron attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get yesterday's date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayDate = yesterday.toISOString().split('T')[0]

    // Get today's date for logging
    const today = new Date().toISOString().split('T')[0]

    console.log(`Running streak check for ${today}. Checking for users inactive on ${yesterdayDate}`)

    // Find users who were NOT active yesterday and have an active streak
    // (last_activity_date is older than yesterday AND streak_days > 0)
    const { data: inactiveUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, streak_days, streak_freeze_available, highest_streak, last_activity_date')
      .lt('last_activity_date', yesterdayDate)
      .gt('streak_days', 0)

    if (fetchError) {
      console.error('Error fetching inactive users:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch inactive users', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      console.log('No inactive users found')
      return NextResponse.json({
        success: true,
        message: 'No inactive users to process',
        freezesUsed: 0,
        streaksReset: 0
      })
    }

    console.log(`Found ${inactiveUsers.length} inactive users to process`)

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
          console.error(`Failed to use freeze for user ${user.id}:`, updateError)
        } else {
          freezesUsed++
          console.log(`Used freeze for user ${user.id}, streak maintained at ${user.streak_days}`)
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
          console.error(`Failed to reset streak for user ${user.id}:`, updateError)
        } else {
          streaksReset++
          console.log(`Reset streak for user ${user.id} from ${user.streak_days} to 0`)
        }
      }
    }

    console.log(`Streak check complete: ${freezesUsed} freezes used, ${streaksReset} streaks reset`)

    return NextResponse.json({
      success: true,
      message: 'Streak check completed successfully',
      usersProcessed: inactiveUsers.length,
      freezesUsed,
      streaksReset,
      checkDate: today
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

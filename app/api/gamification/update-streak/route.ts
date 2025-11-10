import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call database function to update streak
    const { data, error } = await supabase
      .rpc('update_user_streak_enhanced', { p_user_id: user.id })

    if (error) {
      console.error('Streak update error:', error)
      return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 })
    }

    const streakResult = data[0]

    // Check for streak milestones
    const milestones = [3, 7, 14, 30, 60, 100]
    const bonusPoints: Record<number, number> = {
      3: 75,
      7: 150,
      14: 300,
      30: 500,
      60: 750,
      100: 1500
    }

    let milestoneReached = null

    if (milestones.includes(streakResult.new_streak)) {
      // Check if milestone already achieved
      const { data: existing } = await supabase
        .from('streak_milestones')
        .select('id')
        .eq('user_id', user.id)
        .eq('milestone_days', streakResult.new_streak)
        .single()

      if (!existing) {
        // Record milestone
        await supabase
          .from('streak_milestones')
          .insert({
            user_id: user.id,
            milestone_days: streakResult.new_streak
          })

        // Award bonus points
        const bonus = bonusPoints[streakResult.new_streak]
        const url = new URL(request.url)
        const baseUrl = `${url.protocol}//${url.host}`

        await fetch(`${baseUrl}/api/gamification/award-points`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || ''
          },
          body: JSON.stringify({
            basePoints: bonus,
            transactionType: 'streak_bonus',
            metadata: { milestoneDays: streakResult.new_streak }
          })
        })

        milestoneReached = {
          days: streakResult.new_streak,
          bonusPoints: bonus
        }
      }
    }

    return NextResponse.json({
      success: true,
      streakDays: streakResult.new_streak,
      usedFreeze: streakResult.used_freeze,
      message: streakResult.message,
      milestoneReached
    })

  } catch (error) {
    console.error('Update streak error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

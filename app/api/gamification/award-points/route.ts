import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    const { user, supabase } = auth

    const body = await request.json()
    const {
      basePoints,
      transactionType,
      relatedEntityType,
      relatedEntityId,
      metadata = {}
    } = body

    // Validate input
    if (!basePoints || !transactionType) {
      return NextResponse.json(
        { error: 'Missing required fields: basePoints, transactionType' },
        { status: 400 }
      )
    }

    // Get user profile for multiplier calculation
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('streak_days, current_level, points')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Calculate multipliers using database functions
    const { data: streakMult } = await supabase
      .rpc('get_streak_multiplier', { streak_days: profile.streak_days })

    const { data: levelMult } = await supabase
      .rpc('get_level_multiplier', { level: profile.current_level })

    const streakMultiplier = streakMult || 1.0
    const levelMultiplier = levelMult || 1.0
    const totalMultiplier = streakMultiplier * levelMultiplier

    // Calculate final points
    const pointsAwarded = Math.floor(basePoints * totalMultiplier)

    // Create point transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: user.id,
        points_change: pointsAwarded,
        transaction_type: transactionType,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId,
        base_points: basePoints,
        multiplier: totalMultiplier,
        metadata
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Transaction error:', transactionError)
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }

    // Calculate new total points and overall level
    const newTotalPoints = profile.points + pointsAwarded

    // Calculate overall level: Level n requires (n-1)^2 * 100 points
    // Level 1: 0, Level 2: 100, Level 3: 400, Level 4: 900, etc.
    let newOverallLevel = 1
    for (let level = 1; level <= 100; level++) {
      const pointsRequired = (level - 1) * (level - 1) * 100
      if (newTotalPoints >= pointsRequired) {
        newOverallLevel = level
      } else {
        break
      }
    }

    // Update user's total points and overall level
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        points: newTotalPoints,
        current_level: newOverallLevel
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update points' }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({
      success: true,
      pointsAwarded,
      basePoints,
      multipliers: {
        streak: streakMultiplier,
        level: levelMultiplier,
        total: totalMultiplier
      },
      transactionId: transaction.id
    })

  } catch (error) {
    console.error('Award points error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

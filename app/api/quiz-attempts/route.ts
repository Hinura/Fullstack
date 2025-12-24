import { NextResponse, NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { logger } from '@/lib/logger'

// POST - Save quiz attempt
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    const { user, supabase } = auth

    // Parse request body
    const body = await request.json()
    const {
      subject,
      difficulty,
      total_questions,
      correct_answers,
      time_spent_seconds,
      answered_questions // Array of question IDs
    } = body

    // Validate inputs
    if (!subject || !['math', 'english', 'science'].includes(subject)) {
      return NextResponse.json(
        { error: 'Invalid subject' },
        { status: 400 }
      )
    }

    if (!difficulty || !['easy', 'medium', 'hard', 'adaptive'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty' },
        { status: 400 }
      )
    }

    if (typeof total_questions !== 'number' || typeof correct_answers !== 'number') {
      return NextResponse.json(
        { error: 'Invalid question counts' },
        { status: 400 }
      )
    }

    // Calculate score
    const scorePercentage = (correct_answers / total_questions) * 100

    // ========================================
    // GAMIFICATION: Calculate base points
    // ========================================
    const basePointsForCorrect = correct_answers * 10
    const completionBonus = 20
    const perfectScoreBonus = scorePercentage === 100 ? 50 : 0
    const totalBasePoints = basePointsForCorrect + completionBonus + perfectScoreBonus

    // Call award-points API to apply multipliers
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`

    let pointsEarned = totalBasePoints
    let multipliers = { streak: 1.0, level: 1.0, total: 1.0 }

    try {
      const awardResponse = await fetch(`${baseUrl}/api/gamification/award-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          basePoints: totalBasePoints,
          transactionType: 'quiz_completion',
          relatedEntityType: 'quiz_attempt',
          metadata: {
            subject,
            difficulty,
            correct_answers,
            total_questions,
            score_percentage: scorePercentage
          }
        })
      })

      if (awardResponse.ok) {
        const awardData = await awardResponse.json()
        pointsEarned = awardData.pointsAwarded || totalBasePoints
        multipliers = awardData.multipliers || multipliers
      }
    } catch (error) {
      logger.error('Failed to award points', error, { userId: user.id, subject, difficulty })
      // Continue with base points if API fails
    }

    // 1. Save quiz attempt
    const { data: attemptData, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        subject: subject,
        difficulty: difficulty,
        attempt_type: 'practice',
        total_questions: total_questions,
        correct_answers: correct_answers,
        score_percentage: scorePercentage,
        points_earned: pointsEarned,
        time_spent_seconds: time_spent_seconds || null,
        answered_questions: answered_questions || null
      })
      .select()
      .single()

    if (attemptError) {
      logger.error('Failed to save quiz attempt', attemptError, { userId: user.id, subject })
      return NextResponse.json(
        { error: 'Failed to save quiz attempt' },
        { status: 500 }
      )
    }

    // 2. Update subject-specific points and levels
    let levelUpInfo = null

    try {
      // Get subject-specific field names
      const subjectPointsField = `${subject}_points` as 'math_points' | 'english_points' | 'science_points'
      const subjectLevelField = `${subject}_level` as 'math_level' | 'english_level' | 'science_level'

      // Get current subject stats
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select(`${subjectPointsField}, ${subjectLevelField}`)
        .eq('id', user.id)
        .single()

      const profileData = currentProfile as Record<string, number> | null
      const currentSubjectPoints = profileData?.[subjectPointsField] || 0
      const currentSubjectLevel = profileData?.[subjectLevelField] || 1
      const newSubjectPoints = currentSubjectPoints + pointsEarned

      // Calculate new level using database function
      const { data: newLevelData } = await supabase
        .rpc('calculate_subject_level', { subject_points: newSubjectPoints })

      const newSubjectLevel = newLevelData || currentSubjectLevel

      // Update subject points and level
      await supabase
        .from('profiles')
        .update({
          [subjectPointsField]: newSubjectPoints,
          [subjectLevelField]: newSubjectLevel
        })
        .eq('id', user.id)

      // Check if user leveled up
      if (newSubjectLevel > currentSubjectLevel) {
        // Record level-up in level_history
        await supabase
          .from('level_history')
          .insert({
            user_id: user.id,
            subject,
            old_level: currentSubjectLevel,
            new_level: newSubjectLevel,
            points_at_level_up: newSubjectPoints
          })

        // Award level-up bonus (50 XP × new level)
        const levelUpBonus = 50 * newSubjectLevel

        await fetch(`${baseUrl}/api/gamification/award-points`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || ''
          },
          body: JSON.stringify({
            basePoints: levelUpBonus,
            transactionType: 'level_up',
            metadata: { subject, oldLevel: currentSubjectLevel, newLevel: newSubjectLevel }
          })
        })

        levelUpInfo = {
          subject,
          oldLevel: currentSubjectLevel,
          newLevel: newSubjectLevel,
          bonusPoints: levelUpBonus
        }
      }
    } catch (error) {
      logger.error('Failed to update subject levels', error, { userId: user.id, subject })
      // Don't fail the whole request
    }

    // 3. Update daily streak
    let streakUpdate = null

    try {
      const streakResponse = await fetch(`${baseUrl}/api/gamification/update-streak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        }
      })

      if (streakResponse.ok) {
        const streakData = await streakResponse.json()
        streakUpdate = {
          streakDays: streakData.streakDays,
          usedFreeze: streakData.usedFreeze,
          message: streakData.message,
          milestoneReached: streakData.milestoneReached || null
        }
      }
    } catch (error) {
      logger.error('Failed to update streak', error, { userId: user.id })
      // Don't fail the whole request
    }

    // 4. Update EDL if adaptive mode
    let edlUpdate = null

    if (difficulty === 'adaptive') {
      const { data: edlResult, error: edlError } = await supabase
        .rpc('update_edl_after_quiz', {
          p_user_id: user.id,
          p_subject: subject,
          p_score_percentage: scorePercentage
        })

      if (edlError) {
        logger.error('Failed to update EDL', edlError, { userId: user.id, subject })
        // Don't fail the whole request, just log the error
        // The quiz was still saved
      } else {
        edlUpdate = edlResult?.[0] || null
      }
    }

    // 5. Check for achievement unlocks
    let achievementUnlocks = null

    try {
      const achievementResponse = await fetch(`${baseUrl}/api/gamification/check-achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        }
      })

      if (achievementResponse.ok) {
        const achievementData = await achievementResponse.json()
        if (achievementData.newlyUnlocked && achievementData.newlyUnlocked.length > 0) {
          achievementUnlocks = {
            newlyUnlocked: achievementData.newlyUnlocked,
            totalUnlocked: achievementData.totalUnlocked
          }
        }
      }
    } catch (error) {
      logger.error('Failed to check achievements', error, { userId: user.id })
      // Don't fail the whole request
    }

    // 5a. Check for perfect score achievement (100% accuracy)
    if (scorePercentage === 100) {
      try {
        // Get perfect score achievement
        const { data: perfectAchievement } = await supabase
          .from('achievements')
          .select('*')
          .eq('achievement_key', 'perfect_quiz')
          .single()

        if (perfectAchievement) {
          // Check if user already has this achievement
          const { data: alreadyUnlocked } = await supabase
            .from('user_achievements')
            .select('id')
            .eq('user_id', user.id)
            .eq('achievement_id', perfectAchievement.id)
            .single()

          // If not unlocked yet, unlock it now
          if (!alreadyUnlocked) {
            await supabase
              .from('user_achievements')
              .insert({
                user_id: user.id,
                achievement_id: perfectAchievement.id
              })

            // Award bonus points
            await fetch(`${baseUrl}/api/gamification/award-points`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || ''
              },
              body: JSON.stringify({
                basePoints: perfectAchievement.points_reward,
                transactionType: 'achievement_unlock',
                relatedEntityType: 'achievement',
                relatedEntityId: perfectAchievement.id,
                metadata: { achievementKey: 'perfect_quiz' }
              })
            })

            // Update total_achievements count
            const { data: currentProfile } = await supabase
              .from('profiles')
              .select('total_achievements')
              .eq('id', user.id)
              .single()

            await supabase
              .from('profiles')
              .update({
                total_achievements: (currentProfile?.total_achievements || 0) + 1
              })
              .eq('id', user.id)

            // Add to unlocked achievements in response
            const perfectUnlock = {
              id: perfectAchievement.id,
              key: perfectAchievement.achievement_key,
              name: perfectAchievement.name,
              description: perfectAchievement.description,
              pointsReward: perfectAchievement.points_reward,
              icon: perfectAchievement.icon_name
            }

            if (achievementUnlocks) {
              achievementUnlocks.newlyUnlocked.push(perfectUnlock)
              achievementUnlocks.totalUnlocked += 1
            } else {
              achievementUnlocks = {
                newlyUnlocked: [perfectUnlock],
                totalUnlocked: (currentProfile?.total_achievements || 0) + 1
              }
            }
          }
        }
      } catch (error) {
        logger.error('Failed to check perfect score achievement', error, { userId: user.id })
        // Don't fail the whole request
      }
    }

    // 6. Prepare response
    const response: {
      success: boolean
      data: {
        quiz_result: {
          id: string
          score: number
          correct: number
          total: number
          points_earned: number
          base_points: number
          multipliers: {
            streak: number
            level: number
            total: number
          }
        }
        gamification?: {
          levelUp?: {
            subject: string
            oldLevel: number
            newLevel: number
            bonusPoints: number
          }
          streak?: {
            streakDays: number
            usedFreeze: boolean
            message: string
            milestoneReached?: {
              days: number
              bonusPoints: number
            } | null
          }
          achievements?: {
            newlyUnlocked: Array<{
              id: string
              key: string
              name: string
              description: string
              pointsReward: number
              icon: string
            }>
            totalUnlocked: number
          }
        }
        edl_update?: {
          previous_effective_age: number
          new_effective_age: number
          adjustment_occurred: boolean
          adjustment_type: string
          recent_accuracy: number
          status: string
          message: string
          next_adjustment_in: number
        }
      }
    } = {
      success: true,
      data: {
        quiz_result: {
          id: attemptData.id,
          score: Math.round(scorePercentage * 10) / 10,
          correct: correct_answers,
          total: total_questions,
          points_earned: pointsEarned,
          base_points: totalBasePoints,
          multipliers: multipliers
        }
      }
    }

    // Add gamification updates if any
    if (levelUpInfo || streakUpdate || achievementUnlocks) {
      response.data.gamification = {}

      if (levelUpInfo) {
        response.data.gamification.levelUp = levelUpInfo
      }

      if (streakUpdate) {
        response.data.gamification.streak = streakUpdate
      }

      if (achievementUnlocks) {
        response.data.gamification.achievements = achievementUnlocks
      }
    }

    // Add EDL update info if applicable
    if (edlUpdate) {
      response.data.edl_update = {
        previous_effective_age: edlUpdate.previous_effective_age,
        new_effective_age: edlUpdate.new_effective_age,
        adjustment_occurred: edlUpdate.adjustment_occurred,
        adjustment_type: edlUpdate.adjustment_type,
        recent_accuracy: Math.round(edlUpdate.recent_accuracy * 10) / 10,
        status: edlUpdate.status,
        message: edlUpdate.message,
        // Calculate quizzes until next adjustment check
        next_adjustment_in: 0 // Already have 3 scores, always ready to adjust
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    logger.error('Quiz attempt creation failed', error, { path: '/api/quiz-attempts' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Fetch user's quiz attempts
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    const { user, supabase } = auth

    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch quiz attempts', error, { userId: user.id })
      return NextResponse.json({ error: 'Failed to fetch quiz attempts' }, { status: 500 })
    }

    return NextResponse.json({ attempts })
  } catch (error) {
    logger.error('Quiz attempts fetch failed', error, { path: '/api/quiz-attempts' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

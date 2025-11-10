import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get quiz count
    const { count: quizCount } = await supabase
      .from('quiz_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get unique subjects attempted
    const { data: subjectsAttempted } = await supabase
      .from('quiz_attempts')
      .select('subject')
      .eq('user_id', user.id)

    const uniqueSubjects = new Set(subjectsAttempted?.map(q => q.subject) || [])

    // Check if assessment is complete
    const { data: assessmentComplete } = await supabase
      .from('user_performance_metrics')
      .select('has_completed_assessment')
      .eq('user_id', user.id)

    // Check for perfect scores (100%)
    const { data: perfectScores } = await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('user_id', user.id)
      .eq('score_percentage', 100)
      .limit(1)

    const hasPerfectScore = (perfectScores && perfectScores.length > 0) || false

    const userStats = {
      quizCount: quizCount || 0,
      streakDays: profile?.streak_days || 0,
      mathLevel: profile?.math_level || 1,
      englishLevel: profile?.english_level || 1,
      scienceLevel: profile?.science_level || 1,
      subjectsCompleted: uniqueSubjects.size,
      hasCompletedAssessment: assessmentComplete?.some(m => m.has_completed_assessment) || false,
      hasPerfectScore: hasPerfectScore
    }

    // Get all achievements user hasn't unlocked yet
    const { data: unlockedAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id)

    const unlockedSet = new Set(unlockedAchievements?.map(u => u.achievement_id) || [])

    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*')

    const lockedAchievements = allAchievements?.filter(a => !unlockedSet.has(a.id)) || []

    // Evaluate each locked achievement
    const newlyUnlocked = []

    for (const achievement of lockedAchievements) {
      const criteria = achievement.unlock_criteria

      if (evaluateCriteria(criteria, userStats)) {
        newlyUnlocked.push(achievement)
      }
    }

    // Unlock achievements and award bonus points
    for (const achievement of newlyUnlocked) {
      // Create user_achievement record
      await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievement.id
        })

      // Award bonus points
      if (achievement.points_reward > 0) {
        // Get the base URL from the request
        const url = new URL(request.url)
        const baseUrl = `${url.protocol}//${url.host}`

        await fetch(`${baseUrl}/api/gamification/award-points`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || ''
          },
          body: JSON.stringify({
            basePoints: achievement.points_reward,
            transactionType: 'achievement_unlock',
            relatedEntityType: 'achievement',
            relatedEntityId: achievement.id,
            metadata: { achievementKey: achievement.achievement_key }
          })
        })
      }

      // Update total_achievements count
      await supabase
        .from('profiles')
        .update({
          total_achievements: (profile?.total_achievements || 0) + 1
        })
        .eq('id', user.id)
    }

    return NextResponse.json({
      success: true,
      newlyUnlocked: newlyUnlocked.map(a => ({
        id: a.id,
        key: a.achievement_key,
        name: a.name,
        description: a.description,
        pointsReward: a.points_reward,
        icon: a.icon_name,
        rarity: a.rarity as 'common' | 'rare' | 'epic' | 'legendary'
      })),
      totalUnlocked: (profile?.total_achievements || 0) + newlyUnlocked.length
    })

  } catch (error) {
    console.error('Check achievements error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to evaluate unlock criteria
interface UnlockCriteria {
  type: string
  count?: number
  percentage?: number
  days?: number
  subjects?: number
  [key: string]: unknown
}

interface UserStats {
  quizCount: number
  streakDays: number
  mathLevel?: number
  englishLevel?: number
  scienceLevel?: number
  subjectsCompleted: number
  hasCompletedAssessment: boolean
  hasPerfectScore: boolean
  [key: string]: unknown
}

function evaluateCriteria(criteria: UnlockCriteria, stats: UserStats): boolean {
  if (!criteria || !criteria.type) {
    return false
  }

  switch (criteria.type) {
    case 'quiz_count':
      return criteria.count !== undefined && stats.quizCount >= criteria.count

    case 'streak':
      return criteria.days !== undefined && stats.streakDays >= criteria.days

    case 'level':
      const levelKey = `${criteria.subjects}Level`
      const levelValue = stats[levelKey]
      return criteria.count !== undefined && typeof levelValue === 'number' && levelValue >= criteria.count

    case 'subjects_completed':
      return criteria.count !== undefined && stats.subjectsCompleted >= criteria.count

    case 'perfect_score':
      return stats.hasPerfectScore === true

    case 'assessment_complete':
      return stats.hasCompletedAssessment

    default:
      return false
  }
}

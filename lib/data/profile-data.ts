import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { calculateSkillLevel } from '@/lib/constants/game-config'

interface UserProfile {
  id: string
  email: string
  username?: string
  fullName: string
  age: number | null
  birthdate: string | null
  pictureUrl?: string | null
  points: number
  currentLevel: number
  streakDays: number
  createdAt: string
  updatedAt: string
}

interface UserStats {
  totalExercises: number
  correctAnswers: number
  accuracyPercentage: number
  streakDays: number
  completedAssessments: number
  weeklyExercises: number
  bestAccuracy: number
}

interface GamificationData {
  totalPoints: number
  overallLevel: number
  streak: {
    currentDays: number
    highestDays: number
    freezeAvailable: boolean
  }
  subjects: {
    math: { level: number; points: number; pointsToNextLevel: number }
    english: { level: number; points: number; pointsToNextLevel: number }
    science: { level: number; points: number; pointsToNextLevel: number }
  }
  achievements: {
    total: number
    unlocked: Array<{
      id: string
      achievement_key: string
      name: string
      description: string
      category: string
      icon_name: string
      points_reward: number
      rarity: string
      unlocked_at: string | null
    }>
    locked: Array<{
      id: string
      achievement_key: string
      name: string
      description: string
      category: string
      icon_name: string
      points_reward: number
      rarity: string
      unlocked_at: null
    }>
  }
  recentActivity: {
    xpLast7Days: number
  }
}

interface AssessmentAttempt {
  id: string
  subject: string
  score_percentage: number
  completed_at: string
  total_questions: number
  correct_answers: number
}

interface DashboardData {
  user: UserProfile
  skillLevels: Record<string, { level: number; percentage: number }>
  stats: UserStats
  hasCompletedAssessment: boolean
  assessmentHistory: AssessmentAttempt[]
  gamification: GamificationData
}

function getSevenDaysAgo(): Date {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return date
}

function pointsForNextLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 100
}

function pointsToNextLevel(currentPoints: number, currentLevel: number): number {
  const requiredPoints = pointsForNextLevel(currentLevel)
  return Math.max(0, requiredPoints - currentPoints)
}

// Cache prevents duplicate fetches during render
export const getProfileData = cache(async (): Promise<DashboardData> => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Parallel queries instead of sequential
  const [
    profileResult,
    assessmentAttemptsResult,
    allAttemptsResult,
    achievementsResult,
    unlockedAchievementsResult,
    recentXPResult
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('quiz_attempts').select('*').eq('user_id', user.id)
      .eq('attempt_type', 'assessment').order('completed_at', { ascending: false }),
    supabase.from('quiz_attempts').select('*').eq('user_id', user.id)
      .order('completed_at', { ascending: false }).limit(50),
    supabase.from('achievements').select('*').order('sort_order', { ascending: true }),
    supabase.from('user_achievements').select('achievement_id, unlocked_at').eq('user_id', user.id),
    supabase.from('point_transactions').select('points_change, created_at')
      .eq('user_id', user.id).gte('created_at', getSevenDaysAgo().toISOString())
  ])

  // Handle profile creation if needed
  let profile = profileResult.data
  if (profileResult.error) {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        username: user.email?.split('@')[0],
        birthdate: user.user_metadata?.birthdate,
        age: user.user_metadata?.age,
        points: 0,
        current_level: 1,
        streak_days: 0
      })
      .select()
      .single()

    if (createError) {
      throw new Error('Failed to create profile')
    }
    profile = newProfile
  }

  const assessmentAttempts = assessmentAttemptsResult.data || []
  const allAttempts = allAttemptsResult.data || []
  const allAchievements = achievementsResult.data || []
  const unlockedAchievements = unlockedAchievementsResult.data || []
  const recentXP = recentXPResult.data || []

  // Calculate stats
  const totalQuestions = allAttempts.reduce((sum, attempt) => sum + attempt.total_questions, 0)
  const totalCorrect = allAttempts.reduce((sum, attempt) => sum + attempt.correct_answers, 0)
  const totalExercises = allAttempts.length
  const accuracyPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  const weekStartDate = getSevenDaysAgo()
  const weeklyExercises = allAttempts.filter(attempt =>
    new Date(attempt.completed_at) >= weekStartDate
  ).length

  const bestAccuracy = allAttempts.length > 0
    ? Math.round(Math.max(...allAttempts.map(a => a.score_percentage || 0)))
    : 0

  const currentStreak = profile.streak_days || 0

  // Transform assessment results into skill levels
  const skillLevelsBySubject: Record<string, { level: number; percentage: number }> = {}
  assessmentAttempts.forEach((attempt) => {
    const percentage = attempt.score_percentage || 0
    const skillLevel = calculateSkillLevel(percentage)
    skillLevelsBySubject[attempt.subject] = {
      level: skillLevel,
      percentage: Math.round(percentage)
    }
  })

  const hasCompletedAssessment = assessmentAttempts.length >= 3

  // Process achievements
  const unlockedAchievementIds = new Set(
    unlockedAchievements.map(ua => ua.achievement_id)
  )
  const unlockedTimestamps = new Map(
    unlockedAchievements.map(ua => [ua.achievement_id, ua.unlocked_at])
  )

  const unlockedList: GamificationData['achievements']['unlocked'] = []
  const lockedList: GamificationData['achievements']['locked'] = []

  allAchievements.forEach(achievement => {
    const isUnlocked = unlockedAchievementIds.has(achievement.id)
    const achievementData = {
      id: achievement.id,
      achievement_key: achievement.achievement_key,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category,
      icon_name: achievement.icon_name,
      points_reward: achievement.points_reward,
      rarity: achievement.rarity,
      unlocked_at: isUnlocked ? unlockedTimestamps.get(achievement.id) : null
    }

    if (isUnlocked) {
      unlockedList.push(achievementData as GamificationData['achievements']['unlocked'][number])
    } else {
      lockedList.push({ ...achievementData, unlocked_at: null })
    }
  })

  unlockedList.sort((a, b) =>
    new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime()
  )

  const xpLast7Days = recentXP.reduce((sum, t) => sum + t.points_change, 0)

  // Build gamification object
  const gamification: GamificationData = {
    totalPoints: profile.points || 0,
    overallLevel: profile.current_level || 1,
    streak: {
      currentDays: profile.streak_days || 0,
      highestDays: profile.highest_streak || 0,
      freezeAvailable: profile.streak_freeze_available ?? true
    },
    subjects: {
      math: {
        level: profile.math_level || 1,
        points: profile.math_points || 0,
        pointsToNextLevel: pointsToNextLevel(profile.math_points || 0, profile.math_level || 1)
      },
      english: {
        level: profile.english_level || 1,
        points: profile.english_points || 0,
        pointsToNextLevel: pointsToNextLevel(profile.english_points || 0, profile.english_level || 1)
      },
      science: {
        level: profile.science_level || 1,
        points: profile.science_points || 0,
        pointsToNextLevel: pointsToNextLevel(profile.science_points || 0, profile.science_level || 1)
      }
    },
    achievements: {
      total: unlockedList.length,
      unlocked: unlockedList,
      locked: lockedList
    },
    recentActivity: {
      xpLast7Days
    }
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
      username: profile.username,
      fullName: profile.full_name,
      birthdate: profile.birthdate,
      age: profile.age,
      pictureUrl: profile.picture_url,
      points: profile.points || 0,
      currentLevel: profile.current_level || 1,
      streakDays: currentStreak,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    },
    skillLevels: skillLevelsBySubject,
    stats: {
      totalExercises,
      correctAnswers: totalCorrect,
      accuracyPercentage,
      streakDays: currentStreak,
      completedAssessments: assessmentAttempts.length,
      weeklyExercises,
      bestAccuracy
    },
    hasCompletedAssessment,
    assessmentHistory: assessmentAttempts,
    gamification
  }
})

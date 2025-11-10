import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile (created automatically by database trigger)
    let profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    profile = profileData

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      // If profile doesn't exist, create it
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
        console.error('Profile creation error:', createError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }

      profile = newProfile
    }

    // Get assessment attempts (one-time skill assessment)
    const { data: assessmentAttempts } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('attempt_type', 'assessment')
      .order('completed_at', { ascending: false })

    // Get all quiz attempts (practice + assessment) for accuracy calculation
    const { data: allAttempts } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(50)

    // Calculate stats from all quiz attempts
    const totalQuestions = allAttempts?.reduce((sum, attempt) => sum + attempt.total_questions, 0) || 0
    const totalCorrect = allAttempts?.reduce((sum, attempt) => sum + attempt.correct_answers, 0) || 0
    const totalExercises = allAttempts?.length || 0
    const accuracyPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

    // Calculate weekly exercises (last 7 days)
    const weekStartDate = new Date()
    weekStartDate.setDate(weekStartDate.getDate() - 7)
    const weeklyExercises = allAttempts?.filter(attempt =>
      new Date(attempt.completed_at) >= weekStartDate
    ).length || 0

    // Calculate best accuracy ever (highest score percentage from any quiz)
    const bestAccuracy = (allAttempts && allAttempts.length > 0)
      ? Math.round(Math.max(...allAttempts.map(a => a.score_percentage || 0)))
      : 0

    // Calculate current streak (consecutive days with activity)
    const currentStreak = profile.streak_days || 0

    // Transform assessment results into skill levels for frontend
    const skillLevelsBySubject: Record<string, { level: number; percentage: number }> = {}

    assessmentAttempts?.forEach((attempt) => {
      const percentage = attempt.score_percentage || 0
      let skillLevel = 1

      // Convert percentage to skill level (1-5) - same logic as assessment page
      if (percentage >= 85) skillLevel = 5
      else if (percentage >= 70) skillLevel = 4
      else if (percentage >= 55) skillLevel = 3
      else if (percentage >= 40) skillLevel = 2
      else skillLevel = 1

      skillLevelsBySubject[attempt.subject] = {
        level: skillLevel,
        percentage: Math.round(percentage)
      }
    })

    // Determine if user has completed assessment (all 3 subjects)
    const hasCompletedAssessment = assessmentAttempts && assessmentAttempts.length >= 3

    // ========================================
    // GAMIFICATION DATA
    // ========================================

    // Get all achievements
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*')
      .order('sort_order', { ascending: true })

    // Get user's unlocked achievements
    const { data: unlockedAchievements } = await supabase
      .from('user_achievements')
      .select(`
        achievement_id,
        unlocked_at
      `)
      .eq('user_id', user.id)

    // Create a map of unlocked achievement IDs for quick lookup
    const unlockedAchievementIds = new Set(
      unlockedAchievements?.map(ua => ua.achievement_id) || []
    )

    // Create a map of unlocked timestamps
    const unlockedTimestamps = new Map(
      unlockedAchievements?.map(ua => [ua.achievement_id, ua.unlocked_at]) || []
    )

    // Separate and format achievements
    const unlockedList: Array<{
      id: string
      achievement_key: string
      name: string
      description: string
      category: string
      icon_name: string
      points_reward: number
      rarity: string
      unlocked_at: string | null
    }> = []
    const lockedList: Array<{
      id: string
      achievement_key: string
      name: string
      description: string
      category: string
      icon_name: string
      points_reward: number
      rarity: string
      unlocked_at: null
    }> = []

    allAchievements?.forEach(achievement => {
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
        unlockedList.push(achievementData)
      } else {
        lockedList.push(achievementData)
      }
    })

    // Sort unlocked by unlock date (most recent first)
    unlockedList.sort((a, b) =>
      new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime()
    )

    // Get XP earned in last 7 days (reuse the same date calculation)
    const { data: recentXP } = await supabase
      .from('point_transactions')
      .select('points_change, created_at')
      .eq('user_id', user.id)
      .gte('created_at', weekStartDate.toISOString())

    const xpLast7Days = recentXP?.reduce((sum, t) => sum + t.points_change, 0) || 0

    // Calculate points needed for next level (per subject)
    function pointsForNextLevel(currentLevel: number): number {
      // L(n+1) requires: (n^2) * 100 points
      return currentLevel * currentLevel * 100
    }

    function pointsToNextLevel(currentPoints: number, currentLevel: number): number {
      const requiredPoints = pointsForNextLevel(currentLevel)
      return Math.max(0, requiredPoints - currentPoints)
    }

    // Build gamification object
    const gamification = {
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

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
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
        completedAssessments: assessmentAttempts?.length || 0,
        weeklyExercises,
        bestAccuracy
      },
      hasCompletedAssessment,
      assessmentHistory: assessmentAttempts || [],
      gamification
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
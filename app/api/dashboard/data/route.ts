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
        completedAssessments: assessmentAttempts?.length || 0
      },
      hasCompletedAssessment,
      assessmentHistory: assessmentAttempts || []
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
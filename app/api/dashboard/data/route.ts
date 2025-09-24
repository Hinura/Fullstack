import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    let finalProfile = profile

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      console.log('User ID from auth:', user.id)

      // If profile doesn't exist, create one with basic info
      if (profileError.code === 'PGRST116') {
        console.log('Creating new profile for user:', user.id)
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            age: user.user_metadata?.age || null,
            birthdate: user.user_metadata?.birthdate || null
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
        } else {
          console.log('Successfully created profile:', newProfile)
          // Update the finalProfile variable to use the newly created profile
          finalProfile = newProfile
        }
      }
    }

    // Re-fetch profile if creation failed
    if (!finalProfile && profileError?.code === 'PGRST116') {
      const { data: refetchedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      finalProfile = refetchedProfile
    }

    // Get user skill levels
    const { data: skillLevels } = await supabase
      .from('user_skill_levels')
      .select('*')
      .eq('user_id', user.id)

    // Get assessment history
    const { data: assessments } = await supabase
      .from('user_assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false })

    // Get recent assessment answers for accuracy calculation
    const { data: recentAnswers } = await supabase
      .from('user_assessment_answers')
      .select(`
        *,
        user_assessments!inner (
          user_id,
          is_completed
        )
      `)
      .eq('user_assessments.user_id', user.id)
      .eq('user_assessments.is_completed', true)
      .order('answered_at', { ascending: false })
      .limit(50)

    // Calculate stats
    const totalExercises = recentAnswers?.length || 0
    const correctAnswers = recentAnswers?.filter(answer => answer.is_correct).length || 0
    const accuracyPercentage = totalExercises > 0 ? Math.round((correctAnswers / totalExercises) * 100) : 0

    // Calculate current streak (consecutive days with activity)
    const currentStreak = finalProfile?.streak_days || 0

    // Transform skill levels for easier frontend use
    const skillLevelsBySubject = skillLevels?.reduce((acc, skill) => {
      acc[skill.subject] = {
        level: skill.skill_level,
        percentage: skill.score_percentage
      }
      return acc
    }, {} as Record<string, { level: number; percentage: number }>) || {}

    // Determine if user has completed assessment
    const hasCompletedAssessment = skillLevels && skillLevels.length > 0

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: finalProfile?.full_name,
        age: finalProfile?.age,
        points: finalProfile?.points || 0,
        currentLevel: finalProfile?.current_level || 1,
        streakDays: currentStreak
      },
      skillLevels: skillLevelsBySubject,
      stats: {
        totalExercises,
        correctAnswers,
        accuracyPercentage,
        streakDays: currentStreak,
        completedAssessments: assessments?.length || 0
      },
      hasCompletedAssessment,
      assessmentHistory: assessments || []
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
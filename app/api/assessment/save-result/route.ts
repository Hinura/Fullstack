import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    const { user, supabase } = auth

    const body = await request.json()
    const { results } = body

    // results should be an object like:
    // { math: { correct: 5, total: 7 }, english: { correct: 6, total: 7 }, science: { correct: 4, total: 7 } }

    if (!results || typeof results !== 'object') {
      return NextResponse.json({ error: 'Invalid results format' }, { status: 400 })
    }

    // Get user's age from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('age')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const chronologicalAge = profile.age

    // Validate age is in valid range
    if (chronologicalAge < 7 || chronologicalAge > 18) {
      return NextResponse.json(
        { error: 'Invalid age. Must be between 7-18.' },
        { status: 400 }
      )
    }

    // Process each subject
    const subjects = ['math', 'english', 'science'] as const
    const edlInitialized: Record<string, {
      score: number
      adjustment: number
      effective_age: number
      message: string
    }> = {}

    for (const subject of subjects) {
      const result = results[subject]

      if (!result || typeof result.correct !== 'number' || typeof result.total !== 'number') {
        return NextResponse.json(
          { error: `Invalid result format for ${subject}` },
          { status: 400 }
        )
      }

      const { correct, total } = result
      const scorePercentage = (correct / total) * 100
      const pointsEarned = correct * 10

      // 1. Save to quiz_attempts (existing functionality)
      const { error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          subject: subject,
          difficulty: 'adaptive',
          attempt_type: 'assessment',
          total_questions: total,
          correct_answers: correct,
          score_percentage: scorePercentage,
          points_earned: pointsEarned
        })

      if (attemptError) {
        console.error(`Error saving ${subject} assessment:`, attemptError)
        return NextResponse.json(
          { error: `Failed to save ${subject} assessment` },
          { status: 500 }
        )
      }

      // 2. Initialize EDL (NEW)
      const { data: edlResult, error: edlError } = await supabase
        .rpc('initialize_edl_from_assessment', {
          p_user_id: user.id,
          p_subject: subject,
          p_score_percentage: scorePercentage,
          p_chronological_age: chronologicalAge
        })

      if (edlError) {
        console.error(`Error initializing EDL for ${subject}:`, edlError)
        return NextResponse.json(
          { error: `Failed to initialize EDL for ${subject}` },
          { status: 500 }
        )
      }

      // Extract EDL results
      const edlData = edlResult?.[0] || {}

      edlInitialized[subject] = {
        score: Math.round(scorePercentage * 10) / 10, // Round to 1 decimal
        adjustment: edlData.performance_adjustment,
        effective_age: edlData.effective_age,
        message: edlData.message
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment completed! Practice mode unlocked.',
      data: {
        edl_initialized: edlInitialized
      }
    })

  } catch (error) {
    console.error('Error in assessment save-result:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

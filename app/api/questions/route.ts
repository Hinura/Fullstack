import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getTargetAge, getDifficultyDistribution, buildSelectionMetadata } from '@/lib/edl/selector'
import type { Subject, Difficulty } from '@/lib/edl/types'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject') as Subject | null
    const difficulty = (searchParams.get('difficulty') || 'adaptive') as Difficulty
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate subject
    if (!subject || !['math', 'english', 'science'].includes(subject)) {
      return NextResponse.json(
        { error: 'Invalid subject. Must be math, english, or science.' },
        { status: 400 }
      )
    }

    // Validate difficulty
    if (!['easy', 'medium', 'hard', 'adaptive'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be easy, medium, hard, or adaptive.' },
        { status: 400 }
      )
    }

    // Get user's EDL metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('user_performance_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('subject', subject)
      .single()

    if (metricsError || !metrics) {
      return NextResponse.json(
        {
          error: 'Assessment not completed',
          message: 'Please complete the initial assessment first.',
          redirect: '/dashboard/assessment?required=true'
        },
        { status: 403 }
      )
    }

    // Determine target age and difficulty distribution
    const targetAge = getTargetAge(metrics, difficulty)
    const distribution = getDifficultyDistribution(metrics, difficulty, limit)

    // Build metadata for response
    const metadata = buildSelectionMetadata(metrics, difficulty, limit)

    // Get recently answered questions (30-day window) for repeat avoidance
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentAttempts } = await supabase
      .from('quiz_attempts')
      .select('answered_questions')
      .eq('user_id', user.id)
      .eq('subject', subject)
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Flatten recent question IDs
    const recentQuestionIds = recentAttempts
      ?.flatMap(attempt => attempt.answered_questions || [])
      .filter((id): id is string => typeof id === 'string') || []

    // Fetch questions by difficulty level
    const selectedQuestions = []

    for (const [diffLevel, count] of Object.entries(distribution)) {
      if (count === 0) continue

      // Build query
      let query = supabase
        .from('questions')
        .select('*')
        .eq('subject', subject)
        .eq('age', targetAge)
        .eq('difficulty', diffLevel)

      // Exclude recently answered questions
      if (recentQuestionIds.length > 0) {
        query = query.not('id', 'in', `(${recentQuestionIds.join(',')})`)
      }

      // Fetch with random ordering
      const { data: questions, error: questionsError } = await query
        .limit(count * 2) // Fetch extra for randomization
        .order('created_at', { ascending: false })

      if (questionsError) {
        console.error(`Error fetching ${diffLevel} questions:`, questionsError)
        continue
      }

      // Randomize and take required count
      const shuffled = questions?.sort(() => Math.random() - 0.5) || []
      selectedQuestions.push(...shuffled.slice(0, count))
    }

    // Final shuffle
    const finalQuestions = selectedQuestions.sort(() => Math.random() - 0.5)

    // Check if we got enough questions
    if (finalQuestions.length < Math.floor(limit * 0.5)) {
      return NextResponse.json(
        {
          error: 'Insufficient questions',
          message: 'Not enough questions available at this level. Try a different difficulty or subject.',
          available: finalQuestions.length,
          requested: limit
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        questions: finalQuestions,
        metadata
      }
    })

  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

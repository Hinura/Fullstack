import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { selectQuestionsWithEDL, isValidSubject, isValidDifficulty } from '@/lib/edl'
import type { Subject, Difficulty } from '@/lib/types/edl'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subject = searchParams.get('subject')
  const difficulty = searchParams.get('difficulty')
  const limit = searchParams.get('limit') || '10'

  if (!subject) {
    return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
  }

  // Validate subject
  if (!isValidSubject(subject)) {
    return NextResponse.json({
      error: 'Invalid subject. Must be one of: math, english, science'
    }, { status: 400 })
  }

  // Validate difficulty if provided
  if (difficulty && difficulty !== 'adaptive' && !isValidDifficulty(difficulty)) {
    return NextResponse.json({
      error: 'Invalid difficulty. Must be one of: easy, medium, hard, or adaptive'
    }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    // Get user's age from profile
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('age')
      .eq('id', user.id)
      .single()

    if (!profile?.age) {
      return NextResponse.json({ error: 'User age not found' }, { status: 400 })
    }

    // Use EDL system to select questions based on effective age
    const result = await selectQuestionsWithEDL(
      user.id,
      subject as Subject,
      profile.age,
      difficulty && difficulty !== 'adaptive' ? difficulty as Difficulty : undefined,
      parseInt(limit)
    )

    // Developer Debug - Server logs
    console.log(`[EDL] User ${user.id.substring(0, 8)} | ${subject} | Age ${profile.age} → Effective ${result.effective_age} (${result.performance_metrics.performance_adjustment >= 0 ? '+' : ''}${result.performance_metrics.performance_adjustment}) | Accuracy: ${result.performance_metrics.recent_accuracy !== null && result.performance_metrics.recent_accuracy !== undefined ? result.performance_metrics.recent_accuracy.toFixed(1) : 'N/A'}%`)

    return NextResponse.json({
      questions: result.questions,
      effective_age: result.effective_age,
      chronological_age: profile.age,
      performance_adjustment: result.performance_metrics.performance_adjustment,
      recent_accuracy: result.performance_metrics.recent_accuracy,
      excluded_count: result.excluded_count,
    })
  } catch (error) {
    console.error('Error in questions API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { ASSESSMENT_CONFIG } from '@/lib/constants/game-config'
import { shuffleArray } from '@/lib/utils/array'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    const { user, supabase } = auth

    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')

    // Use consistent subject names: math, english, science
    if (!subject || !['math', 'english', 'science'].includes(subject)) {
      return NextResponse.json({ error: 'Invalid subject' }, { status: 400 })
    }

    // Get user's age for age-appropriate questions
    const { data: profile } = await supabase
      .from('profiles')
      .select('age')
      .eq('id', user.id)
      .single()

    const userAge = profile?.age || 10

    // Get questions for the subject using configured distribution
    const { data: easyQuestions, error: easyError } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .eq('age', userAge)
      .eq('difficulty', 'easy')
      .limit(ASSESSMENT_CONFIG.QUESTION_DISTRIBUTION.EASY)

    const { data: mediumQuestions, error: mediumError } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .eq('age', userAge)
      .eq('difficulty', 'medium')
      .limit(ASSESSMENT_CONFIG.QUESTION_DISTRIBUTION.MEDIUM)

    const { data: hardQuestions, error: hardError } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .eq('age', userAge)
      .eq('difficulty', 'hard')
      .limit(ASSESSMENT_CONFIG.QUESTION_DISTRIBUTION.HARD)

    if (easyError || mediumError || hardError) {
      console.error('Database error:', { easyError, mediumError, hardError })
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const allQuestions = [
      ...(easyQuestions || []),
      ...(mediumQuestions || []),
      ...(hardQuestions || [])
    ]

    // Shuffle questions to randomize order using Fisher-Yates algorithm
    const shuffledQuestions = shuffleArray(allQuestions)

    return NextResponse.json({ questions: shuffledQuestions })
  } catch (error) {
    console.error('Assessment questions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
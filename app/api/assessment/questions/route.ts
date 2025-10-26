import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')

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

    // Get questions for the subject (2 easy, 3 medium, 2 hard)
    const { data: easyQuestions, error: easyError } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .eq('age_group', userAge)
      .eq('difficulty', 'easy')
      .limit(2)

    const { data: mediumQuestions, error: mediumError } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .eq('age_group', userAge)
      .eq('difficulty', 'medium')
      .limit(3)

    const { data: hardQuestions, error: hardError } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .eq('age_group', userAge)
      .eq('difficulty', 'hard')
      .limit(2)

    if (easyError || mediumError || hardError) {
      console.error('Database error:', { easyError, mediumError, hardError })
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const allQuestions = [
      ...(easyQuestions || []),
      ...(mediumQuestions || []),
      ...(hardQuestions || [])
    ]

    // Shuffle questions to randomize order
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5)

    return NextResponse.json({ questions: shuffledQuestions })
  } catch (error) {
    console.error('Assessment questions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
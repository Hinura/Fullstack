import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { assessmentId, questionId, answer } = body

    if (!assessmentId || !questionId || answer === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the question to check correct answer
    const { data: question, error: questionError } = await supabase
      .from('assessment_questions')
      .select('correct_answer')
      .eq('id', questionId)
      .single()

    if (questionError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const isCorrect = answer === question.correct_answer

    // Save the answer
    const { error: insertError } = await supabase
      .from('user_assessment_answers')
      .insert({
        assessment_id: assessmentId,
        question_id: questionId,
        user_answer: answer,
        is_correct: isCorrect
      })

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      message: 'Answer submitted successfully'
    })
  } catch (error) {
    console.error('Submit answer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
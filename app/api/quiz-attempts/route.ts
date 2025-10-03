import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST - Save quiz attempt
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, difficulty, total_questions, correct_answers, time_spent_seconds } = body

    if (!subject || !difficulty || total_questions === undefined || correct_answers === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const score_percentage = (correct_answers / total_questions) * 100
    const points_earned = correct_answers * 10 // 10 points per correct answer

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        subject,
        difficulty,
        total_questions,
        correct_answers,
        score_percentage,
        points_earned,
        time_spent_seconds
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving quiz attempt:', error)
      return NextResponse.json({ error: 'Failed to save quiz attempt' }, { status: 500 })
    }

    // Update user's total points in profile
    const { error: updateError } = await supabase.rpc('increment_user_points', {
      user_id: user.id,
      points_to_add: points_earned
    })

    if (updateError) {
      console.error('Error updating points:', updateError)
      // Don't fail the request if points update fails
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in quiz-attempts POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Fetch user's quiz attempts
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching quiz attempts:', error)
      return NextResponse.json({ error: 'Failed to fetch quiz attempts' }, { status: 500 })
    }

    return NextResponse.json({ attempts })
  } catch (error) {
    console.error('Error in quiz-attempts GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

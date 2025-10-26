import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { processQuizCompletion, isValidSubject } from '@/lib/edl'
import type { Subject, QuestionAttemptInput } from '@/lib/types/edl'

// POST - Save quiz attempt
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      subject,
      difficulty,
      total_questions,
      correct_answers,
      time_spent_seconds,
      question_attempts
    } = body

    // Debug logging
    console.log('📝 Quiz Attempt Received:', {
      subject,
      difficulty,
      total_questions,
      correct_answers,
      question_attempts_count: question_attempts?.length || 0,
      has_question_attempts: !!question_attempts
    })

    if (!subject || !difficulty || total_questions === undefined || correct_answers === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate subject
    if (!isValidSubject(subject)) {
      return NextResponse.json({
        error: 'Invalid subject. Must be one of: math, english, science'
      }, { status: 400 })
    }

    const score_percentage = (correct_answers / total_questions) * 100
    const points_earned = correct_answers * 10 // 10 points per correct answer

    // Save quiz attempt to database
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

    // Get user's chronological age for EDL updates
    const { data: profile } = await supabase
      .from('profiles')
      .select('age')
      .eq('id', user.id)
      .single()

    if (!profile?.age) {
      console.error('❌ User age not found for EDL update')
      // Continue without EDL update
    } else {
      // Update EDL performance metrics and record question history
      try {
        // Add user_id to each question attempt (frontend doesn't send this for security)
        const questionAttemptsData: QuestionAttemptInput[] = (question_attempts || []).map((attempt: any) => ({
          user_id: user.id,  // Add the authenticated user's ID
          question_id: attempt.question_id,
          answered_correctly: attempt.answered_correctly,
          time_spent_seconds: attempt.time_spent_seconds
        }))

        console.log('🔄 Processing EDL update:', {
          userId: user.id.substring(0, 8),
          subject,
          score_percentage,
          age: profile.age,
          question_attempts: questionAttemptsData.length
        })

        const result = await processQuizCompletion(
          user.id,
          subject as Subject,
          score_percentage,
          profile.age,
          questionAttemptsData,
          supabase  // Pass the authenticated Supabase client
        )

        console.log('✅ EDL metrics updated:', {
          effective_age: result.effective_age,
          performance_adjustment: result.performance_adjustment,
          recent_accuracy: result.recent_accuracy,
          last_3_scores: result.last_3_quiz_scores
        })
      } catch (edlError) {
        console.error('❌ Error updating EDL metrics:', edlError)
        // Don't fail the request if EDL update fails
      }
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

    // Update user's streak
    const { error: streakError } = await supabase.rpc('update_user_streak', {
      user_id: user.id
    })

    if (streakError) {
      console.error('Error updating streak:', streakError)
      // Don't fail the request if streak update fails
    }

    // Update user's level based on points (exponential progression)
    const { error: levelError } = await supabase.rpc('update_user_level', {
      user_id: user.id
    })

    if (levelError) {
      console.error('Error updating level:', levelError)
      // Don't fail the request if level update fails
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

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST - Save quiz attempt
export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json()
    const {
      subject,
      difficulty,
      total_questions,
      correct_answers,
      time_spent_seconds,
      answered_questions // Array of question IDs
    } = body

    // Validate inputs
    if (!subject || !['math', 'english', 'science'].includes(subject)) {
      return NextResponse.json(
        { error: 'Invalid subject' },
        { status: 400 }
      )
    }

    if (!difficulty || !['easy', 'medium', 'hard', 'adaptive'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty' },
        { status: 400 }
      )
    }

    if (typeof total_questions !== 'number' || typeof correct_answers !== 'number') {
      return NextResponse.json(
        { error: 'Invalid question counts' },
        { status: 400 }
      )
    }

    // Calculate score
    const scorePercentage = (correct_answers / total_questions) * 100
    const pointsEarned = correct_answers * 10

    // 1. Save quiz attempt
    const { data: attemptData, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        subject: subject,
        difficulty: difficulty,
        attempt_type: 'practice',
        total_questions: total_questions,
        correct_answers: correct_answers,
        score_percentage: scorePercentage,
        points_earned: pointsEarned,
        time_spent_seconds: time_spent_seconds || null,
        answered_questions: answered_questions || null
      })
      .select()
      .single()

    if (attemptError) {
      console.error('Error saving quiz attempt:', attemptError)
      return NextResponse.json(
        { error: 'Failed to save quiz attempt' },
        { status: 500 }
      )
    }

    // 2. Update EDL if adaptive mode
    let edlUpdate = null

    if (difficulty === 'adaptive') {
      const { data: edlResult, error: edlError } = await supabase
        .rpc('update_edl_after_quiz', {
          p_user_id: user.id,
          p_subject: subject,
          p_score_percentage: scorePercentage
        })

      if (edlError) {
        console.error('Error updating EDL:', edlError)
        // Don't fail the whole request, just log the error
        // The quiz was still saved
      } else {
        edlUpdate = edlResult?.[0] || null
      }
    }

    // 3. Prepare response
    const response: {
      success: boolean
      data: {
        quiz_result: {
          id: string
          score: number
          correct: number
          total: number
          points_earned: number
        }
        edl_update?: {
          previous_effective_age: number
          new_effective_age: number
          adjustment_occurred: boolean
          adjustment_type: string
          recent_accuracy: number
          status: string
          message: string
          next_adjustment_in: number
        }
      }
    } = {
      success: true,
      data: {
        quiz_result: {
          id: attemptData.id,
          score: Math.round(scorePercentage * 10) / 10,
          correct: correct_answers,
          total: total_questions,
          points_earned: pointsEarned
        }
      }
    }

    // Add EDL update info if applicable
    if (edlUpdate) {
      response.data.edl_update = {
        previous_effective_age: edlUpdate.previous_effective_age,
        new_effective_age: edlUpdate.new_effective_age,
        adjustment_occurred: edlUpdate.adjustment_occurred,
        adjustment_type: edlUpdate.adjustment_type,
        recent_accuracy: Math.round(edlUpdate.recent_accuracy * 10) / 10,
        status: edlUpdate.status,
        message: edlUpdate.message,
        // Calculate quizzes until next adjustment check
        next_adjustment_in: 0 // Already have 3 scores, always ready to adjust
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in quiz-attempts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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

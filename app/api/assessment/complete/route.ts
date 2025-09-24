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
    const { assessmentId } = body

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })
    }

    // Get all assessment answers with their questions
    const { data: answers, error: answersError } = await supabase
      .from('user_assessment_answers')
      .select(`
        *,
        assessment_questions (
          subject,
          difficulty,
          points
        )
      `)
      .eq('assessment_id', assessmentId)

    if (answersError || !answers) {
      console.error('Database error:', answersError)
      return NextResponse.json({ error: 'Failed to get assessment answers' }, { status: 500 })
    }

    // Calculate skill levels for each subject
    const subjects = ['mathematics', 'reading', 'science'] as const
    const skillLevels: { [key: string]: { level: number; percentage: number } } = {}

    for (const subject of subjects) {
      const subjectAnswers = answers.filter(
        answer => answer.assessment_questions?.subject === subject
      )

      if (subjectAnswers.length > 0) {
        let totalPoints = 0
        let earnedPoints = 0

        subjectAnswers.forEach(answer => {
          const points = answer.assessment_questions?.points || 1
          totalPoints += points
          if (answer.is_correct) {
            earnedPoints += points
          }
        })

        const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0

        // Convert percentage to skill level (1-5)
        let skillLevel = 1
        if (percentage >= 90) skillLevel = 5
        else if (percentage >= 75) skillLevel = 4
        else if (percentage >= 60) skillLevel = 3
        else if (percentage >= 45) skillLevel = 2
        else skillLevel = 1

        skillLevels[subject] = { level: skillLevel, percentage }

        // Save skill level to database
        const { error: skillLevelError } = await supabase
          .from('user_skill_levels')
          .upsert({
            user_id: user.id,
            subject,
            skill_level: skillLevel,
            score_percentage: percentage,
            assessment_id: assessmentId
          })

        if (skillLevelError) {
          console.error('Error saving skill level:', skillLevelError)
        }
      }
    }

    // Mark assessment as completed
    const { error: updateError } = await supabase
      .from('user_assessments')
      .update({
        completed_at: new Date().toISOString(),
        is_completed: true
      })
      .eq('id', assessmentId)

    if (updateError) {
      console.error('Error updating assessment:', updateError)
    }

    return NextResponse.json({
      success: true,
      skillLevels,
      message: 'Assessment completed successfully'
    })
  } catch (error) {
    console.error('Complete assessment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
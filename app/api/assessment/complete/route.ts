import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { calculateSkillLevel } from '@/lib/constants/game-config'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    const { user, supabase } = auth

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

        // Convert percentage to skill level (1-5) using centralized function
        const skillLevel = calculateSkillLevel(percentage)

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
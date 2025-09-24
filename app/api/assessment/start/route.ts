import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a skill level assessment
    const { data: existingSkillLevels } = await supabase
      .from('user_skill_levels')
      .select('*')
      .eq('user_id', user.id)

    if (existingSkillLevels && existingSkillLevels.length > 0) {
      return NextResponse.json({ error: 'Assessment already completed' }, { status: 400 })
    }

    // Create new assessment record
    const { data: assessment, error } = await supabase
      .from('user_assessments')
      .insert({
        user_id: user.id,
        current_subject: 'mathematics',
        current_question_index: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to start assessment' }, { status: 500 })
    }

    return NextResponse.json({
      assessmentId: assessment.id,
      message: 'Assessment started successfully'
    })
  } catch (error) {
    console.error('Start assessment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
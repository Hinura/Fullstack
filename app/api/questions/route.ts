import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subject = searchParams.get('subject')
  const difficulty = searchParams.get('difficulty')
  const limit = searchParams.get('limit') || '10'

  if (!subject) {
    return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
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

    // Build query
    let query = supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .eq('age_group', profile.age)

    // Add difficulty filter if specified
    if (difficulty && difficulty !== 'adaptive') {
      query = query.eq('difficulty', difficulty)
    }

    // Get random questions
    const { data: questions, error } = await query
      .limit(parseInt(limit))

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    // Shuffle questions for randomness
    const shuffled = questions?.sort(() => Math.random() - 0.5) || []

    return NextResponse.json({ questions: shuffled })
  } catch (error) {
    console.error('Error in questions API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

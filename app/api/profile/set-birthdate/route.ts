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
    const { birthdate, age } = body

    if (!birthdate || typeof birthdate !== 'string') {
      return NextResponse.json({ error: 'Birthdate is required' }, { status: 400 })
    }

    if (!age || typeof age !== 'number' || age < 7) {
      return NextResponse.json({ error: 'Must be at least 7 years old' }, { status: 400 })
    }

    if (age > 18) {
      return NextResponse.json({ error: 'Hinura is designed for students aged 7-18' }, { status: 400 })
    }

    const birthdateObj = new Date(birthdate)
    if (isNaN(birthdateObj.getTime())) {
      return NextResponse.json({ error: 'Invalid birthdate format' }, { status: 400 })
    }

    // Check if user already has a birthdate set (prevent multiple updates)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('birthdate, age')
      .eq('id', user.id)
      .single()

    if (existingProfile?.birthdate && existingProfile?.age) {
      return NextResponse.json({
        success: true,
        message: 'Birthdate already set',
        profile: existingProfile
      })
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        birthdate: birthdate,
        age: age,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Birthdate setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    const { user, supabase } = auth

    const body = await request.json()
    const { birthdate, age } = body

    if (!birthdate || typeof birthdate !== 'string') {
      return NextResponse.json({ error: 'Birthdate is required' }, { status: 400 })
    }

    if (!age || typeof age !== 'number') {
      return NextResponse.json({ error: 'Invalid age provided' }, { status: 400 })
    }

    if (age < 7) {
      return NextResponse.json({
        error: 'Age requirement not met',
        message: 'You must be at least 7 years old to use Hinura',
        ineligible: true
      }, { status: 403 })
    }

    if (age > 18) {
      return NextResponse.json({
        error: 'Age requirement not met',
        message: 'Hinura is designed for students aged 7-18',
        ineligible: true
      }, { status: 403 })
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
      logger.error('Failed to update profile with birthdate', updateError, { userId: user.id })
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })

  } catch (error) {
    logger.error('Birthdate setup failed', error, { path: '/api/profile/set-birthdate' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
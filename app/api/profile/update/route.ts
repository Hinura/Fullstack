import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { logger } from '@/lib/logger'

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    const { user, supabase } = auth

    const body = await request.json()
    const { username, fullName } = body

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    // Check if username is unique (if provided)
    if (username && username.trim()) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim())
        .neq('id', user.id)
        .single()

      if (existingUser) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
    }

    const updateData: { full_name: string; username?: string | null; updated_at: string } = {
      full_name: fullName.trim(),
      updated_at: new Date().toISOString()
    }

    // Add username to update only if it's provided
    if (username !== undefined) {
      updateData.username = username && username.trim() ? username.trim() : null
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to update profile', updateError, { userId: user.id })
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })

  } catch (error) {
    logger.error('Profile update failed', error, { path: '/api/profile/update' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
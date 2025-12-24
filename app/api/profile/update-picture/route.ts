import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    const { user, supabase } = auth

    const body = await request.json()
    const { pictureUrl } = body

    // pictureUrl can be null to remove the picture
    if (pictureUrl !== null && typeof pictureUrl !== 'string') {
      return NextResponse.json({ error: 'Invalid picture URL' }, { status: 400 })
    }

    // Update the profile with the new picture URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        picture_url: pictureUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to update profile picture', updateError, { userId: user.id })
      return NextResponse.json({ error: 'Failed to update profile picture' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })

  } catch (error) {
    logger.error('Profile picture update failed', error, { path: '/api/profile/update-picture' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
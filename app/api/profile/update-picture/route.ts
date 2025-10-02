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
      console.error('Profile picture update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile picture' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Profile picture update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
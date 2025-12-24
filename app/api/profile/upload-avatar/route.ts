import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-middleware'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.error) return auth.error
    const { user, supabase } = auth

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
      }, { status: 400 })
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 5MB.'
      }, { status: 400 })
    }

    // Create unique filename with user ID and timestamp
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

    // Delete old avatar if exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('picture_url')
      .eq('id', user.id)
      .single()

    if (profile?.picture_url) {
      // Extract the file path from the URL
      const oldPath = profile.picture_url.split('/').slice(-2).join('/')
      await supabase.storage
        .from('avatars')
        .remove([oldPath])
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      logger.error('Failed to upload avatar to storage', uploadError, { userId: user.id })
      return NextResponse.json({
        error: 'Failed to upload file'
      }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Update profile with new picture URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        picture_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to update profile with avatar URL', updateError, { userId: user.id })
      return NextResponse.json({
        error: 'Failed to update profile'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      pictureUrl: publicUrl,
      profile: updatedProfile
    })

  } catch (error) {
    logger.error('Avatar upload failed', error, { path: '/api/profile/upload-avatar' })
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

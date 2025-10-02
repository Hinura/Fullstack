"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Camera, Upload, X, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ProfilePictureUploadProps {
  userId: string
  currentPictureUrl?: string | null
  onUploadComplete: (newPictureUrl: string) => void
  className?: string
}

export default function ProfilePictureUpload({
  userId,
  currentPictureUrl,
  onUploadComplete,
  className = ""
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `profile-pictures/${fileName}`

      // Delete old profile picture if it exists
      if (currentPictureUrl) {
        const oldPath = currentPictureUrl.split('/').slice(-2).join('/')
        await supabase.storage.from('avatars').remove([oldPath])
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile in database
      console.log('Updating profile with URL:', data.publicUrl)
      const response = await fetch('/api/profile/update-picture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pictureUrl: data.publicUrl
        }),
      })

      console.log('API Response status:', response.status)
      console.log('API Response ok:', response.ok)

      if (!response.ok) {
        let errorMessage = 'Failed to update profile'
        try {
          const responseText = await response.text()
          try {
            const errorData = JSON.parse(responseText)
            errorMessage = errorData.error || errorMessage
          } catch (jsonError) {
            // Response is not JSON, use the raw text
            errorMessage = responseText || `HTTP ${response.status}: ${response.statusText}`
          }
        } catch (readError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      console.log('Upload successful, calling onUploadComplete with:', data.publicUrl)
      onUploadComplete(data.publicUrl)
      setPreviewUrl(null)

    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload image')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePicture = async () => {
    if (!currentPictureUrl) return

    setUploading(true)
    setError(null)

    try {
      // Delete from storage
      const oldPath = currentPictureUrl.split('/').slice(-2).join('/')
      await supabase.storage.from('avatars').remove([oldPath])

      // Update profile in database
      const response = await fetch('/api/profile/update-picture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pictureUrl: null
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to remove profile picture'
        try {
          const responseText = await response.text()
          try {
            const errorData = JSON.parse(responseText)
            errorMessage = errorData.error || errorMessage
          } catch (jsonError) {
            // Response is not JSON, use the raw text
            errorMessage = responseText || `HTTP ${response.status}: ${response.statusText}`
          }
        } catch (readError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      onUploadComplete('')

    } catch (error) {
      console.error('Remove error:', error)
      setError(error instanceof Error ? error.message : 'Failed to remove image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-600 font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col items-center space-y-4">
        {/* Profile Picture Display */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-coral/20 to-warm-green/20 flex items-center justify-center border-4 border-cream shadow-lg">
            {previewUrl || currentPictureUrl ? (
              <img
                src={previewUrl || currentPictureUrl || ''}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-charcoal/40" />
            )}
          </div>

          {/* Upload indicator */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}

          {/* Camera overlay on hover */}
          {!uploading && (
            <div
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-coral hover:bg-coral/90 text-cream rounded-2xl flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{currentPictureUrl ? 'Change Picture' : 'Upload Picture'}</span>
          </Button>

          {currentPictureUrl && (
            <Button
              variant="outline"
              onClick={handleRemovePicture}
              disabled={uploading}
              className="border-red-300 text-red-600 hover:bg-red-50 rounded-2xl flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Remove</span>
            </Button>
          )}
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Help Text */}
        <p className="text-sm text-charcoal/60 text-center max-w-xs">
          Upload a profile picture (JPG, PNG, max 5MB). Your image will be cropped to a circle.
        </p>
      </div>
    </div>
  )
}
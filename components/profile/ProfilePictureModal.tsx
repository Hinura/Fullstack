'use client'

import { X } from 'lucide-react'
import ProfilePictureUpload from '@/components/ProfilePictureUpload'

interface ProfilePictureModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentPictureUrl?: string | null
  onUploadComplete: (newPictureUrl: string) => void
}

export default function ProfilePictureModal({
  isOpen,
  onClose,
  userId,
  currentPictureUrl,
  onUploadComplete,
}: ProfilePictureModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-cream/95 backdrop-blur-sm rounded-3xl shadow-soft border border-sage-blue/20 w-full max-w-md">
        <div className="p-6 border-b border-sage-blue/20">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-charcoal">Profile Picture</h3>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-coral/10 hover:bg-coral/20 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <X className="w-5 h-5 text-coral" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <ProfilePictureUpload
            userId={userId}
            currentPictureUrl={currentPictureUrl}
            onUploadComplete={(url) => {
              onUploadComplete(url)
              onClose()
            }}
            className="flex justify-center"
          />
        </div>
      </div>
    </div>
  )
}

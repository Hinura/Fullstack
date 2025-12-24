'use client'

import { useState } from 'react'
import { User, Edit3 } from 'lucide-react'
import ProfilePictureModal from './ProfilePictureModal'

interface ProfilePictureButtonProps {
  userId: string
  pictureUrl?: string | null
}

export default function ProfilePictureButton({ userId, pictureUrl }: ProfilePictureButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [currentPictureUrl, setCurrentPictureUrl] = useState(pictureUrl)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="relative w-20 h-20 bg-gradient-to-br from-coral/20 to-warm-green/20 rounded-3xl flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-soft hover:shadow-lg group overflow-hidden"
      >
        {currentPictureUrl ? (
          <img
            src={currentPictureUrl}
            alt="Profile"
            className="w-full h-full object-cover rounded-3xl"
          />
        ) : (
          <User className="w-10 h-10 text-charcoal group-hover:text-coral transition-colors" />
        )}
        <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit3 className="w-6 h-6 text-white" />
        </div>
      </button>

      <ProfilePictureModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userId={userId}
        currentPictureUrl={currentPictureUrl}
        onUploadComplete={(newUrl) => {
          setCurrentPictureUrl(newUrl)
        }}
      />
    </>
  )
}

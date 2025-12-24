'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BirthdateSetup from '@/components/BirthdateSetup'

interface BirthdateSetupWrapperProps {
  needsBirthdateSetup: boolean
  children: React.ReactNode
}

export default function BirthdateSetupWrapper({ needsBirthdateSetup, children }: BirthdateSetupWrapperProps) {
  const router = useRouter()
  const [showSetup, setShowSetup] = useState(needsBirthdateSetup)

  const handleComplete = () => {
    setShowSetup(false)
    // Refresh to get updated data
    router.refresh()
  }

  return (
    <>
      {showSetup && <BirthdateSetup onComplete={handleComplete} />}
      {!showSetup && children}
    </>
  )
}

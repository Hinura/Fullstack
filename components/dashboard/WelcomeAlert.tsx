'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface WelcomeAlertProps {
  hasCompletedAssessment: boolean
}

export default function WelcomeAlert({ hasCompletedAssessment }: WelcomeAlertProps) {
  const searchParams = useSearchParams()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true)
      const timer = setTimeout(() => setShowWelcome(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!showWelcome) return null

  return (
    <Alert className="mb-8 border-2 border-warm-green/30 bg-warm-green/10 backdrop-blur-sm rounded-3xl shadow-soft">
      <AlertDescription className="text-warm-green/90">
        <div className="flex items-start space-x-4 p-6">
          <span className="text-3xl">🎉</span>
          <div>
            <h3 className="text-2xl font-bold text-warm-green mb-3">Welcome to Hinura!</h3>
            {hasCompletedAssessment ? (
              <p className="text-base leading-relaxed">
                Great job completing your skill assessment! Your personalized learning journey is ready.
              </p>
            ) : (
              <p className="text-base leading-relaxed">
                Your account has been successfully verified. You can now start your learning journey!
              </p>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

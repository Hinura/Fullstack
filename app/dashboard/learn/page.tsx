'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LearnPage() {
  const searchParams = useSearchParams()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true)
      // Hide welcome message after 5 seconds
      const timer = setTimeout(() => setShowWelcome(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5 p-8">
      {showWelcome && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <h2 className="text-xl font-bold">Welcome to Hinura! 🎉</h2>
          <p>Your account has been successfully verified. You can now start your learning journey!</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-charcoal mb-6">Learn</h1>
        <div className="bg-cream/95 rounded-2xl p-8 shadow-lg">
          <p className="text-lg text-charcoal/70 mb-4">Welcome to your learning dashboard!</p>
          <p className="text-charcoal/60">Your personalized learning experience is coming soon...</p>
        </div>
      </div>
    </div>
  )
}
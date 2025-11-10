'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Zap } from 'lucide-react'

interface StreakTrackerCardProps {
  currentStreak: number
  highestStreak: number
  freezeAvailable: boolean
}

export function StreakTrackerCard({
  currentStreak,
  highestStreak,
  freezeAvailable
}: StreakTrackerCardProps) {
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('')

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)

      const diff = midnight.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeUntilMidnight(`${hours}h ${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="p-6 bg-gradient-to-br from-coral/5 to-warm-green/5 border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-coral/15 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-coral" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Daily Streak</h3>
          </div>
          {freezeAvailable && (
            <span className="text-xs bg-sage-blue/20 text-sage-blue border border-sage-blue/30 rounded-full px-3 py-1 font-semibold inline-flex items-center">
              ❄️ Freeze Available
            </span>
          )}
        </div>

        {/* Streak Display */}
        <div className="text-center py-4 mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-4xl">🔥</span>
            <span className="text-5xl font-bold text-charcoal">{currentStreak}</span>
          </div>
          <p className="text-base font-medium text-charcoal/60">
            {currentStreak === 1 ? 'day' : 'days'} in a row
          </p>
        </div>

        {/* Time Remaining Today */}
        <div className="text-center py-3 bg-gradient-to-r from-warm-green/5 to-sage-blue/5 rounded-xl mb-4 border border-warm-green/10">
          <p className="text-xs text-charcoal/60 mb-1 font-medium uppercase tracking-wide">
            Time left today
          </p>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">⏱️</span>
            <p className="text-xl font-bold text-charcoal">{timeUntilMidnight}</p>
          </div>
        </div>

        {/* Personal Best */}
        {highestStreak > currentStreak && (
          <div className="text-center pt-4 border-t border-charcoal/10">
            <p className="text-sm text-charcoal/60">
              Personal best: <span className="font-bold text-warm-green">🏆 {highestStreak} days</span>
            </p>
          </div>
        )}

        {/* At Personal Best */}
        {highestStreak === currentStreak && currentStreak > 0 && (
          <div className="text-center pt-4 border-t border-charcoal/10">
            <p className="text-sm font-bold text-warm-green">
              🏆 Personal Best! Keep it going!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

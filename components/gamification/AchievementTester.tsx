'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AchievementUnlockModal } from './AchievementUnlockModal'

export function AchievementTester() {
  const [achievement, setAchievement] = useState<{
    name: string
    description: string
    icon_name: string
    points_reward: number
  } | null>(null)

  const testAchievements = [
    {
      name: 'First Steps',
      description: 'Complete your first quiz and start your learning journey!',
      icon_name: '🎯',
      points_reward: 10
    },
    {
      name: 'Week Warrior',
      description: 'Maintain a 7-day learning streak. Consistency is key!',
      icon_name: '🔥',
      points_reward: 50
    },
    {
      name: 'Perfect Score',
      description: 'Get 100% on any quiz. Excellence achieved!',
      icon_name: '💯',
      points_reward: 25
    },
    {
      name: 'Dedicated Learner',
      description: 'Complete 10 quizzes in total. Keep up the great work!',
      icon_name: '📚',
      points_reward: 30
    }
  ]

  return (
    <div className="p-6 bg-gradient-to-br from-coral/10 to-warm-green/10 rounded-3xl border border-coral/20">
      <h3 className="text-xl font-bold text-charcoal mb-4">
        🧪 Test Achievement Modal
      </h3>
      <p className="text-sm text-charcoal/60 mb-4">
        Click any achievement below to see the unlock modal:
      </p>
      <div className="grid grid-cols-2 gap-3">
        {testAchievements.map((ach, index) => (
          <Button
            key={index}
            onClick={() => setAchievement(ach)}
            variant="outline"
            className="text-left h-auto p-3 rounded-2xl border-charcoal/20 hover:bg-warm-green/10"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{ach.icon_name}</span>
              <div>
                <p className="font-semibold text-sm">{ach.name}</p>
                <p className="text-xs text-charcoal/60">+{ach.points_reward} XP</p>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Modal */}
      <AchievementUnlockModal
        achievement={achievement}
        onClose={() => setAchievement(null)}
      />
    </div>
  )
}

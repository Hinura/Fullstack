'use client'

import { useState } from 'react'
import { CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { LevelUpModal } from './LevelUpModal'

interface SubjectProgress {
  subject: 'math' | 'english' | 'science'
  level: number
  currentPoints: number
  pointsToNextLevel: number
}

interface SubjectProgressGridProps {
  subjects: SubjectProgress[]
}

const subjectConfig = {
  math: {
    name: 'Mathematics',
    icon: '📐',
    gradient: 'from-coral/5 to-warm-green/5',
    border: 'border-coral/15',
    iconBg: 'bg-coral/15',
    iconColor: 'text-coral'
  },
  english: {
    name: 'English',
    icon: '📖',
    gradient: 'from-warm-green/5 to-sage-blue/5',
    border: 'border-warm-green/15',
    iconBg: 'bg-warm-green/15',
    iconColor: 'text-warm-green'
  },
  science: {
    name: 'Science',
    icon: '🔬',
    gradient: 'from-sage-blue/5 to-coral/5',
    border: 'border-sage-blue/15',
    iconBg: 'bg-sage-blue/15',
    iconColor: 'text-sage-blue'
  }
}

export function SubjectProgressGrid({ subjects }: SubjectProgressGridProps) {
  const [selectedLevelUp, setSelectedLevelUp] = useState<{
    subject: 'math' | 'english' | 'science'
    oldLevel: number
    newLevel: number
    bonusPoints?: number
  } | null>(null)

  const handleCardClick = (subject: 'math' | 'english' | 'science', level: number) => {
    // Simulate a level up for demonstration
    setSelectedLevelUp({
      subject,
      oldLevel: level,
      newLevel: level + 1,
      bonusPoints: (level + 1) * 50
    })
  }

  return (
    <>
      {subjects.map(({ subject, level, currentPoints, pointsToNextLevel }) => {
        const config = subjectConfig[subject]

        // Calculate progress percentage
        const totalForNextLevel = level * level * 100
        const pointsInCurrentLevel = currentPoints
        const progressPercentage = totalForNextLevel > 0
          ? Math.min((pointsInCurrentLevel / totalForNextLevel) * 100, 100)
          : 0

        return (
          <button
            key={subject}
            onClick={() => handleCardClick(subject, level)}
            className={`w-full p-5 bg-gradient-to-br ${config.gradient} border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl cursor-pointer text-left`}
          >
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${config.iconBg} rounded-xl flex items-center justify-center`}>
                    <span className="text-xl">{config.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-charcoal">{config.name}</h4>
                    <p className="text-xs text-charcoal/60">Level {level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-charcoal">{currentPoints.toLocaleString()}</p>
                  <p className="text-xs text-charcoal/60">XP</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <Progress value={progressPercentage} className="h-2.5" />
                <p className="text-xs text-charcoal/60 text-center">
                  {pointsToNextLevel.toLocaleString()} XP to Level {level + 1}
                </p>
              </div>
            </CardContent>
          </button>
        )
      })}

      {/* Level-Up Modal */}
      <LevelUpModal
        levelUp={selectedLevelUp}
        onClose={() => setSelectedLevelUp(null)}
      />
    </>
  )
}

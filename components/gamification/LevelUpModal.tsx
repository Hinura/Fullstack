'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Trophy, Zap, Target } from 'lucide-react'

interface LevelUpModalProps {
  levelUp: {
    subject: 'math' | 'english' | 'science'
    oldLevel: number
    newLevel: number
    bonusPoints?: number
  } | null
  onClose: () => void
}

const subjectConfig = {
  math: {
    name: 'Mathematics',
    icon: '📐',
    color: 'coral',
    gradient: 'from-coral/20 to-warm-green/20',
    border: 'border-coral/40'
  },
  english: {
    name: 'English',
    icon: '📖',
    color: 'warm-green',
    gradient: 'from-warm-green/20 to-sage-blue/20',
    border: 'border-warm-green/40'
  },
  science: {
    name: 'Science',
    icon: '🔬',
    color: 'sage-blue',
    gradient: 'from-sage-blue/20 to-coral/20',
    border: 'border-sage-blue/40'
  }
}

export function LevelUpModal({ levelUp, onClose }: LevelUpModalProps) {
  // Close modal with ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (levelUp) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [levelUp, onClose])

  if (!levelUp) return null

  const config = subjectConfig[levelUp.subject]
  const bonusPoints = levelUp.bonusPoints || levelUp.newLevel * 50 // Default bonus calculation

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-cream rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-charcoal/10 hover:bg-charcoal/20 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
        >
          <X className="w-5 h-5 text-charcoal" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-charcoal mb-2">
              🎊 LEVEL UP! 🎊
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-coral via-warm-green to-sage-blue rounded-full mx-auto" />
          </div>

          {/* Subject Icon */}
          <div className={`w-32 h-32 bg-gradient-to-br ${config.gradient} rounded-3xl flex items-center justify-center border-4 ${config.border} shadow-lg`}>
            <span className="text-7xl">{config.icon}</span>
          </div>

          {/* Subject & Level Change */}
          <div className="text-center space-y-3">
            <p className="text-xl text-charcoal/70 font-semibold">
              {config.name}
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <p className="text-sm text-charcoal/60 mb-1">Previous</p>
                <p className="text-3xl font-bold text-charcoal/50">Level {levelUp.oldLevel}</p>
              </div>
              <div className="text-4xl text-warm-green animate-pulse">→</div>
              <div className="text-center">
                <p className="text-sm text-charcoal/60 mb-1">New</p>
                <p className="text-4xl font-bold text-warm-green">Level {levelUp.newLevel}</p>
              </div>
            </div>
          </div>

          {/* Encouragement Message */}
          <p className="text-center text-charcoal/70 text-base leading-relaxed max-w-sm px-4">
            Amazing progress! You&apos;re becoming a {config.name} expert!
          </p>

          {/* Rewards Box */}
          <div className={`w-full bg-gradient-to-r ${config.gradient} border-2 ${config.border} rounded-2xl p-5 shadow-soft`}>
            <p className="font-bold text-charcoal mb-3 flex items-center justify-center">
              <Trophy className="w-5 h-5 mr-2 text-warm-green" />
              Rewards Unlocked
            </p>
            <ul className="space-y-2 text-sm text-charcoal/80">
              <li className="flex items-center">
                <Zap className="w-4 h-4 mr-2 text-warm-green flex-shrink-0" />
                <span><strong>+{bonusPoints} XP</strong> Level-Up Bonus</span>
              </li>
              <li className="flex items-center">
                <Target className="w-4 h-4 mr-2 text-sage-blue flex-shrink-0" />
                <span>Higher Point Multiplier</span>
              </li>
              <li className="flex items-center">
                <span className="text-base mr-2">🎯</span>
                <span>More Challenging Questions</span>
              </li>
            </ul>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-coral via-warm-green to-sage-blue hover:opacity-90 text-cream font-bold text-lg py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            Continue Learning 🚀
          </Button>
        </div>
      </div>
    </div>
  )
}

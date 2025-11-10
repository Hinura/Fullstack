'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface AchievementUnlockModalProps {
  achievement: {
    name: string
    description: string
    icon_name: string
    points_reward: number
    rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  } | null
  onClose: () => void
  autoCloseDelay?: number // Auto-close after X ms (optional)
}

// Confetti particle configuration
interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  delay: number
  duration: number
  color: string
}

// Rarity-based theme configurations using Bloom Humanist palette
const rarityThemes = {
  common: {
    gradient: 'from-sage-blue to-warm-green',
    glow: 'shadow-soft',
    glowColor: '#4ecdc4',
    border: 'border-sage-blue/20',
    bg: 'from-sage-blue/10 to-warm-green/10',
    text: 'text-charcoal',
    accentText: 'text-sage-blue',
    confettiColors: ['#4ecdc4', '#45b7d1', '#6ee7de']
  },
  rare: {
    gradient: 'from-warm-green to-sage-blue',
    glow: 'shadow-organic',
    glowColor: '#45b7d1',
    border: 'border-warm-green/30',
    bg: 'from-warm-green/10 to-sage-blue/10',
    text: 'text-charcoal',
    accentText: 'text-warm-green',
    confettiColors: ['#45b7d1', '#4ecdc4', '#67d4ed']
  },
  epic: {
    gradient: 'from-coral via-warm-green to-sage-blue',
    glow: 'shadow-organic-lg',
    glowColor: '#ff6b6b',
    border: 'border-coral/30',
    bg: 'from-coral/10 to-warm-green/10',
    text: 'text-charcoal',
    accentText: 'text-coral',
    confettiColors: ['#ff6b6b', '#ff8787', '#45b7d1']
  },
  legendary: {
    gradient: 'from-coral via-sage-blue to-warm-green',
    glow: 'shadow-organic-lg',
    glowColor: '#ff6b6b',
    border: 'border-coral/40',
    bg: 'from-coral/20 to-sage-blue/20',
    text: 'text-charcoal',
    accentText: 'text-coral',
    confettiColors: ['#ff6b6b', '#4ecdc4', '#45b7d1']
  }
}

export function AchievementUnlockModal({
  achievement,
  onClose,
  autoCloseDelay
}: AchievementUnlockModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [isClosing, setIsClosing] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const rarity = achievement?.rarity || 'common'
  const theme = rarityThemes[rarity]

  // Handle close with callback
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
      setIsClosing(false)
    }, 300) // Match animation duration
  }

  // Generate confetti particles
  useEffect(() => {
    if (achievement) {
      const particleCount = rarity === 'legendary' ? 50 : rarity === 'epic' ? 40 : rarity === 'rare' ? 30 : 20
      const newParticles: Particle[] = []

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: -10 - Math.random() * 20,
          rotation: Math.random() * 360,
          delay: Math.random() * 0.3,
          duration: 2 + Math.random() * 2,
          color: theme.confettiColors[Math.floor(Math.random() * theme.confettiColors.length)]
        })
      }

      setParticles(newParticles)

      // Trigger entrance animation
      setTimeout(() => setIsVisible(true), 10)

      // Optional auto-close
      if (autoCloseDelay) {
        const autoCloseTimer = setTimeout(() => handleClose(), autoCloseDelay)
        return () => clearTimeout(autoCloseTimer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievement, rarity, autoCloseDelay, theme.confettiColors])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }

    if (achievement) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'

      // Focus trap for accessibility
      modalRef.current?.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievement])

  if (!achievement) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-title"
      aria-describedby="achievement-description"
    >
      {/* Backdrop with blur */}
      <div
        className={`absolute inset-0 bg-charcoal/60 backdrop-blur-sm transition-all duration-500 ${
          isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Confetti Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 rounded-sm animate-confetti-fall"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              transform: `rotate(${particle.rotation}deg)`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              opacity: 0.9,
              willChange: 'transform, opacity'
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative bg-cream rounded-3xl shadow-2xl max-w-md w-full p-8 transition-all duration-500 ${
          isVisible && !isClosing
            ? 'scale-100 translate-y-0 opacity-100'
            : 'scale-90 translate-y-8 opacity-0'
        }`}
        style={{
          willChange: 'transform, opacity',
          transformOrigin: 'center center'
        }}
      >
        {/* Content */}
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-0 right-0 w-10 h-10 bg-charcoal/10 hover:bg-charcoal/20 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            aria-label="Close achievement modal"
          >
            <X className="w-5 h-5 text-charcoal" />
          </button>

          {/* Content */}
          <div className="flex flex-col items-center space-y-6 py-4">
            {/* Title */}
            <div className="text-center">
              <h2 id="achievement-title" className="text-4xl font-bold text-charcoal mb-2">
                🎊 Achievement Unlocked! 🎊
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-coral via-warm-green to-sage-blue rounded-full mx-auto" />
            </div>

            {/* Achievement Icon with Glow */}
            <div className="relative animate-icon-bounce">
              {/* Static glow rings */}
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  boxShadow: `0 0 30px 8px ${theme.glowColor}60, 0 0 50px 15px ${theme.glowColor}30`
                }}
              />

              {/* Icon container */}
              <div className={`relative w-36 h-36 bg-gradient-to-br ${theme.bg} rounded-3xl flex items-center justify-center border-4 ${theme.border} shadow-lg`}>
                <span className="text-7xl">{achievement.icon_name}</span>
              </div>
            </div>

            {/* Rarity Badge */}
            <div className="text-center">
              <span className={`inline-block px-5 py-2 rounded-2xl bg-gradient-to-r ${theme.gradient} text-cream text-sm font-bold uppercase tracking-wider shadow-soft`}>
                {rarity}
              </span>
            </div>

            {/* Achievement Details */}
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-charcoal">
                {achievement.name}
              </h3>
              <p id="achievement-description" className="text-charcoal/70 text-base leading-relaxed max-w-sm">
                {achievement.description}
              </p>
            </div>

            {/* XP Reward */}
            {achievement.points_reward > 0 && (
              <div className={`w-full bg-gradient-to-r ${theme.bg} border-2 ${theme.border} rounded-2xl px-8 py-4 shadow-soft`}>
                <p className={`${theme.accentText} font-bold text-xl text-center`}>
                  +{achievement.points_reward} XP Earned! 🎯
                </p>
              </div>
            )}

            {/* Close Button */}
            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-coral via-warm-green to-sage-blue hover:opacity-90 text-cream font-bold text-lg py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Awesome! 🚀
            </Button>
          </div>
        </div>
      </div>

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes icon-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-confetti-fall {
          animation: confetti-fall ease-in-out forwards;
        }

        .animate-icon-bounce {
          animation: icon-bounce 1s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }
      `}</style>
    </div>
  )
}

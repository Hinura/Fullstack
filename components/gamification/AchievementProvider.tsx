'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AchievementUnlockModal } from './AchievementUnlockModal'

interface Achievement {
  name: string
  description: string
  icon_name: string
  points_reward: number
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

interface AchievementContextType {
  showAchievement: (achievement: Achievement) => void
  queueAchievements: (achievements: Achievement[]) => void
  isShowing: boolean
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined)

interface AchievementProviderProps {
  children: ReactNode
  autoCloseDelay?: number
}

export function AchievementProvider({ children, autoCloseDelay = 5000 }: AchievementProviderProps) {
  const [queue, setQueue] = useState<Achievement[]>([])
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)
  const [isShowing, setIsShowing] = useState(false)

  // Show a single achievement
  const showAchievement = useCallback((achievement: Achievement) => {
    if (isShowing) {
      // If already showing, add to queue
      setQueue((prev) => [...prev, achievement])
    } else {
      setCurrentAchievement(achievement)
      setIsShowing(true)
    }
  }, [isShowing])

  // Queue multiple achievements
  const queueAchievements = useCallback((achievements: Achievement[]) => {
    if (achievements.length === 0) return

    if (isShowing) {
      // Add all to queue
      setQueue((prev) => [...prev, ...achievements])
    } else {
      // Show first, queue rest
      setCurrentAchievement(achievements[0])
      setIsShowing(true)
      if (achievements.length > 1) {
        setQueue((prev) => [...prev, ...achievements.slice(1)])
      }
    }
  }, [isShowing])

  // Handle modal close
  const handleClose = useCallback(() => {
    setIsShowing(false)
    setCurrentAchievement(null)

    // Show next achievement from queue after a short delay
    setTimeout(() => {
      setQueue((prev) => {
        if (prev.length > 0) {
          const [next, ...rest] = prev
          setCurrentAchievement(next)
          setIsShowing(true)
          return rest
        }
        return prev
      })
    }, 500) // Small delay between achievements
  }, [])

  return (
    <AchievementContext.Provider value={{ showAchievement, queueAchievements, isShowing }}>
      {children}
      <AchievementUnlockModal
        achievement={currentAchievement}
        onClose={handleClose}
        autoCloseDelay={autoCloseDelay}
      />
    </AchievementContext.Provider>
  )
}

// Custom hook to use achievement context
export function useAchievements() {
  const context = useContext(AchievementContext)
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider')
  }
  return context
}

// Hook for checking and showing achievements after actions
export function useCheckAchievements() {
  const { queueAchievements } = useAchievements()

  const checkAchievements = useCallback(async () => {
    try {
      const response = await fetch('/api/gamification/check-achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Failed to check achievements:', response.statusText)
        return { success: false, newlyUnlocked: [] }
      }

      const data = await response.json()

      // Show newly unlocked achievements
      if (data.success && data.newlyUnlocked?.length > 0) {
        const formattedAchievements = data.newlyUnlocked.map((a: {
          name: string
          description: string
          icon: string
          pointsReward: number
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
        }) => ({
          name: a.name,
          description: a.description,
          icon_name: a.icon,
          points_reward: a.pointsReward,
          rarity: a.rarity
        }))

        queueAchievements(formattedAchievements)
      }

      return data
    } catch (error) {
      console.error('Error checking achievements:', error)
      return { success: false, newlyUnlocked: [] }
    }
  }, [queueAchievements])

  return { checkAchievements }
}

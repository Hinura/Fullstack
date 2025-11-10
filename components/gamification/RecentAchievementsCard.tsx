'use client'

import { useState } from 'react'
import { Trophy, Lock } from 'lucide-react'
import { AchievementUnlockModal } from './AchievementUnlockModal'

interface Achievement {
  id: string
  achievement_key: string
  name: string
  description: string
  category: string
  icon_name: string
  points_reward: number
  rarity: string
  unlocked_at: string | null
}

interface RecentAchievementsCardProps {
  unlockedAchievements: Achievement[]
  lockedAchievements: Achievement[]
  totalCount: number
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'text-charcoal/60 bg-charcoal/5'
    case 'rare': return 'text-sage-blue bg-sage-blue/10'
    case 'epic': return 'text-purple-600 bg-purple-100'
    case 'legendary': return 'text-amber-600 bg-amber-100'
    default: return 'text-charcoal/60 bg-charcoal/5'
  }
}

export function RecentAchievementsCard({
  unlockedAchievements,
  lockedAchievements,
  totalCount
}: RecentAchievementsCardProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [activeTab, setActiveTab] = useState<'unlocked' | 'locked'>('unlocked')
  const [showAll, setShowAll] = useState(false)

  const displayUnlocked = showAll ? unlockedAchievements : unlockedAchievements.slice(0, 3)
  const displayLocked = showAll ? lockedAchievements : lockedAchievements.slice(0, 3)

  if (totalCount === 0 && lockedAchievements.length === 0) {
    return (
      <div className="bg-cream/95 rounded-3xl p-8 shadow-soft border border-sage-blue/10">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-sage-blue/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-sage-blue" />
          </div>
          <h3 className="text-2xl font-bold text-charcoal mb-2">No Achievements Yet</h3>
          <p className="text-base text-charcoal/60 max-w-md mx-auto">
            Complete quizzes and maintain streaks to earn your first achievement!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream/95 rounded-3xl p-8 shadow-soft border border-sage-blue/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-sage-blue/15 rounded-2xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-sage-blue" />
          </div>
          <h3 className="text-3xl font-bold text-charcoal">Achievements</h3>
        </div>
        <span className="text-sm bg-sage-blue/20 text-sage-blue border border-sage-blue/30 rounded-full px-4 py-1.5 font-semibold">
          {totalCount} / {unlockedAchievements.length + lockedAchievements.length}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => {
            setActiveTab('unlocked')
            setShowAll(false)
          }}
          className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all duration-200 ${
            activeTab === 'unlocked'
              ? 'bg-gradient-to-r from-warm-green/20 to-sage-blue/20 text-charcoal border-2 border-warm-green/30'
              : 'bg-charcoal/5 text-charcoal/60 border-2 border-transparent hover:bg-charcoal/10'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>Unlocked ({unlockedAchievements.length})</span>
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab('locked')
            setShowAll(false)
          }}
          className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all duration-200 ${
            activeTab === 'locked'
              ? 'bg-gradient-to-r from-coral/20 to-sage-blue/20 text-charcoal border-2 border-coral/30'
              : 'bg-charcoal/5 text-charcoal/60 border-2 border-transparent hover:bg-charcoal/10'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Locked ({lockedAchievements.length})</span>
          </div>
        </button>
      </div>

      {/* Achievement List */}
      <div className="space-y-3">
        {activeTab === 'unlocked' && (
          <>
            {displayUnlocked.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-charcoal/60">No achievements unlocked yet</p>
              </div>
            ) : (
              displayUnlocked.map((achievement) => (
                <button
                  key={achievement.id}
                  onClick={() => setSelectedAchievement(achievement)}
                  className="w-full flex items-center space-x-4 p-5 bg-gradient-to-r from-warm-green/10 to-sage-blue/10 rounded-2xl border-2 border-warm-green/20 hover:border-warm-green/40 hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  {/* Icon */}
                  <div className="w-14 h-14 bg-warm-green/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-3xl">{achievement.icon_name}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-charcoal text-lg truncate">
                        {achievement.name}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                    <p className="text-sm text-charcoal/70 truncate mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-warm-green font-bold">
                        +{achievement.points_reward} XP
                      </span>
                      <span className="text-xs text-charcoal/50">
                        {achievement.unlocked_at && new Date(achievement.unlocked_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
            {unlockedAchievements.length > 3 && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-sm font-semibold text-sage-blue hover:text-sage-blue/80 transition-colors"
                >
                  {showAll
                    ? '↑ Show less'
                    : `View all ${unlockedAchievements.length} unlocked →`
                  }
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'locked' && (
          <>
            {displayLocked.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-warm-green/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-warm-green" />
                </div>
                <p className="text-charcoal font-semibold mb-1">All Achievements Unlocked!</p>
                <p className="text-sm text-charcoal/60">You&apos;ve earned every achievement available</p>
              </div>
            ) : (
              displayLocked.map((achievement) => (
                <button
                  key={achievement.id}
                  onClick={() => setSelectedAchievement(achievement)}
                  className="w-full flex items-center space-x-4 p-5 bg-charcoal/5 rounded-2xl border-2 border-charcoal/10 hover:border-charcoal/20 hover:bg-charcoal/10 transition-all duration-200 cursor-pointer group"
                >
                  {/* Icon */}
                  <div className="w-14 h-14 bg-charcoal/10 rounded-2xl flex items-center justify-center flex-shrink-0 relative">
                    <span className="text-3xl opacity-30">{achievement.icon_name}</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-charcoal/60" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-charcoal/70 text-lg truncate">
                        {achievement.name}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold opacity-60 ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                    <p className="text-sm text-charcoal/60 truncate mb-2">
                      {achievement.description}
                    </p>
                    <span className="text-sm text-charcoal/50 font-semibold">
                      +{achievement.points_reward} XP
                    </span>
                  </div>
                </button>
              ))
            )}
            {lockedAchievements.length > 3 && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-sm font-semibold text-coral hover:text-coral/80 transition-colors"
                >
                  {showAll
                    ? '↑ Show less'
                    : `View all ${lockedAchievements.length} locked →`
                  }
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Achievement Modal */}
      <AchievementUnlockModal
        achievement={selectedAchievement ? {
          name: selectedAchievement.name,
          description: selectedAchievement.description,
          icon_name: selectedAchievement.icon_name,
          points_reward: selectedAchievement.points_reward
        } : null}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  )
}

export interface AwardPointsRequest {
  basePoints: number
  transactionType: 'quiz_correct' | 'quiz_completion' | 'achievement_unlock' | 'perfect_score' | 'streak_bonus' | 'level_up' | 'quiz_partial' | 'daily_goal'
  relatedEntityType?: 'quiz_attempt' | 'achievement'
  relatedEntityId?: string
  metadata?: {
    subject?: 'math' | 'english' | 'science'
    difficulty?: string
    accuracy?: number
    [key: string]: unknown
  }
}

export interface AwardPointsResponse {
  success: boolean
  pointsAwarded: number
  basePoints: number
  multipliers: {
    streak: number
    level: number
    total: number
  }
  transactionId: string
}

export interface StreakUpdateResponse {
  success: boolean
  streakDays: number
  usedFreeze: boolean
  message: string
  milestoneReached?: {
    days: number
    bonusPoints: number
  }
}

export interface Achievement {
  id: string
  achievement_key: string
  name: string
  description: string
  category: 'mastery' | 'persistence' | 'milestone' | 'exploration'
  icon_name: string
  points_reward: number
  unlock_criteria: Record<string, unknown>
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  sort_order: number
  is_hidden: boolean
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
}

export interface PointTransaction {
  id: string
  user_id: string
  points_change: number
  transaction_type: 'quiz_correct' | 'quiz_partial' | 'quiz_completion' | 'streak_bonus' | 'level_up' | 'achievement_unlock' | 'daily_goal' | 'perfect_score'
  related_entity_type?: string
  related_entity_id?: string
  multiplier: number
  base_points: number
  metadata?: Record<string, unknown>
  created_at: string
}

export interface SubjectProgress {
  level: number
  points: number
  pointsToNextLevel: number
}

export interface GamificationProfile {
  totalPoints: number
  overallLevel: number
  streak: {
    currentDays: number
    highestDays: number
    freezeAvailable: boolean
  }
  subjects: {
    math: SubjectProgress
    english: SubjectProgress
    science: SubjectProgress
  }
  achievements: {
    total: number
    recent: Array<{
      unlocked_at: string
      achievements: {
        name: string
        description: string
        icon_name: string
        points_reward: number
      }
    }>
  }
  recentActivity: {
    xpLast7Days: number
  }
}

export interface UnlockedAchievement {
  id: string
  key: string
  name: string
  description: string
  pointsReward: number
  icon: string
}

export interface CheckAchievementsResponse {
  success: boolean
  newlyUnlocked: UnlockedAchievement[]
  totalUnlocked: number
}

export interface DashboardResponse {
  user: {
    id: string
    email: string | undefined
    username: string | null
    fullName: string | null
    birthdate: string | null
    age: number | null
    pictureUrl: string | null
    points: number
    currentLevel: number
    streakDays: number
    createdAt: string
    updatedAt: string
  }
  skillLevels: Record<string, { level: number; percentage: number }>
  stats: {
    totalExercises: number
    correctAnswers: number
    accuracyPercentage: number
    streakDays: number
    completedAssessments: number
  }
  hasCompletedAssessment: boolean
  assessmentHistory: Array<{
    id: string
    subject: string
    difficulty: string
    total_questions: number
    correct_answers: number
    score_percentage: number
    points_earned: number
    completed_at: string
  }>
  gamification: GamificationProfile
}

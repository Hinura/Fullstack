// lib/constants/game-config.ts
// Centralized game configuration and constants

// ============================================
// SKILL LEVELS & ASSESSMENT
// ============================================

export const SKILL_LEVELS = {
  THRESHOLDS: {
    EXPERT: 90,      // Level 5: 90%+
    ADVANCED: 76,    // Level 4: 76-89%
    INTERMEDIATE: 60, // Level 3: 60-75%
    BASIC: 50,       // Level 2: 50-59%
    BEGINNER: 0      // Level 1: 0-49%
  },
  NAMES: {
    5: 'Expert',
    4: 'Advanced',
    3: 'Intermediate',
    2: 'Basic',
    1: 'Beginner'
  } as const
} as const

export function calculateSkillLevel(percentage: number): number {
  const { THRESHOLDS } = SKILL_LEVELS

  if (percentage >= THRESHOLDS.EXPERT) return 5
  if (percentage >= THRESHOLDS.ADVANCED) return 4
  if (percentage >= THRESHOLDS.INTERMEDIATE) return 3
  if (percentage >= THRESHOLDS.BASIC) return 2
  return 1
}

// ============================================
// ASSESSMENT CONFIGURATION
// ============================================

export const ASSESSMENT_CONFIG = {
  QUESTION_DISTRIBUTION: {
    EASY: 2,
    MEDIUM: 3,
    HARD: 2
  },
  TOTAL_QUESTIONS: 7 // 2 + 3 + 2
} as const

// ============================================
// STREAK & GAMIFICATION
// ============================================

export const STREAK_CONFIG = {
  MILESTONES: [3, 7, 14, 30, 60, 100] as const,
  BONUS_POINTS: {
    3: 75,
    7: 150,
    14: 300,
    30: 500,
    60: 750,
    100: 1500
  } as const,
  FREEZE_RESET_DAYS: 6,
  AUTO_CLOSE_MODAL_DELAY: 5000 // milliseconds
} as const

// ============================================
// RATE LIMITING
// ============================================

export const RATE_LIMITS = {
  AI_HINT: {
    MAX_REQUESTS: 30,
    WINDOW_MS: 60_000 // 1 minute
  },
  AI_EXPLAIN: {
    MAX_REQUESTS: 20,
    WINDOW_MS: 60_000
  },
  AI_INSIGHTS: {
    MAX_REQUESTS: 8,
    WINDOW_MS: 60_000
  },
  AI_RECOMMENDATIONS: {
    MAX_REQUESTS: 10,
    WINDOW_MS: 60_000
  }
} as const

// ============================================
// CACHING
// ============================================

export const CACHE_CONFIG = {
  AI_HINT_TTL: 5 * 60_000,      // 5 minutes
  AI_EXPLAIN_TTL: 5 * 60_000,   // 5 minutes
  RECOMMENDATIONS_TTL: 10 * 60_000 // 10 minutes
} as const

// ============================================
// EDL (Educational Data Layer)
// ============================================

export const EDL_CONFIG = {
  DIFFICULTY_DISTRIBUTION: {
    MASTERED: { EASY: 20, MEDIUM: 50, HARD: 30 },
    STRONG: { EASY: 30, MEDIUM: 50, HARD: 20 },
    MODERATE: { EASY: 40, MEDIUM: 50, HARD: 10 },
    NEEDS_WORK: { EASY: 50, MEDIUM: 40, HARD: 10 },
    STRUGGLING: { EASY: 70, MEDIUM: 25, HARD: 5 }
  }
} as const

// ============================================
// TYPE EXPORTS
// ============================================

export type SkillLevelName = typeof SKILL_LEVELS.NAMES[keyof typeof SKILL_LEVELS.NAMES]
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type Subject = 'math' | 'english' | 'science'

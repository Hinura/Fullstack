/**
 * EDL (Effective Difficulty Level) System
 * Main export file for the adaptive learning system
 *
 * Phase 2A: Simple EDL Implementation
 * Based on Flow Theory and Zone of Proximal Development
 */

// ============================================
// Calculator exports
// ============================================

export {
  calculatePerformanceAdjustment,
  calculateEffectiveAge,
  calculateAverageAccuracy,
  shouldAdjustPerformance,
  getAdjustmentRecommendationMessage,
  getQuizzesUntilAdjustment,
  isInFlowZone,
  simulateAdjustmentProgression,
  calculateScoreStatistics,
} from './calculator';

// ============================================
// Selector exports
// ============================================

export {
  getOrInitializePerformanceMetrics,
  getEffectiveAge,
  calculateEDL,
  selectQuestions,
  selectQuestionsWithEDL,
  hasEnoughQuizData,
  getAvailableQuestionCount,
  getUnattemptedQuestionCount,
} from './selector';

// ============================================
// Updater exports
// ============================================

export {
  updatePerformanceMetrics,
  recordQuestionAttempt,
  recordQuestionAttemptsBatch,
  processQuizCompletion,
  resetPerformanceMetrics,
  getPerformanceTrend,
  getUserOverallStatistics,
  needsMorePractice,
} from './updater';

// ============================================
// Type re-exports
// ============================================

export type {
  // Core types
  PerformanceMetrics,
  PerformanceUpdateInput,
  PerformanceAdjustmentResult,
  AdjustmentReason,

  // Question types
  Question,
  QuestionWithHistory,
  QuestionHistory,
  QuestionAttemptInput,

  // Quiz types
  QuizAttempt,
  QuizAttemptInput,

  // EDL calculation types
  EDLCalculationResult,
  EDLRecommendation,
  QuestionSelectionOptions,
  QuestionSelectionResult,

  // Enums
  Subject,
  Difficulty,
} from '@/lib/types/edl';

export {
  // Constants
  SUBJECTS,
  DIFFICULTY_LEVELS,
  AGE_BOUNDS,
  ADJUSTMENT_BOUNDS,
  ACCURACY_THRESHOLDS,
  MIN_QUIZZES_FOR_ADJUSTMENT,
  DEFAULT_EXCLUSION_DAYS,

  // Type guards
  isValidSubject,
  isValidDifficulty,
  isValidAge,
  isValidAdjustment,
  isValidAccuracy,
} from '@/lib/types/edl';

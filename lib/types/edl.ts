/**
 * TypeScript types for the Effective Difficulty Level (EDL) system
 * Phase 2A: Simple EDL Implementation
 */

// ============================================
// Subject and Difficulty Enums
// ============================================

export const SUBJECTS = ['math', 'english', 'science'] as const;
export type Subject = (typeof SUBJECTS)[number];

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTY_LEVELS)[number];

// ============================================
// Core EDL Types
// ============================================

/**
 * Performance metrics for a user in a specific subject
 * Tracks effective age and recent quiz performance
 */
export interface PerformanceMetrics {
  user_id: string;
  subject: Subject;
  chronological_age: number;  // User's actual age (7-18)
  performance_adjustment: number;  // -2 to +2 adjustment
  effective_age: number;  // chronological_age + performance_adjustment (7-18)
  recent_accuracy: number | null;  // Average of last 3 quizzes (0-100)
  last_3_quiz_scores: number[];  // Array of last 3 quiz scores
  total_questions_answered: number;
  total_correct: number;
  last_quiz_at: string | null;  // ISO timestamp
  created_at: string;  // ISO timestamp
  updated_at: string;  // ISO timestamp
}

/**
 * Input for updating performance metrics after a quiz
 */
export interface PerformanceUpdateInput {
  user_id: string;
  subject: Subject;
  score: number;  // 0-100 percentage
  chronological_age: number;
}

/**
 * Result of calculating performance adjustment
 */
export interface PerformanceAdjustmentResult {
  adjustment: number;  // -2 to +2
  reason: AdjustmentReason;
  previous_adjustment: number;
  new_effective_age: number;
}

export type AdjustmentReason =
  | 'exceptional_performance'  // ≥90% → +2
  | 'high_performance'         // ≥85% → +1
  | 'optimal_flow_zone'        // 60-84% → 0 (no change)
  | 'struggling'               // 50-60% → -1
  | 'severe_difficulty'        // <50% → -2
  | 'insufficient_data';       // Less than 3 quizzes

// ============================================
// Question Types
// ============================================

/**
 * Question from the database
 */
export interface Question {
  id: string;
  subject: Subject;
  age_group: number;  // 7-18
  difficulty: Difficulty;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;  // 'A', 'B', 'C', or 'D'
  created_at: string;
  updated_at: string;
}

/**
 * Question with user attempt history
 */
export interface QuestionWithHistory extends Question {
  user_attempted: boolean;
  user_answered_correctly: boolean | null;
  user_time_spent_seconds: number | null;
  user_answered_at: string | null;
}

/**
 * Question history record
 */
export interface QuestionHistory {
  user_id: string;
  question_id: string;
  answered_correctly: boolean;
  time_spent_seconds: number | null;
  answered_at: string;
}

/**
 * Input for recording a question attempt
 */
export interface QuestionAttemptInput {
  user_id: string;
  question_id: string;
  answered_correctly: boolean;
  time_spent_seconds?: number;
}

// ============================================
// Quiz Types
// ============================================

/**
 * Quiz attempt record
 */
export interface QuizAttempt {
  id: string;
  user_id: string;
  subject: Subject;
  difficulty: Difficulty;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  points_earned: number;
  time_spent_seconds: number | null;
  completed_at: string;
}

/**
 * Input for creating a quiz attempt
 */
export interface QuizAttemptInput {
  user_id: string;
  subject: Subject;
  difficulty: Difficulty;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  points_earned: number;
  time_spent_seconds?: number;
}

// ============================================
// EDL Calculation Types
// ============================================

/**
 * Result of EDL calculation for question selection
 */
export interface EDLCalculationResult {
  effective_age: number;  // The age level to use for question selection
  performance_adjustment: number;  // Current adjustment value
  recommendation: EDLRecommendation;
  metrics: PerformanceMetrics;
}

export type EDLRecommendation =
  | 'increase_difficulty'  // Student performing too well
  | 'maintain_difficulty'  // Student in flow zone
  | 'decrease_difficulty'  // Student struggling
  | 'no_change';           // Not enough data or no adjustment needed

/**
 * Options for selecting questions
 */
export interface QuestionSelectionOptions {
  user_id: string;
  subject: Subject;
  difficulty?: Difficulty;  // Optional: filter by difficulty
  effective_age: number;  // Age level to select questions from
  limit?: number;  // Number of questions to return (default: 5)
  exclude_recent_days?: number;  // Exclude questions attempted within X days (default: 30)
}

/**
 * Result of question selection
 */
export interface QuestionSelectionResult {
  questions: Question[];
  effective_age: number;
  performance_metrics: PerformanceMetrics;
  excluded_count: number;  // Number of questions excluded due to recent attempts
}

// ============================================
// Validation Types
// ============================================

/**
 * Age bounds for the EDL system
 */
export const AGE_BOUNDS = {
  MIN: 7,
  MAX: 18,
} as const;

/**
 * Performance adjustment bounds
 */
export const ADJUSTMENT_BOUNDS = {
  MIN: -2,
  MAX: 2,
} as const;

/**
 * Accuracy thresholds for adjustments (percentage values 0-100)
 */
export const ACCURACY_THRESHOLDS = {
  EXCEPTIONAL: 90,    // ≥90% → +2 or increase current adjustment
  HIGH: 85,           // ≥85% → +1 or increase current adjustment
  FLOW_ZONE_MAX: 84,  // Upper bound of optimal flow zone
  FLOW_ZONE_MIN: 60,  // Lower bound of optimal flow zone
  STRUGGLING: 60,     // <60% → -1 or decrease current adjustment
  SEVERE: 50,         // <50% → -2 or decrease current adjustment
} as const;

/**
 * Minimum number of quizzes required before adjusting difficulty
 */
export const MIN_QUIZZES_FOR_ADJUSTMENT = 3;

/**
 * Default number of days to exclude recently attempted questions
 * Reduced from 30 to 7 days for thesis prototype to enable continuous daily practice
 * with the current question pool size (15 per age/subject)
 */
export const DEFAULT_EXCLUSION_DAYS = 7;

// ============================================
// Helper Type Guards
// ============================================

/**
 * Type guard to check if a value is a valid Subject
 */
export function isValidSubject(value: unknown): value is Subject {
  return typeof value === 'string' && SUBJECTS.includes(value as Subject);
}

/**
 * Type guard to check if a value is a valid Difficulty
 */
export function isValidDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && DIFFICULTY_LEVELS.includes(value as Difficulty);
}

/**
 * Type guard to check if age is within valid bounds
 */
export function isValidAge(age: number): boolean {
  return Number.isInteger(age) && age >= AGE_BOUNDS.MIN && age <= AGE_BOUNDS.MAX;
}

/**
 * Type guard to check if adjustment is within valid bounds
 */
export function isValidAdjustment(adjustment: number): boolean {
  return Number.isInteger(adjustment) &&
         adjustment >= ADJUSTMENT_BOUNDS.MIN &&
         adjustment <= ADJUSTMENT_BOUNDS.MAX;
}

/**
 * Type guard to check if accuracy is valid percentage
 */
export function isValidAccuracy(accuracy: number): boolean {
  return accuracy >= 0 && accuracy <= 100;
}

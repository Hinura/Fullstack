/**
 * EDL Calculator - Performance Adjustment Logic
 * Calculates effective age based on recent quiz performance
 *
 * Theoretical foundation:
 * - Flow Theory (Csikszentmihalyi, 1990): Optimal challenge at 60-75% success rate
 * - Zone of Proximal Development (Vygotsky, 1978): Learn best when slightly challenged
 */

import {
  type PerformanceAdjustmentResult,
  type AdjustmentReason,
  ACCURACY_THRESHOLDS,
  ADJUSTMENT_BOUNDS,
  AGE_BOUNDS,
  MIN_QUIZZES_FOR_ADJUSTMENT,
  isValidAge,
  isValidAdjustment,
  isValidAccuracy,
} from '@/lib/types/edl';

// ============================================
// Core Calculation Functions
// ============================================

/**
 * Calculate performance adjustment based on recent quiz scores
 *
 * Adjustment Rules:
 * - ≥90% accuracy (3 quizzes) → increase adjustment toward +2 (exceptional performance)
 * - ≥85% accuracy (3 quizzes) → increase adjustment toward +1 (high performance)
 * - 60-84% accuracy → no change (optimal flow zone)
 * - 50-60% accuracy (3 quizzes) → decrease adjustment toward -1 (struggling)
 * - <50% accuracy (3 quizzes) → decrease adjustment toward -2 (severe difficulty)
 *
 * @param recentScores - Array of recent quiz scores (0-100 percentages)
 * @param currentAdjustment - Current performance adjustment value
 * @returns New performance adjustment value (-2 to +2)
 */
export function calculatePerformanceAdjustment(
  recentScores: number[],
  currentAdjustment: number = 0
): PerformanceAdjustmentResult {
  // Validate current adjustment
  if (!isValidAdjustment(currentAdjustment)) {
    throw new Error(`Invalid current adjustment: ${currentAdjustment}. Must be between ${ADJUSTMENT_BOUNDS.MIN} and ${ADJUSTMENT_BOUNDS.MAX}`);
  }

  // Validate all scores
  for (const score of recentScores) {
    if (!isValidAccuracy(score)) {
      throw new Error(`Invalid score: ${score}. Scores must be between 0 and 100`);
    }
  }

  // Not enough data - require at least 3 quizzes
  if (recentScores.length < MIN_QUIZZES_FOR_ADJUSTMENT) {
    return {
      adjustment: currentAdjustment,
      reason: 'insufficient_data',
      previous_adjustment: currentAdjustment,
      new_effective_age: 0, // Will be calculated by caller
    };
  }

  // Calculate average accuracy from recent scores
  const avgAccuracy = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;

  let newAdjustment = currentAdjustment;
  let reason: AdjustmentReason;

  // Apply adjustment rules based on accuracy thresholds
  if (avgAccuracy >= ACCURACY_THRESHOLDS.EXCEPTIONAL) {
    // Exceptional performance (≥90%) - move toward +2
    newAdjustment = Math.min(ADJUSTMENT_BOUNDS.MAX, currentAdjustment + 1);
    reason = 'exceptional_performance';
  } else if (avgAccuracy >= ACCURACY_THRESHOLDS.HIGH) {
    // High performance (≥85%) - move toward +1
    newAdjustment = Math.min(ADJUSTMENT_BOUNDS.MAX, currentAdjustment + 1);
    reason = 'high_performance';
  } else if (avgAccuracy >= ACCURACY_THRESHOLDS.FLOW_ZONE_MIN) {
    // Flow zone (60-84%) - maintain current difficulty
    newAdjustment = currentAdjustment;
    reason = 'optimal_flow_zone';
  } else if (avgAccuracy >= ACCURACY_THRESHOLDS.SEVERE) {
    // Struggling (50-60%) - move toward -1
    newAdjustment = Math.max(ADJUSTMENT_BOUNDS.MIN, currentAdjustment - 1);
    reason = 'struggling';
  } else {
    // Severe difficulty (<50%) - move toward -2
    newAdjustment = Math.max(ADJUSTMENT_BOUNDS.MIN, currentAdjustment - 1);
    reason = 'severe_difficulty';
  }

  return {
    adjustment: newAdjustment,
    reason,
    previous_adjustment: currentAdjustment,
    new_effective_age: 0, // Will be calculated by caller
  };
}

/**
 * Calculate effective age from chronological age and performance adjustment
 * Effective age is clamped to valid age bounds (7-18)
 *
 * Formula: effective_age = clamp(chronological_age + performance_adjustment, 7, 18)
 *
 * @param chronologicalAge - User's actual age (7-18)
 * @param performanceAdjustment - Performance-based adjustment (-2 to +2)
 * @returns Effective age for question selection (7-18)
 */
export function calculateEffectiveAge(
  chronologicalAge: number,
  performanceAdjustment: number
): number {
  // Validate inputs
  if (!isValidAge(chronologicalAge)) {
    throw new Error(`Invalid chronological age: ${chronologicalAge}. Must be between ${AGE_BOUNDS.MIN} and ${AGE_BOUNDS.MAX}`);
  }

  if (!isValidAdjustment(performanceAdjustment)) {
    throw new Error(`Invalid performance adjustment: ${performanceAdjustment}. Must be between ${ADJUSTMENT_BOUNDS.MIN} and ${ADJUSTMENT_BOUNDS.MAX}`);
  }

  // Calculate and clamp effective age
  const effectiveAge = chronologicalAge + performanceAdjustment;
  return Math.max(AGE_BOUNDS.MIN, Math.min(AGE_BOUNDS.MAX, effectiveAge));
}

/**
 * Calculate average accuracy from an array of quiz scores
 * Returns null if array is empty
 *
 * @param scores - Array of quiz scores (0-100 percentages)
 * @returns Average accuracy or null if no scores
 */
export function calculateAverageAccuracy(scores: number[]): number | null {
  if (scores.length === 0) {
    return null;
  }

  // Validate all scores
  for (const score of scores) {
    if (!isValidAccuracy(score)) {
      throw new Error(`Invalid score: ${score}. Scores must be between 0 and 100`);
    }
  }

  const sum = scores.reduce((acc, score) => acc + score, 0);
  return sum / scores.length;
}

/**
 * Determine if performance adjustment is needed based on recent scores
 *
 * @param recentScores - Array of recent quiz scores
 * @returns True if adjustment should be made (3+ quizzes), false otherwise
 */
export function shouldAdjustPerformance(recentScores: number[]): boolean {
  return recentScores.length >= MIN_QUIZZES_FOR_ADJUSTMENT;
}

/**
 * Get recommendation message based on adjustment reason
 * Useful for debugging and logging
 *
 * @param reason - Adjustment reason
 * @returns Human-readable recommendation message
 */
export function getAdjustmentRecommendationMessage(reason: AdjustmentReason): string {
  const messages: Record<AdjustmentReason, string> = {
    exceptional_performance: 'Student is excelling! Increasing challenge level.',
    high_performance: 'Student is performing well! Slightly increasing difficulty.',
    optimal_flow_zone: 'Student is in optimal flow zone. Maintaining current difficulty.',
    struggling: 'Student is struggling. Slightly decreasing difficulty.',
    severe_difficulty: 'Student needs support. Decreasing challenge level.',
    insufficient_data: 'Not enough quiz data to adjust difficulty. Need at least 3 quizzes.',
  };

  return messages[reason];
}

/**
 * Calculate the required number of additional quizzes before adjustment
 *
 * @param currentQuizCount - Current number of quizzes completed
 * @returns Number of quizzes needed (0 if ready for adjustment)
 */
export function getQuizzesUntilAdjustment(currentQuizCount: number): number {
  return Math.max(0, MIN_QUIZZES_FOR_ADJUSTMENT - currentQuizCount);
}

/**
 * Determine if user is in the optimal flow zone
 *
 * @param accuracy - Recent accuracy percentage (0-100)
 * @returns True if in flow zone (60-84%), false otherwise
 */
export function isInFlowZone(accuracy: number): boolean {
  if (!isValidAccuracy(accuracy)) {
    throw new Error(`Invalid accuracy: ${accuracy}. Must be between 0 and 100`);
  }

  return accuracy >= ACCURACY_THRESHOLDS.FLOW_ZONE_MIN &&
         accuracy <= ACCURACY_THRESHOLDS.FLOW_ZONE_MAX;
}

// ============================================
// Utility Functions for Testing/Calibration
// ============================================

/**
 * Simulate performance adjustment over multiple quizzes
 * Useful for testing and understanding the EDL system behavior
 *
 * @param quizScores - Array of quiz scores to simulate
 * @param initialAdjustment - Starting adjustment value
 * @returns Array of adjustment results for each quiz
 */
export function simulateAdjustmentProgression(
  quizScores: number[],
  initialAdjustment: number = 0
): PerformanceAdjustmentResult[] {
  const results: PerformanceAdjustmentResult[] = [];
  let currentAdjustment = initialAdjustment;

  for (let i = 0; i < quizScores.length; i++) {
    // Use last 3 scores (or all available if less than 3)
    const startIdx = Math.max(0, i - 2);
    const recentScores = quizScores.slice(startIdx, i + 1);

    const result = calculatePerformanceAdjustment(recentScores, currentAdjustment);
    results.push(result);
    currentAdjustment = result.adjustment;
  }

  return results;
}

/**
 * Calculate statistics for a set of quiz scores
 * Useful for analytics and calibration
 *
 * @param scores - Array of quiz scores
 * @returns Statistics object
 */
export function calculateScoreStatistics(scores: number[]): {
  mean: number | null;
  min: number | null;
  max: number | null;
  range: number | null;
  inFlowZone: number;  // Count of scores in flow zone
  tooEasy: number;      // Count of scores ≥85%
  tooHard: number;      // Count of scores <60%
} {
  if (scores.length === 0) {
    return {
      mean: null,
      min: null,
      max: null,
      range: null,
      inFlowZone: 0,
      tooEasy: 0,
      tooHard: 0,
    };
  }

  const mean = calculateAverageAccuracy(scores);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min;

  let inFlowZone = 0;
  let tooEasy = 0;
  let tooHard = 0;

  for (const score of scores) {
    if (score >= ACCURACY_THRESHOLDS.HIGH) {
      tooEasy++;
    } else if (score < ACCURACY_THRESHOLDS.FLOW_ZONE_MIN) {
      tooHard++;
    } else {
      inFlowZone++;
    }
  }

  return {
    mean,
    min,
    max,
    range,
    inFlowZone,
    tooEasy,
    tooHard,
  };
}

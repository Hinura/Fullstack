// lib/edl/selector.ts
// Question selection logic for EDL system

import type {
  Difficulty,
  UserPerformanceMetrics,
  DifficultyDistribution,
  QuestionSelectionMetadata
} from './types';
import { calculateDifficultyDistribution, getEDLStatus } from './calculator';

/**
 * Determine which age to use for question selection
 * @param metrics - User's EDL metrics
 * @param difficulty - Selected difficulty mode
 * @returns Age to use for fetching questions
 */
export function getTargetAge(
  metrics: UserPerformanceMetrics | null,
  difficulty: Difficulty
): number {
  if (!metrics) {
    throw new Error('User metrics not found. Complete assessment first.');
  }

  // Adaptive mode uses effective age
  if (difficulty === 'adaptive') {
    return metrics.effective_age;
  }

  // Manual mode uses chronological age
  return metrics.chronological_age;
}

/**
 * Determine difficulty distribution for question selection
 * @param metrics - User's EDL metrics
 * @param difficulty - Selected difficulty
 * @param limit - Total number of questions
 * @returns Distribution of questions by difficulty
 */
export function getDifficultyDistribution(
  metrics: UserPerformanceMetrics | null,
  difficulty: Difficulty,
  limit: number = 10
): DifficultyDistribution {
  // Manual difficulty - all questions at specified level
  if (difficulty !== 'adaptive') {
    return {
      easy: difficulty === 'easy' ? limit : 0,
      medium: difficulty === 'medium' ? limit : 0,
      hard: difficulty === 'hard' ? limit : 0
    };
  }

  // Adaptive mode - use accuracy to determine distribution
  const accuracy = metrics?.recent_accuracy ?? null;
  return calculateDifficultyDistribution(accuracy, limit);
}

/**
 * Build metadata for question selection response
 * @param metrics - User's EDL metrics
 * @param difficulty - Selected difficulty
 * @param limit - Total questions
 * @returns Metadata object
 */
export function buildSelectionMetadata(
  metrics: UserPerformanceMetrics | null,
  difficulty: Difficulty,
  limit: number
): QuestionSelectionMetadata {
  if (!metrics) {
    throw new Error('User metrics not found');
  }

  const targetAge = getTargetAge(metrics, difficulty);
  const distribution = getDifficultyDistribution(metrics, difficulty, limit);
  const mode = difficulty === 'adaptive' ? 'adaptive' : 'manual';

  return {
    target_age: targetAge,
    mode,
    distribution,
    user_status: {
      effective_age: metrics.effective_age,
      recent_accuracy: metrics.recent_accuracy,
      status: getEDLStatus(metrics.recent_accuracy)
    }
  };
}

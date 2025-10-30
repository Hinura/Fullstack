// lib/edl/calculator.ts
// Client-side EDL utilities for question selection
// NOTE: Core EDL calculations (performance adjustment, effective age) are handled
// by PostgreSQL functions. This file contains ONLY production utilities.

import type {
  EDLStatus,
  DifficultyDistribution
} from './types';

/**
 * Determine EDL status based on accuracy
 * Maps accuracy percentage to user-friendly status category
 * Used by selector.ts for building question selection metadata
 * @param accuracy - Recent accuracy percentage (0-100)
 * @returns Status string for UI display
 */
export function getEDLStatus(accuracy: number | null): EDLStatus {
  if (accuracy === null) return 'flow_zone'; // Default for new users

  if (accuracy >= 90) return 'exceptional';
  if (accuracy >= 85) return 'approaching_mastery';
  if (accuracy >= 60) return 'flow_zone';
  if (accuracy >= 50) return 'challenging';
  return 'struggling';
}

/**
 * Calculate difficulty distribution for adaptive mode
 * Used by selector.ts to determine question mix based on user performance
 * @param recentAccuracy - User's recent accuracy percentage (0-100)
 * @param totalQuestions - Total questions to distribute
 * @returns Distribution of questions by difficulty level
 */
export function calculateDifficultyDistribution(
  recentAccuracy: number | null,
  totalQuestions: number = 10
): DifficultyDistribution {
  // Default balanced distribution for new users
  if (recentAccuracy === null) {
    return {
      easy: Math.floor(totalQuestions * 0.3),
      medium: Math.ceil(totalQuestions * 0.4),
      hard: Math.floor(totalQuestions * 0.3)
    };
  }

  // High performers need more challenge
  if (recentAccuracy >= 75) {
    return {
      easy: Math.floor(totalQuestions * 0.2),   // 20% easy
      medium: Math.floor(totalQuestions * 0.3), // 30% medium
      hard: Math.ceil(totalQuestions * 0.5)     // 50% hard
    };
  }

  // Struggling users need more support
  if (recentAccuracy < 60) {
    return {
      easy: Math.ceil(totalQuestions * 0.5),    // 50% easy
      medium: Math.floor(totalQuestions * 0.3), // 30% medium
      hard: Math.floor(totalQuestions * 0.2)    // 20% hard
    };
  }

  // Flow zone - balanced distribution
  return {
    easy: Math.floor(totalQuestions * 0.3),
    medium: Math.ceil(totalQuestions * 0.4),
    hard: Math.floor(totalQuestions * 0.3)
  };
}

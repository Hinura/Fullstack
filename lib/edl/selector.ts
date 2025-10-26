/**
 * EDL Selector - Question Selection Logic
 * Selects appropriate questions based on effective age and user history
 */

import { createClient } from '@/lib/supabase/server';
import {
  type PerformanceMetrics,
  type Question,
  type QuestionSelectionOptions,
  type QuestionSelectionResult,
  type EDLCalculationResult,
  type EDLRecommendation,
  type Subject,
  type Difficulty,
  DEFAULT_EXCLUSION_DAYS,
  isValidAge,
  isValidSubject,
} from '@/lib/types/edl';

// ============================================
// Performance Metrics Retrieval
// ============================================

/**
 * Get or initialize performance metrics for a user in a subject
 * If metrics don't exist, creates them with initial values
 *
 * @param userId - User's UUID
 * @param subject - Subject (math, english, science)
 * @param chronologicalAge - User's actual age from profile
 * @returns Performance metrics for the user in this subject
 */
export async function getOrInitializePerformanceMetrics(
  userId: string,
  subject: Subject,
  chronologicalAge: number
): Promise<PerformanceMetrics> {
  if (!isValidSubject(subject)) {
    throw new Error(`Invalid subject: ${subject}`);
  }

  if (!isValidAge(chronologicalAge)) {
    throw new Error(`Invalid chronological age: ${chronologicalAge}`);
  }

  const supabase = await createClient();

  // Try to fetch existing metrics
  const { data: existingMetrics, error: fetchError } = await supabase
    .from('user_performance_metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('subject', subject)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 is "not found" error - that's OK, we'll create it
    throw new Error(`Error fetching performance metrics: ${fetchError.message}`);
  }

  // If metrics exist, return them
  if (existingMetrics) {
    return existingMetrics as PerformanceMetrics;
  }

  // Initialize new metrics using the database function
  const { error: initError } = await supabase
    .rpc('initialize_user_performance_metrics', {
      p_user_id: userId,
      p_subject: subject,
      p_chronological_age: chronologicalAge,
    });

  if (initError) {
    throw new Error(`Error initializing performance metrics: ${initError.message}`);
  }

  // Fetch the newly created metrics
  const { data: newMetrics, error: newFetchError } = await supabase
    .from('user_performance_metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('subject', subject)
    .single();

  if (newFetchError || !newMetrics) {
    throw new Error('Error fetching newly initialized metrics');
  }

  return newMetrics as PerformanceMetrics;
}

/**
 * Get effective age for a user in a subject
 * Convenience wrapper around getOrInitializePerformanceMetrics
 *
 * @param userId - User's UUID
 * @param subject - Subject (math, english, science)
 * @param chronologicalAge - User's actual age
 * @returns Effective age (7-18)
 */
export async function getEffectiveAge(
  userId: string,
  subject: Subject,
  chronologicalAge: number
): Promise<number> {
  const metrics = await getOrInitializePerformanceMetrics(userId, subject, chronologicalAge);
  return metrics.effective_age;
}

/**
 * Calculate EDL result including recommendation
 *
 * @param userId - User's UUID
 * @param subject - Subject
 * @param chronologicalAge - User's actual age
 * @returns Complete EDL calculation result
 */
export async function calculateEDL(
  userId: string,
  subject: Subject,
  chronologicalAge: number
): Promise<EDLCalculationResult> {
  const metrics = await getOrInitializePerformanceMetrics(userId, subject, chronologicalAge);

  let recommendation: EDLRecommendation;

  if (metrics.recent_accuracy === null || metrics.last_3_quiz_scores.length < 3) {
    recommendation = 'no_change';
  } else {
    const accuracy = metrics.recent_accuracy;

    if (accuracy >= 85) {
      recommendation = 'increase_difficulty';
    } else if (accuracy < 60) {
      recommendation = 'decrease_difficulty';
    } else {
      recommendation = 'maintain_difficulty';
    }
  }

  return {
    effective_age: metrics.effective_age,
    performance_adjustment: metrics.performance_adjustment,
    recommendation,
    metrics,
  };
}

// ============================================
// Question Selection
// ============================================

/**
 * Select questions for a user based on effective age and history
 * Excludes recently attempted questions to prevent repeats
 *
 * @param options - Question selection options
 * @returns Questions and selection metadata
 */
export async function selectQuestions(
  options: QuestionSelectionOptions
): Promise<QuestionSelectionResult> {
  const {
    user_id,
    subject,
    difficulty,
    effective_age,
    limit = 5,
    exclude_recent_days = DEFAULT_EXCLUSION_DAYS,
  } = options;

  if (!isValidSubject(subject)) {
    throw new Error(`Invalid subject: ${subject}`);
  }

  if (!isValidAge(effective_age)) {
    throw new Error(`Invalid effective age: ${effective_age}`);
  }

  const supabase = await createClient();

  // Get performance metrics (needed for return value)
  const { data: metricsData, error: metricsError } = await supabase
    .from('user_performance_metrics')
    .select('*')
    .eq('user_id', user_id)
    .eq('subject', subject)
    .single();

  if (metricsError) {
    throw new Error(`Error fetching performance metrics: ${metricsError.message}`);
  }

  const metrics = metricsData as PerformanceMetrics;

  // Get recently attempted question IDs to exclude
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - exclude_recent_days);

  const { data: recentHistory, error: historyError } = await supabase
    .from('user_question_history')
    .select('question_id')
    .eq('user_id', user_id)
    .gte('answered_at', cutoffDate.toISOString());

  if (historyError) {
    throw new Error(`Error fetching question history: ${historyError.message}`);
  }

  const excludedQuestionIds = recentHistory?.map((h) => h.question_id) || [];
  const excludedCount = excludedQuestionIds.length;

  let questions: Question[] = [];

  // Special handling for max age (18) without specific difficulty
  // Balance between easy, medium, and hard to keep advanced students engaged
  if (effective_age === 18 && !difficulty) {
    const questionsPerDifficulty = Math.ceil(limit / 3);
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

    for (const diff of difficulties) {
      let query = supabase
        .from('questions')
        .select('*')
        .eq('subject', subject)
        .eq('age_group', effective_age)
        .eq('difficulty', diff);

      // Exclude recently attempted questions
      if (excludedQuestionIds.length > 0) {
        query = query.not('id', 'in', `(${excludedQuestionIds.join(',')})`);
      }

      const { data: diffQuestions } = await query
        .limit(questionsPerDifficulty * 2)
        .order('created_at', { ascending: false });

      if (diffQuestions && diffQuestions.length > 0) {
        // Shuffle and take requested amount for this difficulty
        const shuffled = diffQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, questionsPerDifficulty);
        questions.push(...shuffled);
      }
    }

    // Shuffle the combined questions
    questions = questions.sort(() => Math.random() - 0.5).slice(0, limit);
  } else {
    // Standard query for specific difficulty or non-max age
    let query = supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .eq('age_group', effective_age);

    // Add difficulty filter if specified
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    // Exclude recently attempted questions
    if (excludedQuestionIds.length > 0) {
      query = query.not('id', 'in', `(${excludedQuestionIds.join(',')})`);
    }

    // Order randomly and limit
    const { data: queryQuestions, error: questionsError } = await query
      .limit(limit * 2)  // Fetch more than needed to allow for random selection
      .order('created_at', { ascending: false });

    if (questionsError) {
      throw new Error(`Error fetching questions: ${questionsError.message}`);
    }

    // Randomly shuffle and limit to requested amount
    questions = (queryQuestions || [])
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  }

  return {
    questions: questions as Question[],
    effective_age,
    performance_metrics: metrics,
    excluded_count: excludedCount,
  };
}

/**
 * Select questions using automatic EDL calculation
 * Convenience function that combines calculateEDL and selectQuestions
 *
 * @param userId - User's UUID
 * @param subject - Subject
 * @param chronologicalAge - User's actual age
 * @param difficulty - Optional difficulty filter
 * @param limit - Number of questions to return
 * @returns Questions and selection metadata
 */
export async function selectQuestionsWithEDL(
  userId: string,
  subject: Subject,
  chronologicalAge: number,
  difficulty?: Difficulty,
  limit: number = 5
): Promise<QuestionSelectionResult> {
  const edlResult = await calculateEDL(userId, subject, chronologicalAge);

  return await selectQuestions({
    user_id: userId,
    subject,
    difficulty,
    effective_age: edlResult.effective_age,
    limit,
  });
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if user has attempted enough quizzes for reliable adjustment
 *
 * @param userId - User's UUID
 * @param subject - Subject
 * @returns True if user has 3+ quiz attempts
 */
export async function hasEnoughQuizData(
  userId: string,
  subject: Subject
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_performance_metrics')
    .select('last_3_quiz_scores')
    .eq('user_id', userId)
    .eq('subject', subject)
    .single();

  if (error) {
    return false;
  }

  return (data?.last_3_quiz_scores?.length || 0) >= 3;
}

/**
 * Get count of available questions for a given effective age and subject
 * Useful for checking if enough questions exist
 *
 * @param subject - Subject
 * @param effectiveAge - Effective age level
 * @param difficulty - Optional difficulty filter
 * @returns Count of available questions
 */
export async function getAvailableQuestionCount(
  subject: Subject,
  effectiveAge: number,
  difficulty?: Difficulty
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('subject', subject)
    .eq('age_group', effectiveAge);

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Error counting questions: ${error.message}`);
  }

  return count || 0;
}

/**
 * Get questions that user has NOT attempted yet
 * Useful for ensuring fresh content
 *
 * @param userId - User's UUID
 * @param subject - Subject
 * @param effectiveAge - Effective age level
 * @returns Count of unattempted questions
 */
export async function getUnattemptedQuestionCount(
  userId: string,
  subject: Subject,
  effectiveAge: number
): Promise<number> {
  const supabase = await createClient();

  // Get all questions for this age/subject
  const { data: allQuestions, error: questionsError } = await supabase
    .from('questions')
    .select('id')
    .eq('subject', subject)
    .eq('age_group', effectiveAge);

  if (questionsError) {
    throw new Error(`Error fetching questions: ${questionsError.message}`);
  }

  // Get attempted question IDs
  const { data: attemptedHistory, error: historyError } = await supabase
    .from('user_question_history')
    .select('question_id')
    .eq('user_id', userId);

  if (historyError) {
    throw new Error(`Error fetching history: ${historyError.message}`);
  }

  const attemptedIds = new Set(attemptedHistory?.map((h) => h.question_id) || []);
  const unattemptedCount = (allQuestions || []).filter(
    (q) => !attemptedIds.has(q.id)
  ).length;

  return unattemptedCount;
}

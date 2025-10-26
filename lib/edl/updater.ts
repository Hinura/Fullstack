/**
 * EDL Updater - Performance Metrics Update Logic
 * Updates user performance metrics after quiz completion
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import {
  type PerformanceMetrics,
  type PerformanceUpdateInput,
  type QuestionAttemptInput,
  type Subject,
  isValidSubject,
  isValidAccuracy,
  isValidAge,
} from '@/lib/types/edl';
import {
  calculatePerformanceAdjustment,
  calculateAverageAccuracy,
  calculateEffectiveAge,
} from './calculator';
import { getOrInitializePerformanceMetrics } from './selector';

// ============================================
// Performance Metrics Update
// ============================================

/**
 * Update performance metrics after a quiz is completed
 * Updates rolling window of last 3 quiz scores and recalculates adjustment
 *
 * @param input - Performance update input data
 * @returns Updated performance metrics
 */
export async function updatePerformanceMetrics(
  input: PerformanceUpdateInput
): Promise<PerformanceMetrics> {
  const { user_id, subject, score, chronological_age } = input;

  // Validate inputs
  if (!isValidSubject(subject)) {
    throw new Error(`Invalid subject: ${subject}`);
  }

  if (!isValidAccuracy(score)) {
    throw new Error(`Invalid score: ${score}. Must be between 0 and 100`);
  }

  if (!isValidAge(chronological_age)) {
    throw new Error(`Invalid chronological age: ${chronological_age}`);
  }

  const supabase = await createClient();

  // Get or initialize existing metrics
  const existingMetrics = await getOrInitializePerformanceMetrics(
    user_id,
    subject,
    chronological_age
  );

  // Update last 3 quiz scores (rolling window)
  const updatedScores = [...existingMetrics.last_3_quiz_scores, score].slice(-3);

  // Calculate new average accuracy
  const newAccuracy = calculateAverageAccuracy(updatedScores);

  // Calculate new performance adjustment
  const adjustmentResult = calculatePerformanceAdjustment(
    updatedScores,
    existingMetrics.performance_adjustment
  );

  // Calculate new effective age (capped at 7-18)
  const newEffectiveAge = calculateEffectiveAge(
    chronological_age,
    adjustmentResult.adjustment
  );

  // Determine if answer was correct (>= 60% is passing)
  const wasCorrect = score >= 60;

  // Update metrics in database
  // Note: effective_age is GENERATED column, so we don't update it directly
  // PostgreSQL automatically calculates it as: chronological_age + performance_adjustment
  const { data: updatedMetrics, error: updateError } = await supabase
    .from('user_performance_metrics')
    .update({
      chronological_age,  // Update in case user's age changed (birthday)
      performance_adjustment: adjustmentResult.adjustment,
      // effective_age is GENERATED - removed from update
      recent_accuracy: newAccuracy,
      last_3_quiz_scores: updatedScores,
      total_questions_answered: existingMetrics.total_questions_answered + 1,
      total_correct: existingMetrics.total_correct + (wasCorrect ? 1 : 0),
      last_quiz_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user_id)
    .eq('subject', subject)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Error updating performance metrics: ${updateError.message}`);
  }

  return updatedMetrics as PerformanceMetrics;
}

/**
 * Record a question attempt in history
 * Prevents question repeats and tracks individual question performance
 *
 * @param input - Question attempt input data
 */
export async function recordQuestionAttempt(
  input: QuestionAttemptInput
): Promise<void> {
  const { user_id, question_id, answered_correctly, time_spent_seconds } = input;

  const supabase = await createClient();

  // Insert or update question history
  const { error } = await supabase
    .from('user_question_history')
    .upsert({
      user_id,
      question_id,
      answered_correctly,
      time_spent_seconds: time_spent_seconds || null,
      answered_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,question_id',  // Update if already exists
    });

  if (error) {
    throw new Error(`Error recording question attempt: ${error.message}`);
  }
}

/**
 * Record multiple question attempts in batch
 * More efficient for quiz completion
 *
 * @param attempts - Array of question attempts
 * @param supabaseClient - Optional authenticated Supabase client
 */
export async function recordQuestionAttemptsBatch(
  attempts: QuestionAttemptInput[],
  supabaseClient?: SupabaseClient
): Promise<void> {
  // Use service role client to bypass RLS for this server-side operation
  // This is safe because user authentication is already verified in the API route
  const supabase = createServiceClient();

  const records = attempts.map((attempt) => ({
    user_id: attempt.user_id,
    question_id: attempt.question_id,
    answered_correctly: attempt.answered_correctly,
    time_spent_seconds: attempt.time_spent_seconds || null,
    answered_at: new Date().toISOString(),
  }));

  console.log('🔍 Recording question history:', {
    user_id: records[0]?.user_id?.substring(0, 8),
    records_count: records.length
  });

  // Use upsert with service role (bypasses RLS)
  const { error } = await supabase
    .from('user_question_history')
    .upsert(records, {
      onConflict: 'user_id,question_id',
    });

  if (error) {
    console.error('❌ Error recording question history:', error);
    throw new Error(`Error recording question attempts: ${error.message}`);
  }

  console.log(`✅ Question history saved: ${records.length} records`);
}

// ============================================
// Complete Quiz Processing
// ============================================

/**
 * Process complete quiz submission
 * Updates both performance metrics and question history
 *
 * @param userId - User's UUID
 * @param subject - Subject
 * @param score - Overall quiz score percentage (0-100)
 * @param chronologicalAge - User's actual age
 * @param questionAttempts - Individual question attempts from the quiz
 * @param supabaseClient - Optional authenticated Supabase client (recommended)
 * @returns Updated performance metrics
 */
export async function processQuizCompletion(
  userId: string,
  subject: Subject,
  score: number,
  chronologicalAge: number,
  questionAttempts: QuestionAttemptInput[],
  supabaseClient?: SupabaseClient
): Promise<PerformanceMetrics> {
  // Record individual question attempts
  if (questionAttempts.length > 0) {
    await recordQuestionAttemptsBatch(questionAttempts, supabaseClient);
  }

  // Update performance metrics
  const updatedMetrics = await updatePerformanceMetrics({
    user_id: userId,
    subject,
    score,
    chronological_age: chronologicalAge,
  });

  return updatedMetrics;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Reset user performance metrics for a subject
 * Useful for testing or allowing users to restart
 *
 * @param userId - User's UUID
 * @param subject - Subject to reset
 * @param chronologicalAge - User's actual age
 */
export async function resetPerformanceMetrics(
  userId: string,
  subject: Subject,
  chronologicalAge: number
): Promise<void> {
  if (!isValidSubject(subject)) {
    throw new Error(`Invalid subject: ${subject}`);
  }

  if (!isValidAge(chronologicalAge)) {
    throw new Error(`Invalid chronological age: ${chronologicalAge}`);
  }

  const supabase = await createClient();

  // Reset to initial state
  // Note: effective_age is GENERATED and will auto-reset to chronological_age + 0
  const { error } = await supabase
    .from('user_performance_metrics')
    .update({
      performance_adjustment: 0,
      // effective_age is GENERATED - auto-calculated as chronological_age + 0
      recent_accuracy: null,
      last_3_quiz_scores: [],
      total_questions_answered: 0,
      total_correct: 0,
      last_quiz_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('subject', subject);

  if (error) {
    throw new Error(`Error resetting performance metrics: ${error.message}`);
  }
}

/**
 * Get performance trend for a user in a subject
 * Returns last N quiz scores to show improvement/decline
 *
 * @param userId - User's UUID
 * @param subject - Subject
 * @param limit - Number of recent quizzes to fetch
 * @returns Array of quiz scores with timestamps
 */
export async function getPerformanceTrend(
  userId: string,
  subject: Subject,
  limit: number = 10
): Promise<Array<{ score: number; completed_at: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('score_percentage, completed_at')
    .eq('user_id', userId)
    .eq('subject', subject)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Error fetching performance trend: ${error.message}`);
  }

  return (data || []).map((d) => ({
    score: d.score_percentage,
    completed_at: d.completed_at,
  }));
}

/**
 * Get overall statistics for a user across all subjects
 *
 * @param userId - User's UUID
 * @returns Statistics summary
 */
export async function getUserOverallStatistics(
  userId: string
): Promise<{
  total_quizzes: number;
  total_questions: number;
  total_correct: number;
  overall_accuracy: number;
  subjects: Record<Subject, {
    effective_age: number;
    performance_adjustment: number;
    recent_accuracy: number | null;
    quizzes_completed: number;
  }>;
}> {
  const supabase = await createClient();

  // Get all performance metrics for user
  const { data: metricsData, error: metricsError } = await supabase
    .from('user_performance_metrics')
    .select('*')
    .eq('user_id', userId);

  if (metricsError) {
    throw new Error(`Error fetching statistics: ${metricsError.message}`);
  }

  const metrics = (metricsData || []) as PerformanceMetrics[];

  let totalQuestions = 0;
  let totalCorrect = 0;

  interface SubjectStats {
    effective_age: number;
    performance_adjustment: number;
    recent_accuracy: number | null;
    quizzes_completed: number;
  }

  const subjects: Record<string, SubjectStats> = {};

  for (const metric of metrics) {
    totalQuestions += metric.total_questions_answered;
    totalCorrect += metric.total_correct;

    subjects[metric.subject] = {
      effective_age: metric.effective_age,
      performance_adjustment: metric.performance_adjustment,
      recent_accuracy: metric.recent_accuracy,
      quizzes_completed: metric.last_3_quiz_scores.length,
    };
  }

  // Get total quiz count
  const { count: quizCount, error: quizError } = await supabase
    .from('quiz_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (quizError) {
    throw new Error(`Error counting quizzes: ${quizError.message}`);
  }

  const overallAccuracy = totalQuestions > 0
    ? (totalCorrect / totalQuestions) * 100
    : 0;

  return {
    total_quizzes: quizCount || 0,
    total_questions: totalQuestions,
    total_correct: totalCorrect,
    overall_accuracy: overallAccuracy,
    subjects: subjects,
  };
}

/**
 * Check if user needs more practice before progressing
 * Returns true if recent accuracy is below 60% (flow zone minimum)
 *
 * @param userId - User's UUID
 * @param subject - Subject
 * @returns True if more practice recommended
 */
export async function needsMorePractice(
  userId: string,
  subject: Subject
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_performance_metrics')
    .select('recent_accuracy')
    .eq('user_id', userId)
    .eq('subject', subject)
    .single();

  if (error || !data) {
    return false;  // No data available
  }

  return data.recent_accuracy !== null && data.recent_accuracy < 60;
}

// lib/edl/types.ts
// TypeScript types for EDL system

export type Subject = 'math' | 'english' | 'science';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'adaptive';

export type PerformanceAdjustment = -2 | -1 | 0 | 1 | 2;

export type EDLStatus =
  | 'exceptional'
  | 'approaching_mastery'
  | 'flow_zone'
  | 'challenging'
  | 'struggling';

export type AdjustmentType = 'level_up' | 'level_down' | null;

export interface UserPerformanceMetrics {
  user_id: string;
  subject: Subject;
  chronological_age: number;
  performance_adjustment: PerformanceAdjustment;
  effective_age: number;
  recent_accuracy: number | null;
  last_3_quiz_scores: number[];
  total_quizzes_completed: number;
  has_completed_assessment: boolean;
  last_quiz_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EDLStatusResponse {
  subject: Subject;
  chronological_age: number;
  performance_adjustment: PerformanceAdjustment;
  effective_age: number;
  recent_accuracy: number | null;
  total_quizzes: number;
  has_completed_assessment: boolean;
  last_quiz_at: string | null;
  status: EDLStatus;
  next_adjustment_in: number; // Number of quizzes until next adjustment check
}

export interface QuizResult {
  score_percentage: number;
  correct_answers: number;
  total_questions: number;
}

export interface EDLUpdateResult {
  previous_effective_age: number;
  new_effective_age: number;
  adjustment_occurred: boolean;
  adjustment_type: AdjustmentType;
  recent_accuracy: number;
  status: EDLStatus;
  message: string;
}

export interface EDLInitializationResult {
  effective_age: number;
  performance_adjustment: PerformanceAdjustment;
  message: string;
}

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface QuestionSelectionParams {
  userId: string;
  subject: Subject;
  difficulty: Difficulty;
  limit: number;
}

export interface QuestionSelectionMetadata {
  target_age: number;
  mode: 'adaptive' | 'manual';
  distribution: DifficultyDistribution;
  user_status: {
    effective_age: number;
    recent_accuracy: number | null;
    status: EDLStatus;
  };
}

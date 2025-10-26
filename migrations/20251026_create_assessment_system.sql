-- Migration: Create Assessment System Tables
-- Purpose: Add tables for initial skill level assessment
-- Date: 2025-10-26
-- Description: Creates tables for user assessments, assessment questions,
--              assessment answers, and skill level storage

-- ============================================================================
-- 1. ASSESSMENT QUESTIONS TABLE
-- ============================================================================
-- Purpose: Store questions specifically for the initial skill assessment
-- Note: Separate from the main 'questions' table used for practice/quizzes

CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL CHECK (subject IN ('math', 'english', 'science')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  points INTEGER DEFAULT 1 CHECK (points > 0),
  age_range_min INTEGER DEFAULT 7 CHECK (age_range_min >= 7 AND age_range_min <= 18),
  age_range_max INTEGER DEFAULT 18 CHECK (age_range_max >= 7 AND age_range_max <= 18),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_assessment_questions_subject_difficulty
  ON assessment_questions(subject, difficulty);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_age_range
  ON assessment_questions(age_range_min, age_range_max);

-- RLS Policies
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read assessment questions
CREATE POLICY "assessment_questions_select_policy"
  ON assessment_questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can modify assessment questions
CREATE POLICY "assessment_questions_insert_policy"
  ON assessment_questions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "assessment_questions_update_policy"
  ON assessment_questions
  FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "assessment_questions_delete_policy"
  ON assessment_questions
  FOR DELETE
  TO service_role
  USING (true);

-- ============================================================================
-- 2. USER ASSESSMENTS TABLE
-- ============================================================================
-- Purpose: Track assessment sessions for users

CREATE TABLE IF NOT EXISTS user_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_subject TEXT CHECK (current_subject IN ('math', 'english', 'science')),
  current_question_index INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id
  ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_completed
  ON user_assessments(user_id, is_completed);

-- RLS Policies
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;

-- Users can only read their own assessments
CREATE POLICY "user_assessments_select_policy"
  ON user_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only insert their own assessments
CREATE POLICY "user_assessments_insert_policy"
  ON user_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own assessments
CREATE POLICY "user_assessments_update_policy"
  ON user_assessments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own assessments
CREATE POLICY "user_assessments_delete_policy"
  ON user_assessments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. USER ASSESSMENT ANSWERS TABLE
-- ============================================================================
-- Purpose: Store individual question answers during assessment

CREATE TABLE IF NOT EXISTS user_assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES user_assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL CHECK (user_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, question_id) -- Prevent duplicate answers for same question
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_assessment_answers_assessment_id
  ON user_assessment_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_user_assessment_answers_question_id
  ON user_assessment_answers(question_id);

-- RLS Policies
ALTER TABLE user_assessment_answers ENABLE ROW LEVEL SECURITY;

-- Users can read answers for their own assessments
CREATE POLICY "user_assessment_answers_select_policy"
  ON user_assessment_answers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_assessments
      WHERE user_assessments.id = user_assessment_answers.assessment_id
      AND user_assessments.user_id = auth.uid()
    )
  );

-- Users can insert answers for their own assessments
CREATE POLICY "user_assessment_answers_insert_policy"
  ON user_assessment_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_assessments
      WHERE user_assessments.id = user_assessment_answers.assessment_id
      AND user_assessments.user_id = auth.uid()
    )
  );

-- Users can delete their own assessment answers
CREATE POLICY "user_assessment_answers_delete_policy"
  ON user_assessment_answers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_assessments
      WHERE user_assessments.id = user_assessment_answers.assessment_id
      AND user_assessments.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. USER SKILL LEVELS TABLE
-- ============================================================================
-- Purpose: Store calculated skill levels per subject (1-5 scale)

CREATE TABLE IF NOT EXISTS user_skill_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('math', 'english', 'science')),
  skill_level INTEGER NOT NULL CHECK (skill_level >= 1 AND skill_level <= 5),
  score_percentage DECIMAL(5,2) CHECK (score_percentage >= 0 AND score_percentage <= 100),
  assessment_id UUID REFERENCES user_assessments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject) -- One skill level per subject per user
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_skill_levels_user_id
  ON user_skill_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_levels_subject
  ON user_skill_levels(user_id, subject);

-- RLS Policies
ALTER TABLE user_skill_levels ENABLE ROW LEVEL SECURITY;

-- Users can only read their own skill levels
CREATE POLICY "user_skill_levels_select_policy"
  ON user_skill_levels
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only insert their own skill levels
CREATE POLICY "user_skill_levels_insert_policy"
  ON user_skill_levels
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own skill levels
CREATE POLICY "user_skill_levels_update_policy"
  ON user_skill_levels
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Trigger for assessment_questions
CREATE OR REPLACE FUNCTION update_assessment_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assessment_questions_updated_at
  BEFORE UPDATE ON assessment_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_questions_updated_at();

-- Trigger for user_assessments
CREATE OR REPLACE FUNCTION update_user_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_assessments_updated_at
  BEFORE UPDATE ON user_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_user_assessments_updated_at();

-- Trigger for user_skill_levels
CREATE OR REPLACE FUNCTION update_user_skill_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_skill_levels_updated_at
  BEFORE UPDATE ON user_skill_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_user_skill_levels_updated_at();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE assessment_questions IS 'Questions used for initial skill level assessment';
COMMENT ON TABLE user_assessments IS 'User assessment sessions tracking progress through initial evaluation';
COMMENT ON TABLE user_assessment_answers IS 'Individual question answers during assessment';
COMMENT ON TABLE user_skill_levels IS 'Calculated skill levels (1-5) per subject based on assessment performance';

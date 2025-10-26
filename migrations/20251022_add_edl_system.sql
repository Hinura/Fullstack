-- ============================================
-- Phase 2A: Simple Effective Difficulty Level (EDL) System
-- Implements adaptive learning using performance-based difficulty adjustment
-- Based on Flow Theory (Csikszentmihalyi) and Zone of Proximal Development (Vygotsky)
-- ============================================
--
-- IMPORTANT: Subject Name Mapping
-- The EDL system uses different subject names than the assessment system:
--
-- Assessment (user_skill_levels)  →  EDL (user_performance_metrics)
-- --------------------------------    ----------------------------------
-- 'mathematics'                   →   'math'
-- 'reading'                       →   'english'
-- 'science'                       →   'science'
--
-- This mapping is handled in:
-- - seed_performance_metrics_from_assessments() function
-- - initialize_user_performance_metrics() function
-- ============================================

-- ============================================
-- Create user_performance_metrics table
-- Tracks per-subject performance and calculates effective age
-- ============================================

CREATE TABLE IF NOT EXISTS user_performance_metrics (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('math', 'english', 'science')),
  chronological_age INTEGER NOT NULL CHECK (chronological_age BETWEEN 7 AND 18),
  performance_adjustment INTEGER DEFAULT 0 CHECK (performance_adjustment BETWEEN -2 AND 2),

  -- Generated column: effective_age = chronological_age + performance_adjustment
  effective_age INTEGER GENERATED ALWAYS AS (
    GREATEST(7, LEAST(18, chronological_age + performance_adjustment))
  ) STORED,

  -- Performance tracking data
  recent_accuracy DECIMAL(5,2),  -- Average accuracy of last 3 quizzes (0-100)
  last_3_quiz_scores INTEGER[] DEFAULT '{}',  -- Array of last 3 quiz scores
  total_questions_answered INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,

  -- Timestamps
  last_quiz_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (user_id, subject),
  CONSTRAINT valid_accuracy CHECK (recent_accuracy IS NULL OR (recent_accuracy >= 0 AND recent_accuracy <= 100))
);

-- Add comments to document the table
COMMENT ON TABLE user_performance_metrics IS 'Tracks user performance per subject for adaptive difficulty adjustment (EDL system)';
COMMENT ON COLUMN user_performance_metrics.user_id IS 'Reference to the user profile';
COMMENT ON COLUMN user_performance_metrics.subject IS 'Subject being tracked: math, english, or science';
COMMENT ON COLUMN user_performance_metrics.chronological_age IS 'User actual age (from profiles table)';
COMMENT ON COLUMN user_performance_metrics.performance_adjustment IS 'Performance-based adjustment (-2 to +2) applied to chronological age';
COMMENT ON COLUMN user_performance_metrics.effective_age IS 'Calculated age for question selection (chronological_age + performance_adjustment), clamped to 7-18';
COMMENT ON COLUMN user_performance_metrics.recent_accuracy IS 'Average accuracy of last 3 quizzes as percentage (0-100)';
COMMENT ON COLUMN user_performance_metrics.last_3_quiz_scores IS 'Array storing scores from last 3 quiz attempts (rolling window)';
COMMENT ON COLUMN user_performance_metrics.total_questions_answered IS 'Lifetime count of questions answered in this subject';
COMMENT ON COLUMN user_performance_metrics.total_correct IS 'Lifetime count of correctly answered questions in this subject';

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_perf_metrics_subject_effective ON user_performance_metrics(subject, effective_age);
CREATE INDEX IF NOT EXISTS idx_user_perf_metrics_user ON user_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_perf_metrics_updated ON user_performance_metrics(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE user_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own metrics
CREATE POLICY "Users can read own performance metrics"
ON user_performance_metrics FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to update their own metrics
CREATE POLICY "Users can update own performance metrics"
ON user_performance_metrics FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to insert their own metrics
CREATE POLICY "Users can insert own performance metrics"
ON user_performance_metrics FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Create user_question_history table
-- Tracks which questions each user has attempted to avoid repeats
-- ============================================

CREATE TABLE IF NOT EXISTS user_question_history (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answered_correctly BOOLEAN NOT NULL,
  time_spent_seconds INTEGER,
  answered_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (user_id, question_id)
);

-- Add comments
COMMENT ON TABLE user_question_history IS 'Tracks individual question attempts to prevent repeats and analyze learning patterns';
COMMENT ON COLUMN user_question_history.user_id IS 'Reference to the user who answered the question';
COMMENT ON COLUMN user_question_history.question_id IS 'Reference to the question that was answered';
COMMENT ON COLUMN user_question_history.answered_correctly IS 'Whether the user answered correctly';
COMMENT ON COLUMN user_question_history.time_spent_seconds IS 'Time spent on this question in seconds';
COMMENT ON COLUMN user_question_history.answered_at IS 'Timestamp when the question was answered';

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_question_history_user ON user_question_history(user_id, answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_history_question ON user_question_history(question_id);
-- Note: Partial index removed - WHERE clause with NOW() requires IMMUTABLE function
-- Query optimization will rely on the full index above
CREATE INDEX IF NOT EXISTS idx_question_history_user_recent ON user_question_history(user_id, answered_at DESC);

-- Enable Row Level Security
ALTER TABLE user_question_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own history
CREATE POLICY "Users can read own question history"
ON user_question_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own history
CREATE POLICY "Users can insert own question history"
ON user_question_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Create function to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_performance_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_performance_metrics_updated_at_trigger
BEFORE UPDATE ON user_performance_metrics
FOR EACH ROW
EXECUTE FUNCTION update_performance_metrics_updated_at();

-- ============================================
-- Create function to seed initial performance metrics from assessment results
-- Maps user_skill_levels (1-5) to performance_adjustment (-2 to +2)
-- ============================================

CREATE OR REPLACE FUNCTION seed_performance_metrics_from_assessments()
RETURNS INTEGER AS $$
DECLARE
  inserted_count INTEGER := 0;
  user_record RECORD;
  adjustment INTEGER;
  mapped_subject TEXT;
BEGIN
  -- Loop through all users with completed assessments
  FOR user_record IN
    SELECT DISTINCT
      usl.user_id,
      usl.subject,
      usl.skill_level,
      p.age as chronological_age
    FROM user_skill_levels usl
    JOIN profiles p ON usl.user_id = p.id
  LOOP
    -- Map assessment subject names to EDL subject names
    -- 'mathematics' → 'math', 'reading' → 'english', 'science' → 'science'
    mapped_subject := CASE user_record.subject
      WHEN 'mathematics' THEN 'math'
      WHEN 'reading' THEN 'english'
      WHEN 'science' THEN 'science'
      ELSE NULL
    END;

    -- Skip if subject doesn't map or metrics already exist
    IF mapped_subject IS NULL THEN
      CONTINUE;
    END IF;

    IF EXISTS (
      SELECT 1 FROM user_performance_metrics upm
      WHERE upm.user_id = user_record.user_id AND upm.subject = mapped_subject
    ) THEN
      CONTINUE;
    END IF;

    -- Map skill level (1-5) to performance adjustment (-2 to +2)
    -- Level 1 (beginner) → -2
    -- Level 2 (below average) → -1
    -- Level 3 (average) → 0
    -- Level 4 (above average) → +1
    -- Level 5 (advanced) → +2
    adjustment := user_record.skill_level - 3;  -- Maps 1→-2, 2→-1, 3→0, 4→+1, 5→+2

    -- Insert initial performance metrics
    INSERT INTO user_performance_metrics (
      user_id,
      subject,
      chronological_age,
      performance_adjustment,
      recent_accuracy,
      last_3_quiz_scores,
      total_questions_answered,
      total_correct,
      created_at,
      updated_at
    ) VALUES (
      user_record.user_id,
      mapped_subject,
      user_record.chronological_age,
      adjustment,
      NULL,  -- No quiz history yet
      '{}',  -- Empty array for quiz scores
      0,
      0,
      NOW(),
      NOW()
    );

    inserted_count := inserted_count + 1;
  END LOOP;

  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION seed_performance_metrics_from_assessments IS
  'Seeds user_performance_metrics table from existing user_skill_levels data. Maps skill levels (1-5) to performance adjustments (-2 to +2).';

-- ============================================
-- Execute seeding function to populate metrics for existing users
-- ============================================

-- Note: Run this after the migration is applied
-- SELECT seed_performance_metrics_from_assessments();
-- This will return the number of records inserted

-- ============================================
-- Create helper function to initialize metrics for new users
-- Called when a user starts their first quiz in a subject
-- ============================================

CREATE OR REPLACE FUNCTION initialize_user_performance_metrics(
  p_user_id UUID,
  p_subject TEXT,
  p_chronological_age INTEGER
)
RETURNS VOID AS $$
DECLARE
  skill_level_value INTEGER;
  adjustment INTEGER := 0;
  assessment_subject TEXT;
BEGIN
  -- Check if metrics already exist
  IF EXISTS (
    SELECT 1 FROM user_performance_metrics
    WHERE user_id = p_user_id AND subject = p_subject
  ) THEN
    RETURN;  -- Already initialized
  END IF;

  -- Map EDL subject to assessment subject
  -- 'math' → 'mathematics', 'english' → 'reading', 'science' → 'science'
  assessment_subject := CASE p_subject
    WHEN 'math' THEN 'mathematics'
    WHEN 'english' THEN 'reading'
    WHEN 'science' THEN 'science'
    ELSE p_subject
  END;

  -- Check if user has completed assessment for this subject
  SELECT skill_level INTO skill_level_value
  FROM user_skill_levels
  WHERE user_id = p_user_id AND subject = assessment_subject;

  -- If assessment exists, map skill level to adjustment
  IF skill_level_value IS NOT NULL THEN
    adjustment := skill_level_value - 3;  -- Maps 1→-2, 2→-1, 3→0, 4→+1, 5→+2
  END IF;

  -- Insert initial metrics
  INSERT INTO user_performance_metrics (
    user_id,
    subject,
    chronological_age,
    performance_adjustment,
    recent_accuracy,
    last_3_quiz_scores,
    total_questions_answered,
    total_correct,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_subject,
    p_chronological_age,
    adjustment,
    NULL,
    '{}',
    0,
    0,
    NOW(),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION initialize_user_performance_metrics IS
  'Initializes performance metrics for a user in a specific subject. Uses assessment results if available, otherwise starts at adjustment = 0.';

-- ============================================
-- Migration complete
-- ============================================

-- To apply this migration:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Execute: SELECT seed_performance_metrics_from_assessments();
-- 3. Verify with: SELECT COUNT(*) FROM user_performance_metrics;

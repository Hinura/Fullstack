-- ============================================
-- Fix EDL System Initialization
-- Issue: Users getting performance adjustments from assessments before any practice quizzes
-- Solution: Always initialize with adjustment = 0, only adjust based on quiz performance
-- ============================================

-- Update existing metrics to reset adjustment if user hasn't completed enough quizzes
UPDATE user_performance_metrics
SET
  performance_adjustment = 0,
  updated_at = NOW()
WHERE
  -- Only reset if user doesn't have enough quiz data (< 3 quizzes)
  COALESCE(array_length(last_3_quiz_scores, 1), 0) < 3;

-- Drop and recreate the initialization function to always start at adjustment = 0
CREATE OR REPLACE FUNCTION initialize_user_performance_metrics(
  p_user_id UUID,
  p_subject TEXT,
  p_chronological_age INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Check if metrics already exist
  IF EXISTS (
    SELECT 1 FROM user_performance_metrics
    WHERE user_id = p_user_id AND subject = p_subject
  ) THEN
    RETURN;  -- Already initialized
  END IF;

  -- Insert initial metrics with adjustment = 0
  -- Performance adjustment should ONLY be based on actual quiz performance
  -- NOT on assessment results
  INSERT INTO user_performance_metrics (
    user_id,
    subject,
    chronological_age,
    performance_adjustment,  -- Always start at 0
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
    0,  -- Start at 0, adjust based on quiz performance only
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
  'Initializes performance metrics for a user in a specific subject. Always starts at adjustment = 0. Adjustments are made based on quiz performance only.';

-- Log the number of records that were reset
DO $$
DECLARE
  reset_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO reset_count
  FROM user_performance_metrics
  WHERE COALESCE(array_length(last_3_quiz_scores, 1), 0) < 3
    AND performance_adjustment != 0;

  RAISE NOTICE 'Reset % user performance metrics to adjustment = 0', reset_count;
END $$;

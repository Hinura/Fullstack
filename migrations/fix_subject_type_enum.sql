-- Fix initialize_user_performance_metrics function to handle subject_type enum
-- This addresses the error: "operator does not exist: subject_type = text"

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
  -- Cast p_subject to subject_type enum for comparison
  IF EXISTS (
    SELECT 1 FROM user_performance_metrics
    WHERE user_id = p_user_id AND subject::text = p_subject
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
  WHERE user_id = p_user_id AND subject::text = assessment_subject;

  -- If assessment exists, map skill level to adjustment
  IF skill_level_value IS NOT NULL THEN
    adjustment := skill_level_value - 3;  -- Maps 1→-2, 2→-1, 3→0, 4→+1, 5→+2
  END IF;

  -- Insert initial metrics, casting p_subject to the correct enum type
  -- Note: effective_age is a GENERATED column, so we don't insert it directly
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
    p_subject::subject_type,  -- Cast TEXT to subject_type enum
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
  'Initializes performance metrics for a user in a specific subject. Uses assessment results if available, otherwise starts at adjustment = 0. Handles subject_type enum casting.';

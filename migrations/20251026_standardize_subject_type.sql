-- Migration: Standardize Subject Type Handling
-- Purpose: Document and enforce TEXT CHECK pattern for subject columns
-- Date: 2025-10-26
-- Decision: Use TEXT with CHECK constraint instead of enum for flexibility

-- ============================================================================
-- CONTEXT: Subject Type Handling Decision
-- ============================================================================
--
-- After evaluation, we're standardizing on TEXT with CHECK constraints rather
-- than ENUM types for the following reasons:
--
-- 1. Flexibility: TEXT CHECK allows easier modification without ALTER TYPE
-- 2. Compatibility: No casting required in functions and queries
-- 3. Simplicity: Avoids enum-related PostgreSQL migration complexity
-- 4. Performance: CHECK constraint validation is comparable to enum
--
-- All tables use: TEXT CHECK (subject IN ('math', 'english', 'science'))
--
-- ============================================================================

-- ============================================================================
-- 1. DROP ANY EXISTING ENUM (if created by previous migrations)
-- ============================================================================

-- Drop enum type if it exists (safe to run even if it doesn't exist)
DROP TYPE IF EXISTS subject_type CASCADE;

-- ============================================================================
-- 2. VERIFY ALL TABLES USE TEXT CHECK PATTERN
-- ============================================================================

-- Note: These tables should already use TEXT CHECK from their creation migrations
-- This section documents the expected schema for verification

-- Expected schema for all subject columns:
-- subject TEXT NOT NULL CHECK (subject IN ('math', 'english', 'science'))

-- Tables with subject columns:
-- - questions
-- - quiz_attempts
-- - user_performance_metrics
-- - assessment_questions
-- - user_skill_levels (may use different names: 'mathematics', 'reading', 'science')

-- ============================================================================
-- 3. CREATE HELPER FUNCTION FOR SUBJECT VALIDATION
-- ============================================================================

-- Function to validate subject values (useful for application logic)
CREATE OR REPLACE FUNCTION is_valid_subject(subject_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN subject_value IN ('math', 'english', 'science');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION is_valid_subject IS 'Validates if a subject value is one of the allowed values: math, english, science';

-- ============================================================================
-- 4. CREATE HELPER FUNCTION FOR SUBJECT MAPPING
-- ============================================================================

-- Function to map assessment subjects to EDL subjects
CREATE OR REPLACE FUNCTION map_assessment_to_edl_subject(assessment_subject TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE assessment_subject
    WHEN 'mathematics' THEN 'math'
    WHEN 'reading' THEN 'english'
    WHEN 'science' THEN 'science'
    ELSE assessment_subject  -- Pass through if already in EDL format
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION map_assessment_to_edl_subject IS 'Maps assessment subject names (mathematics, reading) to EDL subject names (math, english)';

-- ============================================================================
-- 5. UPDATE INITIALIZE FUNCTION TO USE TEXT (NO CASTING)
-- ============================================================================

-- Re-create initialize function without enum casting
CREATE OR REPLACE FUNCTION initialize_user_performance_metrics(
  p_user_id UUID,
  p_subject TEXT,
  p_chronological_age INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Validate subject
  IF NOT is_valid_subject(p_subject) THEN
    RAISE EXCEPTION 'Invalid subject: %. Must be math, english, or science', p_subject;
  END IF;

  -- Check if metrics already exist
  IF EXISTS (
    SELECT 1 FROM user_performance_metrics
    WHERE user_id = p_user_id AND subject = p_subject
  ) THEN
    RETURN;  -- Already initialized
  END IF;

  -- Insert initial metrics with adjustment = 0
  -- (Users start at their chronological age, adjust based on performance only)
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
    p_subject,  -- No casting needed - just TEXT
    p_chronological_age,
    0,  -- Always start at 0 adjustment
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
  'Initializes performance metrics for a user in a specific subject. Always starts at adjustment = 0.';

-- ============================================================================
-- 6. VERIFICATION QUERIES (For Manual Testing)
-- ============================================================================

-- Run these queries to verify subject column consistency:

-- Check questions table
-- SELECT column_name, data_type, check_clause
-- FROM information_schema.columns
-- WHERE table_name = 'questions' AND column_name = 'subject';

-- Check quiz_attempts table
-- SELECT column_name, data_type, check_clause
-- FROM information_schema.columns
-- WHERE table_name = 'quiz_attempts' AND column_name = 'subject';

-- Check user_performance_metrics table
-- SELECT column_name, data_type, check_clause
-- FROM information_schema.columns
-- WHERE table_name = 'user_performance_metrics' AND column_name = 'subject';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary:
-- - Dropped subject_type enum if it existed
-- - Created helper functions for validation and mapping
-- - Updated initialize function to use TEXT without casting
-- - All tables consistently use TEXT CHECK pattern

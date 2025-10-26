-- ============================================
-- Fix RLS Policy for user_question_history
-- Adds missing UPDATE policy to allow upsert operations
-- ============================================

-- The user_question_history table uses upsert operations (INSERT ... ON CONFLICT UPDATE)
-- but only had INSERT and SELECT policies, causing RLS violations on UPDATE.
-- This migration adds the missing UPDATE policy.

-- Create policy to allow users to update their own question history
CREATE POLICY "Users can update own question history"
ON user_question_history FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verify policies exist
DO $$
BEGIN
  RAISE NOTICE 'RLS Policies for user_question_history:';
  RAISE NOTICE '1. SELECT policy: Users can read own question history';
  RAISE NOTICE '2. INSERT policy: Users can insert own question history';
  RAISE NOTICE '3. UPDATE policy: Users can update own question history (NEW)';
END $$;

-- ============================================
-- Migration complete
-- ============================================

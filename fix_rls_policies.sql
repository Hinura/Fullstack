-- First, check current policies
SELECT policyname, cmd, qual::text as using_clause, with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'user_question_history';

-- Drop existing policies and recreate them correctly
DROP POLICY IF EXISTS "Users can read own question history" ON user_question_history;
DROP POLICY IF EXISTS "Users can insert own question history" ON user_question_history;
DROP POLICY IF EXISTS "Users can update own question history" ON user_question_history;

-- Create SELECT policy
CREATE POLICY "Users can read own question history"
ON user_question_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create INSERT policy
CREATE POLICY "Users can insert own question history"
ON user_question_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy
CREATE POLICY "Users can update own question history"
ON user_question_history FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verify policies were created
SELECT policyname, cmd, qual::text as using_clause, with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'user_question_history'
ORDER BY cmd, policyname;

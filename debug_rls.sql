-- Check current RLS policies for user_question_history
SELECT
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'user_question_history'
ORDER BY cmd, policyname;

-- Also check if RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'user_question_history';

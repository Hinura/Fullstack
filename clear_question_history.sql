-- Clear question history for testing
-- Run this in Supabase SQL Editor

-- Find your user ID first (optional - to verify)
SELECT id, full_name, email FROM auth.users WHERE email LIKE '%@%' LIMIT 5;

-- Clear all question history for your user
-- Replace 'YOUR_USER_ID' with your actual user ID from above
DELETE FROM user_question_history WHERE user_id = 'YOUR_USER_ID';

-- Or clear ALL question history (if you're the only user)
-- DELETE FROM user_question_history;

-- Verify it's cleared
SELECT COUNT(*) as cleared_count FROM user_question_history WHERE user_id = 'YOUR_USER_ID';

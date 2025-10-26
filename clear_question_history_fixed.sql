-- Clear question history for testing
-- Run this in Supabase SQL Editor

-- Option 1: Find your user ID (if you want to be specific)
SELECT id, email FROM auth.users LIMIT 5;

-- Option 2: Just clear ALL question history (simplest for testing)
DELETE FROM user_question_history;

-- Verify it's cleared
SELECT COUNT(*) as total_cleared FROM user_question_history;

-- You should see: total_cleared = 0

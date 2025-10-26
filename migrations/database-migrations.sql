-- Add profile picture URL column to profiles table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS picture_url TEXT;

-- Add comment to document the field
COMMENT ON COLUMN profiles.picture_url IS 'URL to user profile picture stored in Supabase storage';

-- ============================================
-- Add last_activity_date for streak tracking
-- ============================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

COMMENT ON COLUMN profiles.last_activity_date IS 'Last date user completed a quiz (for streak calculation)';

-- ============================================
-- Create questions table for storing learning content
-- ============================================

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL CHECK (subject IN ('math', 'english', 'science')),
  age_group INTEGER NOT NULL CHECK (age_group >= 7 AND age_group <= 18),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to document the table and columns
COMMENT ON TABLE questions IS 'Stores questions for the adaptive learning system';
COMMENT ON COLUMN questions.id IS 'Unique identifier for each question';
COMMENT ON COLUMN questions.subject IS 'Subject category: math, english, or science';
COMMENT ON COLUMN questions.age_group IS 'Target age group (7-18 years)';
COMMENT ON COLUMN questions.difficulty IS 'Difficulty level: easy, medium, or hard';
COMMENT ON COLUMN questions.question IS 'The question text';
COMMENT ON COLUMN questions.option_a IS 'Multiple choice option A';
COMMENT ON COLUMN questions.option_b IS 'Multiple choice option B';
COMMENT ON COLUMN questions.option_c IS 'Multiple choice option C';
COMMENT ON COLUMN questions.option_d IS 'Multiple choice option D';
COMMENT ON COLUMN questions.answer IS 'The correct answer';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_age_group ON questions(age_group);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_subject_age_difficulty ON questions(subject, age_group, difficulty);

-- Enable Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read questions
CREATE POLICY "Allow authenticated users to read questions"
ON questions FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow only service role to insert/update/delete questions
CREATE POLICY "Allow service role to manage questions"
ON questions FOR ALL
TO service_role
USING (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_questions_updated_at_trigger
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_questions_updated_at();

-- ============================================
-- Create quiz_attempts table for tracking user progress
-- ============================================

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('math', 'english', 'science')),
  difficulty TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE quiz_attempts IS 'Stores user quiz attempts and results for progress tracking';
COMMENT ON COLUMN quiz_attempts.user_id IS 'Reference to the user who took the quiz';
COMMENT ON COLUMN quiz_attempts.subject IS 'Subject of the quiz: math, english, or science';
COMMENT ON COLUMN quiz_attempts.difficulty IS 'Difficulty level of the quiz';
COMMENT ON COLUMN quiz_attempts.total_questions IS 'Total number of questions in the quiz';
COMMENT ON COLUMN quiz_attempts.correct_answers IS 'Number of correct answers';
COMMENT ON COLUMN quiz_attempts.score_percentage IS 'Percentage score (0-100)';
COMMENT ON COLUMN quiz_attempts.points_earned IS 'Points earned from this attempt';
COMMENT ON COLUMN quiz_attempts.time_spent_seconds IS 'Time taken to complete the quiz in seconds';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_subject ON quiz_attempts(subject);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_subject ON quiz_attempts(user_id, subject);

-- Enable Row Level Security
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own attempts
CREATE POLICY "Users can read own quiz attempts"
ON quiz_attempts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own attempts
CREATE POLICY "Users can insert own quiz attempts"
ON quiz_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Create function to increment user points
-- ============================================

CREATE OR REPLACE FUNCTION increment_user_points(user_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET points = COALESCE(points, 0) + points_to_add
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Create function to update user streak
-- ============================================

CREATE OR REPLACE FUNCTION update_user_streak(user_id UUID)
RETURNS VOID AS $$
DECLARE
  last_activity DATE;
  current_streak INTEGER;
  days_since_activity INTEGER;
BEGIN
  -- Get current streak and last activity date
  SELECT last_activity_date, streak_days
  INTO last_activity, current_streak
  FROM profiles
  WHERE id = user_id;

  -- If no previous activity, start streak at 1
  IF last_activity IS NULL THEN
    UPDATE profiles
    SET streak_days = 1,
        last_activity_date = CURRENT_DATE
    WHERE id = user_id;
    RETURN;
  END IF;

  -- Calculate days since last activity
  days_since_activity := CURRENT_DATE - last_activity;

  -- If activity is today, don't update (already counted)
  IF days_since_activity = 0 THEN
    RETURN;
  END IF;

  -- If activity is consecutive (yesterday), increment streak
  IF days_since_activity = 1 THEN
    UPDATE profiles
    SET streak_days = COALESCE(streak_days, 0) + 1,
        last_activity_date = CURRENT_DATE
    WHERE id = user_id;
    RETURN;
  END IF;

  -- If more than 1 day has passed, reset streak to 1
  IF days_since_activity > 1 THEN
    UPDATE profiles
    SET streak_days = 1,
        last_activity_date = CURRENT_DATE
    WHERE id = user_id;
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Create function to calculate and update user level
-- Uses exponential progression: level = floor(sqrt(points / 50)) + 1
-- ============================================

CREATE OR REPLACE FUNCTION update_user_level(user_id UUID)
RETURNS VOID AS $$
DECLARE
  user_points INTEGER;
  new_level INTEGER;
BEGIN
  -- Get current points
  SELECT points INTO user_points
  FROM profiles
  WHERE id = user_id;

  -- Calculate level using exponential formula
  -- Level 1: 0-100 points
  -- Level 2: 100-250 points
  -- Level 3: 250-500 points
  -- Level 4: 500-1000 points
  -- Formula: level = floor(sqrt(points / 50)) + 1
  new_level := GREATEST(1, FLOOR(SQRT(COALESCE(user_points, 0)::FLOAT / 50.0)) + 1);

  -- Update the user's level
  UPDATE profiles
  SET current_level = new_level
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_user_level IS 'Calculates and updates user level based on exponential progression formula';
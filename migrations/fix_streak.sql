-- ============================================
-- Fix Streak Calculation
-- ============================================

-- Add last_activity_date column if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

COMMENT ON COLUMN profiles.last_activity_date IS 'Last date user completed a quiz (for streak calculation)';

-- Create or replace the streak update function
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

COMMENT ON FUNCTION update_user_streak IS 'Updates user streak based on quiz activity. Increments if consecutive days, resets if gap > 1 day';

-- Create increment_user_points function if it doesn't exist
CREATE OR REPLACE FUNCTION increment_user_points(user_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET points = COALESCE(points, 0) + points_to_add
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_user_points IS 'Increments user points by specified amount';

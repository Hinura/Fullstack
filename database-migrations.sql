-- Add profile picture URL column to profiles table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS picture_url TEXT;

-- Add comment to document the field
COMMENT ON COLUMN profiles.picture_url IS 'URL to user profile picture stored in Supabase storage';
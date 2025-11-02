-- Migration: Add Profile Management Fields
-- Date: 2025-10-30
-- Description: Add profile_photo, phone, and preferences fields to users table

-- Add profile photo URL field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500);

-- Add phone number field
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Add preferences JSONB field for storing user preferences (dark mode, language, etc.)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Create index on profile_photo for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_profile_photo ON users(profile_photo) WHERE profile_photo IS NOT NULL;

-- Add comment to document the table changes
COMMENT ON COLUMN users.profile_photo IS 'URL path to user profile photo';
COMMENT ON COLUMN users.phone IS 'User phone number (optional)';
COMMENT ON COLUMN users.preferences IS 'User preferences stored as JSON (dark mode, language, notifications, etc.)';

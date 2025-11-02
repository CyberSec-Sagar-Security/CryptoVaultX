-- Add uniqueness constraints to users table for profile fields
-- Migration: 20251030_add_unique_constraints.sql

-- Add UNIQUE constraint to username if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_username_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
    END IF;
END $$;

-- Add UNIQUE constraint to email if not exists (should already exist, but ensure it)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
END $$;

-- Note: Phone is optional and can have duplicates (multiple users may not provide phone)
-- But if we want it unique when provided, we can add:
-- ALTER TABLE users ADD CONSTRAINT users_phone_key UNIQUE (phone) WHERE phone IS NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Only create phone index if the column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
    END IF;
END $$;

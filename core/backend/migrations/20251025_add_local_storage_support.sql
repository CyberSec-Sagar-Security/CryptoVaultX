-- migrations/20251025_add_local_storage_support.sql
-- Migration to add local storage support and remove PostgreSQL BYTEA storage
-- Adds storage_path, status, and deleted_at columns for local filesystem storage

-- Add new columns for local storage
ALTER TABLE files ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE files ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE files ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Update existing files to have status = 'active' if null
UPDATE files SET status = 'active' WHERE status IS NULL;

-- Make storage_path required for new files (after migration is complete)
-- This will be uncommented after all existing files have been migrated
-- ALTER TABLE files ALTER COLUMN storage_path SET NOT NULL;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
CREATE INDEX IF NOT EXISTS idx_files_deleted_at ON files(deleted_at);
CREATE INDEX IF NOT EXISTS idx_files_owner_status ON files(owner_id, status);

-- Add check constraint for status
ALTER TABLE files ADD CONSTRAINT check_files_status 
    CHECK (status IN ('active', 'deleted'));

-- Comment: The storage_blob column will be dropped in a future migration
-- after all files have been successfully migrated to local storage
-- DROP COLUMN storage_blob;  -- Will be done later
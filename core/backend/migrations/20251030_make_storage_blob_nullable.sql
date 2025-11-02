-- Migration to make storage_blob nullable for new local filesystem storage
-- This allows new files to use storage_path without requiring storage_blob

-- Make storage_blob nullable to support both old (BYTEA) and new (filesystem) storage
ALTER TABLE files ALTER COLUMN storage_blob DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN files.storage_blob IS 'Legacy BYTEA storage for old files. NULL for new files using storage_path.';
COMMENT ON COLUMN files.storage_path IS 'Local filesystem path for encrypted files. NULL for old files using storage_blob.';

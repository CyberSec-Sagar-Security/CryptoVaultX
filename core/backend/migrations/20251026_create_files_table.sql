-- migrations/20251026_create_files_table.sql
-- Migration to create files table with BYTEA storage for encrypted file content
-- This enables storing encrypted files directly in PostgreSQL with per-user quota enforcement

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing files table if it exists (for clean migration)
DROP TABLE IF EXISTS file_shares CASCADE;
DROP TABLE IF EXISTS files CASCADE;

-- Create files table with BYTEA column for encrypted file storage
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id INTEGER NOT NULL,
    original_filename TEXT NOT NULL,
    content_type TEXT,
    size_bytes BIGINT NOT NULL,
    algo TEXT NOT NULL DEFAULT 'AES-256-GCM',           -- Encryption algorithm
    iv TEXT NOT NULL,                                   -- Base64 encoded IV
    storage_blob BYTEA NOT NULL,                        -- Encrypted file content (ciphertext)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Add constraints
    CONSTRAINT files_size_positive CHECK (size_bytes > 0),
    CONSTRAINT files_filename_not_empty CHECK (length(trim(original_filename)) > 0)
);

-- Create index on owner_id for quick quota queries and user file listing
CREATE INDEX idx_files_owner ON files(owner_id);
CREATE INDEX idx_files_created_at ON files(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_files_updated_at();

-- Add foreign key constraint to users table (assumes users table exists)
-- This will be added after confirming users table structure
-- ALTER TABLE files ADD CONSTRAINT fk_files_owner 
--     FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create function to calculate user storage usage
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_id INTEGER)
RETURNS BIGINT AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(size_bytes) FROM files WHERE owner_id = user_id),
        0
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to check if upload would exceed quota
CREATE OR REPLACE FUNCTION check_quota_before_upload(user_id INTEGER, new_file_size BIGINT, quota_limit BIGINT DEFAULT 629145600)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage BIGINT;
BEGIN
    current_usage := get_user_storage_usage(user_id);
    RETURN (current_usage + new_file_size) <= quota_limit;
END;
$$ LANGUAGE plpgsql;

-- Insert some test data (optional - remove in production)
-- INSERT INTO files (owner_id, original_filename, content_type, size_bytes, algo, iv, storage_blob)
-- VALUES (1, 'test_encrypted_file.txt', 'text/plain', 1024, 'AES-256-GCM', 'dGVzdGl2MTIzNDU2Nzg=', '\x48656c6c6f20576f726c64');

COMMENT ON TABLE files IS 'Stores encrypted files directly in PostgreSQL with BYTEA column';
COMMENT ON COLUMN files.storage_blob IS 'Contains the actual encrypted file content (ciphertext)';
COMMENT ON COLUMN files.size_bytes IS 'Size of the encrypted file in bytes';
COMMENT ON COLUMN files.iv IS 'Base64 encoded initialization vector for decryption';
COMMENT ON FUNCTION get_user_storage_usage IS 'Returns total storage usage in bytes for a user';
COMMENT ON FUNCTION check_quota_before_upload IS 'Checks if upload would exceed 600MB quota (default)';
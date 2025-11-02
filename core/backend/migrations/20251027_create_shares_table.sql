-- Migration: Create Shares Table for Secure File Sharing
-- Date: 2025-10-27
-- Purpose: Enable secure file sharing between registered users with access control

-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    file_id VARCHAR(36) NOT NULL,
    grantee_user_id INTEGER NOT NULL,
    permission VARCHAR(20) NOT NULL DEFAULT 'read',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_shares_file 
        FOREIGN KEY (file_id) 
        REFERENCES files(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_shares_grantee 
        FOREIGN KEY (grantee_user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint: one share per file per user
    CONSTRAINT unique_file_grantee_share 
        UNIQUE (file_id, grantee_user_id),
    
    -- Check constraint for valid permissions
    CONSTRAINT check_valid_permission 
        CHECK (permission IN ('read', 'write', 'view', 'download', 'edit'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shares_file_id ON shares(file_id);
CREATE INDEX IF NOT EXISTS idx_shares_grantee_user_id ON shares(grantee_user_id);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at DESC);

-- Create composite index for access control checks
CREATE INDEX IF NOT EXISTS idx_shares_file_grantee ON shares(file_id, grantee_user_id);

-- Add comments for documentation
COMMENT ON TABLE shares IS 'File sharing permissions between users';
COMMENT ON COLUMN shares.id IS 'Unique identifier for the share record';
COMMENT ON COLUMN shares.file_id IS 'Reference to the shared file';
COMMENT ON COLUMN shares.grantee_user_id IS 'User who has been granted access';
COMMENT ON COLUMN shares.permission IS 'Access level: read, write, view, download, edit';
COMMENT ON COLUMN shares.created_at IS 'Timestamp when file was shared';

-- Grant permissions to application user
GRANT SELECT, INSERT, UPDATE, DELETE ON shares TO cryptovault_user;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Shares table created successfully';
END $$;

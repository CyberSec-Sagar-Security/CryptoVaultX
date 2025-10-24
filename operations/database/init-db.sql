-- Initialize CryptoVault database
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (will be created by migrations, but good to have as reference)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_files_owner_id ON files(owner_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shares_file_id ON shares(file_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shares_user_id ON shares(user_id);

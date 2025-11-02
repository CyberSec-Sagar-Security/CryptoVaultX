-- Migration: Create sync_events table for real-time dashboard synchronization
-- Date: 2025-10-28
-- Description: Stores sync events for polling fallback when WebSocket is unavailable

CREATE TABLE IF NOT EXISTS sync_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    INDEX idx_sync_events_user_created (user_id, created_at DESC),
    INDEX idx_sync_events_created (created_at)
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_sync_events_user_id ON sync_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_created_at ON sync_events(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_events_type ON sync_events(event_type);

-- Add comment
COMMENT ON TABLE sync_events IS 'Stores real-time sync events for dashboard updates and polling fallback';
COMMENT ON COLUMN sync_events.event_type IS 'Type of event: file_uploaded, file_deleted, file_shared, file_unshared, file_downloaded, metadata_updated, analytics_updated';
COMMENT ON COLUMN sync_events.payload IS 'Event metadata (non-sensitive data only)';

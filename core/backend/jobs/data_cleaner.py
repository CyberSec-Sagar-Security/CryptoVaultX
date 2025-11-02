"""
Data Cleaning Background Jobs
Scheduled tasks to maintain data cleanliness and relevance
"""
from apscheduler.schedulers.background import BackgroundScheduler
from database import db_manager
from utils.sync_events import cleanup_old_events
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class DataCleanerJob:
    """Background job for data cleaning and maintenance"""
    
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        logger.info("Data cleaner scheduler started")
    
    def start_jobs(self):
        """Start all scheduled jobs"""
        # Run hourly cleanup
        self.scheduler.add_job(
            func=self.cleanup_incomplete_uploads,
            trigger="interval",
            hours=1,
            id='cleanup_incomplete_uploads',
            name='Clean up incomplete uploads',
            replace_existing=True
        )
        
        # Run daily cleanup
        self.scheduler.add_job(
            func=self.cleanup_orphaned_shares,
            trigger="interval",
            hours=24,
            id='cleanup_orphaned_shares',
            name='Clean up orphaned shares',
            replace_existing=True
        )
        
        # Run daily sync events cleanup
        self.scheduler.add_job(
            func=self.cleanup_sync_events,
            trigger="interval",
            hours=24,
            id='cleanup_sync_events',
            name='Clean up old sync events',
            replace_existing=True
        )
        
        # Recalculate analytics hourly
        self.scheduler.add_job(
            func=self.recalculate_analytics,
            trigger="interval",
            hours=1,
            id='recalculate_analytics',
            name='Recalculate user analytics',
            replace_existing=True
        )
        
        logger.info("All data cleaner jobs scheduled")
    
    def cleanup_incomplete_uploads(self):
        """Remove incomplete uploads older than 24 hours"""
        try:
            logger.info("Starting cleanup of incomplete uploads")
            
            # This would require an 'upload_status' field in files table
            # For now, we'll just log
            query = """
            DELETE FROM files
            WHERE created_at < NOW() - INTERVAL '24 hours'
            AND size_bytes = 0
            RETURNING id
            """
            
            with db_manager.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(query)
                    deleted_files = cursor.fetchall()
                    conn.commit()
                    
                    count = len(deleted_files)
                    if count > 0:
                        logger.info(f"Cleaned up {count} incomplete uploads")
                        return count
                    
            return 0
            
        except Exception as e:
            logger.error(f"Error cleaning up incomplete uploads: {e}")
            return 0
    
    def cleanup_orphaned_shares(self):
        """Delete shares pointing to non-existent users or files"""
        try:
            logger.info("Starting cleanup of orphaned shares")
            
            # PostgreSQL will handle this automatically with ON DELETE CASCADE
            # But we can also manually check and log
            query = """
            DELETE FROM shares
            WHERE file_id NOT IN (SELECT id FROM files)
            OR grantee_user_id NOT IN (SELECT id FROM users WHERE is_active = TRUE)
            RETURNING id
            """
            
            with db_manager.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(query)
                    deleted_shares = cursor.fetchall()
                    conn.commit()
                    
                    count = len(deleted_shares)
                    if count > 0:
                        logger.info(f"Cleaned up {count} orphaned shares")
                        return count
            
            return 0
            
        except Exception as e:
            logger.error(f"Error cleaning up orphaned shares: {e}")
            return 0
    
    def cleanup_sync_events(self):
        """Delete sync events older than 7 days"""
        try:
            logger.info("Starting cleanup of old sync events")
            count = cleanup_old_events(days=7)
            logger.info(f"Cleaned up {count} old sync events")
            return count
        except Exception as e:
            logger.error(f"Error cleaning up sync events: {e}")
            return 0
    
    def recalculate_analytics(self):
        """Recalculate storage usage and file counts for all users"""
        try:
            logger.info("Starting analytics recalculation")
            
            # This would update a user_analytics table or similar
            # For now, we just log
            query = """
            SELECT 
                owner_id,
                COUNT(*) as file_count,
                SUM(size_bytes) as total_size
            FROM files
            GROUP BY owner_id
            """
            
            with db_manager.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(query)
                    results = cursor.fetchall()
                    
                    logger.info(f"Recalculated analytics for {len(results)} users")
                    return len(results)
            
        except Exception as e:
            logger.error(f"Error recalculating analytics: {e}")
            return 0
    
    def shutdown(self):
        """Shutdown the scheduler"""
        try:
            self.scheduler.shutdown()
            logger.info("Data cleaner scheduler shut down")
        except Exception as e:
            logger.error(f"Error shutting down scheduler: {e}")

# Global instance
data_cleaner = None

def init_data_cleaner():
    """Initialize and start data cleaner jobs"""
    global data_cleaner
    if data_cleaner is None:
        data_cleaner = DataCleanerJob()
        data_cleaner.start_jobs()
        logger.info("Data cleaner initialized and jobs started")
    return data_cleaner

def shutdown_data_cleaner():
    """Shutdown data cleaner"""
    global data_cleaner
    if data_cleaner:
        data_cleaner.shutdown()
        data_cleaner = None

"""
Sync Events System
Real-time event emission for dashboard synchronization
"""
import uuid
from datetime import datetime, timezone
from database import db_manager
import logging
import json

logger = logging.getLogger(__name__)

def utcnow():
    """Get current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)

# Global SocketIO instance (will be set by app.py)
socketio_instance = None

def set_socketio(socketio):
    """Set the global SocketIO instance"""
    global socketio_instance
    socketio_instance = socketio

def emit_sync_event(user_id, event_type, payload):
    """
    Emit a sync event to affected users via WebSocket and store in DB
    
    Args:
        user_id: The primary user affected by this event
        event_type: Type of event (file_uploaded, file_deleted, file_shared, etc.)
        payload: Event metadata (non-sensitive data only)
    
    Supported event types:
        - file_uploaded
        - file_deleted
        - file_shared
        - file_unshared
        - file_downloaded
        - metadata_updated
        - analytics_updated
    """
    try:
        event_id = str(uuid.uuid4())
        timestamp = utcnow()
        
        event_data = {
            'event_id': event_id,
            'type': event_type,
            'user_id': user_id,
            'timestamp': timestamp.isoformat(),
            'payload': payload
        }
        
        # Store event in database for polling fallback
        store_sync_event(event_id, user_id, event_type, payload, timestamp)
        
        # Emit via WebSocket if available
        if socketio_instance:
            # Emit to user's personal room
            socketio_instance.emit(
                'sync_event',
                event_data,
                room=f'user:{user_id}',
                namespace='/'
            )
            logger.info(f"Emitted {event_type} event to user:{user_id}")
            
            # If it's a sharing event, also emit to recipient(s)
            if event_type == 'file_shared' and 'shared_with_user_ids' in payload:
                for recipient_id in payload['shared_with_user_ids']:
                    recipient_event = event_data.copy()
                    recipient_event['user_id'] = recipient_id
                    socketio_instance.emit(
                        'sync_event',
                        recipient_event,
                        room=f'user:{recipient_id}',
                        namespace='/'
                    )
                    logger.info(f"Emitted {event_type} event to recipient user:{recipient_id}")
        
        return event_id
        
    except Exception as e:
        logger.error(f"Error emitting sync event: {e}")
        return None

def store_sync_event(event_id, user_id, event_type, payload, timestamp):
    """Store sync event in database for polling fallback"""
    try:
        query = """
        INSERT INTO sync_events (id, user_id, event_type, payload, created_at)
        VALUES (%s, %s, %s, %s, %s)
        """
        params = (
            event_id,
            user_id,
            event_type,
            json.dumps(payload),
            timestamp
        )
        db_manager.execute_query(query, params)
        logger.debug(f"Stored sync event {event_id} in database")
    except Exception as e:
        logger.error(f"Error storing sync event: {e}")

def get_sync_events_since(user_id, since_timestamp):
    """
    Get all sync events for a user since a given timestamp
    Used for polling fallback
    """
    try:
        query = """
        SELECT id, user_id, event_type, payload, created_at
        FROM sync_events
        WHERE user_id = %s AND created_at > %s
        ORDER BY created_at ASC
        """
        results = db_manager.execute_query(query, (user_id, since_timestamp), fetch=True)
        
        events = []
        for row in results:
            events.append({
                'event_id': row['id'],
                'user_id': row['user_id'],
                'type': row['event_type'],
                'payload': json.loads(row['payload']) if isinstance(row['payload'], str) else row['payload'],
                'timestamp': row['created_at'].isoformat() if hasattr(row['created_at'], 'isoformat') else row['created_at']
            })
        
        return events
    except Exception as e:
        logger.error(f"Error retrieving sync events: {e}")
        return []

def cleanup_old_events(days=7):
    """Delete sync events older than specified days"""
    try:
        query = """
        DELETE FROM sync_events
        WHERE created_at < NOW() - INTERVAL '%s days'
        """
        rows_deleted = db_manager.execute_query(query, (days,))
        logger.info(f"Cleaned up {rows_deleted} old sync events")
        return rows_deleted
    except Exception as e:
        logger.error(f"Error cleaning up old events: {e}")
        return 0

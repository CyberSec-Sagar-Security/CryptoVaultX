"""
Sync Routes
Provides HTTP endpoints for real-time sync functionality
Includes polling fallback when WebSocket is not available
"""
from flask import Blueprint, request, jsonify
from middleware.auth import auth_required
from flask import g
from utils.sync_events import get_sync_events_since
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

def utcnow():
    """Get current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)

sync_bp = Blueprint('sync', __name__)

@sync_bp.route('/api/sync/updates', methods=['GET'])
@auth_required
def get_updates():
    """
    Get sync updates since a given timestamp
    Used as polling fallback when WebSocket is unavailable
    
    Query params:
    - since: ISO timestamp (required)
    """
    try:
        since_param = request.args.get('since')
        
        if not since_param:
            return jsonify({'error': 'Missing "since" parameter'}), 400
        
        # Parse timestamp
        try:
            since_timestamp = datetime.fromisoformat(since_param.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'Invalid timestamp format. Use ISO 8601 format.'}), 400
        
        # Get events for current user
        events = get_sync_events_since(g.current_user['id'], since_timestamp)
        
        return jsonify({
            'events': events,
            'count': len(events),
            'since': since_param,
            'server_time': utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting sync updates: {e}")
        return jsonify({'error': 'Failed to retrieve updates', 'details': str(e)}), 500

@sync_bp.route('/api/sync/status', methods=['GET'])
@auth_required
def sync_status():
    """Get sync system status"""
    try:
        return jsonify({
            'status': 'active',
            'server_time': utcnow().isoformat(),
            'user_id': g.current_user['id']
        }), 200
    except Exception as e:
        logger.error(f"Error getting sync status: {e}")
        return jsonify({'error': 'Failed to get status', 'details': str(e)}), 500

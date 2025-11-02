from flask import Blueprint, request, jsonify, g
from middleware.auth import auth_required
from middleware.quota import quota_required
from models import File
from storage_manager import storage_manager
import logging
from datetime import timezone

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def format_timestamp(dt):
    """Convert datetime to ISO format with UTC timezone"""
    if dt is None:
        return None
    # If datetime is timezone-aware, convert to UTC
    if hasattr(dt, 'astimezone'):
        dt_utc = dt.astimezone(timezone.utc)
        return dt_utc.isoformat()
    # If timezone-naive, assume it's UTC and make it explicit
    if hasattr(dt, 'replace'):
        dt_utc = dt.replace(tzinfo=timezone.utc)
        return dt_utc.isoformat()
    # Fallback to string
    return str(dt)

# Import separated controllers
from routes.uploadController import upload_encrypted_file as upload_handler
from routes.downloadController import download_encrypted_file as download_handler
from routes.deleteController import delete_file as delete_handler

files_bp = Blueprint('files_v2', __name__)

# Configuration - 512MB per-user quota as specified in requirements
USER_QUOTA_BYTES = 512 * 1024 * 1024  # 512 MB

def get_file_size_on_disk(file_path):
    """Helper to get actual file size on disk"""
    try:
        import os
        if os.path.exists(file_path):
            return os.path.getsize(file_path)
        return 0
    except Exception as e:
        print(f"Error getting file size for {file_path}: {e}")
        return 0

def calculate_user_storage_usage(owner_id):
    """Calculate user's storage usage from files in database"""
    try:
        files = File.find_by_owner(owner_id)
        total_bytes = sum(file.get('file_size', 0) for file in files)
        return total_bytes
    except Exception as e:
        print(f"Error calculating storage usage for user {owner_id}: {e}")
        return 0

# ===== ROUTES - Named routes first, then parameterized routes =====

# Specific named routes MUST come before /<file_id> parameterized routes
@files_bp.route('/simple-test', methods=['GET'])
def simple_test():
    """Simple test route without auth"""
    return jsonify({'success': True, 'message': 'Simple test works!'}), 200

@files_bp.route('/simple-list', methods=['GET'])
@auth_required
def simple_list():
    """Simple list endpoint that should work"""
    return jsonify({
        'success': True,
        'message': 'Simple list works!',
        'user_id': g.current_user['id']
    }), 200
@files_bp.route('/test', methods=['GET'])
def test_route():
    """Simple test route"""
    logger.info("TEST ROUTE CALLED!")
    print("TEST ROUTE CALLED - PRINT!")
    return jsonify({'message': 'Files blueprint is working!'}), 200

@files_bp.route('/debug-list', methods=['GET'])
@auth_required
def debug_list_files():
    """Debug version of file listing"""
    return jsonify({
        'message': 'Debug endpoint working',
        'user_id': g.current_user['id'],
        'username': g.current_user['username']
    }), 200

@files_bp.route('/list', methods=['GET'])
@auth_required  
def list_user_files():
    """
    List all files accessible by the authenticated user
    Includes both owned files and files shared with the user
    """
    try:
        logger.info("DEBUG: list_user_files called")
        print(f"DEBUG: list_user_files called")
        
        user_id = g.current_user['id']
        username = g.current_user['username']
        
        print(f"DEBUG: user_id = {user_id}, username = {username}")
        
        # Get user's owned files from database
        owned_files = File.find_by_owner(user_id)
        
        # Get files shared with user
        from database import Share
        shared_files = Share.find_shared_with_user(user_id)
        
        # Format owned files for response
        formatted_owned_files = []
        owned_total_size = 0
        
        if owned_files:
            for file_record in owned_files:
                file_info = {
                    'id': str(file_record['id']),
                    'original_filename': file_record['original_filename'],
                    'content_type': file_record['content_type'],
                    'size_bytes': file_record['size_bytes'],
                    'algo': file_record['algo'],
                    'created_at': format_timestamp(file_record['created_at']),
                    'updated_at': format_timestamp(file_record['updated_at']),
                    'access_type': 'owner'
                }
                formatted_owned_files.append(file_info)
                owned_total_size += file_record['size_bytes']
        
        # Format shared files for response
        formatted_shared_files = []
        
        if shared_files:
            for shared_record in shared_files:
                file_info = {
                    'id': str(shared_record['file_id']),
                    'original_filename': shared_record['original_filename'],
                    'content_type': shared_record['content_type'],
                    'size_bytes': shared_record['size_bytes'],
                    'created_at': format_timestamp(shared_record['file_created_at']),
                    'shared_at': format_timestamp(shared_record['shared_at']),
                    'access_type': 'shared',
                    'permission': shared_record['permission'],
                    'owner': {
                        'id': shared_record['owner_id'],
                        'username': shared_record['owner_username'],
                        'name': shared_record['owner_name']
                    }
                }
                formatted_shared_files.append(file_info)
        
        # Calculate storage statistics (only owned files count toward quota)
        quota_bytes = USER_QUOTA_BYTES
        remaining_bytes = max(0, quota_bytes - owned_total_size)
        usage_percentage = (owned_total_size / quota_bytes) * 100 if quota_bytes > 0 else 0
        
        response = {
            'files': formatted_owned_files,  # For FilesPage compatibility
            'owned_files': formatted_owned_files,  # For Dashboard compatibility
            'shared_files': formatted_shared_files,
            'owned_storage': {
                'total_size': owned_total_size
            },
            'storage_info': {
                'used_bytes': owned_total_size,
                'used_mb': round(owned_total_size / (1024 * 1024), 2),
                'quota_bytes': quota_bytes,
                'quota_mb': round(quota_bytes / (1024 * 1024)),
                'remaining_bytes': remaining_bytes,
                'remaining_mb': round(remaining_bytes / (1024 * 1024), 2),
                'usage_percentage': round(usage_percentage, 2)
            },
            'file_counts': {
                'owned': len(formatted_owned_files),
                'shared_with_me': len(formatted_shared_files),
                'total': len(formatted_owned_files) + len(formatted_shared_files)
            }
        }
        
        print(f"DEBUG: Returning {len(formatted_owned_files)} owned + {len(formatted_shared_files)} shared files for user {username}")
        return jsonify(response), 200
        
    except Exception as e:
        print(f"List files error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to list files'}), 500

@files_bp.route('/quota2', methods=['GET'])
@auth_required
def get_user_quota2():
    """Test quota endpoint with different name"""
    try:
        user_id = g.current_user['id']
        username = g.current_user['username']
        storage_usage = storage_manager.get_user_storage_usage(username)
        
        return jsonify({
            'message': 'quota2 endpoint works!',
            'user_id': user_id,
            'username': username,
            'storage_info': {
                'used_bytes': storage_usage['total_bytes'],
                'quota_bytes': storage_usage['quota_bytes']
            }
        }), 200
    except Exception as e:
        return jsonify({'error': f'quota2 failed: {str(e)}'}), 500

@files_bp.route('/quota', methods=['GET'])
@auth_required
def get_user_quota():
    """Get current user's storage quota and usage"""
    try:
        user_id = g.current_user['id']
        username = g.current_user['username']
        storage_usage = storage_manager.get_user_storage_usage(username)
        
        return jsonify({
            'storage_info': {
                'used_bytes': storage_usage['total_bytes'],
                'used_mb': storage_usage['total_bytes'] // (1024 * 1024),
                'quota_bytes': storage_usage['quota_bytes'],
                'quota_mb': storage_usage['quota_bytes'] // (1024 * 1024),
                'remaining_bytes': storage_usage['remaining_bytes'],
                'remaining_mb': storage_usage['remaining_bytes'] // (1024 * 1024),
                'usage_percentage': storage_usage['usage_percentage'],
                'uploads_bytes': storage_usage['uploads_bytes'],
                'uploads_mb': storage_usage['uploads_bytes'] // (1024 * 1024),
                'deleted_bytes': storage_usage['deleted_bytes'],
                'deleted_mb': storage_usage['deleted_bytes'] // (1024 * 1024)
            }
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to get quota information'}), 500

# Parameterized routes come after named routes
@files_bp.route('/', methods=['POST'])
@auth_required
@quota_required
def upload_encrypted_file():
    """Upload endpoint - delegates to uploadController"""
    return upload_handler()

@files_bp.route('/<file_id>', methods=['GET'])
@auth_required
def download_encrypted_file(file_id):
    """Download endpoint - delegates to downloadController"""
    return download_handler(file_id)

# Provide an explicit download path variant as per requirements
@files_bp.route('/<file_id>/download', methods=['GET'])
@auth_required
def download_encrypted_file_alias(file_id):
    """Download alias endpoint - delegates to downloadController"""
    return download_handler(file_id)

@files_bp.route('/<file_id>', methods=['DELETE'])
@auth_required
def delete_file(file_id):
    """Delete endpoint - delegates to deleteController"""
    return delete_handler(file_id)
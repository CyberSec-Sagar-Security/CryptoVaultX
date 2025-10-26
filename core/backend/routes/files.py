from flask import Blueprint, request, jsonify, g
from middleware.auth import auth_required
from middleware.quota import quota_required
from models import File
from storage_manager import storage_manager

# Import separated controllers
from routes.uploadController import upload_encrypted_file as upload_handler
from routes.downloadController import download_encrypted_file as download_handler
from routes.deleteController import delete_file as delete_handler

files_bp = Blueprint('files', __name__)

# Configuration - 512MB per-user quota as specified in requirements
USER_QUOTA_BYTES = 512 * 1024 * 1024  # 512 MB (updated from 600MB)
MAX_FILE_SIZE = 100 * 1024 * 1024     # 100MB per file

ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 
    'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', '7z', 'tar', 
    'gz', 'mp3', 'mp4', 'avi', 'mov', 'mkv', 'enc'  # .enc for encrypted files
}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_user_storage_usage(owner_id):
    """Get current storage usage for a user from filesystem"""
    try:
        usage = storage_manager.get_user_storage_usage(owner_id)
        return usage['total_bytes']
    except Exception as e:
        print(f"Error calculating storage usage for user {owner_id}: {e}")
        return 0

# ===== ROUTES - Delegating to separated controllers =====

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

@files_bp.route('/list', methods=['GET'])
@auth_required
def list_user_files():
    """List all active files owned by the authenticated user"""
    try:
        user_id = g.current_user.id
        username = g.current_user.username
        files = File.find_by_owner(user_id)
        
        # Get detailed storage usage from storage manager using username
        storage_usage = storage_manager.get_user_storage_usage(username)
        
        file_list = [file.to_dict() for file in files]
        
        return jsonify({
            'files': file_list,
            'storage_info': {
                'used_bytes': storage_usage['total_bytes'],
                'used_mb': storage_usage['total_bytes'] // (1024 * 1024),
                'quota_bytes': storage_usage['quota_bytes'],
                'quota_mb': storage_usage['quota_bytes'] // (1024 * 1024),
                'remaining_bytes': storage_usage['remaining_bytes'],
                'remaining_mb': storage_usage['remaining_bytes'] // (1024 * 1024),
                'usage_percentage': storage_usage['usage_percentage'],
                'uploads_bytes': storage_usage['uploads_bytes'],
                'deleted_bytes': storage_usage['deleted_bytes']
            }
        }), 200
        
    except Exception as e:
        print(f"List files error: {str(e)}")
        return jsonify({'error': 'Failed to list files'}), 500

@files_bp.route('/quota', methods=['GET'])
@auth_required
def get_user_quota():
    """Get current user's storage quota and usage"""
    try:
        user_id = g.current_user.id
        username = g.current_user.username
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
        print(f"Quota check error: {str(e)}")
        return jsonify({'error': 'Failed to check quota'}), 500
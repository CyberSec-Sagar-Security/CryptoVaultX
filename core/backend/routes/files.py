from flask import Blueprint, request, jsonify, g, Response
from werkzeug.utils import secure_filename
import os
import json
import uuid
import base64
from datetime import datetime
from database import db_manager
from models import db, File
from middleware.auth import auth_required
from storage_manager import storage_manager
import psycopg2

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

@files_bp.route('/', methods=['POST'])
@auth_required
def upload_encrypted_file():
    """
    Upload encrypted file to local filesystem storage with quota enforcement.
    Client must encrypt files on browser - server never receives plaintext.
    """
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': f'File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB'}), 413
        
        if file_size == 0:
            return jsonify({'error': 'Empty file not allowed'}), 400
        
        # Get metadata (must be JSON string)
        metadata_str = request.form.get('metadata')
        if not metadata_str:
            return jsonify({'error': 'Metadata is required'}), 400
        
        try:
            metadata = json.loads(metadata_str)
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid JSON in metadata'}), 400
        
        # Extract required metadata fields
        original_filename = metadata.get('originalFilename', '')
        iv_base64 = metadata.get('ivBase64', '')
        algo = metadata.get('algo', 'AES-256-GCM')
        
        if not original_filename:
            return jsonify({'error': 'originalFilename is required in metadata'}), 400
        
        if not iv_base64:
            return jsonify({'error': 'ivBase64 is required in metadata'}), 400
        
        # Validate IV is valid base64
        try:
            base64.b64decode(iv_base64)
        except Exception:
            return jsonify({'error': 'ivBase64 must be valid base64'}), 400
        
        # Get current user from auth middleware
        user_id = g.current_user.id
        
        # Check quota BEFORE accepting upload using storage manager
        can_upload, quota_message = storage_manager.check_quota_before_upload(user_id, file_size)
        if not can_upload:
            return jsonify({
                'error': 'quota_exceeded', 
                'message': quota_message
            }), 413
        
        # Read encrypted file content (ciphertext)
        ciphertext_buffer = file.read()
        
        # Generate unique file ID and storage path
        file_id = str(uuid.uuid4())
        storage_path = storage_manager.generate_storage_path(user_id, original_filename)
        
        # Save encrypted file to local filesystem
        if not storage_manager.save_encrypted_file(ciphertext_buffer, storage_path):
            return jsonify({'error': 'Failed to save encrypted file'}), 500
        
        # Create file record in database with local storage path
        new_file = File(
            id=file_id,
            owner_id=user_id,
            original_filename=original_filename,
            content_type=file.content_type or 'application/octet-stream',
            size_bytes=file_size,
            algo=algo,
            iv=iv_base64,
            storage_path=storage_path,  # Store local filesystem path instead of blob
            status='active'
        )
        
        db.session.add(new_file)
        db.session.commit()
        
        # Log safe metadata only (no plaintext or keys)
        print(f"✅ Encrypted file stored locally: {file_id} (size: {file_size} bytes, path: {storage_path})")
        
        return jsonify({
            'message': 'File uploaded successfully',
            'id': new_file.id,
            'original_filename': new_file.original_filename,
            'size_bytes': new_file.size_bytes,
            'created_at': new_file.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Upload error: {str(e)}")  # Log error message only
        return jsonify({'error': 'File upload failed'}), 500

@files_bp.route('/<file_id>', methods=['GET'])
@auth_required
def download_encrypted_file(file_id):
    """
    Download encrypted file from local filesystem storage.
    Returns ciphertext and metadata headers - client decrypts with session key.
    """
    try:
        user_id = g.current_user.id
        
        # Find file and verify ownership
        file_record = File.find_by_id_and_owner(file_id, user_id)
        if not file_record:
            return jsonify({'error': 'File not found or access denied'}), 404
        
        # Read encrypted file from local storage
        encrypted_data = storage_manager.read_encrypted_file(file_record.storage_path)
        if encrypted_data is None:
            return jsonify({'error': 'File data not found'}), 404
        
        # Return ciphertext with metadata in headers
        response = Response(
            encrypted_data,  # Raw encrypted file data
            status=200,
            content_type='application/octet-stream'
        )
        
        # Set metadata headers for client-side decryption
        response.headers['X-File-Name'] = file_record.original_filename
        response.headers['X-File-IV'] = file_record.iv
        response.headers['X-File-Algo'] = file_record.algo
        response.headers['X-File-Size'] = str(file_record.size_bytes)
        
        # Log safe metadata only
        print(f"✅ File downloaded: {file_id} (size: {file_record.size_bytes} bytes)")
        
        return response
        
    except Exception as e:
        print(f"Download error: {str(e)}")  # Log error message only
        return jsonify({'error': 'File download failed'}), 500

@files_bp.route('/list', methods=['GET'])
@auth_required
def list_user_files():
    """List all active files owned by the authenticated user"""
    try:
        user_id = g.current_user.id
        files = File.find_by_owner(user_id)
        
        # Get detailed storage usage from storage manager
        storage_usage = storage_manager.get_user_storage_usage(user_id)
        
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

@files_bp.route('/<file_id>', methods=['DELETE'])
@auth_required
def delete_file(file_id):
    """Soft delete file (move to deleted folder)"""
    try:
        user_id = g.current_user.id
        
        # Find file and verify ownership
        file_record = File.find_by_id_and_owner(file_id, user_id)
        if not file_record:
            return jsonify({'error': 'File not found or access denied'}), 404
        
        # Move file from uploads to deleted folder
        deleted_path = storage_manager.move_to_deleted(file_record.storage_path, user_id)
        if deleted_path is None:
            return jsonify({'error': 'Failed to move file to deleted folder'}), 500
        
        # Update database record
        file_record.status = 'deleted'
        file_record.deleted_at = datetime.utcnow()
        file_record.storage_path = deleted_path  # Update to new path in deleted folder
        file_record.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        print(f"✅ File soft deleted: {file_id} → {deleted_path}")
        
        return jsonify({'message': 'File deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Delete error: {str(e)}")
        return jsonify({'error': 'Failed to delete file'}), 500

@files_bp.route('/quota', methods=['GET'])
@auth_required
def get_user_quota():
    """Get current user's storage quota and usage"""
    try:
        user_id = g.current_user.id
        storage_usage = storage_manager.get_user_storage_usage(user_id)
        
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
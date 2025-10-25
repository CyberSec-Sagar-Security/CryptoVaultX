from flask import Blueprint, request, jsonify, g, Response
from werkzeug.utils import secure_filename
import os
import json
import uuid
import base64
from database import db_manager
from models import db, File
from middleware.auth import auth_required
import psycopg2

files_bp = Blueprint('files', __name__)

# Configuration - 600MB per-user quota as specified
USER_QUOTA_BYTES = 600 * 1024 * 1024  # 600 MB
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
    """Get current storage usage for a user"""
    try:
        return File.get_user_storage_usage(owner_id)
    except Exception as e:
        print(f"Error calculating storage usage for user {owner_id}: {e}")
        return 0

@files_bp.route('/', methods=['POST'])
@auth_required
def upload_encrypted_file():
    """
    Upload encrypted file directly to PostgreSQL BYTEA storage with quota enforcement.
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
        
        # Check quota BEFORE accepting upload
        current_usage = get_user_storage_usage(user_id)
        if current_usage + file_size > USER_QUOTA_BYTES:
            quota_mb = USER_QUOTA_BYTES // (1024 * 1024)
            current_mb = current_usage // (1024 * 1024)
            return jsonify({
                'error': 'quota_exceeded', 
                'message': f'User storage quota ({quota_mb}MB) exceeded. Current usage: {current_mb}MB'
            }), 413
        
        # Read encrypted file content (ciphertext)
        ciphertext_buffer = file.read()
        
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Create file record in database with BYTEA storage
        new_file = File(
            id=file_id,
            owner_id=user_id,
            original_filename=original_filename,
            content_type=file.content_type or 'application/octet-stream',
            size_bytes=file_size,
            algo=algo,
            iv=iv_base64,
            storage_blob=ciphertext_buffer  # Store ciphertext directly in BYTEA
        )
        
        db.session.add(new_file)
        db.session.commit()
        
        # Log safe metadata only (no plaintext or keys)
        print(f"✅ Encrypted file stored in PostgreSQL: {file_id} (size: {file_size} bytes, iv: {iv_base64[:8]}...)")
        
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
    Download encrypted file from PostgreSQL BYTEA storage.
    Returns ciphertext and metadata headers - client decrypts with session key.
    """
    try:
        user_id = g.current_user.id
        
        # Find file and verify ownership
        file_record = File.find_by_id_and_owner(file_id, user_id)
        if not file_record:
            return jsonify({'error': 'File not found or access denied'}), 404
        
        # Return ciphertext with metadata in headers
        response = Response(
            file_record.storage_blob,  # Raw BYTEA ciphertext
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
    """List all files owned by the authenticated user"""
    try:
        user_id = g.current_user.id
        files = File.find_by_owner(user_id)
        
        # Calculate current storage usage
        total_usage = get_user_storage_usage(user_id)
        quota_mb = USER_QUOTA_BYTES // (1024 * 1024)
        usage_mb = total_usage // (1024 * 1024)
        
        file_list = [file.to_dict() for file in files]
        
        return jsonify({
            'files': file_list,
            'storage_info': {
                'used_bytes': total_usage,
                'used_mb': usage_mb,
                'quota_bytes': USER_QUOTA_BYTES,
                'quota_mb': quota_mb,
                'remaining_bytes': USER_QUOTA_BYTES - total_usage,
                'remaining_mb': quota_mb - usage_mb
            }
        }), 200
        
    except Exception as e:
        print(f"List files error: {str(e)}")
        return jsonify({'error': 'Failed to list files'}), 500

@files_bp.route('/<file_id>', methods=['DELETE'])
@auth_required
def delete_file(file_id):
    """Delete file from PostgreSQL storage"""
    try:
        user_id = g.current_user.id
        
        # Find file and verify ownership
        file_record = File.find_by_id_and_owner(file_id, user_id)
        if not file_record:
            return jsonify({'error': 'File not found or access denied'}), 404
        
        # Delete from database (BYTEA data is automatically removed)
        db.session.delete(file_record)
        db.session.commit()
        
        print(f"✅ File deleted: {file_id}")
        
        return jsonify({'message': 'File deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Delete error: {str(e)}")
        return jsonify({'error': 'Failed to delete file'}), 500
        algo = metadata.get('algo', 'AES-256-GCM')
        
        if not original_filename:
            return jsonify({'error': 'Original filename is required'}), 400
        
        if not iv_base64:
            return jsonify({'error': 'IV is required'}), 400
        
        # Validate IV is valid base64
        try:
            base64.b64decode(iv_base64)
        except Exception:
            return jsonify({'error': 'IV must be valid base64'}), 400
        
        # Ensure filename is safe
        secure_name = secure_filename(original_filename)
        if not secure_name:
            secure_name = 'unnamed_file'
        
        # Generate unique filename for storage
        file_id = str(uuid.uuid4())
        storage_filename = f"{file_id}.enc"
        
        # Create the main CryptoVaultX directory structure
        base_dir = "C:\\CryptoVaultX"
        upload_dir = os.path.join(base_dir, "uploads")
        downloads_dir = os.path.join(base_dir, "downloads")
        db_dir = os.path.join(base_dir, "db")
        
        # Ensure all directories exist
        os.makedirs(upload_dir, exist_ok=True)
        os.makedirs(downloads_dir, exist_ok=True)
        os.makedirs(db_dir, exist_ok=True)
        
        storage_path = os.path.join(upload_dir, storage_filename)
        
        # Save encrypted file to storage
        file.save(storage_path)
        
        # Verify file was actually saved
        if not os.path.exists(storage_path):
            return jsonify({'error': 'Failed to save file to storage'}), 500
            
        # Log successful storage for debugging
        print(f"✅ File saved successfully: {storage_path} (size: {os.path.getsize(storage_path)} bytes)")
        
        # Create file record in database
        # Use authenticated user ID
        user_id = g.current_user.id
        
        new_file = File(
            id=file_id,
            owner_id=user_id,
            filename=secure_name,
            size=original_size,  # Store original file size
            algo=algo,
            iv=iv_base64,
            tag=iv_base64,  # For GCM, auth tag is included in ciphertext
            wrapped_key=None,  # Session-based encryption doesn't use wrapped keys
            storage_path=storage_path,
            content_type='application/octet-stream',  # Encrypted files are binary
            is_encrypted=True,
            folder='root'
        )
        
        db.session.add(new_file)
        db.session.commit()

            })
        
        response.headers['X-File-Metadata'] = json.dumps(metadata)
        
        return response
        
    except Exception as e:
        return jsonify({'error': 'File download failed', 'details': str(e)}), 500

@files_bp.route('/<file_id>/info', methods=['GET'])
@auth_required
def get_file_info(file_id):
    """Get file metadata without downloading the file"""
    try:
        # Find file and check access
        file_record = File.find_by_id_and_owner(file_id, g.current_user.id)
        if not file_record:
            return jsonify({'error': 'File not found or access denied'}), 404
        
        return jsonify({
            'file': file_record.to_dict(include_sensitive=True)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get file info', 'details': str(e)}), 500

@files_bp.route('/<file_id>', methods=['DELETE'])
@auth_required
def delete_file(file_id):
    """Delete file (only owner can delete)"""
    try:
        # Find file and check ownership
        file_record = File.find_by_id_and_owner(file_id, g.current_user.id)
        if not file_record:
            return jsonify({'error': 'File not found or access denied'}), 404
        
        # Delete file from storage
        file_deleted_from_storage = file_record.delete_file_from_storage()
        
        # Delete file record from database
        db.session.delete(file_record)
        db.session.commit()
        
        return jsonify({
            'message': 'File deleted successfully',
            'file_id': file_id,
            'storage_deleted': file_deleted_from_storage
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'File deletion failed', 'details': str(e)}), 500

@files_bp.route('/stats', methods=['GET'])
@auth_required
def get_file_stats():
    """Get file statistics for the current user"""
    try:
        total_files = File.query.filter_by(owner_id=g.current_user.id).count()
        
        # Calculate total storage used
        total_size = db.session.query(db.func.sum(File.size))\
                             .filter_by(owner_id=g.current_user.id)\
                             .scalar() or 0
        
        return jsonify({
            'stats': {
                'total_files': total_files,
                'total_size_bytes': total_size,
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'max_file_size_mb': MAX_FILE_SIZE // (1024 * 1024)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get file stats', 'details': str(e)}), 500

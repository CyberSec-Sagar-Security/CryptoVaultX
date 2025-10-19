from flask import Blueprint, request, jsonify, send_file, g
from werkzeug.utils import secure_filename
import os
import json
import uuid
import base64
from database import File, db_manager
from models import db
from middleware.auth import auth_required
import psycopg2

files_bp = Blueprint('files', __name__)

# Configuration
ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 
    'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', '7z', 'tar', 
    'gz', 'mp3', 'mp4', 'avi', 'mov', 'mkv', 'enc'  # .enc for encrypted files
}

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_metadata(metadata):
    """Validate file upload metadata"""
    required_fields = ['filename', 'iv', 'tag']
    
    for field in required_fields:
        if field not in metadata:
            return False, f"Missing required field: {field}"
    
    # Validate filename
    filename = metadata.get('filename', '').strip()
    if not filename or len(filename) > 255:
        return False, "Filename must be between 1 and 255 characters"
    
    # Validate IV (should be base64 encoded)
    iv = metadata.get('iv', '').strip()
    if not iv:
        return False, "IV is required"
    
    try:
        base64.b64decode(iv)
    except Exception:
        return False, "IV must be valid base64"
    
    # Validate authentication tag (should be base64 encoded)
    tag = metadata.get('tag', '').strip()
    if not tag:
        return False, "Authentication tag is required"
    
    try:
        base64.b64decode(tag)
    except Exception:
        return False, "Authentication tag must be valid base64"
    
    return True, "Valid metadata"

@files_bp.route('/api/files', methods=['POST'])
@auth_required
def upload_encrypted_file():
    """Upload encrypted file with simplified metadata format"""
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
        
        # Get metadata
        metadata_str = request.form.get('metadata')
        if not metadata_str:
            return jsonify({'error': 'Metadata is required'}), 400
        
        try:
            metadata = json.loads(metadata_str)
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid JSON in metadata'}), 400
        
        # Extract metadata fields
        original_filename = metadata.get('originalFilename', '')
        original_size = metadata.get('size', 0)
        iv_base64 = metadata.get('ivBase64', '')
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
        
        # Ensure uploads directory exists
        upload_dir = '/app/uploads'
        os.makedirs(upload_dir, exist_ok=True)
        
        storage_path = os.path.join(upload_dir, storage_filename)
        
        # Save encrypted file to storage
        file.save(storage_path)
        
        # Create file record in database
        new_file = File(
            id=file_id,
            owner_id=g.current_user.id,
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
        
        return jsonify({
            'message': 'File uploaded successfully',
            'id': new_file.id,
            'filename': new_file.filename,
            'size': new_file.size,
            'created_at': new_file.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        # Clean up file if it was saved but DB operation failed
        if 'storage_path' in locals() and os.path.exists(storage_path):
            try:
                os.remove(storage_path)
            except:
                pass
        
        return jsonify({'error': 'File upload failed', 'details': str(e)}), 500

@files_bp.route('/api/files/upload', methods=['POST'])
@auth_required
def upload_file():
    """Upload file with optional encryption support"""
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
        
        # Check if file is encrypted
        is_encrypted = request.form.get('is_encrypted', 'false').lower() == 'true'
        folder = request.form.get('folder', 'root')
        
        # Initialize variables for encrypted files
        iv = None
        tag = None
        original_filename = file.filename
        algo = None
        content_type = file.content_type
        
        if is_encrypted:
            # Get encryption data
            encryption_data_str = request.form.get('encryption_data')
            if not encryption_data_str:
                return jsonify({'error': 'Encryption data is required for encrypted files'}), 400
            
            try:
                encryption_data = json.loads(encryption_data_str)
            except json.JSONDecodeError:
                return jsonify({'error': 'Invalid JSON in encryption data'}), 400
            
            # Extract encryption metadata
            iv = encryption_data.get('iv')
            tag = encryption_data.get('tag')
            metadata = encryption_data.get('metadata', {})
            wrapped_key = encryption_data.get('wrappedKey')
            
            if not iv:
                return jsonify({'error': 'IV is required for encrypted files'}), 400
            
            # Use original filename and metadata
            original_filename = metadata.get('filename', original_filename)
            content_type = metadata.get('mimeType', content_type)
            algo = metadata.get('algorithm', 'AES-256-GCM')
            
            # For GCM mode, tag is embedded in ciphertext, so we'll use IV for tag field
            tag = iv
            
            # Validate base64 encoding
            try:
                base64.b64decode(iv)
                base64.b64decode(tag)
            except Exception:
                return jsonify({'error': 'IV and tag must be valid base64'}), 400
        
        # Ensure filename is safe
        secure_name = secure_filename(original_filename)
        if not secure_name:
            secure_name = 'unnamed_file'
        
        # Generate unique filename for storage
        file_id = str(uuid.uuid4())
        file_extension = '.enc' if is_encrypted else os.path.splitext(secure_name)[1]
        storage_filename = f"{file_id}{file_extension}"
        
        # Ensure uploads directory exists
        upload_dir = '/app/uploads'
        os.makedirs(upload_dir, exist_ok=True)
        
        storage_path = os.path.join(upload_dir, storage_filename)
        
        # Save file to storage
        file.save(storage_path)
        
        # Create file record in database
        new_file = File(
            id=file_id,
            owner_id=g.current_user.id,
            filename=secure_name,
            size=file_size,
            algo=algo,
            iv=iv,
            tag=tag,
            wrapped_key=wrapped_key if is_encrypted else None,
            storage_path=storage_path,
            content_type=content_type,
            is_encrypted=is_encrypted,
            folder=folder
        )
        
        db.session.add(new_file)
        db.session.commit()
        
        return jsonify({
            'message': 'File uploaded successfully',
            'file_id': new_file.id,
            'filename': new_file.filename,
            'size': new_file.size,
            'is_encrypted': new_file.is_encrypted,
            'folder': new_file.folder,
            'created_at': new_file.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        # Clean up file if it was saved but DB operation failed
        if 'storage_path' in locals() and os.path.exists(storage_path):
            try:
                os.remove(storage_path)
            except:
                pass
        
        return jsonify({'error': 'File upload failed', 'details': str(e)}), 500

@files_bp.route('/api/files', methods=['GET'])
@auth_required
def list_files():
    """List all files owned by the current user"""
    try:
        # Get optional query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)  # Max 100 per page
        
        # Get files owned by current user
        files_query = File.query.filter_by(owner_id=g.current_user.id)\
                                .order_by(File.created_at.desc())
        
        # Paginate results
        files_pagination = files_query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        files_list = [file.to_dict() for file in files_pagination.items]
        
        return jsonify({
            'files': files_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': files_pagination.total,
                'pages': files_pagination.pages,
                'has_next': files_pagination.has_next,
                'has_prev': files_pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to list files', 'details': str(e)}), 500

@files_bp.route('/api/files/<file_id>', methods=['GET'])
@auth_required
def download_file(file_id):
    """Download file (returns encrypted or unencrypted file + metadata)"""
    try:
        # Find file and check access (owner or shared)
        file_record = File.query.filter_by(id=file_id).first()
        if not file_record:
            return jsonify({'error': 'File not found'}), 404
        
        # Check if user has access to this file
        if not file_record.can_access(g.current_user.id):
            return jsonify({'error': 'Access denied'}), 403
        
        # Check if file exists on disk
        if not os.path.exists(file_record.storage_path):
            return jsonify({'error': 'File not found on storage'}), 404
        
        # Determine download name and mime type
        if file_record.is_encrypted:
            download_name = f"{file_record.filename}"  # Keep original name, client will decrypt
            mimetype = 'application/octet-stream'  # Encrypted files are binary
        else:
            download_name = file_record.filename
            mimetype = file_record.content_type or 'application/octet-stream'
        
        # Create response with file data
        response = send_file(
            file_record.storage_path,
            as_attachment=True,
            download_name=download_name,
            mimetype=mimetype
        )
        
        # Add metadata to response headers
        metadata = {
            'file_id': file_record.id,
            'filename': file_record.filename,
            'size': file_record.size,
            'content_type': file_record.content_type,
            'is_encrypted': file_record.is_encrypted,
            'folder': file_record.folder,
            'created_at': file_record.created_at.isoformat()
        }
        
        # Add encryption metadata if file is encrypted
        if file_record.is_encrypted and file_record.iv:
            metadata.update({
                'algo': file_record.algo,
                'iv': file_record.iv,
                'tag': file_record.tag,
                'wrapped_key': file_record.wrapped_key
            })
        
        response.headers['X-File-Metadata'] = json.dumps(metadata)
        
        return response
        
    except Exception as e:
        return jsonify({'error': 'File download failed', 'details': str(e)}), 500

@files_bp.route('/api/files/<file_id>/info', methods=['GET'])
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

@files_bp.route('/api/files/<file_id>', methods=['DELETE'])
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

@files_bp.route('/api/files/stats', methods=['GET'])
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

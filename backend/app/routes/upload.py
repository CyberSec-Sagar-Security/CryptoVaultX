"""
Upload Route - Phase 4

Professional REST API endpoint for secure encrypted file uploads.
Implements zero-knowledge architecture where the server only receives
and stores encrypted files without access to decryption keys.

Security Features:
- Accepts only encrypted files
- No plaintext data handling
- Secure file storage with UUID filenames
- Comprehensive error handling
- Request validation and sanitization

@author: CryptoVaultX Development Team
@version: 1.0.0
@since: Phase 4
"""

import os
import json
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.exceptions import RequestEntityTooLarge, BadRequest

# Import our utilities
from ..utils.file_handler import SecureFileHandler, FileHandlerError
from ..models.FileMeta import FileMeta, create_file_record

# Create blueprint
upload_bp = Blueprint('upload', __name__)

# Configuration
CONFIG = {
    'MAX_CONTENT_LENGTH': 6 * 1024 * 1024,  # 6MB (includes form data overhead)
    'REQUIRED_FIELDS': ['iv', 'originalSize', 'encryptedSize', 'timestamp'],
    'MAX_METADATA_SIZE': 1024,  # 1KB for metadata
}

@upload_bp.route('/api/upload', methods=['POST'])
def upload_encrypted_file():
    """
    Upload an encrypted file to the server.
    
    Expected form data:
    - file: Encrypted file data (required)
    - metadata: Encrypted metadata blob (optional)
    - iv: Initialization vector in base64 (required)
    - originalSize: Original file size in bytes (required)
    - encryptedSize: Encrypted file size in bytes (required)
    - timestamp: Upload timestamp (required)
    
    Returns:
        JSON response with upload status and file information
    """
    
    # Initialize response
    response_data = {
        'status': 'error',
        'message': '',
        'timestamp': datetime.utcnow().isoformat()
    }
    
    try:
        # Log upload attempt
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        print(f"🔄 Upload attempt from {client_ip}")
        
        # Validate request
        validation_result = validate_upload_request(request)
        if not validation_result['valid']:
            response_data['message'] = validation_result['error']
            return jsonify(response_data), 400
        
        # Extract form data
        form_data = validation_result['data']
        encrypted_file = form_data['file']
        
        print(f"📁 Processing encrypted file upload:")
        print(f"   Original filename: {encrypted_file.filename}")
        print(f"   Original size: {form_data.get('originalSize', 'unknown')} bytes")
        print(f"   Encrypted size: {form_data.get('encryptedSize', 'unknown')} bytes")
        
        # Initialize file handler
        file_handler = SecureFileHandler()
        
        # Prepare metadata
        upload_metadata = {
            'iv': form_data['iv'],
            'original_size': int(form_data['originalSize']),
            'encrypted_size': int(form_data['encryptedSize']),
            'upload_timestamp': form_data['timestamp'],
            'client_ip': client_ip,
            'user_agent': request.headers.get('User-Agent', 'Unknown'),
            'has_encrypted_metadata': 'metadata' in form_data
        }
        
        # Save encrypted file
        file_info = file_handler.save_encrypted_file(
            encrypted_file,
            metadata=upload_metadata
        )
        
        # Save encrypted metadata blob if provided
        if 'metadata' in form_data:
            metadata_file = form_data['metadata']
            if metadata_file.content_length <= CONFIG['MAX_METADATA_SIZE']:
                metadata_info = file_handler.save_encrypted_file(
                    metadata_file,
                    metadata={'type': 'encrypted_metadata', 'parent_file': file_info['file_id']}
                )
                file_info['metadata_file_id'] = metadata_info['file_id']
                print(f"📝 Encrypted metadata saved: {metadata_info['file_id']}")
        
        # Create database record (if database is available)
        try:
            db_record = create_file_record(file_info, upload_metadata)
            if db_record:
                file_info['database_id'] = db_record['id']
                print(f"💾 Database record created: {db_record['id']}")
        except Exception as db_error:
            print(f"⚠️ Database record creation failed: {db_error}")
            # Continue without database - file is still saved
        
        # Prepare success response
        response_data.update({
            'status': 'success',
            'message': 'Encrypted file uploaded successfully',
            'fileId': file_info['file_id'],
            'filename': file_info['original_filename'],
            'size': {
                'original': file_info['metadata']['original_size'],
                'encrypted': file_info['file_size'],
                'overhead': file_info['file_size'] - file_info['metadata']['original_size']
            },
            'hash': file_info['file_hash'],
            'upload_timestamp': file_info['upload_timestamp']
        })
        
        print(f"✅ Upload successful: {file_info['file_id']}")
        print(f"📊 File saved: {file_info['file_path']}")
        
        return jsonify(response_data), 201
        
    except FileHandlerError as e:
        print(f"❌ File handling error: {e}")
        response_data['message'] = f"File handling error: {str(e)}"
        return jsonify(response_data), 400
        
    except RequestEntityTooLarge:
        print("❌ File size exceeds limit")
        response_data['message'] = "File size exceeds maximum allowed limit"
        return jsonify(response_data), 413
        
    except Exception as e:
        print(f"❌ Unexpected upload error: {e}")
        response_data['message'] = "Internal server error during upload"
        
        # Log full error in development
        if current_app.debug:
            response_data['debug_error'] = str(e)
            
        return jsonify(response_data), 500

def validate_upload_request(request) -> dict:
    """
    Validate the upload request and extract form data
    
    Args:
        request: Flask request object
        
    Returns:
        Dictionary with validation result and extracted data
    """
    
    try:
        # Check if it's a multipart request
        if not request.content_type or 'multipart/form-data' not in request.content_type:
            return {
                'valid': False,
                'error': 'Request must be multipart/form-data'
            }
        
        # Check for required encrypted file
        if 'file' not in request.files:
            return {
                'valid': False,
                'error': 'No encrypted file provided'
            }
        
        encrypted_file = request.files['file']
        if not encrypted_file.filename:
            return {
                'valid': False,
                'error': 'No file selected'
            }
        
        # Validate required fields
        form_data = {}
        for field in CONFIG['REQUIRED_FIELDS']:
            if field not in request.form:
                return {
                    'valid': False,
                    'error': f'Missing required field: {field}'
                }
            form_data[field] = request.form[field]
        
        # Validate IV format (should be base64)
        iv = form_data['iv']
        if not iv or len(iv) < 16:  # Base64 encoded 12-byte IV should be longer
            return {
                'valid': False,
                'error': 'Invalid or missing initialization vector'
            }
        
        # Validate sizes
        try:
            original_size = int(form_data['originalSize'])
            encrypted_size = int(form_data['encryptedSize'])
            
            if original_size <= 0 or encrypted_size <= 0:
                return {
                    'valid': False,
                    'error': 'Invalid file sizes'
                }
                
            if encrypted_size < original_size:
                return {
                    'valid': False,
                    'error': 'Encrypted size cannot be smaller than original size'
                }
                
        except ValueError:
            return {
                'valid': False,
                'error': 'File sizes must be valid integers'
            }
        
        # Validate timestamp
        try:
            timestamp = int(form_data['timestamp'])
            # Check if timestamp is reasonable (not too old or in future)
            now = int(datetime.utcnow().timestamp() * 1000)
            if abs(now - timestamp) > 300000:  # 5 minutes tolerance
                print(f"⚠️ Timestamp warning: {timestamp} vs {now}")
        except ValueError:
            return {
                'valid': False,
                'error': 'Invalid timestamp format'
            }
        
        # Add files to form data
        form_data['file'] = encrypted_file
        
        # Check for optional encrypted metadata
        if 'metadata' in request.files:
            metadata_file = request.files['metadata']
            if metadata_file.filename and metadata_file.content_length <= CONFIG['MAX_METADATA_SIZE']:
                form_data['metadata'] = metadata_file
            else:
                print("⚠️ Metadata file too large or invalid")
        
        print(f"✅ Request validation passed")
        return {
            'valid': True,
            'data': form_data
        }
        
    except Exception as e:
        print(f"❌ Request validation error: {e}")
        return {
            'valid': False,
            'error': f'Request validation failed: {str(e)}'
        }

@upload_bp.route('/api/upload/status', methods=['GET'])
def upload_status():
    """
    Get upload service status and statistics
    
    Returns:
        JSON response with service status
    """
    try:
        file_handler = SecureFileHandler()
        stats = file_handler.get_storage_stats()
        
        return jsonify({
            'status': 'active',
            'service': 'CryptoVaultX Upload Service',
            'version': '1.0.0',
            'phase': 'Phase 4',
            'features': [
                'AES-256-GCM encryption support',
                'Zero-knowledge architecture',
                'Secure file storage',
                'Metadata encryption'
            ],
            'limits': {
                'max_file_size_mb': CONFIG['MAX_CONTENT_LENGTH'] / (1024 * 1024),
                'max_metadata_size_bytes': CONFIG['MAX_METADATA_SIZE']
            },
            'storage_stats': stats,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Status check failed: {str(e)}',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@upload_bp.route('/api/upload/health', methods=['GET'])
def upload_health():
    """
    Health check endpoint for upload service
    
    Returns:
        Simple health status
    """
    return jsonify({
        'status': 'healthy',
        'service': 'upload',
        'timestamp': datetime.utcnow().isoformat()
    })

# Error handlers for the blueprint
@upload_bp.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(error):
    """Handle file too large errors"""
    max_size_mb = CONFIG['MAX_CONTENT_LENGTH'] / (1024 * 1024)
    return jsonify({
        'status': 'error',
        'message': f'File size exceeds {max_size_mb:.1f}MB limit',
        'timestamp': datetime.utcnow().isoformat()
    }), 413

@upload_bp.errorhandler(BadRequest)
def handle_bad_request(error):
    """Handle bad request errors"""
    return jsonify({
        'status': 'error',
        'message': 'Bad request - please check your data format',
        'timestamp': datetime.utcnow().isoformat()
    }), 400

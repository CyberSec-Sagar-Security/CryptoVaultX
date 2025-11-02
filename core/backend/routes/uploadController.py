"""
Upload Controller - Handles encrypted file uploads with quota enforcement
Separated from other file operations per architecture requirements
"""
from flask import request, jsonify, g
from werkzeug.utils import secure_filename
import os
import json
import uuid
import base64
from datetime import datetime
from database import File
from storage_manager import storage_manager

# Configuration
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB per file

def upload_encrypted_file():
    """
    Upload encrypted file to local filesystem storage with quota enforcement.
    Client must encrypt files on browser - server never receives plaintext.
    
    Expected multipart/form-data:
      - file: encrypted file blob
      - metadata: JSON string with {originalFilename, ivBase64, algo}
    
    Returns:
      201: {message, id, original_filename, size_bytes, created_at}
      400: Missing or invalid data
      413: Quota exceeded or file too large
      500: Server error
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
        username = g.current_user.username
        
        # Quota is enforced by middleware; continue
        
        # Read encrypted file content (ciphertext)
        ciphertext_buffer = file.read()
        
        # Generate unique file ID and storage path using username
        file_id = str(uuid.uuid4())
        storage_path = storage_manager.generate_storage_path(username, original_filename)
        
        # Save encrypted file to local filesystem
        if not storage_manager.save_encrypted_file(ciphertext_buffer, storage_path):
            return jsonify({'error': 'Failed to save encrypted file'}), 500
        
        # Create file record in database using direct PostgreSQL
        new_file = File.create(
            owner_id=user_id,
            original_filename=original_filename,
            size_bytes=file_size,
            content_type=file.content_type or 'application/octet-stream',
            algo=algo,
            iv=iv_base64,
            storage_path=storage_path  # Store local filesystem path
        )
        
        if not new_file:
            return jsonify({'error': 'Failed to create file record in database'}), 500
        
        # Log safe metadata only (no plaintext or keys)
        print(f"✅ Encrypted file stored locally: {new_file['id']} (size: {file_size} bytes, path: {storage_path})")
        
        return jsonify({
            'message': 'File uploaded successfully',
            'id': new_file['id'],
            'original_filename': new_file['original_filename'],
            'size_bytes': new_file['size_bytes'],
            'created_at': new_file['created_at'].isoformat()
        }), 201
        
    except Exception as e:
        import traceback
        import sys
        error_msg = f"❌ Upload error: {str(e)}"
        traceback_msg = f"Full traceback:\n{traceback.format_exc()}"
        print(error_msg, file=sys.stderr)
        print(traceback_msg, file=sys.stderr)
        sys.stderr.flush()
        return jsonify({'error': 'File upload failed', 'details': str(e)}), 500

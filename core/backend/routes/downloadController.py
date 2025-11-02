"""
Download Controller - Handles encrypted file downloads from PostgreSQL BYTEA storage
HIGH PERFORMANCE STREAMING - No rate limiting or capping
WITH ACCESS CONTROL - Supports both owner and shared file downloads
"""
from flask import jsonify, g, Response, stream_with_context
from models import File
from database import check_access, Share
import io

def download_encrypted_file(file_id):
    """
    Download encrypted file from PostgreSQL BYTEA storage with STREAMING.
    NO RATE LIMITING - Maximum speed download.
    Returns ciphertext and metadata headers - client decrypts with session key.
    Supports both owner and shared file access.
    
    Args:
        file_id: UUID of the file to download
    
    Returns:
        200: Binary file stream with encryption metadata in headers
        403: Access denied (not owner or grantee)
        404: File not found
        500: Server error
    """
    try:
        user_id = g.current_user['id']
        
        # Get file record from database
        file_record = File.find_by_id(file_id)
        
        if not file_record:
            return jsonify({'error': 'File not found'}), 404
        
        # Check access using access control system (owner or shared)
        has_access = check_access(user_id, file_id)
        if not has_access:
            return jsonify({'error': 'Access denied - you do not have permission to access this file'}), 403
        
        # Determine access type and permission level
        is_owner = file_record['owner_id'] == user_id
        access_type = 'owner'
        permission = 'read'  # Default for owner
        
        if not is_owner:
            # Get share permission
            share = Share.find_by_file_and_grantee(file_id, user_id)
            if share:
                access_type = 'shared'
                permission = share.get('permission', 'full_access')
            else:
                return jsonify({'error': 'Access denied - you do not have permission to access this file'}), 403
        
        # Check if user has download permission
        # 'full_access' = view + download, 'download' = download only, 'view' = view only (no download via API)
        if access_type == 'shared' and permission == 'view':
            return jsonify({
                'error': 'Download not permitted', 
                'message': 'You have view-only access. Use the file viewer instead.'
            }), 403
        
        # Get encrypted file data - support both local filesystem (new) and database storage (old)
        encrypted_data = None
        
        # Priority 1: Try local filesystem storage (new system)
        if file_record.get('storage_path'):
            from storage_manager import storage_manager
            storage_path = file_record['storage_path']
            encrypted_data = storage_manager.read_encrypted_file(storage_path)
            if encrypted_data:
                print(f"✅ File read from local storage: {storage_path}")
            else:
                print(f"⚠️ Failed to read from storage_path: {storage_path}, falling back to storage_blob")
        
        # Priority 2: Fall back to database BYTEA storage (old system) if no storage_path or read failed
        if not encrypted_data and file_record.get('storage_blob'):
            encrypted_data = file_record['storage_blob']
            # Convert memoryview/bytes to bytes if needed
            if isinstance(encrypted_data, memoryview):
                encrypted_data = encrypted_data.tobytes()
            elif not isinstance(encrypted_data, bytes):
                encrypted_data = bytes(encrypted_data)
            print(f"✅ File read from database storage_blob")
        
        # If still no data, file is missing
        if not encrypted_data:
            return jsonify({'error': 'File data not found - neither storage_path nor storage_blob available'}), 404
        
        # Create streaming generator - sends data in 64KB chunks for maximum speed
        def generate():
            """Generator function for streaming large files without memory overhead"""
            chunk_size = 65536  # 64KB chunks - optimal for network performance
            total_size = len(encrypted_data)
            
            for i in range(0, total_size, chunk_size):
                chunk = encrypted_data[i:i + chunk_size]
                yield chunk
        
        # Create streaming response with NO RATE LIMITING
        response = Response(
            stream_with_context(generate()),
            status=200,
            content_type='application/octet-stream',
            direct_passthrough=True  # Bypass Flask buffering for maximum speed
        )
        
        # Set metadata headers for client-side decryption
        response.headers['X-File-Name'] = file_record['original_filename']
        response.headers['X-File-IV'] = file_record['iv']
        response.headers['X-File-Algo'] = file_record['algo']
        response.headers['X-File-Size'] = str(file_record['size_bytes'])
        response.headers['Content-Length'] = str(len(encrypted_data))
        response.headers['X-Access-Type'] = access_type  # 'owner' or 'shared'
        response.headers['X-Permission'] = permission  # 'full_access', 'download', or 'view'
        response.headers['Content-Disposition'] = f'attachment; filename="{file_record["original_filename"]}"'
        
        # Disable buffering and enable streaming
        response.headers['X-Accel-Buffering'] = 'no'  # Disable nginx buffering
        response.headers['Cache-Control'] = 'no-cache'  # No caching for security
        
        # Log safe metadata only
        print(f"✅ Streaming file download: {file_id} (size: {file_record['size_bytes']} bytes, access: {access_type}, permission: {permission})")
        
        # Emit sync event for real-time dashboard update
        try:
            from utils.sync_events import emit_sync_event
            emit_sync_event(
                user_id=user_id,
                event_type='file_downloaded',
                payload={
                    'file_id': file_id,
                    'filename': file_record['original_filename'],
                    'size_bytes': file_record['size_bytes']
                }
            )
        except Exception as e:
            print(f"Warning: Failed to emit sync event: {e}")
        
        return response
        
    except Exception as e:
        print(f"❌ Download error: {str(e)}")
        return jsonify({'error': 'File download failed'}), 500

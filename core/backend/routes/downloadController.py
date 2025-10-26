"""
Download Controller - Handles encrypted file downloads
Separated from other file operations per architecture requirements
"""
from flask import jsonify, g, Response
from models import File
from storage_manager import storage_manager

def download_encrypted_file(file_id):
    """
    Download encrypted file from local filesystem storage.
    Returns ciphertext and metadata headers - client decrypts with session key.
    
    Args:
        file_id: UUID of the file to download
    
    Returns:
        200: Binary file stream with encryption metadata in headers
        404: File not found or access denied
        500: Server error
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
        # Advise browsers to download
        response.headers['Content-Disposition'] = f'attachment; filename="{file_record.original_filename}"'
        
        # Log safe metadata only
        print(f"✅ File downloaded: {file_id} (size: {file_record.size_bytes} bytes)")
        
        return response
        
    except Exception as e:
        print(f"Download error: {str(e)}")  # Log error message only
        return jsonify({'error': 'File download failed'}), 500

"""
Delete Controller - Handles file deletion for both database and local storage
"""
from flask import jsonify, g
from datetime import datetime
from models import File
from storage_manager import storage_manager
import os
from pathlib import Path

def delete_file(file_id):
    """
    Hard delete file - removes file from database AND physical storage.
    
    Args:
        file_id: UUID of the file to delete
    
    Returns:
        200: {message: 'File deleted successfully'}
        404: File not found or access denied
        500: Server error
    """
    try:
        user_id = g.current_user['id']
        username = g.current_user['username']
        
        # Find file and verify ownership
        file_record = File.find_by_id(file_id)
        if not file_record:
            return jsonify({'error': 'File not found'}), 404
            
        # Check ownership
        if file_record['owner_id'] != user_id:
            return jsonify({'error': 'Access denied - you are not the owner'}), 403
        
        # Store storage_path before deleting from database
        storage_path = file_record.get('storage_path')
        
        # Delete from database first
        deleted_file = File.delete_by_id(file_id, user_id)
        
        if not deleted_file:
            return jsonify({'error': 'File not found or already deleted'}), 404
        
        # Delete physical file from storage if it exists
        if storage_path:
            try:
                file_path = Path(storage_path)
                if file_path.exists():
                    os.remove(file_path)
                    print(f"✅ Physical file deleted: {storage_path}")
                else:
                    print(f"⚠️ Physical file not found (already deleted?): {storage_path}")
            except Exception as e:
                print(f"⚠️ Failed to delete physical file {storage_path}: {e}")
                # Continue anyway - database record is deleted
        
        # Emit sync event for real-time dashboard update
        try:
            from utils.sync_events import emit_sync_event
            emit_sync_event(
                user_id=user_id,
                event_type='file_deleted',
                payload={
                    'file_id': file_id,
                    'filename': deleted_file.get('original_filename', 'unknown')
                }
            )
        except Exception as e:
            print(f"Warning: Failed to emit sync event: {e}")
        
        print(f"✅ File deleted from database: {file_id} (owner: {username})")
        
        return jsonify({'message': 'File deleted successfully'}), 200
        
    except Exception as e:
        print(f"Delete error: {str(e)}")
        return jsonify({'error': 'Failed to delete file'}), 500

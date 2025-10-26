"""
Delete Controller - Handles file soft deletion
Separated from other file operations per architecture requirements
"""
from flask import jsonify, g
from datetime import datetime
from models import db, File
from storage_manager import storage_manager

def delete_file(file_id):
    """
    Soft delete file (move to deleted folder).
    Moves file from ./storage/<user_id>/uploads/ to ./storage/<user_id>/deleted/
    and updates metadata status to 'deleted' with timestamp.
    
    Args:
        file_id: UUID of the file to delete
    
    Returns:
        200: {message: 'File deleted successfully'}
        404: File not found or access denied
        500: Server error
    """
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

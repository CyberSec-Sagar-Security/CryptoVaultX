"""
Bulk Operations Controller - Handles multiple file operations
Path: core/backend/routes/bulkController.py
Provides endpoints for bulk delete, share, and other multi-file operations
"""
from flask import jsonify, g, request
from models import File, Share
from database import check_access, User
from storage_manager import storage_manager
from datetime import datetime
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

def bulk_delete_files():
    """
    Delete multiple files at once
    
    Request body:
    {
        "file_ids": ["uuid1", "uuid2", "uuid3"]
    }
    
    Returns:
        200: {success: true, deleted_count: int, failed: []}
        400: Invalid request
        403: Access denied
        500: Server error
    """
    try:
        user_id = g.current_user['id']
        data = request.get_json()
        
        if not data or 'file_ids' not in data:
            return jsonify({'error': 'file_ids is required'}), 400
        
        file_ids = data.get('file_ids', [])
        
        if not isinstance(file_ids, list) or len(file_ids) == 0:
            return jsonify({'error': 'file_ids must be a non-empty array'}), 400
        
        deleted_count = 0
        failed = []
        
        for file_id in file_ids:
            try:
                # Find file and verify ownership
                file_record = File.find_by_id(file_id)
                
                if not file_record:
                    failed.append({
                        'file_id': file_id,
                        'reason': 'File not found'
                    })
                    continue
                
                # Check ownership
                if file_record['owner_id'] != user_id:
                    failed.append({
                        'file_id': file_id,
                        'reason': 'Access denied - not the owner'
                    })
                    continue
                
                # Store storage_path before deleting from database
                storage_path = file_record.get('storage_path')
                
                # Delete from database
                deleted_file = File.delete_by_id(file_id, user_id)
                
                # Delete physical file from storage if it exists
                if deleted_file and storage_path:
                    try:
                        file_path = Path(storage_path)
                        if file_path.exists():
                            os.remove(file_path)
                            print(f"✅ Physical file deleted: {storage_path}")
                    except Exception as e:
                        print(f"⚠️ Failed to delete physical file {storage_path}: {e}")
                
                if deleted_file:
                    deleted_count += 1
                    
                    # Emit sync event for real-time dashboard update
                    try:
                        from utils.sync_events import emit_sync_event
                        emit_sync_event(
                            user_id=user_id,
                            event_type='file_deleted',
                            payload={
                                'file_id': file_id,
                                'filename': file_record['original_filename']
                            }
                        )
                    except Exception as sync_err:
                        logger.warning(f"Failed to emit sync event: {sync_err}")
                else:
                    failed.append({
                        'file_id': file_id,
                        'reason': 'Delete operation failed'
                    })
                    
            except Exception as file_err:
                logger.error(f"Error deleting file {file_id}: {file_err}")
                failed.append({
                    'file_id': file_id,
                    'reason': str(file_err)
                })
        
        return jsonify({
            'success': True,
            'deleted_count': deleted_count,
            'failed': failed,
            'message': f'Successfully deleted {deleted_count} file(s)'
        }), 200
        
    except Exception as e:
        logger.error(f"Bulk delete error: {e}")
        return jsonify({'error': str(e)}), 500


def bulk_share_files():
    """
    Share multiple files with multiple users at once
    
    Request body:
    {
        "file_ids": ["uuid1", "uuid2"],
        "usernames": ["user1", "user2"],
        "permission": "read"  // "read", "write", or "full_access"
    }
    
    Returns:
        200: {success: true, shares_created: int, failed: []}
        400: Invalid request
        403: Access denied
        500: Server error
    """
    try:
        user_id = g.current_user['id']
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        file_ids = data.get('file_ids', [])
        usernames = data.get('usernames', [])
        permission = data.get('permission', 'read')
        
        # Validate inputs
        if not isinstance(file_ids, list) or len(file_ids) == 0:
            return jsonify({'error': 'file_ids must be a non-empty array'}), 400
        
        if not isinstance(usernames, list) or len(usernames) == 0:
            return jsonify({'error': 'usernames must be a non-empty array'}), 400
        
        if permission not in ['read', 'write', 'full_access']:
            return jsonify({'error': 'Invalid permission level'}), 400
        
        shares_created = 0
        failed = []
        
        # Get grantee user IDs from usernames
        grantee_ids = []
        
        for username in usernames:
            user = User.find_by_username(username)
            if not user:
                failed.append({
                    'username': username,
                    'reason': 'User not found'
                })
                continue
            
            if user['id'] == user_id:
                failed.append({
                    'username': username,
                    'reason': 'Cannot share with yourself'
                })
                continue
            
            grantee_ids.append(user['id'])
        
        # Create shares for each file and each grantee
        for file_id in file_ids:
            try:
                # Verify file exists and user owns it
                file_record = File.find_by_id(file_id)
                
                if not file_record:
                    failed.append({
                        'file_id': file_id,
                        'reason': 'File not found'
                    })
                    continue
                
                if file_record['owner_id'] != user_id:
                    failed.append({
                        'file_id': file_id,
                        'reason': 'Access denied - not the owner'
                    })
                    continue
                
                # Create share for each grantee
                for grantee_id in grantee_ids:
                    try:
                        # Check if share already exists
                        existing_share = Share.find_by_file_and_grantee(file_id, grantee_id)
                        
                        if existing_share:
                            # Update existing share
                            Share.update_permission(file_id, grantee_id, permission)
                            shares_created += 1
                        else:
                            # Create new share
                            share = Share.create(
                                file_id=file_id,
                                owner_id=user_id,
                                grantee_id=grantee_id,
                                permission=permission
                            )
                            if share:
                                shares_created += 1
                            else:
                                failed.append({
                                    'file_id': file_id,
                                    'grantee_id': grantee_id,
                                    'reason': 'Failed to create share'
                                })
                    except Exception as share_err:
                        logger.error(f"Error creating share for file {file_id}, grantee {grantee_id}: {share_err}")
                        failed.append({
                            'file_id': file_id,
                            'grantee_id': grantee_id,
                            'reason': str(share_err)
                        })
                
                # Emit sync event
                try:
                    from utils.sync_events import emit_sync_event
                    emit_sync_event(
                        user_id=user_id,
                        event_type='file_shared',
                        payload={
                            'file_id': file_id,
                            'filename': file_record['original_filename'],
                            'grantee_count': len(grantee_ids)
                        }
                    )
                except Exception as sync_err:
                    logger.warning(f"Failed to emit sync event: {sync_err}")
                    
            except Exception as file_err:
                logger.error(f"Error sharing file {file_id}: {file_err}")
                failed.append({
                    'file_id': file_id,
                    'reason': str(file_err)
                })
        
        return jsonify({
            'success': True,
            'shares_created': shares_created,
            'failed': failed,
            'message': f'Successfully created {shares_created} share(s)'
        }), 200
        
    except Exception as e:
        logger.error(f"Bulk share error: {e}")
        return jsonify({'error': str(e)}), 500


def bulk_download_info():
    """
    Get download information for multiple files
    Used by frontend to prepare bulk downloads
    
    Request body:
    {
        "file_ids": ["uuid1", "uuid2"]
    }
    
    Returns:
        200: {success: true, files: [{id, filename, size, content_type}]}
        400: Invalid request
        403: Access denied
        500: Server error
    """
    try:
        user_id = g.current_user['id']
        data = request.get_json()
        
        if not data or 'file_ids' not in data:
            return jsonify({'error': 'file_ids is required'}), 400
        
        file_ids = data.get('file_ids', [])
        
        if not isinstance(file_ids, list) or len(file_ids) == 0:
            return jsonify({'error': 'file_ids must be a non-empty array'}), 400
        
        files_info = []
        failed = []
        
        for file_id in file_ids:
            try:
                file_record = File.find_by_id(file_id)
                
                if not file_record:
                    failed.append({
                        'file_id': file_id,
                        'reason': 'File not found'
                    })
                    continue
                
                # Check access
                has_access = check_access(user_id, file_id)
                if not has_access:
                    failed.append({
                        'file_id': file_id,
                        'reason': 'Access denied'
                    })
                    continue
                
                files_info.append({
                    'id': file_record['id'],
                    'filename': file_record['original_filename'],
                    'size': file_record['size_bytes'],
                    'content_type': file_record['content_type'],
                    'iv': file_record['iv']
                })
                
            except Exception as file_err:
                logger.error(f"Error getting file info {file_id}: {file_err}")
                failed.append({
                    'file_id': file_id,
                    'reason': str(file_err)
                })
        
        return jsonify({
            'success': True,
            'files': files_info,
            'failed': failed
        }), 200
        
    except Exception as e:
        logger.error(f"Bulk download info error: {e}")
        return jsonify({'error': str(e)}), 500

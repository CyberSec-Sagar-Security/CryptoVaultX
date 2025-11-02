"""
Secure File Sharing Routes
Implements username-based file sharing with access control
Uses direct PostgreSQL via database.py (no SQLAlchemy)
"""
from flask import Blueprint, request, jsonify, g
import re
from database import User, File, Share, check_access
from middleware.auth import auth_required
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

def format_timestamp(dt):
    """Convert datetime to ISO format with UTC timezone"""
    if dt is None:
        return None
    # If datetime is timezone-aware, convert to UTC
    if hasattr(dt, 'astimezone'):
        dt_utc = dt.astimezone(timezone.utc)
        return dt_utc.isoformat()
    # If timezone-naive, assume it's UTC and make it explicit
    if hasattr(dt, 'replace'):
        dt_utc = dt.replace(tzinfo=timezone.utc)
        return dt_utc.isoformat()
    # Fallback to string
    return str(dt)

shares_bp = Blueprint('shares', __name__)

def validate_username(username):
    """Validate username format"""
    if not username or len(username) < 3 or len(username) > 50:
        return False
    # Username should be alphanumeric with optional underscores and hyphens
    pattern = r'^[a-zA-Z0-9_-]+$'
    return re.match(pattern, username) is not None

def validate_permission(permission):
    """Validate permission level"""
    valid_permissions = ['full_access', 'view', 'download']
    return permission in valid_permissions

@shares_bp.route('/api/files/<file_id>/share', methods=['POST'])
@auth_required
def share_file(file_id):
    """
    Share one or more files with one or more users (username-based)
    Supports:
    - Single file + multiple usernames
    - Multiple files (file_ids array) + multiple usernames
    
    Request body:
    {
        "usernames": ["user1", "user2"],  // Required: list of usernames or single username
        "file_ids": ["file1", "file2"],   // Optional: defaults to file_id from URL
        "permission": "read"               // Optional: defaults to "read"
    }
    """
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Support both single and multiple usernames
        usernames = data.get('usernames', [])
        if isinstance(usernames, str):
            usernames = [usernames]
        
        # Also support old 'grantee_username' for backward compatibility
        if not usernames and data.get('grantee_username'):
            usernames = [data.get('grantee_username')]
        
        # Support multiple file IDs (for multi-file sharing)
        file_ids = data.get('file_ids', [file_id])
        if isinstance(file_ids, str):
            file_ids = [file_ids]
        
        permission = data.get('permission', 'read').strip().lower()
        
        # Validate required fields
        if not usernames:
            return jsonify({'error': 'At least one username is required'}), 400
        
        if not file_ids:
            return jsonify({'error': 'At least one file ID is required'}), 400
        
        if not validate_permission(permission):
            return jsonify({'error': f'Invalid permission. Must be one of: read, view, download'}), 400
        
        # Validate all usernames
        for username in usernames:
            if not validate_username(username.strip()):
                return jsonify({'error': f'Invalid username format: {username}'}), 400
        
        results = {
            'created': [],
            'updated': [],
            'failed': [],
            'skipped': []
        }
        
        # Process each file
        for fid in file_ids:
            # Check if file exists and current user is the owner
            file = File.find_by_id(fid)
            if not file or file['owner_id'] != g.current_user['id']:
                results['failed'].append({
                    'file_id': fid,
                    'error': 'File not found or you are not the owner'
                })
                continue
            
            # Process each username
            for username in usernames:
                username = username.strip()
                
                # Find grantee user by username
                grantee_user = User.find_by_username(username)
                if not grantee_user:
                    results['failed'].append({
                        'file_id': fid,
                        'username': username,
                        'error': 'User not found'
                    })
                    continue
                
                # Prevent sharing with self
                if grantee_user['id'] == g.current_user['id']:
                    results['skipped'].append({
                        'file_id': fid,
                        'username': username,
                        'reason': 'Cannot share with yourself'
                    })
                    continue
                
                # Check if file is already shared with this user
                existing_share = Share.find_by_file_and_grantee(fid, grantee_user['id'])
                if existing_share:
                    # Update handled by ON CONFLICT in Share.create
                    share = Share.create(fid, grantee_user['id'], permission)
                    if share:
                        results['updated'].append({
                            'file_id': fid,
                            'filename': file['original_filename'],
                            'username': username,
                            'grantee_user_id': grantee_user['id'],
                            'permission': permission
                        })
                    else:
                        results['failed'].append({
                            'file_id': fid,
                            'username': username,
                            'error': 'Failed to update share'
                        })
                else:
                    # Create new share
                    share = Share.create(fid, grantee_user['id'], permission)
                    if share:
                        results['created'].append({
                            'file_id': fid,
                            'filename': file['original_filename'],
                            'username': username,
                            'grantee_user_id': grantee_user['id'],
                            'permission': permission
                        })
                    else:
                        results['failed'].append({
                            'file_id': fid,
                            'username': username,
                            'error': 'Failed to create share'
                        })
        
        # Emit sync events for file sharing
        if len(results['created']) > 0 or len(results['updated']) > 0:
            try:
                from utils.sync_events import emit_sync_event
                # Get all unique grantee user IDs
                grantee_user_ids = list(set(
                    [item['grantee_user_id'] for item in results['created']] +
                    [item['grantee_user_id'] for item in results['updated']]
                ))
                
                # Emit event to owner
                emit_sync_event(
                    user_id=g.current_user['id'],
                    event_type='file_shared',
                    payload={
                        'file_ids': file_ids,
                        'shared_with_user_ids': grantee_user_ids,
                        'permission': permission
                    }
                )
            except Exception as e:
                logger.warning(f"Failed to emit file_shared event: {e}")
        
        # Build response message
        total_success = len(results['created']) + len(results['updated'])
        total_failed = len(results['failed'])
        total_skipped = len(results['skipped'])
        
        message = f'Sharing complete: {total_success} successful'
        if total_failed > 0:
            message += f', {total_failed} failed'
        if total_skipped > 0:
            message += f', {total_skipped} skipped'
        
        status_code = 201 if total_success > 0 else 400
        
        return jsonify({
            'message': message,
            'results': results,
            'summary': {
                'created': len(results['created']),
                'updated': len(results['updated']),
                'failed': len(results['failed']),
                'skipped': len(results['skipped'])
            }
        }), status_code
        
    except Exception as e:
        logger.error(f"Share file error: {e}")
        return jsonify({'error': 'File sharing failed', 'details': str(e)}), 500


@shares_bp.route('/api/files/<file_id>/share/<int:grantee_user_id>', methods=['DELETE'])
@auth_required
def revoke_file_share(file_id, grantee_user_id):
    """Revoke file share from a user"""
    try:
        # Check if file exists and current user is the owner
        file = File.find_by_id(file_id)
        if not file or file['owner_id'] != g.current_user['id']:
            return jsonify({'error': 'File not found or you are not the owner'}), 404
        
        # Find the share
        share = Share.find_by_file_and_grantee(file_id, grantee_user_id)
        if not share:
            return jsonify({'error': 'Share not found'}), 404
        
        # Get grantee info for response
        grantee = User.find_by_id(grantee_user_id)
        grantee_username = grantee['username'] if grantee else 'Unknown'
        
        # Delete the share
        deleted = Share.delete_share(file_id, grantee_user_id)
        if not deleted:
            return jsonify({'error': 'Failed to revoke share'}), 500
        
        # Emit sync event for file unsharing
        try:
            from utils.sync_events import emit_sync_event
            # Emit to owner
            emit_sync_event(
                user_id=g.current_user['id'],
                event_type='file_unshared',
                payload={
                    'file_id': file_id,
                    'filename': file['original_filename'],
                    'grantee_user_id': grantee_user_id,
                    'grantee_username': grantee_username
                }
            )
            # Emit to recipient
            emit_sync_event(
                user_id=grantee_user_id,
                event_type='file_unshared',
                payload={
                    'file_id': file_id,
                    'filename': file['original_filename'],
                    'owner_id': g.current_user['id']
                }
            )
        except Exception as e:
            logger.warning(f"Failed to emit file_unshared event: {e}")
        
        return jsonify({
            'message': 'File share revoked successfully',
            'file_id': file_id,
            'grantee_user_id': grantee_user_id,
            'grantee_username': grantee_username
        }), 200
        
    except Exception as e:
        logger.error(f"Revoke share error: {e}")
        return jsonify({'error': 'Share revocation failed', 'details': str(e)}), 500


@shares_bp.route('/api/shared', methods=['GET'])
@auth_required
def list_shared_files():
    """
    List files shared with or by the current user
    Query params:
    - view: 'received' (default) or 'sent'
    - page: page number (default: 1)
    - per_page: items per page (default: 20, max: 100)
    """
    try:
        # Get optional query parameters
        view = request.args.get('view', 'received').lower()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        if view == 'sent':
            # Files shared BY current user (as owner)
            all_shares = Share.find_by_owner(g.current_user['id'])
        else:
            # Files shared WITH current user (as grantee) - default  
            all_shares = Share.find_shared_with_user(g.current_user['id'])
        
        # Manual pagination
        total = len(all_shares)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        shares_page = all_shares[start_idx:end_idx]
        
        # Build response with file and user details
        shares_list = []
        for share in shares_page:
            share_info = {
                'share_id': share['share_id'],
                'file_id': share['file_id'],
                'filename': share['original_filename'],
                'size_bytes': share['size_bytes'],
                'content_type': share['content_type'],
                'permission': share['permission'],
                'shared_at': format_timestamp(share['shared_at']),
                'file_created_at': format_timestamp(share['file_created_at'])
            }
            
            if view == 'sent':
                # For sent view, show who we shared with
                share_info['shared_with'] = {
                    'user_id': share['grantee_user_id'],
                    'username': share['grantee_username'],
                    'name': share['grantee_name']
                }
            else:
                # For received view, show who shared with us
                share_info['shared_by'] = {
                    'user_id': share['owner_id'],
                    'username': share['owner_username'],
                    'name': share['owner_name']
                }
            
            shares_list.append(share_info)
        
        # Calculate pagination info
        total_pages = (total + per_page - 1) // per_page
        has_next = page < total_pages
        has_prev = page > 1
        
        return jsonify({
            'view': view,
            'shared_files': shares_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': total_pages,
                'has_next': has_next,
                'has_prev': has_prev
            }
        }), 200
        
    except Exception as e:
        logger.error(f"List shared files error: {e}")
        return jsonify({'error': 'Failed to list shared files', 'details': str(e)}), 500


@shares_bp.route('/api/files/<file_id>/shares', methods=['GET'])
@auth_required
def list_file_shares(file_id):
    """List all users who have access to a specific file (owner only)"""
    try:
        # Check if file exists and current user is the owner
        file = File.find_by_id(file_id)
        if not file or file['owner_id'] != g.current_user['id']:
            return jsonify({'error': 'File not found or you are not the owner'}), 404
        
        # Get all shares for this file with grantee details
        shares = Share.find_by_file(file_id)
        
        shares_list = []
        for share in shares:
            shares_list.append({
                'share_id': share['share_id'],
                'user_id': share['grantee_user_id'],
                'username': share['grantee_username'],
                'name': share['grantee_name'],
                'email': share['grantee_email'],
                'permission': share['permission'],
                'shared_at': format_timestamp(share['shared_at'])
            })
        
        return jsonify({
            'file_id': file_id,
            'filename': file['original_filename'],
            'shares': shares_list,
            'total_shares': len(shares_list)
        }), 200
        
    except Exception as e:
        logger.error(f"List file shares error: {e}")
        return jsonify({'error': 'Failed to list file shares', 'details': str(e)}), 500


@shares_bp.route('/api/shares/stats', methods=['GET'])
@auth_required
def get_sharing_stats():
    """Get sharing statistics for the current user"""
    try:
        # Files shared by current user (as owner)
        files_shared_by_user = len(Share.find_by_owner(g.current_user['id']))
        
        # Files shared with current user (as grantee)
        files_shared_with_user = len(Share.find_shared_with_user(g.current_user['id']))
        
        # Count unique users - sent
        shares_sent = Share.find_by_owner(g.current_user['id'])
        unique_grantees = len(set(share['grantee_user_id'] for share in shares_sent))
        
        # Count unique users - received
        shares_received = Share.find_shared_with_user(g.current_user['id'])
        unique_sharers = len(set(share['owner_id'] for share in shares_received))
        
        return jsonify({
            'stats': {
                'files_you_shared': files_shared_by_user,
                'files_shared_with_you': files_shared_with_user,
                'users_who_shared_with_you': unique_sharers,
                'users_you_shared_with': unique_grantees
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get sharing stats error: {e}")
        return jsonify({'error': 'Failed to get sharing stats', 'details': str(e)}), 500


@shares_bp.route('/api/users/search', methods=['GET'])
@auth_required
def search_users():
    """
    Search for registered users by username
    Query params:
    - q: search query (username)
    - limit: max results (default: 10, max: 50)
    """
    try:
        query = request.args.get('q', '').strip()
        limit = min(request.args.get('limit', 10, type=int), 50)
        
        if not query or len(query) < 2:
            return jsonify({'error': 'Search query must be at least 2 characters'}), 400
        
        # Search for users by username (case-insensitive)
        # Exclude current user from results
        users = User.search_by_username(query, exclude_user_id=g.current_user['id'], limit=limit)
        
        users_list = [{
            'id': user['id'],
            'username': user['username'],
            'name': user['name'],
            'email': user['email']  # Include email for verification purposes
        } for user in users]
        
        return jsonify({
            'query': query,
            'users': users_list,
            'count': len(users_list)
        }), 200
        
    except Exception as e:
        logger.error(f"User search error: {e}")
        return jsonify({'error': 'User search failed', 'details': str(e)}), 500

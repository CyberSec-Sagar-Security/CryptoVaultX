"""
Access Control Middleware
Enforces file access permissions for CryptoVaultX
Uses direct PostgreSQL via database.py (no SQLAlchemy)
"""

from functools import wraps
from flask import jsonify, g
from database import File, Share, check_access

def check_file_access(file_id, user_id):
    """
    Check if user has access to a file
    Returns: (has_access: bool, file: dict|None, access_type: str)
    access_type: 'owner', 'shared', or 'denied'
    """
    # Check if user owns the file
    file = File.find_by_id(file_id)
    if not file:
        return False, None, 'denied'
    
    if file['owner_id'] == user_id:
        return True, file, 'owner'
    
    # Check if file is shared with the user
    share = Share.find_by_file_and_grantee(file_id, user_id)
    if share:
        return True, file, 'shared'
    
    return False, file, 'denied'

def require_file_access(f):
    """
    Decorator to ensure user has access to file (either as owner or grantee)
    Expects file_id parameter in the route
    Sets g.file and g.access_type for use in route handlers
    """
    @wraps(f)
    def decorated_function(file_id, *args, **kwargs):
        if not hasattr(g, 'current_user') or not g.current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        has_access, file, access_type = check_file_access(file_id, g.current_user['id'])
        
        if not has_access:
            return jsonify({
                'error': 'Access denied',
                'message': 'You do not have permission to access this file'
            }), 403
        
        # Set file and access_type in g for route handler
        g.file = file
        g.access_type = access_type
        
        return f(file_id, *args, **kwargs)
    
    return decorated_function

def require_file_ownership(f):
    """
    Decorator to ensure user is the file owner (stricter than require_file_access)
    Used for operations like sharing, deleting, etc.
    """
    @wraps(f)
    def decorated_function(file_id, *args, **kwargs):
        if not hasattr(g, 'current_user') or not g.current_user:
            return jsonify({'error': 'Authentication required'}), 401
        
        file = File.find_by_id(file_id)
        
        if not file or file['owner_id'] != g.current_user['id']:
            return jsonify({
                'error': 'Access denied',
                'message': 'File not found or you are not the owner'
            }), 404
        
        # Set file in g for route handler
        g.file = file
        g.access_type = 'owner'
        
        return f(file_id, *args, **kwargs)
    
    return decorated_function

def get_accessible_files(user_id):
    """
    Get all files accessible to a user (owned + shared)
    Returns: list of (file_dict, access_type) tuples
    """
    accessible_files = []
    
    # Get owned files
    owned_files = File.find_by_owner(user_id)
    for file in owned_files:
        accessible_files.append((file, 'owner'))
    
    # Get shared files
    shared_files = Share.find_shared_with_user(user_id)
    for shared_file in shared_files:
        # shared_file already contains file info from the join query
        accessible_files.append((shared_file, 'shared'))
    
    return accessible_files

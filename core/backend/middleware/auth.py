from functools import wraps
from flask import jsonify, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from models import User

def auth_required(f):
    """
    Decorator to require valid JWT authentication
    Adds current_user to the g object for use in routes
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Verify JWT token is present and valid
            print("[AUTH] Starting authentication check")
            verify_jwt_in_request()
            print("[AUTH] JWT verified successfully")
            
            # Get user ID from JWT
            current_user_identity = get_jwt_identity()
            print(f"[AUTH] Got JWT identity: {current_user_identity} (type: {type(current_user_identity)})")
            
            try:
                current_user_id = int(current_user_identity)
                print(f"[AUTH] Converted to user_id: {current_user_id}")
            except (TypeError, ValueError) as e:
                print(f"[AUTH] ERROR: Failed to convert identity to int: {e}")
                return jsonify({
                    'error': 'Invalid token',
                    'message': 'Malformed user identity'
                }), 401

            # Find user in database
            print(f"[AUTH] Querying database for user_id: {current_user_id}")
            current_user = User.find_by_id(current_user_id)
            print(f"[AUTH] Database query result: {current_user}")
            
            if not current_user:
                print(f"[AUTH] ERROR: User not found for user_id: {current_user_id}")
                return jsonify({
                    'error': 'User not found',
                    'message': 'The user associated with this token no longer exists'
                }), 401
            
            # Convert dictionary to object that supports BOTH dot notation AND dictionary access
            # Some routes use g.current_user.id, others use g.current_user['id']
            class UserObject:
                def __init__(self, user_dict):
                    self._data = user_dict
                    for key, value in user_dict.items():
                        setattr(self, key, value)
                
                def __getitem__(self, key):
                    """Support dictionary-style access: g.current_user['id']"""
                    return self._data[key]
                
                def __contains__(self, key):
                    """Support 'key in g.current_user' checks"""
                    return key in self._data
                
                def get(self, key, default=None):
                    """Support dict.get() method"""
                    return self._data.get(key, default)
            
            # Add user to Flask's g object for access in route functions
            g.current_user = UserObject(current_user)
            print(f"[AUTH] Successfully authenticated user: {current_user.get('username', 'unknown')}")
            print(f"[AUTH] g.current_user has attributes: id={g.current_user.id}, username={g.current_user.username}")
            
            return f(*args, **kwargs)
            
        except Exception as e:
            print(f"[AUTH] EXCEPTION CAUGHT: {type(e).__name__}: {str(e)}")
            import traceback
            print(f"[AUTH] Full traceback:\n{traceback.format_exc()}")
            return jsonify({
                'error': 'Authentication failed',
                'message': 'Invalid or expired token'
            }), 401
    
    return decorated_function

def admin_required(f):
    """
    Decorator to require admin access (future implementation)
    For now, just ensures user is authenticated
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # First ensure user is authenticated
        auth_result = auth_required(lambda: None)()
        if auth_result:  # If auth_required returned an error response
            return auth_result
        
        # In future, check if user has admin role
        # For now, all authenticated users have access
        
        return f(*args, **kwargs)
    
    return decorated_function

def optional_auth(f):
    """
    Decorator that optionally authenticates a user
    If token is present and valid, adds current_user to g
    If no token or invalid token, continues without authentication
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Try to verify JWT token
            verify_jwt_in_request(optional=True)
            
            # Get user ID from JWT (may be None if no token)
            current_user_identity = get_jwt_identity()
            
            if current_user_identity:
                # Find user in database
                try:
                    current_user_id = int(current_user_identity)
                    current_user = User.find_by_id(current_user_id)
                except (TypeError, ValueError):
                    current_user = None
                if current_user:
                    g.current_user = current_user
                else:
                    g.current_user = None
            else:
                g.current_user = None
                
        except Exception:
            # If any error occurs, just set current_user to None
            g.current_user = None
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user():
    """
    Helper function to get the current authenticated user
    Returns None if no user is authenticated
    """
    return getattr(g, 'current_user', None)

def is_authenticated():
    """
    Helper function to check if a user is currently authenticated
    """
    return get_current_user() is not None

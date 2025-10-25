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
            verify_jwt_in_request()
            
            # Get user ID from JWT
            current_user_identity = get_jwt_identity()
            try:
                current_user_id = int(current_user_identity)
            except (TypeError, ValueError):
                return jsonify({
                    'error': 'Invalid token',
                    'message': 'Malformed user identity'
                }), 401

            # Find user in database
            current_user = User.find_by_id(current_user_id)
            
            if not current_user:
                return jsonify({
                    'error': 'User not found',
                    'message': 'The user associated with this token no longer exists'
                }), 401
            
            # Add user to Flask's g object for access in route functions
            g.current_user = current_user
            
            return f(*args, **kwargs)
            
        except Exception as e:
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

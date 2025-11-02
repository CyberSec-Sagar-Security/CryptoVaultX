from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
import re
import logging
from models import User, db  # Use SQLAlchemy models instead of old database
from storage_manager import storage_manager

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

# Handle OPTIONS requests explicitly for CORS preflight
@auth_bp.route('/<path:path>', methods=['OPTIONS'])
@auth_bp.route('/', methods=['OPTIONS'])
def handle_options_requests(path=None):
    """Handle preflight OPTIONS requests for CORS"""
    return '', 204

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength according to requirements"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    if not re.search(r'[!@#$%^&*]', password):
        return False, "Password must contain at least one special character (!@#$%^&*)"
    
    return True, "Password is valid"

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    """Register a new user"""
    # Log the request details
    logger.info(f"Register endpoint called with method {request.method}")
    logger.info(f"Headers: {request.headers}")
    
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        logger.info("Handling OPTIONS preflight request")
        return '', 204
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        logger.info(f"🔵 REGISTRATION ATTEMPT - Username: {username}, Email: {email}")
        
        if not username:
            return jsonify({'message': 'Username is required'}), 400
        
        if not email:
            return jsonify({'message': 'Email is required'}), 400
        
        if not password:
            return jsonify({'message': 'Password is required'}), 400
        
        if len(username) < 2 or len(username) > 100:
            return jsonify({'message': 'Username must be between 2 and 100 characters'}), 400
        
        if not validate_email(email):
            return jsonify({'message': 'Invalid email format'}), 400
        
        is_valid, password_message = validate_password(password)
        if not is_valid:
            return jsonify({'message': password_message}), 400
        
        # Check if user already exists
        existing_user = User.find_by_email(email)
        if existing_user:
            return jsonify({'message': 'Email already registered'}), 409
            
        # Check if username exists
        existing_user = User.find_by_username(username)
        if existing_user:
            return jsonify({'message': 'Username already taken'}), 409
        
        # Create new user using database.py
        new_user = User.create(
            username=username,
            email=email.lower(),
            password=password,
            name=username  # Use username as display name for now
        )
        
        if not new_user:
            return jsonify({'message': 'Failed to create user'}), 500
        
        # Create storage folders for the new user using username
        try:
            storage_manager.create_user_folders(new_user['username'], new_user['id'])
            logger.info(f"✅ Storage folders created for user {new_user['username']} (ID: {new_user['id']})")
        except Exception as e:
            logger.error(f"❌ Failed to create storage folders for user {new_user['username']}: {e}")
            # Don't fail registration if folder creation fails
        
        logger.info(f"✅ REGISTRATION SUCCESS - User ID: {new_user['id']}, Email: {new_user['email']}, Username: {new_user['username']}")
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'id': new_user['id'],
                'username': new_user['username'],
                'email': new_user['email'],
                'name': new_user['name'],
                'created_at': new_user['created_at'].isoformat() if hasattr(new_user['created_at'], 'isoformat') else str(new_user['created_at'])
            }
        }), 201
        
    except Exception as e:
        logger.error(f"❌ REGISTRATION FAILED - Error: {str(e)}")
        if "unique constraint" in str(e).lower() or "already exists" in str(e).lower():
            return jsonify({'message': 'Email or username already registered'}), 409
        return jsonify({'message': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    """Authenticate user and return JWT tokens"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        logger.info(f"🔵 LOGIN ATTEMPT - Email: {email}")
        
        if not email:
            return jsonify({'message': 'Email is required'}), 400
        
        if not password:
            return jsonify({'message': 'Password is required'}), 400
        
        # Use database.py for authentication
        user = User.find_by_email(email)
        if not user:
            logger.error(f"❌ LOGIN FAILED - User not found for email: {email}")
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Verify password using database.py
        if not User.verify_password(email, password):
            logger.error(f"❌ LOGIN FAILED - Invalid password for email: {email}")
            return jsonify({'message': 'Invalid credentials'}), 401

        logger.info(f"✅ LOGIN SUCCESS - User ID: {user['id']}, Email: {user['email']}")
        
        # Cast identity to string for JWT 'sub' claim compliance
        access_token = create_access_token(identity=str(user['id']))

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': access_token,  # Changed from access_token to token for frontend compatibility
            'access_token': access_token,  # Keep both for backward compatibility
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'name': user['name'],
                'is_active': user['is_active']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Login failed', 'details': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        current_user_identity = get_jwt_identity()
        # Identity stored as string; cast to int for DB lookup
        try:
            current_user_id = int(current_user_identity)
        except (TypeError, ValueError):
            return jsonify({'message': 'Invalid user identity in token'}), 400
        
        user = User.find_by_id(current_user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get user info', 'details': str(e)}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Handle forgot password request"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({'message': 'Email is required'}), 400
        
        user = User.find_by_email(email)
        if not user:
            return jsonify({
                'success': True,
                'message': 'If your email is registered, you will receive a password reset link'
            }), 200
        
        return jsonify({
            'success': True,
            'message': 'Password reset link sent to your email!'
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to process request', 'details': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST', 'OPTIONS'])
@jwt_required()
def change_password():
    """Change user password"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        user_id = get_jwt_identity()
        # Convert to int if it's a string (JWT stores as string)
        if isinstance(user_id, str):
            user_id = int(user_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        current_password = data.get('currentPassword', '')
        new_password = data.get('newPassword', '')
        
        logger.info(f"🔵 PASSWORD CHANGE ATTEMPT - User ID: {user_id}")
        
        if not current_password:
            return jsonify({'message': 'Current password is required'}), 400
        
        if not new_password:
            return jsonify({'message': 'New password is required'}), 400
        
        # Validate new password strength
        is_valid, password_message = validate_password(new_password)
        if not is_valid:
            return jsonify({'message': password_message}), 400
        
        # Get user
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Verify current password
        if not User.verify_password(user['email'], current_password):
            logger.error(f"❌ PASSWORD CHANGE FAILED - Invalid current password for user {user_id}")
            return jsonify({'message': 'Current password is incorrect'}), 401
        
        # Check if new password is same as current
        if current_password == new_password:
            return jsonify({'message': 'New password must be different from current password'}), 400
        
        # Update password
        import bcrypt
        from datetime import datetime, timezone
        from database import db_manager
        
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        query = """
        UPDATE users 
        SET password_hash = %s, updated_at = %s
        WHERE id = %s
        """
        
        db_manager.execute_query(query, (password_hash, datetime.now(timezone.utc), user_id))
        
        logger.info(f"✅ PASSWORD CHANGED SUCCESSFULLY - User ID: {user_id}")
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"❌ PASSWORD CHANGE FAILED - Error: {str(e)}")
        return jsonify({'message': 'Failed to change password', 'details': str(e)}), 500

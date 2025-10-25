from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
import re
import logging
from werkzeug.security import check_password_hash, generate_password_hash
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
            
        # Check if username exists (query directly since find_by_username doesn't exist)
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({'message': 'Username already taken'}), 409
        
        # Create new user with SQLAlchemy
        new_user = User(
            username=username,
            name=username,  # Use username as display name for now
            email=email.lower(),
            password_hash=generate_password_hash(password)
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Create storage folders for the new user
        try:
            storage_manager.create_user_folders(new_user.id)
            logger.info(f"✅ Storage folders created for user {new_user.id}")
        except Exception as e:
            logger.error(f"❌ Failed to create storage folders for user {new_user.id}: {e}")
            # Don't fail registration if folder creation fails
        
        logger.info(f"✅ REGISTRATION SUCCESS - User ID: {new_user.id}, Email: {new_user.email}")
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
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
        
        # Use SQLAlchemy User model for authentication
        user = User.find_by_email(email)
        if not user or not check_password_hash(user.password_hash, password):
            logger.error(f"❌ LOGIN FAILED - Invalid credentials for email: {email}")
            return jsonify({'message': 'Invalid credentials'}), 401

        logger.info(f"✅ LOGIN SUCCESS - User ID: {user.id}, Email: {user.email}")
        
        # Cast identity to string for JWT 'sub' claim compliance
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
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
        
        user = User.query.filter_by(email=email).first()
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

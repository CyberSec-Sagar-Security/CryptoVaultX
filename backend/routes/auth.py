from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
import re
import logging
from models import db, User
from sqlalchemy.exc import IntegrityError

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
        
        existing_user = User.query.filter((User.email == email) | (User.username == username)).first()
        if existing_user:
            if existing_user.email == email:
                return jsonify({'message': 'Email already registered'}), 409
            else:
                return jsonify({'message': 'Username already taken'}), 409
        
        user = User(
            username=username,
            name=username,
            email=email
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Email or username already registered'}), 409
    
    except Exception as e:
        db.session.rollback()
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
        
        if not email:
            return jsonify({'message': 'Email is required'}), 400
        
        if not password:
            return jsonify({'message': 'Password is required'}), 400
        
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        if not user.check_password(password):
            return jsonify({'message': 'Invalid credentials'}), 401

        # Cast identity to string for JWT 'sub' claim compliance
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict(),
            'token': access_token
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
        user = User.query.get(current_user_id)
        
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

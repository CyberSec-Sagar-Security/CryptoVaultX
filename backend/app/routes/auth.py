"""
Authentication Routes - CryptoVaultX Phase 4

Professional authentication endpoints with secure password hashing,
JWT token management, and comprehensive validation.

@author: CryptoVaultX Development Team
@version: 1.0.0
@since: Phase 4
"""

import os
import re
import hashlib
import secrets
import jwt
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from typing import Dict, Optional, Tuple

# Create authentication blueprint
auth_bp = Blueprint('auth', __name__)

# JWT Configuration
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Password requirements
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128

# In-memory user storage (replace with database in production)
_users_storage = {}
_user_sessions = {}

def hash_password(password: str, salt: bytes = None) -> Tuple[str, str]:
    """
    Hash password with salt using PBKDF2
    
    Args:
        password: Plain text password
        salt: Optional salt bytes
        
    Returns:
        Tuple of (hashed_password, salt_hex)
    """
    
    if salt is None:
        salt = secrets.token_bytes(32)
    
    # Use PBKDF2 with SHA-256
    password_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000  # 100,000 iterations
    )
    
    return password_hash.hex(), salt.hex()

def verify_password(password: str, hashed_password: str, salt_hex: str) -> bool:
    """
    Verify password against hash
    
    Args:
        password: Plain text password
        hashed_password: Stored password hash
        salt_hex: Stored salt as hex string
        
    Returns:
        True if password matches
    """
    
    try:
        salt = bytes.fromhex(salt_hex)
        computed_hash, _ = hash_password(password, salt)
        return computed_hash == hashed_password
    except Exception:
        return False

def validate_password_strength(password: str) -> Dict:
    """
    Validate password strength
    
    Args:
        password: Password to validate
        
    Returns:
        Validation result dictionary
    """
    
    checks = {
        'min_length': len(password) >= PASSWORD_MIN_LENGTH,
        'max_length': len(password) <= PASSWORD_MAX_LENGTH,
        'has_uppercase': bool(re.search(r'[A-Z]', password)),
        'has_lowercase': bool(re.search(r'[a-z]', password)),
        'has_numbers': bool(re.search(r'\d', password)),
        'has_special_chars': bool(re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\?]', password))
    }
    
    score = sum(checks.values())
    is_valid = all(checks.values())
    
    if score >= 6:
        strength = 'strong'
    elif score >= 4:
        strength = 'medium'
    else:
        strength = 'weak'
    
    return {
        'checks': checks,
        'score': score,
        'strength': strength,
        'is_valid': is_valid
    }

def validate_email(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email to validate
        
    Returns:
        True if email is valid
    """
    
    email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return bool(re.match(email_pattern, email))

def generate_jwt_token(user_data: Dict) -> str:
    """
    Generate JWT token for user
    
    Args:
        user_data: User data to encode in token
        
    Returns:
        JWT token string
    """
    
    payload = {
        'user_id': user_data['user_id'],
        'email': user_data['email'],
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> Optional[Dict]:
    """
    Verify JWT token and extract user data
    
    Args:
        token: JWT token string
        
    Returns:
        User data if token is valid, None otherwise
    """
    
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register new user
    
    Returns:
        JSON response with success/error status
    """
    
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Extract and validate fields
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        first_name = data.get('firstName', '').strip()
        last_name = data.get('lastName', '').strip()
        
        # Validation
        if not all([email, password, first_name, last_name]):
            return jsonify({
                'success': False,
                'error': 'All fields are required'
            }), 400
        
        if not validate_email(email):
            return jsonify({
                'success': False,
                'error': 'Invalid email address'
            }), 400
        
        # Check if user already exists
        if email in _users_storage:
            return jsonify({
                'success': False,
                'error': 'User already exists with this email'
            }), 409
        
        # Validate password strength
        password_validation = validate_password_strength(password)
        if not password_validation['is_valid']:
            return jsonify({
                'success': False,
                'error': 'Password does not meet security requirements',
                'password_validation': password_validation
            }), 400
        
        # Hash password
        password_hash, salt_hex = hash_password(password)
        
        # Generate user ID
        user_id = secrets.token_hex(16)
        
        # Create user record
        user_data = {
            'user_id': user_id,
            'email': email,
            'firstName': first_name,
            'lastName': last_name,
            'password_hash': password_hash,
            'salt': salt_hex,
            'created_at': datetime.utcnow().isoformat(),
            'last_login': None,
            'is_active': True
        }
        
        # Store user
        _users_storage[email] = user_data
        
        # Generate JWT token
        token = generate_jwt_token(user_data)
        
        # Store session
        _user_sessions[user_id] = {
            'token': token,
            'created_at': datetime.utcnow().isoformat(),
            'last_activity': datetime.utcnow().isoformat()
        }
        
        print(f"✅ User registered: {email}")
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'token': token,
            'user': {
                'user_id': user_id,
                'email': email,
                'firstName': first_name,
                'lastName': last_name,
                'created_at': user_data['created_at']
            }
        }), 201
        
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return jsonify({
            'success': False,
            'error': 'Registration failed'
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user
    
    Returns:
        JSON response with success/error status
    """
    
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Extract fields
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validation
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Email and password are required'
            }), 400
        
        if not validate_email(email):
            return jsonify({
                'success': False,
                'error': 'Invalid email address'
            }), 400
        
        # Check if user exists
        if email not in _users_storage:
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        user_data = _users_storage[email]
        
        # Check if account is active
        if not user_data.get('is_active', False):
            return jsonify({
                'success': False,
                'error': 'Account is disabled'
            }), 401
        
        # Verify password
        if not verify_password(password, user_data['password_hash'], user_data['salt']):
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        # Update last login
        user_data['last_login'] = datetime.utcnow().isoformat()
        
        # Generate JWT token
        token = generate_jwt_token(user_data)
        
        # Store session
        _user_sessions[user_data['user_id']] = {
            'token': token,
            'created_at': datetime.utcnow().isoformat(),
            'last_activity': datetime.utcnow().isoformat()
        }
        
        print(f"✅ User logged in: {email}")
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'user': {
                'user_id': user_data['user_id'],
                'email': user_data['email'],
                'firstName': user_data['firstName'],
                'lastName': user_data['lastName'],
                'last_login': user_data['last_login']
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({
            'success': False,
            'error': 'Login failed'
        }), 500

@auth_bp.route('/verify', methods=['GET'])
def verify_token():
    """
    Verify JWT token
    
    Returns:
        JSON response with user data if token is valid
    """
    
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'No valid token provided'
            }), 401
        
        token = auth_header.split(' ')[1]
        
        # Verify token
        payload = verify_jwt_token(token)
        
        if not payload:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired token'
            }), 401
        
        # Get user data
        email = payload['email']
        
        if email not in _users_storage:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user_data = _users_storage[email]
        
        # Update last activity
        if user_data['user_id'] in _user_sessions:
            _user_sessions[user_data['user_id']]['last_activity'] = datetime.utcnow().isoformat()
        
        return jsonify({
            'success': True,
            'user': {
                'user_id': user_data['user_id'],
                'email': user_data['email'],
                'firstName': user_data['firstName'],
                'lastName': user_data['lastName'],
                'last_login': user_data.get('last_login')
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Token verification error: {e}")
        return jsonify({
            'success': False,
            'error': 'Token verification failed'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Logout user and invalidate token
    
    Returns:
        JSON response with success status
    """
    
    try:
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            payload = verify_jwt_token(token)
            
            if payload and 'user_id' in payload:
                # Remove session
                if payload['user_id'] in _user_sessions:
                    del _user_sessions[payload['user_id']]
                
                print(f"✅ User logged out: {payload['email']}")
        
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        }), 200
        
    except Exception as e:
        print(f"❌ Logout error: {e}")
        return jsonify({
            'success': False,
            'error': 'Logout failed'
        }), 500

@auth_bp.route('/users', methods=['GET'])
def list_users():
    """
    List registered users (for development only)
    
    Returns:
        JSON response with user list
    """
    
    try:
        users = []
        for email, user_data in _users_storage.items():
            users.append({
                'user_id': user_data['user_id'],
                'email': user_data['email'],
                'firstName': user_data['firstName'],
                'lastName': user_data['lastName'],
                'created_at': user_data['created_at'],
                'last_login': user_data.get('last_login'),
                'is_active': user_data.get('is_active', True)
            })
        
        return jsonify({
            'success': True,
            'users': users,
            'total': len(users)
        }), 200
        
    except Exception as e:
        print(f"❌ List users error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to list users'
        }), 500

# Export user storage for access from other modules
def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user by ID"""
    for user_data in _users_storage.values():
        if user_data['user_id'] == user_id:
            return user_data
    return None

def get_user_by_email(email: str) -> Optional[Dict]:
    """Get user by email"""
    return _users_storage.get(email.lower())

__all__ = ['auth_bp', 'get_user_by_id', 'get_user_by_email', 'verify_jwt_token']

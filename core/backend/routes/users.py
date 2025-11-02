"""
User Profile Management Routes
Handles user profile updates, photo uploads, and account deletion
"""
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import logging
from werkzeug.utils import secure_filename
from PIL import Image
import io
from database import db_manager, User

logger = logging.getLogger(__name__)

users_bp = Blueprint('users', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
PROFILE_PHOTO_DIR = 'profile_photos'

# Ensure profile photos directory exists at module load
def ensure_profile_photos_dir():
    """Create profile_photos directory if it doesn't exist"""
    profile_dir = os.path.join(os.path.dirname(__file__), '..', PROFILE_PHOTO_DIR)
    os.makedirs(profile_dir, exist_ok=True)
    logger.info(f"Profile photos directory ensured at: {profile_dir}")
    return profile_dir

# Create directory on module load
ensure_profile_photos_dir()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def optimize_image(image_data, max_size=(400, 400)):
    """Optimize and resize profile photo"""
    try:
        image = Image.open(io.BytesIO(image_data))
        
        # Convert RGBA to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        # Resize maintaining aspect ratio
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save to bytes
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=85, optimize=True)
        output.seek(0)
        return output.read()
    except Exception as e:
        logger.error(f"Error optimizing image: {e}")
        raise

@users_bp.route('/api/users/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user's profile"""
    try:
        user_id = get_jwt_identity()
        # Convert to int if it's a string (JWT stores as string)
        if isinstance(user_id, str):
            user_id = int(user_id)
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'name': user.get('name', user['username']),
                'phone': user.get('phone'),
                'profile_photo': user.get('profile_photo'),
                'created_at': user['created_at'].isoformat() if hasattr(user['created_at'], 'isoformat') else str(user['created_at']),
                'preferences': user.get('preferences', {})
            }
        }), 200
    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        return jsonify({'message': 'Failed to fetch profile', 'error': str(e)}), 500

@users_bp.route('/api/users/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile information"""
    try:
        user_id = get_jwt_identity()
        # Convert to int if it's a string (JWT stores as string)
        if isinstance(user_id, str):
            user_id = int(user_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Validate and prepare update fields
        update_fields = []
        update_values = []
        
        if 'username' in data and data['username'].strip():
            username = data['username'].strip()
            if len(username) < 2 or len(username) > 100:
                return jsonify({'message': 'Username must be between 2 and 100 characters'}), 400
            
            # Check if username is already taken
            existing_user = User.find_by_username(username)
            if existing_user and existing_user['id'] != user_id:
                return jsonify({'message': 'Username already taken'}), 409
            
            update_fields.append('username = %s')
            update_values.append(username)
        
        if 'email' in data and data['email'].strip():
            email = data['email'].strip().lower()
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, email):
                return jsonify({'message': 'Invalid email format'}), 400
            
            # Check if email is already taken
            existing_user = User.find_by_email(email)
            if existing_user and existing_user['id'] != user_id:
                return jsonify({'message': 'Email already registered'}), 409
            
            update_fields.append('email = %s')
            update_values.append(email)
        
        if 'phone' in data:
            phone = data['phone'].strip() if data['phone'] else None
            update_fields.append('phone = %s')
            update_values.append(phone)
        
        if 'name' in data and data['name'].strip():
            update_fields.append('name = %s')
            update_values.append(data['name'].strip())
        
        if not update_fields:
            return jsonify({'message': 'No valid fields to update'}), 400
        
        # Add updated_at timestamp
        from datetime import datetime, timezone
        update_fields.append('updated_at = %s')
        update_values.append(datetime.now(timezone.utc))
        
        # Add user_id for WHERE clause
        update_values.append(user_id)
        
        # Execute update
        query = f"""
        UPDATE users 
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, username, email, name, phone, profile_photo, created_at
        """
        
        result = db_manager.execute_one(query, tuple(update_values))
        
        if not result:
            return jsonify({'message': 'Failed to update profile'}), 500
        
        logger.info(f"Profile updated for user {user_id}")
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'user': {
                'id': result['id'],
                'username': result['username'],
                'email': result['email'],
                'name': result.get('name', result['username']),
                'phone': result.get('phone'),
                'profile_photo': result.get('profile_photo'),
                'created_at': result['created_at'].isoformat() if hasattr(result['created_at'], 'isoformat') else str(result['created_at'])
            }
        }), 200
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        return jsonify({'message': 'Failed to update profile', 'error': str(e)}), 500

@users_bp.route('/api/users/profile/photo', methods=['POST'])
@jwt_required()
def upload_profile_photo():
    """Upload and update user profile photo"""
    try:
        user_id = get_jwt_identity()
        # Convert to int if it's a string (JWT stores as string)
        if isinstance(user_id, str):
            user_id = int(user_id)
        
        if 'photo' not in request.files:
            return jsonify({'message': 'No photo provided'}), 400
        
        file = request.files['photo']
        
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'message': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP'}), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'message': 'File too large. Maximum size: 5MB'}), 400
        
        # Read and optimize image
        image_data = file.read()
        optimized_data = optimize_image(image_data)
        
        # Create profile photos directory if it doesn't exist
        profile_dir = os.path.join(os.path.dirname(__file__), '..', PROFILE_PHOTO_DIR)
        os.makedirs(profile_dir, exist_ok=True)
        
        # Save file with user_id as filename
        filename = f"user_{user_id}.jpg"
        filepath = os.path.join(profile_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(optimized_data)
        
        # Update user record with photo path
        photo_url = f"/api/users/profile/photo/{user_id}"
        query = """
        UPDATE users 
        SET profile_photo = %s, updated_at = %s
        WHERE id = %s
        RETURNING id, username, email, profile_photo
        """
        from datetime import datetime, timezone
        result = db_manager.execute_one(query, (photo_url, datetime.now(timezone.utc), user_id))
        
        if not result:
            return jsonify({'message': 'Failed to update profile photo'}), 500
        
        logger.info(f"Profile photo uploaded for user {user_id}")
        
        return jsonify({
            'success': True,
            'message': 'Profile photo uploaded successfully',
            'photo_url': photo_url
        }), 200
    except Exception as e:
        logger.error(f"Error uploading profile photo: {e}")
        return jsonify({'message': 'Failed to upload photo', 'error': str(e)}), 500

@users_bp.route('/api/users/profile/photo/<int:user_id>', methods=['GET'])
def get_profile_photo(user_id):
    """Get user profile photo"""
    try:
        profile_dir = os.path.join(os.path.dirname(__file__), '..', PROFILE_PHOTO_DIR)
        filename = f"user_{user_id}.jpg"
        filepath = os.path.join(profile_dir, filename)
        
        if not os.path.exists(filepath):
            return jsonify({'message': 'Photo not found'}), 404
        
        return send_file(filepath, mimetype='image/jpeg')
    except Exception as e:
        logger.error(f"Error fetching profile photo: {e}")
        return jsonify({'message': 'Failed to fetch photo', 'error': str(e)}), 500

@users_bp.route('/api/users/profile/photo', methods=['DELETE'])
@jwt_required()
def delete_profile_photo():
    """Delete user profile photo"""
    try:
        user_id = get_jwt_identity()
        # Convert to int if it's a string (JWT stores as string)
        if isinstance(user_id, str):
            user_id = int(user_id)
        
        # Delete file from disk
        profile_dir = os.path.join(os.path.dirname(__file__), '..', PROFILE_PHOTO_DIR)
        filename = f"user_{user_id}.jpg"
        filepath = os.path.join(profile_dir, filename)
        
        if os.path.exists(filepath):
            os.remove(filepath)
        
        # Update user record
        query = """
        UPDATE users 
        SET profile_photo = NULL, updated_at = %s
        WHERE id = %s
        """
        from datetime import datetime, timezone
        db_manager.execute_query(query, (datetime.now(timezone.utc), user_id))
        
        logger.info(f"Profile photo deleted for user {user_id}")
        
        return jsonify({
            'success': True,
            'message': 'Profile photo deleted successfully'
        }), 200
    except Exception as e:
        logger.error(f"Error deleting profile photo: {e}")
        return jsonify({'message': 'Failed to delete photo', 'error': str(e)}), 500

@users_bp.route('/api/users/preferences', methods=['PUT'])
@jwt_required()
def update_preferences():
    """Update user preferences (dark mode, language, etc.)"""
    try:
        user_id = get_jwt_identity()
        # Convert to int if it's a string (JWT stores as string)
        if isinstance(user_id, str):
            user_id = int(user_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Get current user preferences
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        current_prefs = user.get('preferences', {}) or {}
        
        # Update preferences
        if 'darkMode' in data:
            current_prefs['darkMode'] = bool(data['darkMode'])
        
        if 'language' in data:
            current_prefs['language'] = data['language']
        
        # Update database
        import json
        from datetime import datetime, timezone
        query = """
        UPDATE users 
        SET preferences = %s, updated_at = %s
        WHERE id = %s
        RETURNING preferences
        """
        
        result = db_manager.execute_one(query, (json.dumps(current_prefs), datetime.now(timezone.utc), user_id))
        
        if not result:
            return jsonify({'message': 'Failed to update preferences'}), 500
        
        logger.info(f"Preferences updated for user {user_id}")
        
        return jsonify({
            'success': True,
            'message': 'Preferences updated successfully',
            'preferences': current_prefs
        }), 200
    except Exception as e:
        logger.error(f"Error updating preferences: {e}")
        return jsonify({'message': 'Failed to update preferences', 'error': str(e)}), 500

@users_bp.route('/api/users/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Delete user account and all associated data"""
    try:
        user_id = get_jwt_identity()
        # Convert to int if it's a string (JWT stores as string)
        if isinstance(user_id, str):
            user_id = int(user_id)
        
        logger.info(f"Account deletion initiated for user {user_id}")
        
        # Start transaction
        with db_manager.get_connection() as conn:
            with conn.cursor() as cursor:
                # Delete user's shares (both owned and received)
                cursor.execute("DELETE FROM shares WHERE owner_id = %s OR grantee_id = %s", (user_id, user_id))
                shares_deleted = cursor.rowcount
                
                # Delete user's files
                cursor.execute("DELETE FROM files WHERE owner_id = %s", (user_id,))
                files_deleted = cursor.rowcount
                
                # Delete sync events
                cursor.execute("DELETE FROM sync_events WHERE user_id = %s", (user_id,))
                
                # Soft delete user account
                from datetime import datetime, timezone
                cursor.execute(
                    "UPDATE users SET is_active = FALSE, updated_at = %s WHERE id = %s",
                    (datetime.now(timezone.utc), user_id)
                )
                
                conn.commit()
        
        # Delete user's files from storage
        try:
            from storage_manager import storage_manager
            user = User.find_by_id(user_id)
            if user:
                storage_manager.delete_user_folders(user['username'], user_id)
        except Exception as e:
            logger.error(f"Error deleting user storage: {e}")
        
        # Delete profile photo
        try:
            profile_dir = os.path.join(os.path.dirname(__file__), '..', PROFILE_PHOTO_DIR)
            filename = f"user_{user_id}.jpg"
            filepath = os.path.join(profile_dir, filename)
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception as e:
            logger.error(f"Error deleting profile photo: {e}")
        
        logger.info(f"Account deleted successfully for user {user_id}: {files_deleted} files, {shares_deleted} shares")
        
        return jsonify({
            'success': True,
            'message': 'Account deleted successfully',
            'deleted': {
                'files': files_deleted,
                'shares': shares_deleted
            }
        }), 200
    except Exception as e:
        logger.error(f"Error deleting account: {e}")
        return jsonify({'message': 'Failed to delete account', 'error': str(e)}), 500

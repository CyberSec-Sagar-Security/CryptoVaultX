"""
Models Module - Compatibility layer over direct PostgreSQL database
This module provides model-like interfaces that work with database.py
DO NOT USE SQLAlchemy - use direct PostgreSQL via database.py
"""
from database import db_manager
from datetime import datetime

# This is NOT SQLAlchemy - just a compatibility stub
db = None

class User:
    """User model - wrapper around database.py User functions"""
    
    @staticmethod
    def create(username, email, password, name=None):
        """Create a new user"""
        from database import User as DBUser
        return DBUser.create(username, email, password, name)
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        from database import User as DBUser
        return DBUser.find_by_email(email)
    
    @staticmethod
    def find_by_username(username):
        """Find user by username"""
        from database import User as DBUser
        return DBUser.find_by_username(username)
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        from database import User as DBUser
        return DBUser.find_by_id(user_id)
    
    @staticmethod
    def verify_password(email, password):
        """Verify user password"""
        from database import User as DBUser
        return DBUser.verify_password(email, password)


class File:
    """File model - wrapper around database.py File functions"""
    
    @staticmethod
    def create(owner_id, original_filename, size_bytes, content_type, algo, iv, storage_blob):
        """Create a new file record"""
        from database import File as DBFile
        return DBFile.create(owner_id, original_filename, size_bytes, content_type, algo, iv, storage_blob)
    
    @staticmethod
    def find_by_owner(owner_id):
        """Find files by owner"""
        from database import File as DBFile
        return DBFile.find_by_owner(owner_id)
    
    @staticmethod
    def find_by_id(file_id):
        """Find file by ID"""
        from database import File as DBFile
        return DBFile.find_by_id(file_id)
    
    @staticmethod
    def delete_by_id(file_id, owner_id):
        """Delete file by ID"""
        from database import File as DBFile
        return DBFile.delete_by_id(file_id, owner_id)


class Share:
    """Share model - wrapper around database.py Share functions"""
    
    @staticmethod
    def create(file_id, owner_id, grantee_email, encrypted_key_for_grantee, permissions='read'):
        """Create a new share"""
        from database import Share as DBShare
        return DBShare.create(file_id, owner_id, grantee_email, encrypted_key_for_grantee, permissions)
    
    @staticmethod
    def find_shared_with_user(user_id):
        """Find files shared with a user"""
        from database import Share as DBShare
        return DBShare.find_shared_with_user(user_id)
    

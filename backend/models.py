from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
import bcrypt
from flask_jwt_extended import create_access_token, create_refresh_token

db = SQLAlchemy()

class User(db.Model):
    """User model for authentication and file ownership"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Changed to SERIAL
    username = db.Column(db.String(100), unique=True, nullable=False, index=True)  # Added username
    name = db.Column(db.String(100), nullable=False)  # Keep name for display
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)  # Increased length
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    files = db.relationship('File', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    received_shares = db.relationship('Share', foreign_keys='Share.grantee_user_id', back_populates='grantee', lazy='dynamic')
    
    def __repr__(self):
        return f'<User {self.username} ({self.email})>'
    
    def set_password(self, password):
        """Hash and set the user's password"""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    def check_password(self, password):
        """Check if the provided password matches the stored hash"""
        password_bytes = password.encode('utf-8')
        hash_bytes = self.password_hash.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)
    
    def generate_tokens(self):
        """Generate JWT access and refresh tokens for the user.
        Identity is cast to string to satisfy JWT 'sub' claim expectations in newer libraries."""
        user_id_str = str(self.id)
        access_token = create_access_token(identity=user_id_str)
        refresh_token = create_refresh_token(identity=user_id_str)
        return {
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    def to_dict(self, include_sensitive=False):
        """Convert user to dictionary representation"""
        user_dict = {
            'id': self.id,
            'username': self.username,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active
        }
        
        if include_sensitive:
            user_dict['updated_at'] = self.updated_at.isoformat()
        
        return user_dict
    
    @staticmethod
    def find_by_email(email):
        """Find user by email address"""
        return User.query.filter_by(email=email.lower(), is_active=True).first()
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        return User.query.filter_by(id=user_id, is_active=True).first()

class File(db.Model):
    """File model for storing encrypted file metadata"""
    __tablename__ = 'files'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    filename = db.Column(db.String(255), nullable=False)  # Original filename
    size = db.Column(db.BigInteger, nullable=False)  # File size in bytes
    algo = db.Column(db.String(50), nullable=True, default='AES-256-GCM')  # Encryption algorithm (nullable for unencrypted files)
    iv = db.Column(db.Text, nullable=True)  # Initialization vector (base64) - nullable for unencrypted files
    tag = db.Column(db.Text, nullable=True)  # Authentication tag (base64) - nullable for unencrypted files
    storage_path = db.Column(db.String(500), nullable=False)  # Server storage path
    content_type = db.Column(db.String(100), nullable=True)  # MIME type (optional)
    is_encrypted = db.Column(db.Boolean, nullable=False, default=True)  # Whether file is encrypted
    folder = db.Column(db.String(255), nullable=False, default='root')  # Folder/directory organization
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    file_shares = db.relationship('Share', back_populates='file', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<File {self.filename} (Owner: {self.owner_id})>'
    
    def to_dict(self, include_sensitive=False):
        """Convert file to dictionary representation"""
        file_dict = {
            'id': self.id,
            'filename': self.filename,
            'size': self.size,
            'algo': self.algo,
            'content_type': self.content_type,
            'is_encrypted': self.is_encrypted,
            'folder': self.folder,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Include encryption metadata for download
        if include_sensitive:
            file_dict.update({
                'iv': self.iv,
                'tag': self.tag,
                'storage_path': self.storage_path,
                'owner_id': self.owner_id
            })
        
        return file_dict
    
    @staticmethod
    def find_by_id_and_owner(file_id, owner_id):
        """Find file by ID and owner (for access control)"""
        return File.query.filter_by(id=file_id, owner_id=owner_id).first()
    
    @staticmethod
    def find_by_owner(owner_id):
        """Get all files owned by a user"""
        return File.query.filter_by(owner_id=owner_id).order_by(File.created_at.desc()).all()
    
    def can_access(self, user_id):
        """Check if user can access this file (owner or shared)"""
        if self.owner_id == user_id:
            return True
        
        # Check if file is shared with the user
        share = Share.query.filter_by(file_id=self.id, grantee_user_id=user_id).first()
        return share is not None
    
    def get_access_level(self, user_id):
        """Get user's access level to this file"""
        if self.owner_id == user_id:
            return 'owner'
        
        share = Share.query.filter_by(file_id=self.id, grantee_user_id=user_id).first()
        if share:
            return share.permission
        
        return None
    
    def delete_file_from_storage(self):
        """Delete the actual file from storage"""
        import os
        try:
            if os.path.exists(self.storage_path):
                os.remove(self.storage_path)
                return True
        except Exception as e:
            print(f"Error deleting file {self.storage_path}: {e}")
        return False

class Share(db.Model):
    """Share model for file sharing between users"""
    __tablename__ = 'shares'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign keys
    file_id = db.Column(db.String(36), db.ForeignKey('files.id', ondelete='CASCADE'), nullable=False, index=True)
    grantee_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Sharing metadata
    permission = db.Column(db.String(20), nullable=False, default='read')  # 'read' or 'write'
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    file = db.relationship('File', back_populates='file_shares')
    grantee = db.relationship('User', foreign_keys=[grantee_user_id], back_populates='received_shares')
    
    # Unique constraint: one share per file per user
    __table_args__ = (
        db.UniqueConstraint('file_id', 'grantee_user_id', name='unique_file_grantee_share'),
    )
    
    def __repr__(self):
        return f'<Share file_id={self.file_id} grantee_id={self.grantee_user_id}>'
    
    def to_dict(self, include_file_info=False):
        """Convert share to dictionary representation"""
        share_dict = {
            'id': self.id,
            'file_id': self.file_id,
            'grantee_user_id': self.grantee_user_id,
            'permission': self.permission,
            'created_at': self.created_at.isoformat()
        }
        
        # Include file information for shared files listing
        if include_file_info and self.file:
            share_dict['file'] = {
                'id': self.file.id,
                'filename': self.file.filename,
                'size': self.file.size,
                'content_type': self.file.content_type,
                'created_at': self.file.created_at.isoformat(),
                'owner_id': self.file.owner_id
            }
        
        # Include grantee information
        if self.grantee:
            share_dict['grantee'] = {
                'id': self.grantee.id,
                'name': self.grantee.name,
                'email': self.grantee.email
            }
        
        return share_dict
    
    @staticmethod
    def find_by_file_and_grantee(file_id, grantee_user_id):
        """Find share by file and grantee"""
        return Share.query.filter_by(file_id=file_id, grantee_user_id=grantee_user_id).first()
    
    @staticmethod
    def get_shared_files_for_user(user_id):
        """Get all files shared with a specific user"""
        return Share.query.filter_by(grantee_user_id=user_id).all()
    
    @staticmethod
    def get_file_shares(file_id):
        """Get all shares for a specific file"""
        return Share.query.filter_by(file_id=file_id).all()

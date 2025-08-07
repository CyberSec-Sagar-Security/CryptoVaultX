"""
Database models for CryptoVault secure file sharing system.
Includes User, File, SharedFile, and Session tables with appropriate relationships.
"""

from datetime import datetime, timedelta
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    LargeBinary,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
import os

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://admin:admin123@db:5432/cryptovault_db"
)

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()


class User(Base):
    """
    User model for authentication and account management.
    Stores user credentials and profile information.
    """

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    last_login = Column(DateTime, nullable=True)

    # Relationships
    uploaded_files = relationship(
        "File", back_populates="owner", cascade="all, delete-orphan"
    )
    shared_files_received = relationship(
        "SharedFile",
        foreign_keys="SharedFile.shared_with_user_id",
        back_populates="shared_with_user",
        cascade="all, delete-orphan",
    )
    shared_files_given = relationship(
        "SharedFile",
        foreign_keys="SharedFile.shared_by_user_id",
        back_populates="shared_by_user",
        cascade="all, delete-orphan",
    )
    sessions = relationship(
        "Session", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}')>"


class File(Base):
    """
    File model for storing encrypted file metadata and content.
    Each file belongs to a user and can be shared with others.
    """

    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)  # Size in bytes
    mime_type = Column(String(100), nullable=True)
    file_hash = Column(
        String(64), nullable=False, index=True
    )  # SHA-256 hash for integrity

    # Encryption metadata
    encryption_key_hash = Column(
        String(64), nullable=False
    )  # Hash of the encryption key
    initialization_vector = Column(LargeBinary, nullable=False)  # IV for AES encryption

    # File storage
    encrypted_content = Column(LargeBinary, nullable=False)  # Encrypted file content

    # Metadata
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)
    download_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    expires_at = Column(DateTime, nullable=True)  # Optional expiration date

    # Foreign keys
    owner_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )

    # Relationships
    owner = relationship("User", back_populates="uploaded_files")
    shared_files = relationship(
        "SharedFile", back_populates="file", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<File(filename='{self.filename}', owner_id='{self.owner_id}')>"


class SharedFile(Base):
    """
    SharedFile model for managing file sharing permissions.
    Links files with users they are shared with and manages access permissions.
    """

    __tablename__ = "shared_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Sharing permissions
    can_read = Column(Boolean, default=True, nullable=False)
    can_download = Column(Boolean, default=True, nullable=False)
    can_reshare = Column(Boolean, default=False, nullable=False)

    # Sharing metadata
    share_message = Column(Text, nullable=True)  # Optional message from sharer
    access_count = Column(
        Integer, default=0, nullable=False
    )  # Number of times accessed
    last_accessed = Column(DateTime, nullable=True)

    # Timestamps
    shared_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)  # Optional expiration for sharing
    revoked_at = Column(DateTime, nullable=True)  # When sharing was revoked

    # Foreign keys
    file_id = Column(
        UUID(as_uuid=True), ForeignKey("files.id"), nullable=False, index=True
    )
    shared_with_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    shared_by_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )

    # Relationships
    file = relationship("File", back_populates="shared_files")
    shared_with_user = relationship(
        "User",
        foreign_keys=[shared_with_user_id],
        back_populates="shared_files_received",
    )
    shared_by_user = relationship(
        "User", foreign_keys=[shared_by_user_id], back_populates="shared_files_given"
    )

    # Composite unique constraint to prevent duplicate shares
    __table_args__ = {"extend_existing": True}

    def __repr__(self):
        return f"<SharedFile(file_id='{self.file_id}', shared_with='{self.shared_with_user_id}')>"


class Session(Base):
    """
    Session model for managing user authentication sessions.
    Tracks active user sessions with expiration and security metadata.
    """

    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_token = Column(String(255), unique=True, nullable=False, index=True)

    # Session metadata
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(String(500), nullable=True)
    device_info = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)  # Optional location info

    # Session status
    is_active = Column(Boolean, default=True, nullable=False)
    login_method = Column(
        String(50), default="password", nullable=False
    )  # password, oauth, etc.

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_activity = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(
        DateTime, default=lambda: datetime.utcnow() + timedelta(days=7), nullable=False
    )
    logged_out_at = Column(DateTime, nullable=True)

    # Foreign keys
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )

    # Relationships
    user = relationship("User", back_populates="sessions")

    def __repr__(self):
        return f"<Session(user_id='{self.user_id}', active='{self.is_active}')>"


# Database utility functions
def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


def get_db():
    """Get database session for dependency injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_database():
    """Initialize database with tables and basic data."""
    create_tables()
    print("Database initialization complete!")


# Export models and utilities
__all__ = [
    "Base",
    "User",
    "File",
    "SharedFile",
    "Session",
    "engine",
    "SessionLocal",
    "get_db",
    "create_tables",
    "init_database",
]

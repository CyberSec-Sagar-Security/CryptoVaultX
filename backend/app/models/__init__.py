"""
Models Package - Phase 4

Professional database models for CryptoVaultX.
Supports both PostgreSQL production and in-memory development environments.

@author: CryptoVaultX Development Team
@version: 1.0.0
@since: Phase 4
"""

import os
from typing import Generator, Dict, Any

# Try to import SQLAlchemy for production database
try:
    from sqlalchemy import create_database_url, MetaData
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy import create_engine
    
    SQLALCHEMY_AVAILABLE = True
    print("🗄️ SQLAlchemy available for production database")
    
except ImportError as e:
    print(f"⚠️ SQLAlchemy not available: {e}")
    print("🗄️ Using in-memory storage for development")
    SQLALCHEMY_AVAILABLE = False

# Create base class for models
if SQLALCHEMY_AVAILABLE:
    Base = declarative_base()
    
    # Database configuration
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./cryptovault.db')
    
    try:
        # Create engine
        engine = create_engine(
            DATABASE_URL,
            echo=False,  # Set to True for SQL debugging
            pool_pre_ping=True,
            pool_recycle=300
        )
        
        # Create session maker
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        print(f"🗄️ Database engine created: {DATABASE_URL}")
        
    except Exception as db_error:
        print(f"❌ Database engine creation failed: {db_error}")
        SQLALCHEMY_AVAILABLE = False
        
        # Fallback base class
        class Base:
            pass
            
else:
    # Fallback base class
    class Base:
        pass

# Database dependency
def get_db() -> Generator:
    """
    Get database session
    
    Yields:
        Database session
    """
    
    if SQLALCHEMY_AVAILABLE:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    else:
        # Mock session for in-memory mode
        yield None

# User model (placeholder for future authentication)
class User(Base if SQLALCHEMY_AVAILABLE else object):
    """
    User model placeholder
    Will be implemented in future authentication phases
    """
    
    if SQLALCHEMY_AVAILABLE:
        from sqlalchemy import Column, String, Boolean, DateTime
        from datetime import datetime
        
        __tablename__ = "users"
        
        id = Column(String, primary_key=True)
        username = Column(String(50), unique=True, nullable=False)
        email = Column(String(100), unique=True, nullable=False)
        is_active = Column(Boolean, default=True)
        created_at = Column(DateTime, default=datetime.utcnow)
        
    else:
        def __init__(self, **kwargs):
            self.id = kwargs.get('id', 'anonymous')
            self.username = kwargs.get('username', 'anonymous')
            self.email = kwargs.get('email', 'anonymous@localhost')
            self.is_active = kwargs.get('is_active', True)
            self.created_at = kwargs.get('created_at')

# Import models
from .FileMeta import FileMeta, create_file_record, get_file_record, list_file_records, get_storage_statistics

# Initialize database tables
def init_database():
    """
    Initialize database tables
    """
    
    if SQLALCHEMY_AVAILABLE:
        try:
            # Create all tables
            Base.metadata.create_all(bind=engine)
            print("✅ Database tables created successfully")
            
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")
            print("🗄️ Falling back to in-memory storage")
    else:
        print("🗄️ Using in-memory storage (no database initialization needed)")

# Initialize on import
init_database()

# Export main components
__all__ = [
    'Base',
    'get_db',
    'User',
    'FileMeta',
    'create_file_record',
    'get_file_record',
    'list_file_records',
    'get_storage_statistics',
    'init_database',
    'SQLALCHEMY_AVAILABLE'
]

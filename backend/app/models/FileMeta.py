"""
File Metadata Model - Phase 4

Professional database model for storing encrypted file metadata.
Designed to work with both PostgreSQL and in-memory storage systems.

@author: CryptoVaultX Development Team
@version: 1.0.0
@since: Phase 4
"""

import uuid
from datetime import datetime
from typing import Dict, Optional

# Try to import SQLAlchemy models, fall back to in-memory if not available
try:
    from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy.dialects.postgresql import UUID
    from sqlalchemy.orm import sessionmaker
    
    # Import existing models if available
    from ...models import Base, get_db, User
    
    SQLALCHEMY_AVAILABLE = True
    print("🗄️ Using SQLAlchemy models")
    
except ImportError as e:
    print(f"⚠️ SQLAlchemy not available: {e}")
    print("🗄️ Using in-memory storage models")
    SQLALCHEMY_AVAILABLE = False
    
    # Create mock base for compatibility
    class Base:
        pass

class FileMeta(Base if SQLALCHEMY_AVAILABLE else object):
    """
    File metadata model for encrypted files
    """
    
    if SQLALCHEMY_AVAILABLE:
        __tablename__ = "file_metadata"
        
        # Primary key
        id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
        
        # File identification
        file_id = Column(String(255), unique=True, nullable=False, index=True)
        original_filename = Column(String(255), nullable=False)
        secure_filename = Column(String(255), nullable=False)
        
        # File information
        file_size = Column(Integer, nullable=False)  # Encrypted file size
        original_size = Column(Integer, nullable=False)  # Original file size
        file_hash = Column(String(64), nullable=False)  # SHA-256 hash
        content_type = Column(String(100), nullable=True)
        
        # Encryption information
        iv = Column(String(255), nullable=False)  # Base64 encoded IV
        
        # Upload information
        upload_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
        client_ip = Column(String(45), nullable=True)  # IPv6 compatible
        user_agent = Column(Text, nullable=True)
        
        # Metadata flags
        has_encrypted_metadata = Column(Boolean, default=False, nullable=False)
        metadata_file_id = Column(String(255), nullable=True)
        
        # Status
        is_active = Column(Boolean, default=True, nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        def to_dict(self):
            """Convert model to dictionary"""
            return {
                'id': str(self.id),
                'file_id': self.file_id,
                'original_filename': self.original_filename,
                'secure_filename': self.secure_filename,
                'file_size': self.file_size,
                'original_size': self.original_size,
                'file_hash': self.file_hash,
                'content_type': self.content_type,
                'iv': self.iv,
                'upload_timestamp': self.upload_timestamp.isoformat() if self.upload_timestamp else None,
                'client_ip': self.client_ip,
                'user_agent': self.user_agent,
                'has_encrypted_metadata': self.has_encrypted_metadata,
                'metadata_file_id': self.metadata_file_id,
                'is_active': self.is_active,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
    else:
        def __init__(self, **kwargs):
            """Initialize in-memory model"""
            self.id = str(uuid.uuid4())
            self.file_id = kwargs.get('file_id')
            self.original_filename = kwargs.get('original_filename')
            self.secure_filename = kwargs.get('secure_filename')
            self.file_size = kwargs.get('file_size')
            self.original_size = kwargs.get('original_size')
            self.file_hash = kwargs.get('file_hash')
            self.content_type = kwargs.get('content_type')
            self.iv = kwargs.get('iv')
            self.upload_timestamp = kwargs.get('upload_timestamp', datetime.utcnow())
            self.client_ip = kwargs.get('client_ip')
            self.user_agent = kwargs.get('user_agent')
            self.has_encrypted_metadata = kwargs.get('has_encrypted_metadata', False)
            self.metadata_file_id = kwargs.get('metadata_file_id')
            self.is_active = kwargs.get('is_active', True)
            self.created_at = kwargs.get('created_at', datetime.utcnow())
            self.updated_at = kwargs.get('updated_at', datetime.utcnow())
        
        def to_dict(self):
            """Convert model to dictionary"""
            return {
                'id': self.id,
                'file_id': self.file_id,
                'original_filename': self.original_filename,
                'secure_filename': self.secure_filename,
                'file_size': self.file_size,
                'original_size': self.original_size,
                'file_hash': self.file_hash,
                'content_type': self.content_type,
                'iv': self.iv,
                'upload_timestamp': self.upload_timestamp.isoformat() if isinstance(self.upload_timestamp, datetime) else self.upload_timestamp,
                'client_ip': self.client_ip,
                'user_agent': self.user_agent,
                'has_encrypted_metadata': self.has_encrypted_metadata,
                'metadata_file_id': self.metadata_file_id,
                'is_active': self.is_active,
                'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
                'updated_at': self.updated_at.isoformat() if isinstance(self.updated_at, datetime) else self.updated_at
            }

# In-memory storage for when database is not available
_in_memory_files = {}

def create_file_record(file_info: Dict, upload_metadata: Dict) -> Optional[Dict]:
    """
    Create a file record in the database or in-memory storage
    
    Args:
        file_info: File information from file handler
        upload_metadata: Upload metadata
        
    Returns:
        Created record dictionary or None if failed
    """
    
    try:
        # Prepare record data
        record_data = {
            'file_id': file_info['file_id'],
            'original_filename': file_info['original_filename'],
            'secure_filename': file_info['secure_filename'],
            'file_size': file_info['file_size'],
            'original_size': upload_metadata['original_size'],
            'file_hash': file_info['file_hash'],
            'content_type': file_info['content_type'],
            'iv': upload_metadata['iv'],
            'upload_timestamp': datetime.fromisoformat(file_info['upload_timestamp'].replace('Z', '+00:00')) if isinstance(file_info['upload_timestamp'], str) else file_info['upload_timestamp'],
            'client_ip': upload_metadata.get('client_ip'),
            'user_agent': upload_metadata.get('user_agent'),
            'has_encrypted_metadata': upload_metadata.get('has_encrypted_metadata', False),
            'metadata_file_id': file_info.get('metadata_file_id')
        }
        
        if SQLALCHEMY_AVAILABLE:
            # Try to save to database
            try:
                db = next(get_db())
                
                file_record = FileMeta(**record_data)
                db.add(file_record)
                db.commit()
                
                result = file_record.to_dict()
                print(f"💾 Database record created: {result['id']}")
                return result
                
            except Exception as db_error:
                print(f"⚠️ Database save failed, using in-memory: {db_error}")
                # Fall back to in-memory storage
                return create_memory_record(record_data)
        else:
            # Use in-memory storage
            return create_memory_record(record_data)
            
    except Exception as e:
        print(f"❌ Failed to create file record: {e}")
        return None

def create_memory_record(record_data: Dict) -> Dict:
    """
    Create a record in in-memory storage
    
    Args:
        record_data: Record data dictionary
        
    Returns:
        Created record dictionary
    """
    
    file_record = FileMeta(**record_data)
    record_dict = file_record.to_dict()
    
    # Store in memory
    _in_memory_files[record_data['file_id']] = record_dict
    
    print(f"🧠 In-memory record created: {record_dict['id']}")
    return record_dict

def get_file_record(file_id: str) -> Optional[Dict]:
    """
    Get file record by file ID
    
    Args:
        file_id: File ID to search for
        
    Returns:
        File record dictionary or None if not found
    """
    
    if SQLALCHEMY_AVAILABLE:
        try:
            db = next(get_db())
            record = db.query(FileMeta).filter(FileMeta.file_id == file_id).first()
            
            if record:
                return record.to_dict()
                
        except Exception as db_error:
            print(f"⚠️ Database query failed: {db_error}")
    
    # Check in-memory storage
    return _in_memory_files.get(file_id)

def list_file_records(limit: int = 100) -> list:
    """
    List file records
    
    Args:
        limit: Maximum number of records to return
        
    Returns:
        List of file record dictionaries
    """
    
    if SQLALCHEMY_AVAILABLE:
        try:
            db = next(get_db())
            records = db.query(FileMeta).filter(FileMeta.is_active == True).order_by(FileMeta.created_at.desc()).limit(limit).all()
            
            return [record.to_dict() for record in records]
            
        except Exception as db_error:
            print(f"⚠️ Database query failed: {db_error}")
    
    # Return in-memory records
    records = list(_in_memory_files.values())
    records.sort(key=lambda x: x['created_at'], reverse=True)
    return records[:limit]

def get_storage_statistics() -> Dict:
    """
    Get storage statistics
    
    Returns:
        Statistics dictionary
    """
    
    try:
        if SQLALCHEMY_AVAILABLE:
            try:
                db = next(get_db())
                
                total_files = db.query(FileMeta).filter(FileMeta.is_active == True).count()
                total_size = db.query(FileMeta.file_size).filter(FileMeta.is_active == True).all()
                total_original_size = db.query(FileMeta.original_size).filter(FileMeta.is_active == True).all()
                
                total_encrypted_bytes = sum(size[0] for size in total_size if size[0])
                total_original_bytes = sum(size[0] for size in total_original_size if size[0])
                
                return {
                    'total_files': total_files,
                    'total_encrypted_bytes': total_encrypted_bytes,
                    'total_original_bytes': total_original_bytes,
                    'encryption_overhead_bytes': total_encrypted_bytes - total_original_bytes,
                    'storage_type': 'database'
                }
                
            except Exception as db_error:
                print(f"⚠️ Database statistics failed: {db_error}")
        
        # In-memory statistics
        records = list(_in_memory_files.values())
        total_files = len(records)
        total_encrypted_bytes = sum(r['file_size'] for r in records if r['file_size'])
        total_original_bytes = sum(r['original_size'] for r in records if r['original_size'])
        
        return {
            'total_files': total_files,
            'total_encrypted_bytes': total_encrypted_bytes,
            'total_original_bytes': total_original_bytes,
            'encryption_overhead_bytes': total_encrypted_bytes - total_original_bytes,
            'storage_type': 'in_memory'
        }
        
    except Exception as e:
        print(f"❌ Statistics calculation failed: {e}")
        return {
            'total_files': 0,
            'total_encrypted_bytes': 0,
            'total_original_bytes': 0,
            'encryption_overhead_bytes': 0,
            'storage_type': 'error',
            'error': str(e)
        }

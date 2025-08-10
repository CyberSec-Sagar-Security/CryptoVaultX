"""
File Handler Utility - Phase 4

Professional file handling utility for secure storage of encrypted files.
Implements proper file validation, secure storage, and metadata management.

Security Features:
- UUID-based filename generation
- Secure file storage with proper permissions
- File size validation and limits
- Safe filename sanitization
- Atomic file operations

@author: CryptoVaultX Development Team  
@version: 1.0.0
@since: Phase 4
"""

import os
import uuid
import hashlib
import json
from datetime import datetime
from typing import Tuple, Dict, Optional
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage

# Configuration
CONFIG = {
    'UPLOAD_FOLDER': 'uploads',
    'MAX_FILE_SIZE': 5 * 1024 * 1024,  # 5MB
    'ALLOWED_EXTENSIONS': set(),  # Allow all extensions for encrypted files
    'SECURE_PERMISSIONS': 0o600,  # Owner read/write only
    'METADATA_EXTENSION': '.meta.json'
}

class FileHandlerError(Exception):
    """Custom exception for file handling errors"""
    pass

class SecureFileHandler:
    """
    Handles secure storage and retrieval of encrypted files
    """
    
    def __init__(self, upload_folder: str = None):
        """
        Initialize the file handler
        
        Args:
            upload_folder: Custom upload folder path
        """
        self.upload_folder = upload_folder or CONFIG['UPLOAD_FOLDER']
        self.ensure_upload_directory()
        
    def ensure_upload_directory(self):
        """Create upload directory if it doesn't exist"""
        try:
            os.makedirs(self.upload_folder, exist_ok=True)
            # Set secure permissions on the directory
            os.chmod(self.upload_folder, 0o700)  # Owner access only
            print(f"📁 Upload directory ready: {self.upload_folder}")
        except OSError as e:
            raise FileHandlerError(f"Failed to create upload directory: {e}")
    
    def validate_file(self, file_storage: FileStorage) -> Dict[str, any]:
        """
        Validate uploaded file
        
        Args:
            file_storage: Werkzeug FileStorage object
            
        Returns:
            Dictionary with validation results
            
        Raises:
            FileHandlerError: If file is invalid
        """
        if not file_storage:
            raise FileHandlerError("No file provided")
            
        if not file_storage.filename:
            raise FileHandlerError("No filename provided")
            
        # Check file size by seeking to end
        file_storage.seek(0, 2)  # Seek to end
        file_size = file_storage.tell()
        file_storage.seek(0)  # Reset to beginning
        
        if file_size == 0:
            raise FileHandlerError("File is empty")
            
        if file_size > CONFIG['MAX_FILE_SIZE']:
            max_size_mb = CONFIG['MAX_FILE_SIZE'] / (1024 * 1024)
            raise FileHandlerError(f"File size exceeds {max_size_mb:.1f}MB limit")
        
        # Generate secure filename
        secure_name = self.generate_secure_filename(file_storage.filename)
        
        validation_result = {
            'original_filename': file_storage.filename,
            'secure_filename': secure_name,
            'file_size': file_size,
            'content_type': file_storage.content_type,
            'is_valid': True
        }
        
        print(f"✅ File validation passed: {validation_result}")
        return validation_result
    
    def generate_secure_filename(self, original_filename: str) -> str:
        """
        Generate a secure UUID-based filename
        
        Args:
            original_filename: Original filename
            
        Returns:
            Secure filename with UUID
        """
        # Extract extension safely
        secure_name = secure_filename(original_filename)
        name_parts = secure_name.rsplit('.', 1)
        
        if len(name_parts) > 1:
            extension = name_parts[1].lower()
        else:
            extension = 'enc'  # Default extension for encrypted files
            
        # Generate UUID-based filename
        unique_id = str(uuid.uuid4())
        secure_name = f"{unique_id}.{extension}"
        
        print(f"🔀 Generated secure filename: {original_filename} -> {secure_name}")
        return secure_name
    
    def save_encrypted_file(self, file_storage: FileStorage, metadata: Dict = None) -> Dict[str, any]:
        """
        Save encrypted file with metadata
        
        Args:
            file_storage: Werkzeug FileStorage object
            metadata: Optional metadata dictionary
            
        Returns:
            Dictionary with file information
            
        Raises:
            FileHandlerError: If file cannot be saved
        """
        try:
            # Validate file
            validation_result = self.validate_file(file_storage)
            secure_filename = validation_result['secure_filename']
            
            # Create full file path
            file_path = os.path.join(self.upload_folder, secure_filename)
            
            # Ensure file doesn't already exist (UUID collision - very unlikely)
            if os.path.exists(file_path):
                raise FileHandlerError("File collision detected - please retry")
            
            # Save file atomically
            temp_path = file_path + '.tmp'
            
            try:
                # Write file data
                file_storage.save(temp_path)
                
                # Set secure permissions
                os.chmod(temp_path, CONFIG['SECURE_PERMISSIONS'])
                
                # Calculate file hash for integrity
                file_hash = self.calculate_file_hash(temp_path)
                
                # Move to final location (atomic operation)
                os.rename(temp_path, file_path)
                
                print(f"💾 File saved successfully: {file_path}")
                
            except Exception as e:
                # Cleanup temp file on error
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                raise FileHandlerError(f"Failed to save file: {e}")
            
            # Prepare file metadata
            file_info = {
                'file_id': secure_filename.split('.')[0],  # UUID part
                'original_filename': validation_result['original_filename'],
                'secure_filename': secure_filename,
                'file_path': file_path,
                'file_size': validation_result['file_size'],
                'file_hash': file_hash,
                'content_type': validation_result['content_type'],
                'upload_timestamp': datetime.utcnow().isoformat(),
                'metadata': metadata or {}
            }
            
            # Save metadata file
            self.save_metadata(file_info)
            
            return file_info
            
        except FileHandlerError:
            raise
        except Exception as e:
            raise FileHandlerError(f"Unexpected error saving file: {e}")
    
    def save_metadata(self, file_info: Dict):
        """
        Save file metadata to JSON file
        
        Args:
            file_info: File information dictionary
        """
        try:
            metadata_filename = file_info['secure_filename'] + CONFIG['METADATA_EXTENSION']
            metadata_path = os.path.join(self.upload_folder, metadata_filename)
            
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(file_info, f, indent=2, ensure_ascii=False)
            
            # Set secure permissions
            os.chmod(metadata_path, CONFIG['SECURE_PERMISSIONS'])
            
            print(f"📝 Metadata saved: {metadata_path}")
            
        except Exception as e:
            print(f"⚠️ Failed to save metadata: {e}")
            # Non-critical error - don't fail the upload
    
    def calculate_file_hash(self, file_path: str) -> str:
        """
        Calculate SHA-256 hash of file for integrity verification
        
        Args:
            file_path: Path to the file
            
        Returns:
            Hexadecimal hash string
        """
        hash_sha256 = hashlib.sha256()
        
        try:
            with open(file_path, 'rb') as f:
                # Read file in chunks to handle large files
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_sha256.update(chunk)
            
            file_hash = hash_sha256.hexdigest()
            print(f"🔍 File hash calculated: {file_hash}")
            return file_hash
            
        except Exception as e:
            raise FileHandlerError(f"Failed to calculate file hash: {e}")
    
    def get_file_info(self, file_id: str) -> Optional[Dict]:
        """
        Retrieve file information by file ID
        
        Args:
            file_id: UUID-based file ID
            
        Returns:
            File information dictionary or None if not found
        """
        try:
            # Find metadata file
            for filename in os.listdir(self.upload_folder):
                if filename.startswith(file_id) and filename.endswith(CONFIG['METADATA_EXTENSION']):
                    metadata_path = os.path.join(self.upload_folder, filename)
                    
                    with open(metadata_path, 'r', encoding='utf-8') as f:
                        file_info = json.load(f)
                    
                    # Verify file still exists
                    if os.path.exists(file_info['file_path']):
                        return file_info
                    else:
                        print(f"⚠️ File missing: {file_info['file_path']}")
                        return None
            
            return None
            
        except Exception as e:
            print(f"❌ Error retrieving file info: {e}")
            return None
    
    def delete_file(self, file_id: str) -> bool:
        """
        Securely delete file and metadata
        
        Args:
            file_id: UUID-based file ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            file_info = self.get_file_info(file_id)
            if not file_info:
                return False
            
            # Delete main file
            if os.path.exists(file_info['file_path']):
                os.unlink(file_info['file_path'])
                print(f"🗑️ Deleted file: {file_info['file_path']}")
            
            # Delete metadata file
            metadata_filename = file_info['secure_filename'] + CONFIG['METADATA_EXTENSION']
            metadata_path = os.path.join(self.upload_folder, metadata_filename)
            
            if os.path.exists(metadata_path):
                os.unlink(metadata_path)
                print(f"🗑️ Deleted metadata: {metadata_path}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error deleting file: {e}")
            return False
    
    def list_files(self) -> list:
        """
        List all uploaded files
        
        Returns:
            List of file information dictionaries
        """
        files = []
        
        try:
            for filename in os.listdir(self.upload_folder):
                if filename.endswith(CONFIG['METADATA_EXTENSION']):
                    metadata_path = os.path.join(self.upload_folder, filename)
                    
                    try:
                        with open(metadata_path, 'r', encoding='utf-8') as f:
                            file_info = json.load(f)
                        
                        # Verify file still exists
                        if os.path.exists(file_info['file_path']):
                            files.append(file_info)
                    except Exception as e:
                        print(f"⚠️ Error reading metadata {filename}: {e}")
            
            # Sort by upload timestamp (newest first)
            files.sort(key=lambda x: x['upload_timestamp'], reverse=True)
            
            print(f"📋 Listed {len(files)} files")
            return files
            
        except Exception as e:
            print(f"❌ Error listing files: {e}")
            return []
    
    def get_storage_stats(self) -> Dict[str, any]:
        """
        Get storage statistics
        
        Returns:
            Dictionary with storage information
        """
        try:
            files = self.list_files()
            total_size = sum(f['file_size'] for f in files)
            
            stats = {
                'total_files': len(files),
                'total_size_bytes': total_size,
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'average_file_size': round(total_size / len(files) if files else 0),
                'upload_folder': self.upload_folder
            }
            
            print(f"📊 Storage stats: {stats}")
            return stats
            
        except Exception as e:
            print(f"❌ Error getting storage stats: {e}")
            return {'error': str(e)}

# Create default instance
default_handler = SecureFileHandler()

# Convenience functions using default handler
def save_encrypted_file(file_storage: FileStorage, metadata: Dict = None) -> Dict[str, any]:
    """Save encrypted file using default handler"""
    return default_handler.save_encrypted_file(file_storage, metadata)

def get_file_info(file_id: str) -> Optional[Dict]:
    """Get file info using default handler"""
    return default_handler.get_file_info(file_id)

def delete_file(file_id: str) -> bool:
    """Delete file using default handler"""
    return default_handler.delete_file(file_id)

def list_files() -> list:
    """List files using default handler"""
    return default_handler.list_files()

def get_storage_stats() -> Dict[str, any]:
    """Get storage stats using default handler"""
    return default_handler.get_storage_stats()

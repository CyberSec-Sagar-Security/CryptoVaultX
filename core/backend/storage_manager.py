"""
Local Storage Management for CryptoVault
Handles per-user folder creation and file operations for encrypted file storage
Storage structure: storage/<username>/uploads/ and storage/<username>/deleted/
"""
import os
import shutil
from pathlib import Path
from typing import Tuple, Optional, Union
import uuid
from datetime import datetime

# Storage configuration
STORAGE_ROOT = os.path.join(os.path.dirname(__file__), "storage")  # Relative to this file's directory
USER_QUOTA_BYTES = 512 * 1024 * 1024  # 512 MB per user
MAX_FILE_SIZE = 100 * 1024 * 1024     # 100MB per file

class StorageManager:
    """Manages local filesystem storage for encrypted files"""
    
    def __init__(self, storage_root: str = STORAGE_ROOT):
        self.storage_root = Path(storage_root)
        self.storage_root.mkdir(exist_ok=True)
    
    def create_user_folders(self, username: str, user_id: int = None) -> Tuple[Path, Path]:
        """
        Create storage folders for a new user using their username
        Args:
            username: User's username (used as folder name)
            user_id: Optional user ID for logging
        Returns: (uploads_folder, deleted_folder)
        """
        # Use username as the folder name for better organization
        user_folder = self.storage_root / username
        uploads_folder = user_folder / "uploads"
        deleted_folder = user_folder / "deleted"
        
        # Create folders if they don't exist
        uploads_folder.mkdir(parents=True, exist_ok=True)
        deleted_folder.mkdir(parents=True, exist_ok=True)
        
        user_info = f"user {username}" + (f" (ID: {user_id})" if user_id else "")
        print(f"✅ Created storage folders for {user_info}")
        print(f"   📁 Uploads: {uploads_folder}")
        print(f"   🗑️ Deleted: {deleted_folder}")
        
        return uploads_folder, deleted_folder
    
    def get_user_folders(self, username: str) -> Tuple[Path, Path]:
        """Get paths to user's storage folders by username"""
        user_folder = self.storage_root / username
        uploads_folder = user_folder / "uploads"
        deleted_folder = user_folder / "deleted"
        return uploads_folder, deleted_folder
    
    def generate_storage_path(self, username: str, original_filename: str) -> str:
        """
        Generate a unique storage path for a file using username
        Args:
            username: User's username
            original_filename: Original filename (for reference, not used in path)
        Returns: relative path from project root
        """
        # Generate unique filename to avoid conflicts
        file_extension = ".enc"  # All encrypted files have .enc extension
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        uploads_folder, _ = self.get_user_folders(username)
        storage_path = uploads_folder / unique_filename
        
        # Return relative path from project root
        return str(storage_path.relative_to(Path.cwd()))
    
    def save_encrypted_file(self, encrypted_data: bytes, storage_path: str) -> bool:
        """
        Save encrypted file data to the specified path
        """
        try:
            file_path = Path(storage_path)
            # Ensure parent directory exists
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write encrypted data to file
            with open(file_path, 'wb') as f:
                f.write(encrypted_data)
            
            print(f"✅ Encrypted file saved: {storage_path} ({len(encrypted_data)} bytes)")
            return True
            
        except Exception as e:
            print(f"❌ Failed to save encrypted file {storage_path}: {e}")
            return False
    
    def read_encrypted_file(self, storage_path: str) -> Optional[bytes]:
        """
        Read encrypted file data from the specified path
        """
        try:
            file_path = Path(storage_path)
            if not file_path.exists():
                print(f"❌ File not found: {storage_path}")
                return None
            
            with open(file_path, 'rb') as f:
                data = f.read()
            
            print(f"✅ Encrypted file read: {storage_path} ({len(data)} bytes)")
            return data
            
        except Exception as e:
            print(f"❌ Failed to read encrypted file {storage_path}: {e}")
            return None
    
    def move_to_deleted(self, storage_path: str, username: str) -> Optional[str]:
        """
        Move file from uploads to deleted folder (soft delete)
        Args:
            storage_path: Current path of the file
            username: User's username
        Returns: new storage path in deleted folder, or None if failed
        """
        try:
            source_path = Path(storage_path)
            if not source_path.exists():
                print(f"❌ Source file not found for deletion: {storage_path}")
                return None
            
            # Generate new path in deleted folder
            _, deleted_folder = self.get_user_folders(username)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_{source_path.name}"
            deleted_path = deleted_folder / filename
            
            # Ensure deleted folder exists
            deleted_folder.mkdir(parents=True, exist_ok=True)
            
            # Move file
            shutil.move(str(source_path), str(deleted_path))
            
            # Return relative path from project root
            relative_deleted_path = str(deleted_path.relative_to(Path.cwd()))
            print(f"✅ File moved to deleted folder: {storage_path} → {relative_deleted_path}")
            return relative_deleted_path
            
        except Exception as e:
            print(f"❌ Failed to move file to deleted folder: {e}")
            return None
    
    def get_folder_size(self, folder_path: Path) -> int:
        """Calculate total size of all files in a folder"""
        total_size = 0
        try:
            if folder_path.exists():
                for file_path in folder_path.rglob('*'):
                    if file_path.is_file():
                        total_size += file_path.stat().st_size
        except Exception as e:
            print(f"❌ Error calculating folder size {folder_path}: {e}")
        return total_size
    
    def get_user_storage_usage(self, username: str) -> dict:
        """
        Get detailed storage usage for a user by username
        Args:
            username: User's username
        Returns: dict with uploads_bytes, deleted_bytes, total_bytes
        Note: Only uploads_bytes counts toward quota now (deleted files are physically removed)
        """
        uploads_folder, deleted_folder = self.get_user_folders(username)
        
        uploads_bytes = self.get_folder_size(uploads_folder)
        deleted_bytes = self.get_folder_size(deleted_folder)
        # FIX: Only count active uploads toward quota, not deleted files
        total_bytes = uploads_bytes
        
        return {
            'uploads_bytes': uploads_bytes,
            'deleted_bytes': deleted_bytes,  # For reference only, not counted in quota
            'total_bytes': total_bytes,
            'quota_bytes': USER_QUOTA_BYTES,
            'remaining_bytes': max(0, USER_QUOTA_BYTES - total_bytes),
            'usage_percentage': round((total_bytes / USER_QUOTA_BYTES) * 100, 2)
        }
    
    def check_quota_before_upload(self, username: str, file_size: int) -> Tuple[bool, str]:
        """
        Check if user has enough quota for a new file
        Args:
            username: User's username
            file_size: Size of file to upload in bytes
        Returns: (can_upload, message)
        """
        usage = self.get_user_storage_usage(username)
        
        if usage['total_bytes'] + file_size > USER_QUOTA_BYTES:
            quota_mb = USER_QUOTA_BYTES // (1024 * 1024)
            current_mb = usage['total_bytes'] // (1024 * 1024)
            return False, f"User storage quota ({quota_mb}MB) exceeded. Current usage: {current_mb}MB"
        
        return True, "Quota check passed"
    
    def cleanup_empty_folders(self, username: str):
        """Remove empty folders for a user (optional maintenance)"""
        try:
            user_folder = self.storage_root / username
            if user_folder.exists():
                # Remove empty subfolders
                for subfolder in [user_folder / "uploads", user_folder / "deleted"]:
                    if subfolder.exists() and not any(subfolder.iterdir()):
                        subfolder.rmdir()
                        print(f"🧹 Removed empty folder: {subfolder}")
                
                # Remove empty user folder
                if not any(user_folder.iterdir()):
                    user_folder.rmdir()
                    print(f"🧹 Removed empty user folder: {user_folder}")
                    
        except Exception as e:
            print(f"❌ Error during cleanup for user {username}: {e}")

# Global storage manager instance
storage_manager = StorageManager()
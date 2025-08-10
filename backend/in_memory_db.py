"""
In-memory database implementation for CryptoVaultX development mode.
This provides a simple way to store and retrieve encrypted files without requiring PostgreSQL.
"""
import uuid
from datetime import datetime

# In-memory storage
files_db = {}
users_db = {
    "demo_user": {
        "id": str(uuid.uuid4()),
        "username": "demo_user",
        "email": "demo@example.com",
        "full_name": "Demo User",
        "is_active": True,
        "is_verified": True,
        "created_at": datetime.utcnow().isoformat(),
    }
}

class InMemoryDB:
    """Simple in-memory database for development purposes"""
    
    @staticmethod
    def get_demo_user():
        """Return the demo user"""
        return users_db["demo_user"]
    
    @staticmethod
    def save_file(file_data):
        """Save a file to the in-memory database"""
        file_id = str(uuid.uuid4())
        file_data["id"] = file_id
        file_data["created_at"] = datetime.utcnow().isoformat()
        file_data["updated_at"] = datetime.utcnow().isoformat()
        files_db[file_id] = file_data
        return file_id
    
    @staticmethod
    def get_file(file_id):
        """Get a file from the in-memory database"""
        return files_db.get(file_id)
    
    @staticmethod
    def get_all_files():
        """Get all files from the in-memory database"""
        return list(files_db.values())
    
    @staticmethod
    def delete_file(file_id):
        """Delete a file from the in-memory database"""
        if file_id in files_db:
            del files_db[file_id]
            return True
        return False

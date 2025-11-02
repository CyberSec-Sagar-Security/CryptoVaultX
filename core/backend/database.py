"""
Direct PostgreSQL Database Connection Utility
Replaces SQLAlchemy with direct psycopg2 connections
"""

import psycopg2
import psycopg2.extras
from psycopg2.pool import SimpleConnectionPool
import os
from datetime import datetime, timezone
import bcrypt
import json
from contextlib import contextmanager
import logging

logger = logging.getLogger(__name__)

def utcnow():
    """Get current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)

class DatabaseManager:
    """Direct PostgreSQL database manager without SQLAlchemy"""
    
    def __init__(self):
        self.connection_params = {
            'host': 'localhost',
            'port': 5432,
            'database': 'cryptovault_db',
            'user': 'cryptovault_user',
            'password': 'sql123'
        }
        self.pool = None
        self.init_connection_pool()
    
    def init_connection_pool(self):
        """Initialize connection pool"""
        try:
            self.pool = SimpleConnectionPool(
                minconn=1,
                maxconn=20,
                **self.connection_params
            )
            logger.info("Database connection pool initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database connection pool: {e}")
            raise
    
    @contextmanager
    def get_connection(self):
        """Get a connection from the pool"""
        conn = None
        try:
            conn = self.pool.getconn()
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database connection error: {e}")
            raise
        finally:
            if conn:
                self.pool.putconn(conn)
    
    def execute_query(self, query, params=None, fetch=False):
        """Execute a query and optionally fetch results"""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(query, params)
                if fetch:
                    return cursor.fetchall()
                conn.commit()
                return cursor.rowcount
    
    def execute_one(self, query, params=None):
        """Execute a query and fetch one result"""
        try:
            print(f"[DB] Executing query: {query[:100]}... with params: {params}")
            with self.get_connection() as conn:
                print(f"[DB] Got connection from pool")
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                    cursor.execute(query, params)
                    result = cursor.fetchone()
                    print(f"[DB] Query result: {result}")
                    conn.commit()  # Commit the transaction
                    return result
        except Exception as e:
            print(f"[DB] ERROR in execute_one: {type(e).__name__}: {str(e)}")
            import traceback
            print(f"[DB] Full traceback:\n{traceback.format_exc()}")
            raise

# Global database manager instance
db_manager = DatabaseManager()

class User:
    """User model for direct PostgreSQL operations"""
    
    @staticmethod
    def create(username, email, password, name=None):
        """Create a new user"""
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        query = """
        INSERT INTO users (username, email, password_hash, name, created_at, updated_at, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id, username, email, name, created_at, is_active
        """
        params = (
            username, email, password_hash, name or username,
            utcnow(), utcnow(), True
        )
        
        result = db_manager.execute_one(query, params)
        return dict(result) if result else None
    
    @staticmethod
    def find_by_email(email):
        """Find user by email - case insensitive, includes password_hash for authentication"""
        query = "SELECT * FROM users WHERE LOWER(email) = LOWER(%s) AND is_active = TRUE"
        result = db_manager.execute_one(query, (email,))
        return dict(result) if result else None
    
    @staticmethod
    def find_by_username(username):
        """Find user by username"""
        query = "SELECT * FROM users WHERE username = %s AND is_active = TRUE"
        result = db_manager.execute_one(query, (username,))
        return dict(result) if result else None
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        query = "SELECT * FROM users WHERE id = %s AND is_active = TRUE"
        result = db_manager.execute_one(query, (user_id,))
        return dict(result) if result else None
    
    @staticmethod
    def verify_password(email, password):
        """Verify user password"""
        user = User.find_by_email(email)
        if not user:
            return None
            
        password_hash = user['password_hash']
        
        # Debug logging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Verifying password for {email}")
        logger.info(f"Password hash type: {type(password_hash)}")
        logger.info(f"Password hash length: {len(password_hash)}")
        
        try:
            # Try different encoding approaches
            if isinstance(password_hash, str):
                # If it's a string, encode it
                hash_bytes = password_hash.encode('utf-8')
            elif isinstance(password_hash, bytes):
                # If it's already bytes, use it directly
                hash_bytes = password_hash
            else:
                logger.error(f"Unexpected password_hash type: {type(password_hash)}")
                return None
            
            password_bytes = password.encode('utf-8')
            logger.info(f"Checking password with bcrypt...")
            
            if bcrypt.checkpw(password_bytes, hash_bytes):
                logger.info("Password verification successful")
                return user
            else:
                logger.info("Password verification failed")
                return None
                
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return None
    
    @staticmethod
    def update_last_login(user_id):
        """Update user's last login time"""
        query = "UPDATE users SET updated_at = %s WHERE id = %s"
        db_manager.execute_query(query, (utcnow(), user_id))
    
    @staticmethod
    def search_by_username(search_query, exclude_user_id=None, limit=10):
        """Search users by username (case-insensitive)"""
        if exclude_user_id:
            query = """
            SELECT id, username, name, email, created_at 
            FROM users 
            WHERE LOWER(username) LIKE LOWER(%s) AND is_active = TRUE AND id != %s
            ORDER BY username
            LIMIT %s
            """
            params = (f'%{search_query}%', exclude_user_id, limit)
        else:
            query = """
            SELECT id, username, name, email, created_at 
            FROM users 
            WHERE LOWER(username) LIKE LOWER(%s) AND is_active = TRUE
            ORDER BY username
            LIMIT %s
            """
            params = (f'%{search_query}%', limit)
        
        results = db_manager.execute_query(query, params, fetch=True)
        return [dict(row) for row in results]

class File:
    """File model for direct PostgreSQL operations"""
    
    @staticmethod
    def create(owner_id, original_filename, size_bytes, content_type, algo, iv, storage_path):
        """Create a new file record with local filesystem storage"""
        query = """
        INSERT INTO files (owner_id, original_filename, size_bytes, content_type, algo, iv, storage_path, status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, original_filename, size_bytes, content_type, created_at
        """
        params = (
            owner_id, original_filename, size_bytes, content_type, algo, iv, storage_path, 'active',
            utcnow(), utcnow()
        )
        
        result = db_manager.execute_one(query, params)
        return dict(result) if result else None
    
    @staticmethod
    def find_by_owner(owner_id):
        """Find all files owned by a user"""
        query = """
        SELECT f.*, u.username as owner_username
        FROM files f
        JOIN users u ON f.owner_id = u.id
        WHERE f.owner_id = %s
        ORDER BY f.created_at DESC
        """
        results = db_manager.execute_query(query, (owner_id,), fetch=True)
        return [dict(row) for row in results]
    
    @staticmethod
    def find_by_id(file_id):
        """Find file by ID"""
        query = """
        SELECT f.*, u.username as owner_username
        FROM files f
        JOIN users u ON f.owner_id = u.id
        WHERE f.id = %s
        """
        result = db_manager.execute_one(query, (file_id,))
        return dict(result) if result else None
    
    @staticmethod
    def delete_by_id(file_id, owner_id):
        """Delete file by ID (hard delete from database)"""
        query = """
        DELETE FROM files 
        WHERE id = %s AND owner_id = %s
        RETURNING id, original_filename
        """
        result = db_manager.execute_one(query, (file_id, owner_id))
        return dict(result) if result else None

class Share:
    """Share model for direct PostgreSQL operations"""
    
    @staticmethod
    def create(file_id, grantee_user_id, permission='read'):
        """Create a new file share"""
        query = """
        INSERT INTO shares (file_id, grantee_user_id, permission, created_at)
        VALUES (%s::uuid, %s, %s, %s)
        ON CONFLICT (file_id, grantee_user_id) DO UPDATE SET permission = EXCLUDED.permission
        RETURNING id, file_id, grantee_user_id, permission, created_at
        """
        params = (file_id, grantee_user_id, permission, utcnow())
        
        try:
            result = db_manager.execute_one(query, params)
            return dict(result) if result else None
        except Exception as e:
            logger.error(f"Error creating share: {e}")
            return None
    
    @staticmethod
    def find_by_file_and_grantee(file_id, grantee_user_id):
        """Find a specific share by file and grantee"""
        query = """
        SELECT s.*, u.username as grantee_username, u.name as grantee_name
        FROM shares s
        JOIN users u ON s.grantee_user_id = u.id
        WHERE s.file_id = %s AND s.grantee_user_id = %s
        """
        result = db_manager.execute_one(query, (file_id, grantee_user_id))
        return dict(result) if result else None
    
    @staticmethod
    def find_shared_with_user(user_id):
        """Find all files shared with a user (files user has received)"""
        query = """
        SELECT s.id as share_id, s.file_id, s.permission, s.created_at as shared_at,
               f.original_filename, f.size_bytes, f.content_type, f.created_at as file_created_at,
               f.owner_id,
               u.username as owner_username, u.name as owner_name
        FROM shares s
        JOIN files f ON s.file_id = f.id
        JOIN users u ON f.owner_id = u.id
        WHERE s.grantee_user_id = %s
        ORDER BY s.created_at DESC
        """
        results = db_manager.execute_query(query, (user_id,), fetch=True)
        return [dict(row) for row in results]
    
    @staticmethod
    def find_by_owner(owner_id):
        """Find all shares created by an owner (files owner has shared)"""
        query = """
        SELECT s.id as share_id, s.file_id, s.grantee_user_id, s.permission, s.created_at as shared_at,
               f.original_filename, f.size_bytes, f.content_type, f.created_at as file_created_at,
               u.username as grantee_username, u.name as grantee_name
        FROM shares s
        JOIN files f ON s.file_id = f.id
        JOIN users u ON s.grantee_user_id = u.id
        WHERE f.owner_id = %s
        ORDER BY s.created_at DESC
        """
        results = db_manager.execute_query(query, (owner_id,), fetch=True)
        return [dict(row) for row in results]
    
    @staticmethod
    def find_by_file(file_id):
        """Find all shares for a specific file"""
        query = """
        SELECT s.id as share_id, s.grantee_user_id, s.permission, s.created_at as shared_at,
               u.username as grantee_username, u.name as grantee_name, u.email as grantee_email
        FROM shares s
        JOIN users u ON s.grantee_user_id = u.id
        WHERE s.file_id = %s
        ORDER BY s.created_at DESC
        """
        results = db_manager.execute_query(query, (file_id,), fetch=True)
        return [dict(row) for row in results]
    
    @staticmethod
    def delete_share(file_id, grantee_user_id):
        """Delete a specific share"""
        query = """
        DELETE FROM shares 
        WHERE file_id = %s AND grantee_user_id = %s
        RETURNING id, file_id, grantee_user_id
        """
        result = db_manager.execute_one(query, (file_id, grantee_user_id))
        return dict(result) if result else None
    
    @staticmethod
    def revoke_share(share_id):
        """Revoke a share by share ID"""
        query = """
        DELETE FROM shares 
        WHERE id = %s
        RETURNING id, file_id, grantee_user_id
        """
        result = db_manager.execute_one(query, (share_id,))
        return dict(result) if result else None

def check_access(user_id, file_id):
    """
    Check if a user has access to a file
    Returns True if user is the owner or has been granted access via shares
    """
    try:
        query = """
        SELECT EXISTS (
            SELECT 1 FROM files WHERE id = %s AND owner_id = %s
            UNION
            SELECT 1 FROM shares WHERE file_id = %s AND grantee_user_id = %s
        )
        """
        with db_manager.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (file_id, user_id, file_id, user_id))
                result = cursor.fetchone()
                return result[0] if result else False
    except Exception as e:
        logger.error(f"Error checking access: {e}")
        return False

def test_connection():
    """Test database connection"""
    try:
        with db_manager.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                return result is not None
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False

def initialize_database():
    """Initialize database - ensure tables exist"""
    try:
        # Check if tables exist
        with db_manager.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT table_name FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name IN ('users', 'files', 'shares')
                """)
                existing_tables = [row[0] for row in cursor.fetchall()]
                
                if len(existing_tables) == 3:
                    logger.info("All required tables exist")
                    return True
                else:
                    logger.warning(f"Missing tables: {set(['users', 'files', 'shares']) - set(existing_tables)}")
                    return False
    except Exception as e:
        logger.error(f"Database initialization check failed: {e}")
        return False
"""Add wrapped_key column to files table

This migration adds a wrapped_key column to store the encrypted file keys
for secure client-side decryption.

Revision ID: add_wrapped_key
Create Date: 2024-01-20
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import db_manager

def upgrade():
    """Add wrapped_key column to files table"""
    try:
        with db_manager.get_connection() as connection:
            cursor = connection.cursor()
            
            # Add wrapped_key column
            cursor.execute("""
                ALTER TABLE files 
                ADD COLUMN IF NOT EXISTS wrapped_key TEXT;
            """)
            
            connection.commit()
            cursor.close()
        
        print("Migration completed: Added wrapped_key column to files table")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        raise

def downgrade():
    """Remove wrapped_key column from files table"""
    try:
        with db_manager.get_connection() as connection:
            cursor = connection.cursor()
            
            # Remove wrapped_key column
            cursor.execute("""
                ALTER TABLE files 
                DROP COLUMN IF EXISTS wrapped_key;
            """)
            
            connection.commit()
            cursor.close()
        
        print("Migration rolled back: Removed wrapped_key column from files table")
        
    except Exception as e:
        print(f"Migration rollback failed: {e}")
        raise

if __name__ == "__main__":
    upgrade()
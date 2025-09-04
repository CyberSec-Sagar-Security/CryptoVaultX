"""
Database migration to add encryption support fields to File model
Run this to update the database schema for Phase 5 changes
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models import db
from sqlalchemy import text

def upgrade_database():
    """Add new fields to files table for encryption support"""
    app = create_app()
    
    with app.app_context():
        try:
            # Add is_encrypted column (default TRUE for backward compatibility)
            db.session.execute(text("""
                ALTER TABLE files 
                ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT TRUE;
            """))
            
            # Add folder column (default 'root')
            db.session.execute(text("""
                ALTER TABLE files 
                ADD COLUMN IF NOT EXISTS folder VARCHAR(255) DEFAULT 'root';
            """))
            
            # Make encryption fields nullable (for unencrypted files)
            # Note: PostgreSQL syntax may vary, adjust if needed
            try:
                db.session.execute(text("""
                    ALTER TABLE files 
                    ALTER COLUMN algo DROP NOT NULL;
                """))
            except Exception as e:
                print(f"Note: Could not modify algo column (may already be nullable): {e}")
            
            try:
                db.session.execute(text("""
                    ALTER TABLE files 
                    ALTER COLUMN iv DROP NOT NULL;
                """))
            except Exception as e:
                print(f"Note: Could not modify iv column (may already be nullable): {e}")
            
            try:
                db.session.execute(text("""
                    ALTER TABLE files 
                    ALTER COLUMN tag DROP NOT NULL;
                """))
            except Exception as e:
                print(f"Note: Could not modify tag column (may already be nullable): {e}")
            
            # Update existing records to set is_encrypted = true and folder = 'root'
            db.session.execute(text("""
                UPDATE files 
                SET is_encrypted = TRUE, folder = 'root' 
                WHERE is_encrypted IS NULL OR folder IS NULL;
            """))
            
            db.session.commit()
            print("Database migration completed successfully!")
            
        except Exception as e:
            db.session.rollback()
            print(f"Migration failed: {e}")
            raise

def downgrade_database():
    """Remove the new fields (use with caution)"""
    app = create_app()
    
    with app.app_context():
        try:
            # Make encryption fields required again (reverse migration)
            try:
                db.session.execute(text("""
                    ALTER TABLE files 
                    ALTER COLUMN algo SET NOT NULL;
                """))
            except Exception as e:
                print(f"Note: Could not modify algo column: {e}")
            
            try:
                db.session.execute(text("""
                    ALTER TABLE files 
                    ALTER COLUMN iv SET NOT NULL;
                """))
            except Exception as e:
                print(f"Note: Could not modify iv column: {e}")
            
            try:
                db.session.execute(text("""
                    ALTER TABLE files 
                    ALTER COLUMN tag SET NOT NULL;
                """))
            except Exception as e:
                print(f"Note: Could not modify tag column: {e}")
            
            # Remove new columns
            db.session.execute(text("""
                ALTER TABLE files 
                DROP COLUMN IF EXISTS is_encrypted;
            """))
            
            db.session.execute(text("""
                ALTER TABLE files 
                DROP COLUMN IF EXISTS folder;
            """))
            
            db.session.commit()
            print("Database downgrade completed!")
            
        except Exception as e:
            db.session.rollback()
            print(f"Downgrade failed: {e}")
            raise

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        downgrade_database()
    else:
        upgrade_database()

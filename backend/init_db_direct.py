#!/usr/bin/env python3
"""
Direct database initialization for Phase 4 sharing
"""
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set up environment
os.environ['FLASK_ENV'] = 'development'
os.environ['DATABASE_URL'] = 'postgresql://cryptovault@localhost:5432/cryptovault'

from app import create_app
from models import db

def init_database():
    """Initialize database with empty password"""
    try:
        print("🚀 Initializing database for Phase 4...")
        
        # Create Flask app
        app = create_app()
        
        with app.app_context():
            print("📋 Creating all database tables...")
            
            # Create all tables
            db.create_all()
            
            print("✅ Database tables created successfully!")
            print("📊 Tables created:")
            
            # List all tables
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            for table in tables:
                print(f"   - {table}")
            
            return True
            
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

if __name__ == '__main__':
    success = init_database()
    print("🎉 Database initialization completed!" if success else "💥 Database initialization failed!")
    sys.exit(0 if success else 1)

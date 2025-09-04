#!/usr/bin/env python3
"""
Database initialization and migration script for CryptoVault
"""

import os
import sys
from flask import Flask
from flask_migrate import Migrate, init, migrate, upgrade
from dotenv import load_dotenv

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app import create_app
from models import db

# Load environment variables
load_dotenv()

def init_db():
    """Initialize the database with migrations"""
    app = create_app()
    migrate_obj = Migrate(app, db)
    
    with app.app_context():
        try:
            # Check if migrations directory exists
            migrations_dir = os.path.join(backend_dir, 'migrations')
            
            if not os.path.exists(migrations_dir):
                print("🔄 Initializing migrations...")
                init()
                print("✅ Migrations initialized")
            
            # Create migration
            print("🔄 Creating migration...")
            migrate(message="Add authentication tables")
            print("✅ Migration created")
            
            # Apply migration
            print("🔄 Applying migrations...")
            upgrade()
            print("✅ Database updated successfully")
            
            return True
            
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")
            return False

if __name__ == "__main__":
    success = init_db()
    if success:
        print("\n🎉 Database is ready for Phase 2!")
    else:
        print("\n💥 Database initialization failed!")
        sys.exit(1)

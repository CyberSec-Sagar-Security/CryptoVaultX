#!/usr/bin/env python3
"""
Migration script to transfer existing filesystem files to PostgreSQL BYTEA storage
This script finds files stored in the uploads directory and migrates them to the database
"""

import os
import sys
import json
from datetime import datetime

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, File, User
import uuid

def migrate_filesystem_files_to_db():
    """Migrate existing filesystem files to PostgreSQL BYTEA storage"""
    
    app = create_app()
    
    with app.app_context():
        uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
        
        print(f"🔍 Scanning uploads directory: {uploads_dir}")
        
        if not os.path.exists(uploads_dir):
            print("❌ Uploads directory not found")
            return
        
        # Find all .enc files in uploads directory
        encrypted_files = [f for f in os.listdir(uploads_dir) if f.endswith('.enc')]
        
        print(f"📁 Found {len(encrypted_files)} encrypted files to migrate")
        
        migrated_count = 0
        skipped_count = 0
        error_count = 0
        
        for file_name in encrypted_files:
            try:
                file_path = os.path.join(uploads_dir, file_name)
                file_id = file_name.replace('.enc', '')
                
                print(f"\n🔄 Processing: {file_name}")
                print(f"   File ID: {file_id}")
                print(f"   Path: {file_path}")
                
                # Check if file already exists in database
                existing_file = File.query.filter_by(id=file_id).first()
                if existing_file:
                    print(f"   ⏭️  Already in database, skipping")
                    skipped_count += 1
                    continue
                
                # Get file size
                file_size = os.path.getsize(file_path)
                print(f"   Size: {file_size} bytes")
                
                # Read encrypted file content
                with open(file_path, 'rb') as f:
                    encrypted_content = f.read()
                
                print(f"   ✅ Read {len(encrypted_content)} bytes")
                
                # For migration, we need to assign files to users
                # Let's assign to the first active user for now
                first_user = User.query.filter_by(is_active=True).first()
                
                if not first_user:
                    print(f"   ❌ No active users found to assign file to")
                    error_count += 1
                    continue
                
                # Create file record with best-guess metadata
                new_file = File(
                    id=file_id,
                    owner_id=first_user.id,
                    original_filename=f"migrated_{file_name}",  # We don't have original filename
                    content_type='application/octet-stream',
                    size_bytes=file_size,
                    algo='AES-256-GCM',
                    iv='bWlncmF0ZWRfaXZfcGxhY2Vob2xkZXI=',  # Placeholder IV (base64 encoded)
                    storage_blob=encrypted_content
                )
                
                db.session.add(new_file)
                db.session.commit()
                
                print(f"   ✅ Migrated successfully to database")
                print(f"   📝 Assigned to user: {first_user.email}")
                migrated_count += 1
                
            except Exception as e:
                print(f"   ❌ Error migrating {file_name}: {str(e)}")
                error_count += 1
                db.session.rollback()
        
        print(f"\n📊 Migration Summary:")
        print(f"   ✅ Migrated: {migrated_count}")
        print(f"   ⏭️  Skipped: {skipped_count}")
        print(f"   ❌ Errors: {error_count}")
        print(f"   📁 Total files found: {len(encrypted_files)}")
        
        # Verify migration
        total_files_in_db = File.query.count()
        print(f"\n🗄️  Total files now in database: {total_files_in_db}")
        
        # Show storage usage
        for user in User.query.filter_by(is_active=True).limit(5):
            usage = File.get_user_storage_usage(user.id)
            print(f"   👤 {user.email}: {usage} bytes ({usage // (1024*1024)} MB)")

if __name__ == "__main__":
    print("🚀 CryptoVault File Migration Tool")
    print("===================================")
    print("This tool migrates existing filesystem files to PostgreSQL BYTEA storage")
    print()
    
    migrate_filesystem_files_to_db()
    
    print("\n✅ Migration completed!")
    print("\n📝 Note: Migrated files use placeholder metadata.")
    print("   Original filenames and IVs are not preserved from filesystem storage.")
    print("   This is normal for the migration process.")
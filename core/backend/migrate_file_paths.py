"""
Migration script to fix file storage paths
This script updates existing file records to use the correct storage paths
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models import db, File
import shutil

def migrate_file_paths():
    """Migrate existing file paths to the new CryptoVaultX structure"""
    
    app = create_app('development')
    
    with app.app_context():
        print("🔄 Starting file path migration...")
        
        # Get all files
        files = File.query.all()
        print(f"📋 Found {len(files)} files to check")
        
        # Create directories
        base_dir = "C:\\CryptoVaultX"
        upload_dir = os.path.join(base_dir, "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        
        migrated_count = 0
        error_count = 0
        
        for file_record in files:
            try:
                print(f"\n📄 Processing file: {file_record.filename} (ID: {file_record.id})")
                print(f"   Current path: {file_record.storage_path}")
                
                # Check if file exists at current path
                if os.path.exists(file_record.storage_path):
                    print(f"   ✅ File exists at current path")
                    
                    # Check if it's already in the correct location
                    if file_record.storage_path.startswith("C:\\CryptoVaultX\\uploads"):
                        print(f"   ✅ Already in correct location")
                        continue
                    
                    # Move file to new location
                    new_filename = f"{file_record.id}.enc"
                    new_path = os.path.join(upload_dir, new_filename)
                    
                    if not os.path.exists(new_path):
                        shutil.copy2(file_record.storage_path, new_path)
                        print(f"   📁 Copied to: {new_path}")
                        
                        # Update database record
                        file_record.storage_path = new_path
                        db.session.commit()
                        print(f"   💾 Database updated")
                        
                        migrated_count += 1
                    else:
                        print(f"   ⚠️ File already exists at new location: {new_path}")
                        
                        # Just update the database record
                        file_record.storage_path = new_path
                        db.session.commit()
                        print(f"   💾 Database updated to point to existing file")
                        
                else:
                    print(f"   ❌ File not found at current path: {file_record.storage_path}")
                    
                    # Check if file exists in uploads directory with correct name
                    expected_filename = f"{file_record.id}.enc"
                    expected_path = os.path.join(upload_dir, expected_filename)
                    
                    if os.path.exists(expected_path):
                        print(f"   ✅ Found file at expected location: {expected_path}")
                        file_record.storage_path = expected_path
                        db.session.commit()
                        print(f"   💾 Database updated")
                        migrated_count += 1
                    else:
                        print(f"   ❌ File completely missing - will need re-upload")
                        error_count += 1
                        
            except Exception as e:
                print(f"   ❌ Error processing file {file_record.id}: {str(e)}")
                error_count += 1
                
        print(f"\n📊 Migration Summary:")
        print(f"   ✅ Migrated: {migrated_count}")
        print(f"   ❌ Errors: {error_count}")
        print(f"   📁 Total processed: {len(files)}")
        
        if error_count > 0:
            print(f"\n⚠️ {error_count} files need to be re-uploaded")
        
        print(f"\n🎯 New storage directory: {upload_dir}")

if __name__ == "__main__":
    migrate_file_paths()
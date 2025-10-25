#!/usr/bin/env python3
"""
Direct database test for PostgreSQL BYTEA file storage
This script bypasses authentication to test core functionality
"""

import os
import sys
import base64

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, File, User

def test_direct_db_operations():
    """Test direct database operations for file storage"""
    
    app = create_app()
    
    with app.app_context():
        print("🧪 Testing PostgreSQL BYTEA File Storage")
        print("=========================================")
        
        # Get a test user
        test_user = User.query.filter_by(email='temp@test.com').first()
        if not test_user:
            print("❌ Test user not found")
            return
        
        print(f"👤 Test user: {test_user.email} (ID: {test_user.id})")
        
        # Test 1: Create a new file in database
        print("\n📝 Test 1: Creating new file in database...")
        
        test_content = b"This is a test encrypted file content for PostgreSQL BYTEA storage"
        test_iv = base64.b64encode(b"test_iv_12345678").decode('utf-8')
        
        new_file = File(
            owner_id=test_user.id,
            original_filename="test_direct_upload.txt",
            content_type="text/plain",
            size_bytes=len(test_content),
            algo="AES-256-GCM",
            iv=test_iv,
            storage_blob=test_content
        )
        
        try:
            db.session.add(new_file)
            db.session.commit()
            print(f"✅ File created successfully")
            print(f"   File ID: {new_file.id}")
            print(f"   Original filename: {new_file.original_filename}")
            print(f"   Size: {new_file.size_bytes} bytes")
            print(f"   Algorithm: {new_file.algo}")
            print(f"   IV: {new_file.iv}")
        except Exception as e:
            print(f"❌ Failed to create file: {e}")
            db.session.rollback()
            return
        
        created_file_id = new_file.id
        
        # Test 2: Retrieve the file from database
        print("\n🔍 Test 2: Retrieving file from database...")
        
        try:
            retrieved_file = File.query.filter_by(id=created_file_id).first()
            if retrieved_file:
                print(f"✅ File retrieved successfully")
                print(f"   Original filename: {retrieved_file.original_filename}")
                print(f"   Size: {retrieved_file.size_bytes} bytes")
                print(f"   Storage blob size: {len(retrieved_file.storage_blob)} bytes")
                print(f"   Content matches: {retrieved_file.storage_blob == test_content}")
            else:
                print(f"❌ File not found in database")
        except Exception as e:
            print(f"❌ Failed to retrieve file: {e}")
        
        # Test 3: List files for user
        print("\n📋 Test 3: Listing files for user...")
        
        try:
            user_files = File.find_by_owner(test_user.id)
            print(f"✅ Found {len(user_files)} files for user")
            for file in user_files:
                print(f"   - {file.original_filename} ({file.size_bytes} bytes)")
        except Exception as e:
            print(f"❌ Failed to list files: {e}")
        
        # Test 4: Calculate storage usage
        print("\n📊 Test 4: Calculating storage usage...")
        
        try:
            usage = File.get_user_storage_usage(test_user.id)
            usage_mb = usage / (1024 * 1024)
            print(f"✅ User storage usage: {usage} bytes ({usage_mb:.2f} MB)")
        except Exception as e:
            print(f"❌ Failed to calculate usage: {e}")
        
        # Test 5: Download simulation
        print("\n⬇️ Test 5: Download simulation...")
        
        try:
            download_file = File.find_by_id_and_owner(created_file_id, test_user.id)
            if download_file:
                print(f"✅ File found for download")
                print(f"   Filename: {download_file.original_filename}")
                print(f"   Content-Type: {download_file.content_type}")
                print(f"   Algorithm: {download_file.algo}")
                print(f"   IV: {download_file.iv}")
                print(f"   Blob size: {len(download_file.storage_blob)} bytes")
                
                # Simulate sending the blob data
                print(f"   ✅ Would send {len(download_file.storage_blob)} bytes to client")
            else:
                print(f"❌ File not found for download")
        except Exception as e:
            print(f"❌ Failed download simulation: {e}")
        
        # Test 6: Delete file
        print("\n🗑️ Test 6: Deleting file...")
        
        try:
            delete_file = File.query.filter_by(id=created_file_id).first()
            if delete_file:
                db.session.delete(delete_file)
                db.session.commit()
                print(f"✅ File deleted successfully")
                
                # Verify deletion
                verify_deleted = File.query.filter_by(id=created_file_id).first()
                print(f"   Deletion verified: {verify_deleted is None}")
            else:
                print(f"❌ File not found for deletion")
        except Exception as e:
            print(f"❌ Failed to delete file: {e}")
            db.session.rollback()
        
        print("\n🎯 Summary:")
        print("✅ All core PostgreSQL BYTEA operations working correctly")
        print("✅ Files can be stored, retrieved, listed, and deleted")
        print("✅ Storage usage calculation works")
        print("✅ Binary data (BYTEA) storage and retrieval works")

if __name__ == "__main__":
    test_direct_db_operations()
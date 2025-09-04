#!/usr/bin/env python3
"""
Test script for CryptoVault Phase 3: File Management
Tests file upload, download, list, and delete functionality
"""

import requests
import json
import sys
import time
import base64
import os
import tempfile

# Test configuration
BASE_URL = "http://localhost:5000"
TEST_USER = {
    "name": "File Test User",
    "email": f"filetest{int(time.time())}@cryptovault.test",
    "password": "SecurePass123!"
}

# Global token storage
access_token = None

def create_test_file(content="This is a test file for CryptoVault Phase 3!", filename="test.txt"):
    """Create a temporary test file"""
    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, filename)
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    return file_path

def encode_base64(data):
    """Helper to encode data as base64"""
    if isinstance(data, str):
        data = data.encode('utf-8')
    return base64.b64encode(data).decode('utf-8')

def setup_user_and_login():
    """Create user and login to get access token"""
    global access_token
    
    print("🔐 Setting up test user...")
    
    # Register user
    response = requests.post(f"{BASE_URL}/api/auth/register", json=TEST_USER)
    if response.status_code != 201:
        print(f"❌ User registration failed: {response.text}")
        return False
    
    # Login user
    login_data = {"email": TEST_USER["email"], "password": TEST_USER["password"]}
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"❌ User login failed: {response.text}")
        return False
    
    access_token = response.json().get('access_token')
    if not access_token:
        print("❌ No access token received")
        return False
    
    print(f"✅ User setup complete: {TEST_USER['name']}")
    return True

def test_file_upload():
    """Test file upload functionality"""
    print("\n📁 Testing file upload...")
    
    # Create test file
    test_content = "This is encrypted content for CryptoVault!"
    test_file_path = create_test_file(test_content, "encrypted_test.enc")
    
    try:
        # Simulate encryption metadata
        metadata = {
            "filename": "secret_document.txt",
            "iv": encode_base64("test_iv_12345678"),  # 16 bytes for AES
            "tag": encode_base64("test_auth_tag_16"),  # 16 bytes for GCM tag
            "algo": "AES-256-GCM",
            "content_type": "text/plain"
        }
        
        headers = {"Authorization": f"Bearer {access_token}"}
        
        with open(test_file_path, 'rb') as f:
            files = {'file': ('encrypted_test.enc', f, 'application/octet-stream')}
            data = {'metadata': json.dumps(metadata)}
            
            response = requests.post(f"{BASE_URL}/api/files", 
                                   headers=headers, files=files, data=data)
        
        if response.status_code == 201:
            data = response.json()
            file_id = data.get('file_id')
            print(f"✅ File uploaded successfully!")
            print(f"   File ID: {file_id}")
            print(f"   Filename: {data.get('filename')}")
            print(f"   Size: {data.get('size')} bytes")
            return file_id
        else:
            print(f"❌ File upload failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ File upload exception: {e}")
        return None
    finally:
        # Clean up test file
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

def test_file_list():
    """Test file listing functionality"""
    print("\n📋 Testing file list...")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/api/files", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        files = data.get('files', [])
        pagination = data.get('pagination', {})
        
        print(f"✅ File list retrieved successfully!")
        print(f"   Total files: {pagination.get('total', 0)}")
        print(f"   Files on this page: {len(files)}")
        
        for file in files:
            print(f"   - {file.get('filename')} ({file.get('size')} bytes)")
        
        return files
    else:
        print(f"❌ File list failed: {response.text}")
        return []

def test_file_info(file_id):
    """Test getting file info"""
    print(f"\n📊 Testing file info for {file_id}...")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/api/files/{file_id}/info", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        file_info = data.get('file', {})
        
        print(f"✅ File info retrieved successfully!")
        print(f"   Filename: {file_info.get('filename')}")
        print(f"   Size: {file_info.get('size')} bytes")
        print(f"   Algorithm: {file_info.get('algo')}")
        print(f"   IV: {file_info.get('iv')[:20]}...")
        print(f"   Tag: {file_info.get('tag')[:20]}...")
        
        return True
    else:
        print(f"❌ File info failed: {response.text}")
        return False

def test_file_download(file_id):
    """Test file download functionality"""
    print(f"\n⬇️  Testing file download for {file_id}...")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/api/files/{file_id}", headers=headers)
    
    if response.status_code == 200:
        # Check if we got file content
        content_length = len(response.content)
        
        # Check metadata in headers
        metadata_header = response.headers.get('X-File-Metadata')
        if metadata_header:
            try:
                metadata = json.loads(metadata_header)
                print(f"✅ File downloaded successfully!")
                print(f"   Content length: {content_length} bytes")
                print(f"   Original filename: {metadata.get('filename')}")
                print(f"   IV from header: {metadata.get('iv')[:20]}...")
                print(f"   Tag from header: {metadata.get('tag')[:20]}...")
                return True
            except json.JSONDecodeError:
                print("⚠️  File downloaded but metadata header invalid")
                return True
        else:
            print(f"✅ File downloaded successfully! ({content_length} bytes)")
            return True
    else:
        print(f"❌ File download failed: {response.text}")
        return False

def test_file_stats():
    """Test file statistics"""
    print("\n📈 Testing file statistics...")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/api/files/stats", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        stats = data.get('stats', {})
        
        print(f"✅ File stats retrieved successfully!")
        print(f"   Total files: {stats.get('total_files')}")
        print(f"   Total size: {stats.get('total_size_mb')} MB")
        print(f"   Max file size: {stats.get('max_file_size_mb')} MB")
        
        return True
    else:
        print(f"❌ File stats failed: {response.text}")
        return False

def test_file_delete(file_id):
    """Test file deletion"""
    print(f"\n🗑️  Testing file deletion for {file_id}...")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.delete(f"{BASE_URL}/api/files/{file_id}", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ File deleted successfully!")
        print(f"   Storage deleted: {data.get('storage_deleted')}")
        return True
    else:
        print(f"❌ File deletion failed: {response.text}")
        return False

def test_access_control():
    """Test access control (trying to access non-existent or unauthorized files)"""
    print("\n🔒 Testing access control...")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    fake_file_id = "00000000-0000-0000-0000-000000000000"
    
    # Try to download non-existent file
    response = requests.get(f"{BASE_URL}/api/files/{fake_file_id}", headers=headers)
    if response.status_code == 404:
        print("✅ Access control working: Non-existent file properly rejected")
    else:
        print(f"❌ Access control failed: Got {response.status_code} instead of 404")
        return False
    
    # Try to delete non-existent file
    response = requests.delete(f"{BASE_URL}/api/files/{fake_file_id}", headers=headers)
    if response.status_code == 404:
        print("✅ Access control working: Non-existent file deletion properly rejected")
    else:
        print(f"❌ Access control failed: Got {response.status_code} instead of 404")
        return False
    
    # Try to access without token
    response = requests.get(f"{BASE_URL}/api/files")
    if response.status_code == 401:
        print("✅ Access control working: Unauthorized access properly rejected")
    else:
        print(f"❌ Access control failed: Got {response.status_code} instead of 401")
        return False
    
    return True

def main():
    """Run all Phase 3 tests"""
    print("🚀 CryptoVault Phase 3 - Testing File Management System")
    print("=" * 60)
    
    # Setup
    if not setup_user_and_login():
        print("\n💥 Setup failed!")
        sys.exit(1)
    
    # Test file operations
    tests = []
    
    # Test upload
    file_id = test_file_upload()
    if not file_id:
        print("\n💥 File upload failed!")
        sys.exit(1)
    
    # Test other operations
    tests.append(("File List", test_file_list))
    tests.append(("File Info", lambda: test_file_info(file_id)))
    tests.append(("File Download", lambda: test_file_download(file_id)))
    tests.append(("File Stats", test_file_stats))
    tests.append(("Access Control", test_access_control))
    tests.append(("File Delete", lambda: test_file_delete(file_id)))
    
    # Run tests
    results = [("File Upload", True)]  # Upload already passed
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 Test Summary:")
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 Phase 3 file management system is working correctly!")
        print("\nNext steps for Phase 4:")
        print("   - Implement file sharing between users")
        print("   - Add permission management")
        print("   - Create shared file access controls")
        
        print("\n📝 Example usage:")
        print("# Upload encrypted file:")
        print(f"curl -X POST {BASE_URL}/api/files \\")
        print("  -H 'Authorization: Bearer YOUR_TOKEN' \\")
        print("  -F 'file=@encrypted_file.enc' \\")
        print("  -F 'metadata={\"filename\":\"doc.txt\",\"iv\":\"...\",\"tag\":\"...\"};type=application/json'")
        
        print("\n# List files:")
        print(f"curl -H 'Authorization: Bearer YOUR_TOKEN' {BASE_URL}/api/files")
        
        print("\n# Download file:")
        print(f"curl -H 'Authorization: Bearer YOUR_TOKEN' {BASE_URL}/api/files/FILE_ID")
        
        sys.exit(0)
    else:
        print(f"\n💥 {total - passed} tests failed. Please check the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()

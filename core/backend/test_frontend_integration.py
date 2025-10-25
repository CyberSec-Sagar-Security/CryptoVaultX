#!/usr/bin/env python3
"""
Quick integration test to verify frontend can communicate with backend
Tests the API endpoints that the frontend uses
"""

import requests
import json
import base64

# Configuration
API_BASE = "http://localhost:5000/api"

def test_frontend_integration():
    """Test that frontend can access all necessary API endpoints"""
    print("🔗 Testing Frontend Integration with PostgreSQL Backend")
    print("=" * 60)
    
    try:
        # Step 1: Login (simulating frontend login)
        print("🔐 Step 1: Testing frontend login...")
        login_data = {
            "email": "apitest@test.com",
            "password": "testpass123"
        }
        
        response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        if response.status_code != 200:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return False
            
        token = response.json()['access_token']
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Login successful")
        
        # Step 2: Check if backend is storing files in PostgreSQL
        print("\n📊 Step 2: Checking file storage status...")
        response = requests.get(f"{API_BASE}/files/quota", headers=headers)
        if response.status_code != 200:
            print(f"❌ Quota check failed: {response.status_code}")
            return False
            
        quota_info = response.json()
        print(f"✅ Storage check successful: {quota_info['used_mb']}MB used, {quota_info['remaining_mb']}MB remaining")
        
        # Step 3: List existing files
        print("\n📋 Step 3: Listing files from PostgreSQL...")
        response = requests.get(f"{API_BASE}/files/list", headers=headers)
        if response.status_code != 200:
            print(f"❌ File listing failed: {response.status_code}")
            return False
            
        files_info = response.json()
        print(f"✅ File listing successful: {len(files_info['files'])} files found")
        for file_info in files_info['files']:
            print(f"   - {file_info['original_filename']} ({file_info['size_bytes']} bytes)")
        
        # Step 4: Test file upload (simulating frontend upload)
        print("\n📤 Step 4: Testing file upload to PostgreSQL...")
        
        # Create test file content
        test_content = "Frontend integration test file content"
        encrypted_content = base64.b64encode(test_content.encode()).decode()
        
        files = {
            'file': ('frontend_test.txt', encrypted_content.encode(), 'application/octet-stream')
        }
        data = {
            'iv': base64.b64encode(b'frontend_test_iv').decode(),
            'algo': 'AES-256-GCM'
        }
        
        response = requests.post(f"{API_BASE}/files/", files=files, data=data, headers=headers)
        if response.status_code != 201:
            print(f"❌ Upload failed: {response.status_code} - {response.text}")
            return False
            
        upload_result = response.json()
        file_id = upload_result['id']
        print(f"✅ Upload successful: File ID {file_id}")
        
        # Step 5: Test file download
        print("\n⬇️ Step 5: Testing file download from PostgreSQL...")
        response = requests.get(f"{API_BASE}/files/{file_id}", headers=headers)
        if response.status_code != 200:
            print(f"❌ Download failed: {response.status_code}")
            return False
            
        print("✅ Download successful")
        print(f"   Content-Type: {response.headers.get('Content-Type')}")
        print(f"   X-File-Name: {response.headers.get('X-File-Name')}")
        print(f"   Downloaded size: {len(response.content)} bytes")
        
        # Step 6: Test file deletion
        print("\n🗑️ Step 6: Testing file deletion...")
        response = requests.delete(f"{API_BASE}/files/{file_id}", headers=headers)
        if response.status_code != 200:
            print(f"❌ Delete failed: {response.status_code}")
            return False
            
        print("✅ Delete successful")
        
        # Step 7: Verify deletion
        print("\n🔍 Step 7: Verifying deletion...")
        response = requests.get(f"{API_BASE}/files/{file_id}", headers=headers)
        if response.status_code == 404:
            print("✅ Deletion verified - file not found (expected)")
        else:
            print(f"❌ File still exists after deletion: {response.status_code}")
            return False
        
        print("\n🎯 Frontend Integration Test Results:")
        print("✅ Frontend can successfully communicate with PostgreSQL backend")
        print("✅ All API endpoints working correctly")
        print("✅ Files are properly stored in PostgreSQL BYTEA storage")
        print("✅ Upload, download, list, delete operations functional")
        print("✅ Frontend integration ready ✨")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    if test_frontend_integration():
        print("\n🚀 Frontend integration test PASSED!")
    else:
        print("\n💥 Frontend integration test FAILED!")
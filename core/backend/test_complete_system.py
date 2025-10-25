#!/usr/bin/env python3
"""
Complete system test for CryptoVault PostgreSQL implementation
"""

import sys
import os
import requests
import json
import base64
from datetime import datetime

def test_database_connection():
    """Test database connection and stats"""
    print("🔍 Testing Database Connection...")
    try:
        # Import Flask app and models
        sys.path.append(os.path.dirname(__file__))
        from app import create_app
        from models import db, User, File
        
        app = create_app()
        with app.app_context():
            # Test basic queries
            user_count = User.query.count()
            file_count = File.query.count()
            
            print(f"✅ Database connection successful")
            print(f"📊 Users in database: {user_count}")
            print(f"📊 Files in database: {file_count}")
            
            # Test a specific query
            test_user = User.query.filter_by(email='apitest@test.com').first()
            if test_user:
                print(f"✅ Test user found: {test_user.username}")
            else:
                print("⚠️ Test user not found")
            
            return True
    except Exception as e:
        print(f"❌ Database test failed: {str(e)}")
        return False

def test_backend_server():
    """Test if backend server is running"""
    print("\n🌐 Testing Backend Server...")
    try:
        response = requests.get("http://localhost:5000/api/files/quota", timeout=5)
        if response.status_code == 401:  # Expected - need auth
            print("✅ Backend server is running (auth required as expected)")
            return True
        elif response.status_code == 200:
            print("✅ Backend server is running")
            return True
        else:
            print(f"⚠️ Backend server responding with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend server not running or not accessible")
        return False
    except Exception as e:
        print(f"❌ Backend test failed: {str(e)}")
        return False

def test_authentication():
    """Test authentication system"""
    print("\n🔐 Testing Authentication...")
    try:
        login_data = {
            "email": "apitest@test.com", 
            "password": "testpass123"
        }
        
        response = requests.post("http://localhost:5000/api/auth/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            print("✅ Authentication successful")
            data = response.json()
            if 'access_token' in data:
                print("✅ JWT token received")
                return data['access_token']
            else:
                print("⚠️ Login successful but no token in response")
                return None
        else:
            print(f"❌ Authentication failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Authentication test failed: {str(e)}")
        return None

def test_file_operations(token):
    """Test file upload, download, list, delete operations"""
    print("\n📁 Testing File Operations...")
    if not token:
        print("❌ No authentication token - skipping file operations")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    success_count = 0
    
    try:
        # Test 1: Check quota
        print("  📊 Testing quota check...")
        response = requests.get("http://localhost:5000/api/files/quota", headers=headers)
        if response.status_code == 200:
            quota_info = response.json()
            print(f"  ✅ Quota: {quota_info.get('used_mb', 0)}MB used, {quota_info.get('remaining_mb', 600)}MB remaining")
            success_count += 1
        else:
            print(f"  ❌ Quota check failed: {response.status_code}")
        
        # Test 2: Upload file
        print("  📤 Testing file upload...")
        test_content = f"Test file created at {datetime.now()}"
        encrypted_content = base64.b64encode(test_content.encode()).decode()
        
        files = {
            'file': ('system_test.txt', encrypted_content.encode(), 'application/octet-stream')
        }
        data = {
            'iv': base64.b64encode(b'system_test_iv_12').decode(),
            'algo': 'AES-256-GCM'
        }
        
        response = requests.post("http://localhost:5000/api/files/", files=files, data=data, headers=headers)
        if response.status_code == 201:
            upload_result = response.json()
            file_id = upload_result['id']
            print(f"  ✅ Upload successful: File ID {file_id}")
            success_count += 1
        else:
            print(f"  ❌ Upload failed: {response.status_code} - {response.text}")
            return success_count >= 2
        
        # Test 3: List files
        print("  📋 Testing file listing...")
        response = requests.get("http://localhost:5000/api/files/list", headers=headers)
        if response.status_code == 200:
            files_info = response.json()
            print(f"  ✅ File listing successful: {len(files_info.get('files', []))} files found")
            success_count += 1
        else:
            print(f"  ❌ File listing failed: {response.status_code}")
        
        # Test 4: Download file
        print("  ⬇️ Testing file download...")
        response = requests.get(f"http://localhost:5000/api/files/{file_id}", headers=headers)
        if response.status_code == 200:
            print(f"  ✅ Download successful: {len(response.content)} bytes")
            success_count += 1
        else:
            print(f"  ❌ Download failed: {response.status_code}")
        
        # Test 5: Delete file
        print("  🗑️ Testing file deletion...")
        response = requests.delete(f"http://localhost:5000/api/files/{file_id}", headers=headers)
        if response.status_code == 200:
            print("  ✅ Delete successful")
            success_count += 1
        else:
            print(f"  ❌ Delete failed: {response.status_code}")
        
        # Test 6: Verify deletion
        print("  🔍 Verifying deletion...")
        response = requests.get(f"http://localhost:5000/api/files/{file_id}", headers=headers)
        if response.status_code == 404:
            print("  ✅ Deletion verified - file not found (expected)")
            success_count += 1
        else:
            print(f"  ⚠️ File still exists after deletion: {response.status_code}")
        
        return success_count >= 5  # At least 5 out of 6 tests should pass
        
    except Exception as e:
        print(f"❌ File operations test failed: {str(e)}")
        return False

def main():
    """Run complete system test"""
    print("🧪 CryptoVault System Test")
    print("=" * 50)
    
    results = {
        'database': False,
        'server': False,
        'auth': False,
        'files': False
    }
    
    # Test 1: Database
    results['database'] = test_database_connection()
    
    # Test 2: Backend server
    results['server'] = test_backend_server()
    
    # Test 3: Authentication
    token = test_authentication()
    results['auth'] = token is not None
    
    # Test 4: File operations
    if results['auth']:
        results['files'] = test_file_operations(token)
    
    # Summary
    print("\n" + "=" * 50)
    print("🎯 Test Results Summary:")
    print(f"  Database Connection: {'✅ PASS' if results['database'] else '❌ FAIL'}")
    print(f"  Backend Server: {'✅ PASS' if results['server'] else '❌ FAIL'}")
    print(f"  Authentication: {'✅ PASS' if results['auth'] else '❌ FAIL'}")
    print(f"  File Operations: {'✅ PASS' if results['files'] else '❌ FAIL'}")
    
    all_passed = all(results.values())
    print(f"\n🚀 Overall Status: {'✅ ALL TESTS PASSED' if all_passed else '⚠️ SOME TESTS FAILED'}")
    
    if all_passed:
        print("\n🎉 System is ready for frontend and backend launch!")
    else:
        print("\n🔧 System needs attention before launching services.")
    
    return all_passed

if __name__ == "__main__":
    main()
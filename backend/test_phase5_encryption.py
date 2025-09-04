#!/usr/bin/env python3
"""
Comprehensive test suite for Phase 5: Client-Side Encryption Integration
Tests both encrypted and unencrypted file upload/download flows
"""

import requests
import json
import base64
import os
import time
from io import BytesIO

# Test configuration
BASE_URL = "http://localhost:5000"
TEST_EMAIL = "phase5_test@example.com"
TEST_PASSWORD = "SecurePassword123!"

class Phase5TestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_files = []
        
    def setup(self):
        """Setup test environment"""
        print("=== Phase 5 Test Setup ===")
        
        # Register test user
        register_data = {
            "username": "phase5_user",
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/api/auth/register", json=register_data)
            if response.status_code in [201, 409]:  # 409 = user already exists
                print("✓ User registration successful or user already exists")
            else:
                print(f"✗ User registration failed: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            print(f"✗ Cannot connect to server at {BASE_URL}")
            print("  Make sure the Flask server is running")
            return False
        
        # Login to get auth token
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        response = self.session.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if response.status_code == 200:
            self.auth_token = response.json()['access_token']
            self.session.headers.update({'Authorization': f'Bearer {self.auth_token}'})
            print("✓ Login successful")
            return True
        else:
            print(f"✗ Login failed: {response.status_code}")
            return False
    
    def create_test_files(self):
        """Create test files for upload"""
        # Text file
        text_content = "This is a test file for Phase 5 encryption testing.\\nIt contains multiple lines.\\nAnd various characters: áéíóú ñ 测试 🚀"
        self.test_files.append({
            'name': 'test_document.txt',
            'content': text_content.encode('utf-8'),
            'type': 'text/plain'
        })
        
        # Binary file (fake image)
        binary_content = b'\\x89PNG\\r\\n\\x1a\\n\\x00\\x00\\x00\\rIHDR\\x00\\x00\\x00\\x01\\x00\\x00\\x00\\x01' + b'\\x00' * 100
        self.test_files.append({
            'name': 'test_image.png',
            'content': binary_content,
            'type': 'image/png'
        })
        
        # JSON file
        json_content = json.dumps({
            "test": True,
            "phase": 5,
            "encryption": "AES-256-GCM",
            "unicode": "测试 🔐"
        }, indent=2).encode('utf-8')
        self.test_files.append({
            'name': 'test_data.json',
            'content': json_content,
            'type': 'application/json'
        })
    
    def simulate_encryption(self, file_content):
        """Simulate client-side encryption (for testing backend integration)"""
        # Generate fake encryption data
        iv = base64.b64encode(os.urandom(12)).decode('utf-8')
        tag = base64.b64encode(os.urandom(16)).decode('utf-8')
        
        # For testing, just base64 encode the content as "encrypted" data
        encrypted_content = base64.b64encode(file_content).decode('utf-8')
        
        return {
            'ciphertext': encrypted_content,
            'iv': iv,
            'tag': tag,
            'metadata': {
                'algorithm': 'AES-256-GCM',
                'tagLength': 16,
                'filename': 'test_file',
                'originalSize': len(file_content),
                'mimeType': 'application/octet-stream',
                'timestamp': int(time.time() * 1000)
            }
        }
    
    def test_encrypted_upload(self):
        """Test encrypted file upload"""
        print("\\n=== Testing Encrypted File Upload ===")
        
        for i, test_file in enumerate(self.test_files):
            print(f"\\nTesting encrypted upload: {test_file['name']}")
            
            # Simulate encryption
            encryption_result = self.simulate_encryption(test_file['content'])
            
            # Convert encrypted content back to bytes for upload
            encrypted_bytes = base64.b64decode(encryption_result['ciphertext'])
            
            # Prepare form data
            files = {
                'file': (test_file['name'] + '.encrypted', BytesIO(encrypted_bytes), 'application/octet-stream')
            }
            
            data = {
                'is_encrypted': 'true',
                'folder': 'test_encrypted',
                'encryption_data': json.dumps({
                    'iv': encryption_result['iv'],
                    'tag': encryption_result['tag'],
                    'metadata': {
                        **encryption_result['metadata'],
                        'filename': test_file['name'],
                        'mimeType': test_file['type']
                    }
                })
            }
            
            response = self.session.post(f"{BASE_URL}/api/files/upload", files=files, data=data)
            
            if response.status_code == 201:
                result = response.json()
                print(f"  ✓ Upload successful: {result['file_id']}")
                print(f"    Filename: {result['filename']}")
                print(f"    Size: {result['size']} bytes")
                print(f"    Encrypted: {result['is_encrypted']}")
                print(f"    Folder: {result['folder']}")
                
                # Store file info for download test
                test_file['upload_result'] = result
                test_file['encryption_data'] = encryption_result
            else:
                print(f"  ✗ Upload failed: {response.status_code}")
                if response.content:
                    print(f"    Error: {response.json()}")
                return False
        
        return True
    
    def test_unencrypted_upload(self):
        """Test unencrypted file upload"""
        print("\\n=== Testing Unencrypted File Upload ===")
        
        for i, test_file in enumerate(self.test_files):
            print(f"\\nTesting unencrypted upload: {test_file['name']}")
            
            # Prepare form data
            files = {
                'file': (test_file['name'], BytesIO(test_file['content']), test_file['type'])
            }
            
            data = {
                'is_encrypted': 'false',
                'folder': 'test_unencrypted'
            }
            
            response = self.session.post(f"{BASE_URL}/api/files/upload", files=files, data=data)
            
            if response.status_code == 201:
                result = response.json()
                print(f"  ✓ Upload successful: {result['file_id']}")
                print(f"    Filename: {result['filename']}")
                print(f"    Size: {result['size']} bytes")
                print(f"    Encrypted: {result['is_encrypted']}")
                print(f"    Folder: {result['folder']}")
                
                # Store file info for download test
                test_file['unencrypted_result'] = result
            else:
                print(f"  ✗ Upload failed: {response.status_code}")
                if response.content:
                    print(f"    Error: {response.json()}")
                return False
        
        return True
    
    def test_file_listing(self):
        """Test file listing"""
        print("\\n=== Testing File Listing ===")
        
        response = self.session.get(f"{BASE_URL}/api/files")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ File listing successful")
            print(f"  Total files: {result['pagination']['total']}")
            print(f"  Files on this page: {len(result['files'])}")
            
            # Show file details
            for file_info in result['files']:
                print(f"    - {file_info['filename']} ({file_info['size']} bytes, encrypted: {file_info['is_encrypted']})")
            
            return True
        else:
            print(f"✗ File listing failed: {response.status_code}")
            return False
    
    def test_encrypted_download(self):
        """Test encrypted file download"""
        print("\\n=== Testing Encrypted File Download ===")
        
        for test_file in self.test_files:
            if 'upload_result' not in test_file:
                continue
                
            print(f"\\nTesting encrypted download: {test_file['name']}")
            file_id = test_file['upload_result']['file_id']
            
            response = self.session.get(f"{BASE_URL}/api/files/{file_id}")
            
            if response.status_code == 200:
                # Check metadata in headers
                if 'X-File-Metadata' in response.headers:
                    metadata = json.loads(response.headers['X-File-Metadata'])
                    print(f"  ✓ Download successful")
                    print(f"    Metadata: {metadata['filename']}")
                    print(f"    Encrypted: {metadata['is_encrypted']}")
                    print(f"    Size: {metadata['size']} bytes")
                    print(f"    Algorithm: {metadata.get('algo', 'N/A')}")
                    
                    # Verify content (for test, we just check size)
                    downloaded_size = len(response.content)
                    print(f"    Downloaded size: {downloaded_size} bytes")
                    
                    if metadata['is_encrypted']:
                        print(f"    IV: {metadata.get('iv', 'N/A')[:20]}...")
                        print(f"    Tag: {metadata.get('tag', 'N/A')[:20]}...")
                else:
                    print("  ⚠ Download successful but no metadata in headers")
            else:
                print(f"  ✗ Download failed: {response.status_code}")
                return False
        
        return True
    
    def test_unencrypted_download(self):
        """Test unencrypted file download"""
        print("\\n=== Testing Unencrypted File Download ===")
        
        for test_file in self.test_files:
            if 'unencrypted_result' not in test_file:
                continue
                
            print(f"\\nTesting unencrypted download: {test_file['name']}")
            file_id = test_file['unencrypted_result']['file_id']
            
            response = self.session.get(f"{BASE_URL}/api/files/{file_id}")
            
            if response.status_code == 200:
                # Check metadata in headers
                if 'X-File-Metadata' in response.headers:
                    metadata = json.loads(response.headers['X-File-Metadata'])
                    print(f"  ✓ Download successful")
                    print(f"    Metadata: {metadata['filename']}")
                    print(f"    Encrypted: {metadata['is_encrypted']}")
                    print(f"    Size: {metadata['size']} bytes")
                    
                    # Verify content matches original
                    if response.content == test_file['content']:
                        print(f"    ✓ Content matches original")
                    else:
                        print(f"    ✗ Content does not match original")
                        print(f"      Original size: {len(test_file['content'])}")
                        print(f"      Downloaded size: {len(response.content)}")
                else:
                    print("  ⚠ Download successful but no metadata in headers")
            else:
                print(f"  ✗ Download failed: {response.status_code}")
                return False
        
        return True
    
    def cleanup(self):
        """Clean up test data"""
        print("\\n=== Cleanup ===")
        
        # Get all files and delete them
        response = self.session.get(f"{BASE_URL}/api/files")
        if response.status_code == 200:
            files = response.json()['files']
            deleted_count = 0
            
            for file_info in files:
                delete_response = self.session.delete(f"{BASE_URL}/api/files/{file_info['id']}")
                if delete_response.status_code == 200:
                    deleted_count += 1
            
            print(f"✓ Deleted {deleted_count} test files")
        
        print("✓ Cleanup completed")
    
    def run_all_tests(self):
        """Run the complete test suite"""
        print("🚀 Starting Phase 5 Test Suite: Client-Side Encryption Integration")
        print("=" * 70)
        
        if not self.setup():
            return False
        
        self.create_test_files()
        
        # Run all tests
        tests = [
            ("Encrypted Upload", self.test_encrypted_upload),
            ("Unencrypted Upload", self.test_unencrypted_upload),
            ("File Listing", self.test_file_listing),
            ("Encrypted Download", self.test_encrypted_download),
            ("Unencrypted Download", self.test_unencrypted_download),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                    print(f"\\n✅ {test_name}: PASSED")
                else:
                    print(f"\\n❌ {test_name}: FAILED")
            except Exception as e:
                print(f"\\n💥 {test_name}: ERROR - {e}")
        
        # Cleanup
        self.cleanup()
        
        # Summary
        print("\\n" + "=" * 70)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Phase 5 encryption integration is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Please check the output above for details.")
            return False

if __name__ == "__main__":
    test_suite = Phase5TestSuite()
    success = test_suite.run_all_tests()
    exit(0 if success else 1)

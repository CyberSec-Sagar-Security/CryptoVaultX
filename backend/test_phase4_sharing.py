#!/usr/bin/env python3
"""
Test script for Phase 4: File Sharing Module
Tests all sharing functionality including access control
"""
import requests
import json
import tempfile
import base64
import os
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
TEST_EMAIL_1 = "alice@example.com"
TEST_EMAIL_2 = "bob@example.com"
TEST_PASSWORD = "SecurePassword123!"

class ShareTestRunner:
    def __init__(self):
        self.session = requests.Session()
        self.alice_token = None
        self.bob_token = None
        self.alice_user_id = None
        self.bob_user_id = None
        self.test_file_id = None
        self.passed = 0
        self.failed = 0
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
    
    def assert_test(self, condition, test_name, message=""):
        if condition:
            self.passed += 1
            self.log(f"✅ {test_name}", "PASS")
        else:
            self.failed += 1
            self.log(f"❌ {test_name} - {message}", "FAIL")
    
    def test_user_registration(self):
        """Test user registration for Alice and Bob"""
        self.log("Testing user registration...")
        
        # Register Alice
        alice_data = {
            "name": "Alice Smith",
            "email": TEST_EMAIL_1,
            "password": TEST_PASSWORD
        }
        
        response = self.session.post(f"{BASE_URL}/api/auth/register", json=alice_data)
        if response.status_code == 409:
            # User already exists, skip test
            self.log("Alice already exists, skipping registration", "INFO")
            self.passed += 1
        else:
            self.assert_test(
                response.status_code == 201,
                "Alice registration",
                f"Expected 201, got {response.status_code}"
            )
        
        if response.status_code == 201:
            self.alice_user_id = response.json().get('user', {}).get('id')
        
        # Register Bob
        bob_data = {
            "name": "Bob Johnson",
            "email": TEST_EMAIL_2,
            "password": TEST_PASSWORD
        }
        
        response = self.session.post(f"{BASE_URL}/api/auth/register", json=bob_data)
        if response.status_code == 409:
            # User already exists, skip test
            self.log("Bob already exists, skipping registration", "INFO")
            self.passed += 1
        else:
            self.assert_test(
                response.status_code == 201,
                "Bob registration",
                f"Expected 201, got {response.status_code}"
            )
        
        if response.status_code == 201:
            self.bob_user_id = response.json().get('user', {}).get('id')
    
    def test_user_login(self):
        """Test user login for Alice and Bob"""
        self.log("Testing user login...")
        
        # Login Alice
        alice_login = {
            "email": TEST_EMAIL_1,
            "password": TEST_PASSWORD
        }
        
        response = self.session.post(f"{BASE_URL}/api/auth/login", json=alice_login)
        self.assert_test(
            response.status_code == 200,
            "Alice login",
            f"Expected 200, got {response.status_code}"
        )
        
        if response.status_code == 200:
            self.alice_token = response.json().get('access_token')
            # Get user ID from the response
            user_data = response.json().get('user', {})
            if user_data:
                self.alice_user_id = user_data.get('id')
        
        # Login Bob
        bob_login = {
            "email": TEST_EMAIL_2,
            "password": TEST_PASSWORD
        }
        
        response = self.session.post(f"{BASE_URL}/api/auth/login", json=bob_login)
        self.assert_test(
            response.status_code == 200,
            "Bob login",
            f"Expected 200, got {response.status_code}"
        )
        
        if response.status_code == 200:
            self.bob_token = response.json().get('access_token')
            # Get user ID from the response
            user_data = response.json().get('user', {})
            if user_data:
                self.bob_user_id = user_data.get('id')
    
    def test_file_upload(self):
        """Test file upload by Alice"""
        self.log("Testing file upload...")
        
        # Create a test file
        test_content = b"This is a test file for sharing functionality!"
        test_filename = "test_sharing_file.txt"
        
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        
        # Create encrypted file data
        import base64
        encrypted_content = base64.b64encode(test_content).decode()
        
        files = {
            'file': (test_filename, test_content, 'text/plain')
        }
        
        data = {
            'metadata': json.dumps({
                'filename': test_filename,
                'iv': base64.b64encode(b'test_nonce_12').decode(),
                'tag': base64.b64encode(b'test_tag_16bytes').decode()
            })
        }
        
        response = self.session.post(f"{BASE_URL}/api/files", files=files, data=data, headers=headers)
        self.assert_test(
            response.status_code == 201,
            "File upload",
            f"Expected 201, got {response.status_code}: {response.text}"
        )
        
        if response.status_code == 201:
            self.test_file_id = response.json().get('file_id')
    
    def test_file_sharing(self):
        """Test file sharing functionality"""
        self.log("Testing file sharing...")
        
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        
        # Share file with Bob (read permission)
        share_data = {
            "grantee_email": TEST_EMAIL_2,
            "permission": "read"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/files/{self.test_file_id}/share",
            json=share_data,
            headers=headers
        )
        self.assert_test(
            response.status_code == 201,
            "Share file with read permission",
            f"Expected 201, got {response.status_code}: {response.text}"
        )
        
        # Try to share with invalid email
        invalid_share_data = {
            "grantee_email": "nonexistent@example.com",
            "permission": "read"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/files/{self.test_file_id}/share",
            json=invalid_share_data,
            headers=headers
        )
        self.assert_test(
            response.status_code == 404,
            "Share with invalid email",
            f"Expected 404, got {response.status_code}"
        )
        
        # Try to share with self
        self_share_data = {
            "grantee_email": TEST_EMAIL_1,
            "permission": "read"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/files/{self.test_file_id}/share",
            json=self_share_data,
            headers=headers
        )
        self.assert_test(
            response.status_code == 400,
            "Prevent sharing with self",
            f"Expected 400, got {response.status_code}"
        )
        
        # Update existing share to write permission
        write_share_data = {
            "grantee_email": TEST_EMAIL_2,
            "permission": "write"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/files/{self.test_file_id}/share",
            json=write_share_data,
            headers=headers
        )
        self.assert_test(
            response.status_code == 200,
            "Update existing share permission",
            f"Expected 200, got {response.status_code}: {response.text}"
        )
    
    def test_shared_files_access(self):
        """Test access to shared files"""
        self.log("Testing shared files access...")
        
        # Bob checks his shared files
        headers = {"Authorization": f"Bearer {self.bob_token}"}
        
        response = self.session.get(f"{BASE_URL}/api/shared", headers=headers)
        self.assert_test(
            response.status_code == 200,
            "Get shared files list",
            f"Expected 200, got {response.status_code}: {response.text}"
        )
        
        if response.status_code == 200:
            shared_files = response.json().get('shared_files', [])
            self.assert_test(
                len(shared_files) == 1,
                "Shared files count",
                f"Expected 1 shared file, got {len(shared_files)}"
            )
            
            if shared_files:
                share = shared_files[0]
                self.assert_test(
                    share['permission'] == 'write',
                    "Share permission updated",
                    f"Expected 'write', got '{share['permission']}'"
                )
        
        # Bob downloads the shared file
        response = self.session.get(f"{BASE_URL}/api/files/{self.test_file_id}", headers=headers)
        self.assert_test(
            response.status_code == 200,
            "Download shared file",
            f"Expected 200, got {response.status_code}: {response.text}"
        )
    
    def test_file_shares_list(self):
        """Test listing file shares (owner only)"""
        self.log("Testing file shares listing...")
        
        # Alice lists shares for her file
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        
        response = self.session.get(f"{BASE_URL}/api/files/{self.test_file_id}/shares", headers=headers)
        self.assert_test(
            response.status_code == 200,
            "List file shares",
            f"Expected 200, got {response.status_code}: {response.text}"
        )
        
        if response.status_code == 200:
            shares = response.json().get('shares', [])
            self.assert_test(
                len(shares) == 1,
                "File shares count",
                f"Expected 1 share, got {len(shares)}"
            )
        
        # Bob tries to list shares (should fail - not owner)
        headers = {"Authorization": f"Bearer {self.bob_token}"}
        
        response = self.session.get(f"{BASE_URL}/api/files/{self.test_file_id}/shares", headers=headers)
        self.assert_test(
            response.status_code == 404,
            "Non-owner cannot list shares",
            f"Expected 404, got {response.status_code}"
        )
    
    def test_sharing_stats(self):
        """Test sharing statistics"""
        self.log("Testing sharing statistics...")
        
        # Alice's sharing stats
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        
        response = self.session.get(f"{BASE_URL}/api/shares/stats", headers=headers)
        self.assert_test(
            response.status_code == 200,
            "Get sharing stats (Alice)",
            f"Expected 200, got {response.status_code}: {response.text}"
        )
        
        if response.status_code == 200:
            stats = response.json().get('stats', {})
            self.assert_test(
                stats.get('files_you_shared') == 1,
                "Alice shared files count",
                f"Expected 1, got {stats.get('files_you_shared')}"
            )
            self.assert_test(
                stats.get('users_you_shared_with') == 1,
                "Alice unique grantees count",
                f"Expected 1, got {stats.get('users_you_shared_with')}"
            )
        
        # Bob's sharing stats
        headers = {"Authorization": f"Bearer {self.bob_token}"}
        
        response = self.session.get(f"{BASE_URL}/api/shares/stats", headers=headers)
        self.assert_test(
            response.status_code == 200,
            "Get sharing stats (Bob)",
            f"Expected 200, got {response.status_code}: {response.text}"
        )
        
        if response.status_code == 200:
            stats = response.json().get('stats', {})
            self.assert_test(
                stats.get('files_shared_with_you') == 1,
                "Bob received files count",
                f"Expected 1, got {stats.get('files_shared_with_you')}"
            )
    
    def test_share_revocation(self):
        """Test revoking file shares"""
        self.log("Testing share revocation...")
        
        # Alice revokes Bob's access
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        
        response = self.session.delete(
            f"{BASE_URL}/api/files/{self.test_file_id}/share/{self.bob_user_id}",
            headers=headers
        )
        self.assert_test(
            response.status_code == 200,
            "Revoke file share",
            f"Expected 200, got {response.status_code}: {response.text}"
        )
        
        # Bob checks his shared files (should be empty now)
        headers = {"Authorization": f"Bearer {self.bob_token}"}
        
        response = self.session.get(f"{BASE_URL}/api/shared", headers=headers)
        if response.status_code == 200:
            shared_files = response.json().get('shared_files', [])
            self.assert_test(
                len(shared_files) == 0,
                "Shared files after revocation",
                f"Expected 0 shared files, got {len(shared_files)}"
            )
        
        # Bob tries to download the file (should fail)
        response = self.session.get(f"{BASE_URL}/api/files/{self.test_file_id}", headers=headers)
        self.assert_test(
            response.status_code == 403,
            "Access denied after revocation",
            f"Expected 403, got {response.status_code}"
        )
    
    def test_invalid_operations(self):
        """Test invalid sharing operations"""
        self.log("Testing invalid operations...")
        
        # Bob tries to share Alice's file (should fail - not owner)
        headers = {"Authorization": f"Bearer {self.bob_token}"}
        
        share_data = {
            "grantee_email": "someone@example.com",
            "permission": "read"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/files/{self.test_file_id}/share",
            json=share_data,
            headers=headers
        )
        self.assert_test(
            response.status_code == 404,
            "Non-owner cannot share file",
            f"Expected 404, got {response.status_code}"
        )
        
        # Try to share with invalid permission
        headers = {"Authorization": f"Bearer {self.alice_token}"}
        
        invalid_permission_data = {
            "grantee_email": TEST_EMAIL_2,
            "permission": "invalid_permission"
        }
        
        response = self.session.post(
            f"{BASE_URL}/api/files/{self.test_file_id}/share",
            json=invalid_permission_data,
            headers=headers
        )
        self.assert_test(
            response.status_code == 400,
            "Invalid permission rejected",
            f"Expected 400, got {response.status_code}"
        )
    
    def run_all_tests(self):
        """Run all sharing tests"""
        self.log("🚀 Starting Phase 4 Sharing Tests...")
        
        try:
            self.test_user_registration()
            self.test_user_login()
            self.test_file_upload()
            self.test_file_sharing()
            self.test_shared_files_access()
            self.test_file_shares_list()
            self.test_sharing_stats()
            self.test_share_revocation()
            self.test_invalid_operations()
            
        except Exception as e:
            self.log(f"Test execution error: {e}", "ERROR")
            self.failed += 1
        
        # Summary
        total = self.passed + self.failed
        success_rate = (self.passed / total * 100) if total > 0 else 0
        
        self.log(f"\n📊 Test Results:")
        self.log(f"   ✅ Passed: {self.passed}")
        self.log(f"   ❌ Failed: {self.failed}")
        self.log(f"   📈 Success Rate: {success_rate:.1f}%")
        
        if self.failed == 0:
            self.log("🎉 All Phase 4 sharing tests passed!", "SUCCESS")
        else:
            self.log(f"💥 {self.failed} test(s) failed!", "ERROR")
        
        return self.failed == 0

if __name__ == "__main__":
    test_runner = ShareTestRunner()
    success = test_runner.run_all_tests()
    exit(0 if success else 1)

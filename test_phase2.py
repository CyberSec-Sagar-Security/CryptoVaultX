#!/usr/bin/env python3
"""
Test script for CryptoVault Phase 2: Authentication
Tests user registration, login, and JWT functionality
"""

import requests
import json
import sys
import time

# Test configuration
BASE_URL = "http://localhost:5000"
TEST_USER = {
    "name": "Alice Smith",
    "email": "alice@cryptovault.test",
    "password": "SecurePass123!"
}

def make_request(method, endpoint, data=None, headers=None, expect_status=None):
    """Make HTTP request and handle errors"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        if expect_status and response.status_code != expect_status:
            print(f"❌ Expected status {expect_status}, got {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
        return response
        
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to {url}. Is the service running?")
        return None
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None

def test_health_endpoint():
    """Test the health check endpoint"""
    print("🏥 Testing health endpoint...")
    
    response = make_request("GET", "/api/health", expect_status=200)
    if not response:
        return False
    
    data = response.json()
    print(f"   ✅ Service: {data.get('service')}")
    print(f"   ✅ Status: {data.get('status')}")
    return True

def test_user_registration():
    """Test user registration"""
    print("\n👤 Testing user registration...")
    
    # Test successful registration
    response = make_request("POST", "/api/auth/register", data=TEST_USER, expect_status=201)
    if not response:
        return False
    
    data = response.json()
    print(f"   ✅ User registered: {data.get('user', {}).get('name')}")
    print(f"   ✅ Email: {data.get('user', {}).get('email')}")
    print(f"   ✅ User ID: {data.get('user', {}).get('id')}")
    
    # Test duplicate registration (should fail)
    print("   Testing duplicate registration...")
    response = make_request("POST", "/api/auth/register", data=TEST_USER, expect_status=409)
    if not response:
        return False
    
    print("   ✅ Duplicate registration properly rejected")
    
    # Test invalid email
    print("   Testing invalid email...")
    invalid_user = TEST_USER.copy()
    invalid_user["email"] = "invalid-email"
    response = make_request("POST", "/api/auth/register", data=invalid_user, expect_status=400)
    if not response:
        return False
    
    print("   ✅ Invalid email properly rejected")
    
    # Test weak password
    print("   Testing weak password...")
    weak_user = TEST_USER.copy()
    weak_user["email"] = "test2@example.com"
    weak_user["password"] = "123"
    response = make_request("POST", "/api/auth/register", data=weak_user, expect_status=400)
    if not response:
        return False
    
    print("   ✅ Weak password properly rejected")
    
    return True

def test_user_login():
    """Test user login and JWT token generation"""
    print("\n🔐 Testing user login...")
    
    # Test successful login
    login_data = {
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    }
    
    response = make_request("POST", "/api/auth/login", data=login_data, expect_status=200)
    if not response:
        return False
    
    data = response.json()
    access_token = data.get('access_token')
    refresh_token = data.get('refresh_token')
    
    if not access_token or not refresh_token:
        print("❌ Tokens not returned in login response")
        return False
    
    print(f"   ✅ Login successful for: {data.get('user', {}).get('name')}")
    print(f"   ✅ Access token received (length: {len(access_token)})")
    print(f"   ✅ Refresh token received (length: {len(refresh_token)})")
    
    # Test invalid credentials
    print("   Testing invalid credentials...")
    invalid_login = {
        "email": TEST_USER["email"],
        "password": "wrong-password"
    }
    response = make_request("POST", "/api/auth/login", data=invalid_login, expect_status=401)
    if not response:
        return False
    
    print("   ✅ Invalid credentials properly rejected")
    
    return access_token, refresh_token

def test_protected_endpoint(access_token):
    """Test accessing protected endpoints with JWT"""
    print("\n🛡️  Testing protected endpoints...")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    # Test /api/auth/me endpoint
    response = make_request("GET", "/api/auth/me", headers=headers, expect_status=200)
    if not response:
        return False
    
    data = response.json()
    user_info = data.get('user', {})
    
    print(f"   ✅ User info retrieved: {user_info.get('name')}")
    print(f"   ✅ Email: {user_info.get('email')}")
    
    # Test access without token
    print("   Testing access without token...")
    response = make_request("GET", "/api/auth/me", expect_status=401)
    if not response:
        return False
    
    print("   ✅ Unauthorized access properly rejected")
    
    # Test access with invalid token
    print("   Testing access with invalid token...")
    invalid_headers = {"Authorization": "Bearer invalid-token"}
    response = make_request("GET", "/api/auth/me", headers=invalid_headers, expect_status=401)
    if not response:
        return False
    
    print("   ✅ Invalid token properly rejected")
    
    return True

def test_token_refresh(refresh_token):
    """Test JWT token refresh"""
    print("\n🔄 Testing token refresh...")
    
    headers = {
        "Authorization": f"Bearer {refresh_token}"
    }
    
    response = make_request("POST", "/api/auth/refresh", headers=headers, expect_status=200)
    if not response:
        return False
    
    data = response.json()
    new_access_token = data.get('access_token')
    
    if not new_access_token:
        print("❌ New access token not returned")
        return False
    
    print(f"   ✅ Token refreshed successfully (length: {len(new_access_token)})")
    
    return new_access_token

def test_logout(access_token):
    """Test user logout"""
    print("\n👋 Testing logout...")
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = make_request("POST", "/api/auth/logout", headers=headers, expect_status=200)
    if not response:
        return False
    
    data = response.json()
    print(f"   ✅ Logout successful: {data.get('message')}")
    
    return True

def main():
    """Run all Phase 2 tests"""
    print("🚀 CryptoVault Phase 2 - Testing Authentication System")
    print("=" * 60)
    
    # Basic connectivity
    if not test_health_endpoint():
        print("\n❌ Health check failed. Please ensure the backend is running.")
        sys.exit(1)
    
    # Authentication tests
    tests = []
    
    # Test user registration first
    if not test_user_registration():
        print("\n❌ User registration test failed.")
        sys.exit(1)
    
    # Test user login (which now should work since user is registered)
    login_result = test_user_login()
    if login_result and len(login_result) == 2:
        access_token, refresh_token = login_result
        tests.append(("Protected Endpoints", lambda: test_protected_endpoint(access_token)))
        
        refresh_result = test_token_refresh(refresh_token)
        if refresh_result:
            new_access_token = refresh_result
            tests.append(("Logout", lambda: test_logout(new_access_token)))
        else:
            print("❌ Token refresh test failed")
            sys.exit(1)
    else:
        print("❌ Login test failed")
        sys.exit(1)
    
    # Run remaining tests
    results = [("User Registration", True), ("User Login", True)]  # These already passed
    
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
        print("\n🎉 Phase 2 authentication system is working correctly!")
        print("\nNext steps for Phase 3:")
        print("   - Implement file upload/download APIs")
        print("   - Add file metadata storage")
        print("   - Create file access control")
        
        # Show example curl commands
        print("\n📝 Example curl commands:")
        print("# Register:")
        print(f'curl -X POST {BASE_URL}/api/auth/register \\')
        print('  -H "Content-Type: application/json" \\')
        print(f'  -d \'{json.dumps(TEST_USER)}\'')
        
        print("\n# Login:")
        login_data = {"email": TEST_USER["email"], "password": TEST_USER["password"]}
        print(f'curl -X POST {BASE_URL}/api/auth/login \\')
        print('  -H "Content-Type: application/json" \\')
        print(f'  -d \'{json.dumps(login_data)}\'')
        
        sys.exit(0)
    else:
        print(f"\n💥 {total - passed} tests failed. Please check the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()

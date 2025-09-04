#!/usr/bin/env python3
"""
Simple test script for Phase 2 endpoints
Tests each authentication endpoint individually
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_registration():
    """Test user registration"""
    print("🔐 Testing Registration...")
    
    # Use a unique email for each test
    import time
    unique_email = f"test{int(time.time())}@cryptovault.test"
    
    user_data = {
        "name": "Test User",
        "email": unique_email,
        "password": "SecurePass123!"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 201:
        print("✅ Registration successful!")
        return user_data
    else:
        print("❌ Registration failed!")
        return None

def test_login(user_data):
    """Test user login"""
    print("\n🔐 Testing Login...")
    
    login_data = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Login successful!")
        print(f"Access token length: {len(data.get('access_token', ''))}")
        print(f"User: {data.get('user', {}).get('name')}")
        return data.get('access_token'), data.get('refresh_token')
    else:
        print(f"❌ Login failed! Response: {response.json()}")
        return None, None

def test_protected_endpoint(access_token):
    """Test accessing protected endpoint"""
    print("\n🛡️ Testing Protected Endpoint...")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("✅ Protected endpoint access successful!")
        print(f"User info: {data.get('user', {}).get('name')} ({data.get('user', {}).get('email')})")
        return True
    else:
        print(f"❌ Protected endpoint access failed! Response: {response.json()}")
        return False

def main():
    print("🚀 CryptoVault Phase 2 - Simple Authentication Test")
    print("=" * 50)
    
    # Test registration
    user_data = test_registration()
    if not user_data:
        return
    
    # Test login
    access_token, refresh_token = test_login(user_data)
    if not access_token:
        return
    
    # Test protected endpoint
    if test_protected_endpoint(access_token):
        print("\n🎉 All authentication tests passed!")
        print("\n✨ Phase 2 is working correctly!")
        
        print("\n📝 Example curl commands:")
        print(f"# Register:")
        print(f"curl -X POST {BASE_URL}/api/auth/register -H 'Content-Type: application/json' -d '{json.dumps(user_data)}'")
        
        print(f"\n# Login:")
        login_data = {"email": user_data["email"], "password": user_data["password"]}
        print(f"curl -X POST {BASE_URL}/api/auth/login -H 'Content-Type: application/json' -d '{json.dumps(login_data)}'")
        
        print(f"\n# Access protected endpoint:")
        print(f"curl -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' {BASE_URL}/api/auth/me")
    else:
        print("\n❌ Authentication tests failed!")

if __name__ == "__main__":
    main()

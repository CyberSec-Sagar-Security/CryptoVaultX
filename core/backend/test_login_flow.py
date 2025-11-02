"""
Test actual login flow and token usage
"""
import requests
import json

API_URL = "http://localhost:5000"

# Test 1: Register a test user
print("="*80)
print("TEST 1: REGISTER USER")
print("="*80)

register_data = {
    "username": "jwt_test_user",
    "email": "jwt_test@example.com",
    "password": "Test123!@#"
}

try:
    response = requests.post(f"{API_URL}/api/auth/register", json=register_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Register might fail if user exists: {str(e)}")

print("\n" + "="*80)
print("TEST 2: LOGIN")
print("="*80)

login_data = {
    "email": "jwt_test@example.com",
    "password": "Test123!@#"
}

try:
    response = requests.post(f"{API_URL}/api/auth/login", json=login_data)
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 200 and 'token' in result:
        token = result['token']
        print(f"\n✅ Login successful!")
        print(f"Token (first 50): {token[:50]}...")
        
        # Test 3: Use token to get profile
        print("\n" + "="*80)
        print("TEST 3: GET PROFILE WITH TOKEN")
        print("="*80)
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        profile_response = requests.get(f"{API_URL}/api/users/profile", headers=headers)
        print(f"Status Code: {profile_response.status_code}")
        print(f"Response: {json.dumps(profile_response.json(), indent=2)}")
        
        if profile_response.status_code == 200:
            print("\n✅ Profile fetch successful! JWT is working correctly!")
        else:
            print("\n❌ Profile fetch FAILED! JWT validation issue!")
            
            # Test 4: Check /api/auth/me endpoint
            print("\n" + "="*80)
            print("TEST 4: GET /api/auth/me WITH TOKEN")
            print("="*80)
            
            me_response = requests.get(f"{API_URL}/api/auth/me", headers=headers)
            print(f"Status Code: {me_response.status_code}")
            print(f"Response: {json.dumps(me_response.json(), indent=2)}")
            
    else:
        print(f"\n❌ Login failed!")
        
except Exception as e:
    print(f"Error: {str(e)}")

print("\n" + "="*80)

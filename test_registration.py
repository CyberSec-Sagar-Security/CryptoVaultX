#!/usr/bin/env python3
"""
Quick test script to verify registration API endpoint
"""

import requests
import json

def test_registration():
    """Test the registration endpoint directly"""
    
    # Test data
    test_user = {
        "username": "testuser123",
        "email": "testuser123@example.com", 
        "password": "TestPass123!"
    }
    
    print("🧪 Testing Registration API Endpoint")
    print(f"📤 Sending POST to http://localhost:5000/api/auth/register")
    print(f"📦 Payload: {json.dumps(test_user, indent=2)}")
    
    try:
        # Make the request
        response = requests.post(
            "http://localhost:5000/api/auth/register",
            json=test_user,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"\n📡 Response Status: {response.status_code}")
        print(f"📡 Response Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"📦 Response Data: {json.dumps(response_data, indent=2)}")
        except:
            print(f"📦 Response Text: {response.text}")
        
        if response.status_code == 201:
            print("✅ Registration successful!")
            return True
        else:
            print(f"❌ Registration failed with status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - is the backend server running on port 5000?")
        return False
    except requests.exceptions.Timeout:
        print("❌ Request timeout")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    test_registration()

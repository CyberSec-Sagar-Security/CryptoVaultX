#!/usr/bin/env python3
"""
Simple API login test
"""

import requests
import json

# Test API login
def test_login():
    login_data = {
        "email": "apitest@test.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post("http://localhost:5000/api/auth/login", json=login_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            return True
        else:
            print("❌ Login failed!")
            return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

if __name__ == "__main__":
    test_login()
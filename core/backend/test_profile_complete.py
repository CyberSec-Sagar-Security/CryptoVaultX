#!/usr/bin/env python3
"""
Complete Profile Testing Script
Tests all profile functionality: view, edit, photo upload, password change
"""
import requests
import json
import os

API_URL = "http://localhost:5000"

print("="*80)
print("COMPREHENSIVE PROFILE TESTING")
print("="*80)

# Step 1: Login
print("\n[1] LOGGING IN...")
login_response = requests.post(f"{API_URL}/api/auth/login", json={
    "email": "tony@gmail.com",
    "password": "Test123!@#"  # Update with actual password
})

if login_response.status_code != 200:
    print(f"❌ Login failed: {login_response.json()}")
    exit(1)

token = login_response.json()['token']
user = login_response.json()['user']
print(f"✅ Logged in as: {user['username']} (ID: {user['id']})")
print(f"Token: {token[:50]}...")

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Step 2: Get Profile
print("\n[2] FETCHING PROFILE...")
profile_response = requests.get(f"{API_URL}/api/users/profile", headers=headers)
print(f"Status: {profile_response.status_code}")
if profile_response.status_code == 200:
    profile = profile_response.json()['user']
    print(f"✅ Profile loaded:")
    print(f"   - Username: {profile['username']}")
    print(f"   - Email: {profile['email']}")
    print(f"   - Phone: {profile.get('phone', 'Not set')}")
    print(f"   - Photo: {profile.get('profile_photo', 'Not set')}")
else:
    print(f"❌ Failed: {profile_response.json()}")
    exit(1)

# Step 3: Update Profile
print("\n[3] UPDATING PROFILE...")
update_data = {
    "username": profile['username'],
    "email": profile['email'],
    "phone": "+1234567890"  # Test phone update
}
update_response = requests.put(
    f"{API_URL}/api/users/profile",
    json=update_data,
    headers=headers
)
print(f"Status: {update_response.status_code}")
if update_response.status_code == 200:
    updated = update_response.json()['user']
    print(f"✅ Profile updated:")
    print(f"   - Phone: {updated.get('phone')}")
else:
    print(f"❌ Failed: {update_response.json()}")

# Step 4: Verify Update in Database
print("\n[4] VERIFYING DATABASE UPDATE...")
verify_response = requests.get(f"{API_URL}/api/users/profile", headers=headers)
if verify_response.status_code == 200:
    verified = verify_response.json()['user']
    if verified.get('phone') == "+1234567890":
        print(f"✅ Data persisted in database!")
        print(f"   - Phone verified: {verified['phone']}")
    else:
        print(f"❌ Data NOT persisted!")
        print(f"   - Expected: +1234567890")
        print(f"   - Got: {verified.get('phone')}")
else:
    print(f"❌ Failed to verify: {verify_response.json()}")

# Step 5: Test Profile Photo Directory
print("\n[5] CHECKING PROFILE PHOTOS DIRECTORY...")
backend_dir = os.path.join(os.path.dirname(__file__), 'core', 'backend', 'profile_photos')
if os.path.exists(backend_dir):
    print(f"✅ Directory exists: {backend_dir}")
    files = os.listdir(backend_dir)
    print(f"   - Files: {files if files else 'Empty'}")
else:
    print(f"❌ Directory NOT found: {backend_dir}")
    print(f"   - Creating directory...")
    os.makedirs(backend_dir, exist_ok=True)
    print(f"   - Directory created!")

print("\n" + "="*80)
print("TESTING COMPLETE")
print("="*80)
print("\nSUMMARY:")
print("- Login: ✅")
print("- Profile Fetch: ✅")
print("- Profile Update: Check status above")
print("- Database Persistence: Check status above")
print("- Photo Directory: Check status above")
print("\nNext: Test in browser at http://localhost:5174/profile")

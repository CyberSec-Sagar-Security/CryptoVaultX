import requests
import json
import time

base_url = 'http://localhost:5000/api/auth'

# Generate a unique test user
timestamp = str(int(time.time()))
test_user = {
    'username': f'testuser{timestamp}',
    'email': f'test{timestamp}@example.com',
    'password': 'TestPass123!'
}

print('='*60)
print('🧪 TESTING REGISTRATION → LOGIN FLOW')
print('='*60)

try:
    # 1. REGISTER
    print(f'\n📝 Step 1: Registering user')
    print(f'   Username: {test_user["username"]}')
    print(f'   Email: {test_user["email"]}')
    
    reg_response = requests.post(f'{base_url}/register', json=test_user)
    print(f'   Response Status: {reg_response.status_code}')
    print(f'   Response Body: {json.dumps(reg_response.json(), indent=2)}')
    
    if reg_response.status_code != 201:
        print('❌ REGISTRATION FAILED!')
        exit(1)
    
    registered_user = reg_response.json().get('user', {})
    print(f'✅ User registered with ID: {registered_user.get("id")}')
    
    # 2. IMMEDIATELY LOGIN WITH SAME CREDENTIALS
    print(f'\n🔐 Step 2: Logging in with EXACT same credentials')
    print(f'   Email: {test_user["email"]}')
    
    login_payload = {
        'email': test_user['email'],
        'password': test_user['password']
    }
    
    login_response = requests.post(f'{base_url}/login', json=login_payload)
    print(f'   Response Status: {login_response.status_code}')
    print(f'   Response Body: {json.dumps(login_response.json(), indent=2)}')
    
    if login_response.status_code == 200:
        print('✅ LOGIN SUCCESSFUL!')
        print('\n🎉 TEST PASSED - Registration and Login work correctly')
    else:
        print('❌ LOGIN FAILED!')
        print('\n🚨 ROOT CAUSE: User was registered but cannot login')
        print('   This is the actual bug we need to fix!')
        
except Exception as e:
    print(f'\n❌ TEST ERROR: {e}')
    import traceback
    traceback.print_exc()

print('='*60)
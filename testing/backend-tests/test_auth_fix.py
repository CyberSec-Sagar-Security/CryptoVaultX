import requests
import json

# Test the authentication fix with email normalization
base_url = 'http://localhost:5000/api/auth'

# Test data with mixed case email and spacing
test_user = {
    'username': 'testfix123',
    'email': '  TestFix123@EXAMPLE.COM  ',  # Mixed case with spaces
    'password': 'TestPass123!'
}

print('🧪 Testing Authentication Fix with Email Normalization\n')

try:
    # 1. Register user
    print('1️⃣ Registering user with mixed case email and spaces...')
    print(f'   Email sent: "{test_user["email"]}"')
    
    register_response = requests.post(f'{base_url}/register', json=test_user)
    print(f'   Register Status: {register_response.status_code}')
    print(f'   Register Response: {register_response.json()}')
    
    if register_response.status_code != 201:
        print('❌ Registration failed!')
        exit(1)
        
    print('✅ Registration successful!\n')
    
    # 2. Login with same mixed case email
    print('2️⃣ Logging in with same mixed case email...')
    login_data = {
        'email': test_user['email'],  # Same mixed case email
        'password': test_user['password']
    }
    
    login_response = requests.post(f'{base_url}/login', json=login_data)
    print(f'   Login Status: {login_response.status_code}')
    print(f'   Login Response: {login_response.json()}')
    
    if login_response.status_code == 200:
        print('✅ Login successful with same email format!')
    else:
        print('❌ Login failed!')
        
    # 3. Login with different case email
    print('\n3️⃣ Logging in with different case email...')
    login_data_lower = {
        'email': 'testfix123@example.com',  # All lowercase
        'password': test_user['password']
    }
    
    login_response2 = requests.post(f'{base_url}/login', json=login_data_lower)
    print(f'   Login Status: {login_response2.status_code}')
    print(f'   Login Response: {login_response2.json()}')
    
    if login_response2.status_code == 200:
        print('✅ Login successful with normalized email!')
    else:
        print('❌ Login failed with normalized email!')
        
    print('\n🎉 Authentication normalization test completed!')
        
except Exception as e:
    print(f'❌ Test error: {e}')
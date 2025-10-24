from backend.database import db_manager
import bcrypt

# Check the latest user
result = db_manager.execute_one('SELECT id, email, password_hash FROM users WHERE id = 50')
if result:
    print(f'User found: ID={result["id"]}, Email={result["email"]}')
    print(f'Password hash exists: {bool(result["password_hash"])}')
    print(f'Hash type: {type(result["password_hash"])}')
    if result["password_hash"]:
        print(f'Hash length: {len(result["password_hash"])}')
        print(f'Hash starts with: {result["password_hash"][:10]}')
        
        # Test password verification manually
        test_password = 'TestPass123!'
        try:
            if bcrypt.checkpw(test_password.encode('utf-8'), result["password_hash"].encode('utf-8')):
                print('✅ Manual password check: SUCCESS')
            else:
                print('❌ Manual password check: FAILED')
        except Exception as e:
            print(f'❌ Manual password check error: {e}')
    else:
        print('❌ No password hash found!')
else:
    print('❌ User not found')
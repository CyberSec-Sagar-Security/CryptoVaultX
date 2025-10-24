from backend.database import db_manager
import bcrypt

# Check the user that was just registered
user_id = 49
email = "test1761312464@example.com"
test_password = "TestPass123!"

print("Checking database for user...")
result = db_manager.execute_one(
    "SELECT id, email, password_hash FROM users WHERE id = %s", 
    (user_id,)
)

if result:
    print(f"\n✅ User found in database:")
    print(f"   ID: {result['id']}")
    print(f"   Email: {result['email']}")
    print(f"   Password Hash: {result['password_hash'][:50]}...")
    print(f"   Hash Length: {len(result['password_hash'])}")
    print(f"   Hash Type: {type(result['password_hash'])}")
    
    # Try to verify the password
    print(f"\n🔐 Testing password verification...")
    password_bytes = test_password.encode('utf-8')
    hash_bytes = result['password_hash'].encode('utf-8') if isinstance(result['password_hash'], str) else result['password_hash']
    
    try:
        if bcrypt.checkpw(password_bytes, hash_bytes):
            print("✅ Password verification SUCCESSFUL!")
        else:
            print("❌ Password verification FAILED!")
    except Exception as e:
        print(f"❌ Error during verification: {e}")
else:
    print("❌ User not found!")

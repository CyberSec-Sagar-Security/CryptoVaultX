"""
Test JWT token generation and validation
"""
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token, decode_token
from config import config

# Create Flask app
app = Flask(__name__)
app.config.from_object(config['development']())

# Initialize JWT
jwt = JWTManager(app)

# Test token creation and decoding
with app.app_context():
    # Create token like login does
    user_id = 1
    token = create_access_token(identity=str(user_id))
    
    print("="*80)
    print("JWT TOKEN TEST")
    print("="*80)
    print(f"1. Generated Token (first 50 chars): {token[:50]}...")
    print(f"2. Full Token Length: {len(token)} characters")
    print(f"3. JWT_SECRET_KEY: {app.config['JWT_SECRET_KEY']}")
    print(f"4. JWT_ALGORITHM: {app.config['JWT_ALGORITHM']}")
    
    try:
        # Decode token
        decoded = decode_token(token)
        print(f"5. ✅ Token decoded successfully!")
        print(f"6. Decoded payload: {decoded}")
        print(f"7. Identity (sub): {decoded.get('sub')}")
        print(f"8. Token type: {decoded.get('type')}")
        print(f"9. JTI: {decoded.get('jti')}")
    except Exception as e:
        print(f"5. ❌ Token decode FAILED: {type(e).__name__}: {str(e)}")
    
    print("="*80)
    
    # Now test with Authorization header format
    print("\nTesting Authorization Header Format:")
    print("="*80)
    auth_header = f"Bearer {token}"
    print(f"Authorization Header: {auth_header[:60]}...")
    
    # Extract token from header
    token_from_header = auth_header.split(" ")[1] if " " in auth_header else auth_header
    print(f"Extracted Token Matches Original: {token_from_header == token}")
    
    try:
        decoded2 = decode_token(token_from_header)
        print(f"✅ Header Token decoded successfully!")
        print(f"Identity from header token: {decoded2.get('sub')}")
    except Exception as e:
        print(f"❌ Header Token decode FAILED: {type(e).__name__}: {str(e)}")
    
    print("="*80)

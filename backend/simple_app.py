"""
Simplified CryptoVault Backend for Testing
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import json
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# Simple CORS setup
CORS(app, resources={r"/*": {"origins": "*"}})

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host='localhost',
        database='cryptovault_db',
        user='cryptovault_user',
        password='sql123',
        port=5432
    )

@app.route('/api', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'CryptoVault API is running',
        'version': '1.0.0'
    })

@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        # Simple validation
        if not username or not email or not password:
            return jsonify({'message': 'Missing required fields'}), 400
            
        # Hash password
        password_hash = generate_password_hash(password)
        
        # Insert into database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO users (username, name, email, password_hash, created_at, updated_at, is_active)
            VALUES (%s, %s, %s, %s, NOW(), NOW(), true)
            RETURNING id, username, name, email, created_at, is_active
        """, (username, username, email, password_hash))
        
        user_data = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'id': user_data[0],
                'username': user_data[1],
                'name': user_data[2],
                'email': user_data[3],
                'created_at': user_data[4].isoformat(),
                'is_active': user_data[5]
            }
        }), 201
        
    except psycopg2.IntegrityError:
        return jsonify({'message': 'Email or username already exists'}), 409
    except Exception as e:
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'message': 'Email and password required'}), 400
            
        # Get user from database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, username, name, email, password_hash, is_active
            FROM users WHERE email = %s
        """, (email,))
        
        user_data = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user_data:
            return jsonify({'message': 'Invalid credentials'}), 401
            
        if not check_password_hash(user_data[4], password):
            return jsonify({'message': 'Invalid credentials'}), 401
            
        if not user_data[5]:  # is_active
            return jsonify({'message': 'Account is deactivated'}), 401
            
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': 'simple-token-for-testing',  # In production, use JWT
            'user': {
                'id': user_data[0],
                'username': user_data[1],
                'name': user_data[2],
                'email': user_data[3],
                'is_active': user_data[5]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Login failed: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 Starting CryptoVault Backend...")
    print("📊 Testing database connection...")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM users')
        user_count = cursor.fetchone()[0]
        print(f"✅ Database connected. Users: {user_count}")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        exit(1)
    
    print("🌐 Starting Flask server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)

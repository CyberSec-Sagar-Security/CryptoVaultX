from flask import Blueprint, jsonify, request
from datetime import datetime, timezone

health_bp = Blueprint('health', __name__)

def utcnow():
    """Get current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)

@health_bp.route('/health', methods=['GET', 'OPTIONS'])
def health_check():
    """Health check endpoint with CORS test"""
    if request.method == 'OPTIONS':
        # Handle OPTIONS request explicitly for CORS preflight
        return '', 204
    
    return jsonify({
        'status': 'ok',
        'timestamp': utcnow().isoformat(),
        'service': 'CryptoVault Backend',
        'version': '1.0.0'
    }), 200
    
@health_bp.route('/cors-test', methods=['GET', 'OPTIONS', 'POST'])
def cors_test():
    """Endpoint to test CORS configuration"""
    if request.method == 'OPTIONS':
        # Handle OPTIONS request explicitly for CORS preflight
        return '', 204
    
    return jsonify({
        'message': 'CORS is working correctly',
        'origin': request.headers.get('Origin', 'Unknown'),
        'method': request.method
    }), 200

@health_bp.route('/system-status', methods=['GET', 'OPTIONS'])
def system_status():
    """Get comprehensive system status for all services"""
    if request.method == 'OPTIONS':
        return '', 204
    
    from database import db_manager
    import os
    
    services = {
        'database': {'status': 'operational', 'message': ''},
        'file_upload': {'status': 'operational', 'message': ''},
        'encryption': {'status': 'operational', 'message': ''},
        'file_sharing': {'status': 'operational', 'message': ''},
        'api_services': {'status': 'operational', 'message': ''}
    }
    
    # Check Database
    try:
        conn = db_manager.get_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            db_manager.release_connection(conn)
            services['database']['status'] = 'operational'
        else:
            services['database']['status'] = 'degraded'
            services['database']['message'] = 'Connection pool exhausted'
    except Exception as e:
        services['database']['status'] = 'down'
        services['database']['message'] = str(e)
    
    # Check File Upload Service (storage directory)
    try:
        storage_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'storage')
        uploads_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
        
        # Check if directories exist and are writable
        if not os.path.exists(storage_path):
            os.makedirs(storage_path, exist_ok=True)
        if not os.path.exists(uploads_path):
            os.makedirs(uploads_path, exist_ok=True)
            
        # Test write permissions
        test_file = os.path.join(storage_path, '.health_check')
        with open(test_file, 'w') as f:
            f.write('test')
        os.remove(test_file)
        
        services['file_upload']['status'] = 'operational'
    except Exception as e:
        services['file_upload']['status'] = 'down'
        services['file_upload']['message'] = f'Storage access error: {str(e)}'
    
    # Check Encryption Service (test crypto library)
    try:
        from cryptography.fernet import Fernet
        # Test key generation
        test_key = Fernet.generate_key()
        cipher = Fernet(test_key)
        # Test encryption/decryption
        test_data = b"health_check"
        encrypted = cipher.encrypt(test_data)
        decrypted = cipher.decrypt(encrypted)
        
        if decrypted == test_data:
            services['encryption']['status'] = 'operational'
        else:
            services['encryption']['status'] = 'degraded'
            services['encryption']['message'] = 'Encryption test failed'
    except Exception as e:
        services['encryption']['status'] = 'down'
        services['encryption']['message'] = f'Crypto library error: {str(e)}'
    
    # Check File Sharing Service (shares table access)
    try:
        conn = db_manager.get_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM shares LIMIT 1")
            cursor.fetchone()
            cursor.close()
            db_manager.release_connection(conn)
            services['file_sharing']['status'] = 'operational'
        else:
            services['file_sharing']['status'] = 'degraded'
            services['file_sharing']['message'] = 'Database connection issue'
    except Exception as e:
        services['file_sharing']['status'] = 'down'
        services['file_sharing']['message'] = str(e)
    
    # Check API Services (JWT and general API health)
    try:
        from flask_jwt_extended import create_access_token
        # Test token creation
        test_token = create_access_token(identity='health_check_user', expires_delta=False)
        if test_token:
            services['api_services']['status'] = 'operational'
        else:
            services['api_services']['status'] = 'degraded'
    except Exception as e:
        services['api_services']['status'] = 'down'
        services['api_services']['message'] = str(e)
    
    # Determine overall status
    all_statuses = [service['status'] for service in services.values()]
    if all(status == 'operational' for status in all_statuses):
        overall_status = 'operational'
    elif any(status == 'down' for status in all_statuses):
        overall_status = 'degraded'
    else:
        overall_status = 'degraded'
    
    return jsonify({
        'overall_status': overall_status,
        'services': services,
        'timestamp': utcnow().isoformat(),
        'checked_at': utcnow().isoformat()
    }), 200

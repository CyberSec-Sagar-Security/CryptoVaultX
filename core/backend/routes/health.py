from flask import Blueprint, jsonify, request
from datetime import datetime

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET', 'OPTIONS'])
def health_check():
    """Health check endpoint with CORS test"""
    if request.method == 'OPTIONS':
        # Handle OPTIONS request explicitly for CORS preflight
        return '', 204
    
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat(),
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

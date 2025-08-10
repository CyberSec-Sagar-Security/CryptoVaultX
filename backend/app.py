"""
CryptoVaultX Backend - Phase 4 Professional Implementation
Secure File Upload with AES-256-GCM Client-Side Encryption

Professional zero-knowledge architecture with comprehensive error handling,
security measures, and robust file management capabilities.

@author: CryptoVaultX Development Team
@version: 1.0.0
@since: Phase 4 - Secure File Upload
@license: MIT
"""

import os
import sys
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from typing import Dict, Any, Optional

# Add app directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import professional modules
try:
    from app.models import init_database, SQLALCHEMY_AVAILABLE
    from app.routes.upload import upload_bp
    from app.utils.file_handler import SecureFileHandler
    from app.models import get_storage_statistics
    
    print("✅ All professional modules imported successfully")
    
except ImportError as import_error:
    print(f"❌ Import error: {import_error}")
    print("🔄 Starting with basic functionality...")

def create_app() -> Flask:
    """
    Application factory pattern for creating Flask app
    
    Returns:
        Configured Flask application
    """
    
    # Initialize Flask app
    app = Flask(__name__)
    
    # Load configuration
    app.config.update({
        'MAX_CONTENT_LENGTH': 100 * 1024 * 1024,  # 100MB max file size
        'UPLOAD_FOLDER': os.path.join(os.path.dirname(__file__), 'app', 'storage', 'encrypted'),
        'SECRET_KEY': os.getenv('SECRET_KEY', 'dev-key-change-in-production'),
        'ENV': os.getenv('FLASK_ENV', 'development')
    })
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Configure CORS
    CORS(app, origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ])
    
    print(f"🗄️ Upload directory: {app.config['UPLOAD_FOLDER']}")
    
    return app

# Create Flask app
app = create_app()

# Initialize database
try:
    init_database()
    print("✅ Database initialization completed")
except Exception as db_error:
    print(f"⚠️ Database initialization failed: {db_error}")
    print("🗄️ Continuing with in-memory storage")

# Register blueprints
try:
    app.register_blueprint(upload_bp, url_prefix='/api')
    print("✅ Upload routes registered")
except Exception as route_error:
    print(f"❌ Route registration failed: {route_error}")
    print("🔄 Using fallback routes...")

# Register authentication routes
try:
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    print("✅ Authentication routes registered")
except Exception as auth_error:
    print(f"❌ Auth route registration failed: {auth_error}")
    print("🔄 Authentication routes not available...")

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Comprehensive health check endpoint
    
    Returns:
        System health information
    """
    
    try:
        # Get storage statistics
        storage_stats = get_storage_statistics()
        
        # Check upload directory
        upload_dir = app.config.get('UPLOAD_FOLDER')
        upload_dir_exists = os.path.exists(upload_dir) if upload_dir else False
        upload_dir_writable = os.access(upload_dir, os.W_OK) if upload_dir_exists else False
        
        # System information
        health_info = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'version': '1.0.0',
            'phase': 'Phase 4 - Secure File Upload',
            'environment': app.config.get('ENV', 'unknown'),
            'database': {
                'available': SQLALCHEMY_AVAILABLE if 'SQLALCHEMY_AVAILABLE' in globals() else False,
                'storage_type': storage_stats.get('storage_type', 'unknown')
            },
            'storage': {
                'directory': upload_dir,
                'exists': upload_dir_exists,
                'writable': upload_dir_writable,
                'total_files': storage_stats.get('total_files', 0),
                'total_encrypted_bytes': storage_stats.get('total_encrypted_bytes', 0),
                'total_original_bytes': storage_stats.get('total_original_bytes', 0)
            },
            'security': {
                'encryption': 'AES-256-GCM',
                'zero_knowledge': True,
                'client_side_encryption': True
            },
            'limits': {
                'max_file_size_bytes': app.config.get('MAX_CONTENT_LENGTH', 0),
                'max_file_size_mb': (app.config.get('MAX_CONTENT_LENGTH', 0) // 1024 // 1024)
            }
        }
        
        return jsonify(health_info)
        
    except Exception as e:
        print(f"❌ Health check error: {e}")
        
        return jsonify({
            'status': 'error',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'error': 'Health check failed',
            'details': str(e)
        }), 500

# Basic file listing endpoint (fallback)
@app.route('/api/files', methods=['GET'])
def list_files():
    """
    List uploaded files
    
    Returns:
        List of file metadata
    """
    
    try:
        from app.models import list_file_records
        
        # Get query parameters
        limit = request.args.get('limit', 100, type=int)
        limit = min(limit, 1000)  # Cap at 1000 records
        
        # Get file records
        file_records = list_file_records(limit=limit)
        
        # Format for response
        files = []
        for record in file_records:
            files.append({
                'file_id': record['file_id'],
                'filename': record['original_filename'],
                'file_size': record['file_size'],
                'original_size': record['original_size'],
                'upload_timestamp': record['upload_timestamp'],
                'content_type': record['content_type'],
                'has_encrypted_metadata': record['has_encrypted_metadata']
            })
        
        return jsonify({
            'success': True,
            'files': files,
            'total': len(files),
            'limit': limit
        })
        
    except Exception as e:
        print(f"❌ List files error: {e}")
        
        return jsonify({
            'success': False,
            'error': 'Failed to list files',
            'details': str(e)
        }), 500

# Basic file download endpoint (fallback)
@app.route('/api/files/<file_id>/download', methods=['GET'])
def download_file(file_id: str):
    """
    Download encrypted file
    
    Args:
        file_id: File ID to download
        
    Returns:
        Encrypted file with metadata headers
    """
    
    try:
        from app.models import get_file_record
        
        # Get file record
        file_record = get_file_record(file_id)
        if not file_record:
            return jsonify({
                'success': False,
                'error': 'File not found'
            }), 404
        
        # Check if file exists on disk
        file_handler = SecureFileHandler(app.config['UPLOAD_FOLDER'])
        file_path = file_handler.get_file_path(file_record['secure_filename'])
        
        if not os.path.exists(file_path):
            print(f"⚠️ File not found on disk: {file_path}")
            return jsonify({
                'success': False,
                'error': 'File not found on disk'
            }), 404
        
        # Prepare response headers
        headers = {
            'X-File-ID': file_id,
            'X-Original-Filename': file_record['original_filename'],
            'X-Original-Size': str(file_record['original_size']),
            'X-IV': file_record['iv'],
            'X-File-Hash': file_record['file_hash'],
            'Content-Type': 'application/octet-stream'
        }
        
        print(f"📤 Downloading file: {file_id} -> {file_record['original_filename']}")
        
        return send_file(
            file_path,
            as_attachment=True,
            download_name=f"encrypted_{file_record['original_filename']}",
            mimetype='application/octet-stream'
        ), 200, headers
        
    except Exception as e:
        print(f"❌ Download error: {e}")
        
        return jsonify({
            'success': False,
            'error': 'Download failed',
            'details': str(e)
        }), 500

# Error handlers
@app.errorhandler(413)
def file_too_large(error):
    """Handle file too large error"""
    max_size_mb = app.config.get('MAX_CONTENT_LENGTH', 0) // 1024 // 1024
    
    return jsonify({
        'success': False,
        'error': 'File too large',
        'details': f'Maximum file size is {max_size_mb}MB'
    }), 413

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    print(f"❌ Internal server error: {error}")
    
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

# Startup function
def startup():
    """
    Perform startup tasks
    """
    
    print("🚀 CryptoVaultX Backend - Phase 4")
    print("=" * 50)
    print(f"📅 Started at: {datetime.utcnow().isoformat()}Z")
    print(f"🗄️ Storage directory: {app.config['UPLOAD_FOLDER']}")
    print(f"📊 Database available: {SQLALCHEMY_AVAILABLE if 'SQLALCHEMY_AVAILABLE' in globals() else 'Unknown'}")
    print(f"🔐 Encryption: AES-256-GCM (Client-Side)")
    print(f"🛡️ Zero-knowledge architecture: Enabled")
    print(f"📁 Max file size: {app.config.get('MAX_CONTENT_LENGTH', 0) // 1024 // 1024}MB")
    print("=" * 50)

if __name__ == '__main__':
    startup()
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=(app.config.get('ENV') == 'development'),
        threaded=True
    )

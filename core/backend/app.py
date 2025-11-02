import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, decode_token
from flask_socketio import SocketIO, join_room, leave_room, disconnect
from dotenv import load_dotenv
import logging

from config import config
from database import db_manager, initialize_database, test_connection
from routes import register_routes

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global SocketIO instance
socketio = None

def create_app(config_name=None):
    """Application factory pattern"""
    global socketio
    
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    jwt = JWTManager(app)
    
    # Initialize SocketIO with CORS support
    socketio = SocketIO(
        app,
        cors_allowed_origins="*",
        async_mode='threading',
        logger=True,
        engineio_logger=True,
        ping_timeout=60,
        ping_interval=25
    )
    
    # Set socketio instance for sync_events
    from utils.sync_events import set_socketio
    set_socketio(socketio)
    
    # Initialize data cleaner jobs
    from jobs.data_cleaner import init_data_cleaner
    init_data_cleaner()
    
    # Initialize database connection
    initialize_database()
    
    # Test database connection on startup
    try:
        if test_connection():
            print("✓ Database connection successful")
        else:
            print("✗ Database connection failed")
    except Exception as e:
        print(f"✗ Database connection error: {e}")

    # Since blacklist is enabled in config, ensure tokens are not inadvertently rejected
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        # Implement real blacklist logic later; for now no tokens are revoked
        return False
    
    # JWT Error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token has expired',
            'message': 'Please login again'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Invalid token',
            'message': 'Please provide a valid token'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': 'Authorization token required',
            'message': 'Please provide a valid JWT token'
        }), 401
    
    # Configure CORS - Enhanced for better browser compatibility
    CORS(app, 
         resources={r"/*": {
             "origins": "*",
             "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
             "expose_headers": [
                 "Content-Type", "Authorization", 
                 "X-File-IV", "X-File-Algo", "X-File-Name",
                 "Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers"
             ],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
             "supports_credentials": False
         }})
    
    # Enhanced CORS handler for all responses
    @app.after_request
    def after_request(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
        response.headers['Access-Control-Expose-Headers'] = 'Content-Type, Authorization, X-File-IV, X-File-Algo, X-File-Name, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers'
        response.headers['Access-Control-Max-Age'] = '3600'
        return response
    
    # Explicit OPTIONS handler for preflight requests
    @app.before_request
    def handle_preflight():
        if request.method == 'OPTIONS':
            response = jsonify({'status': 'ok'})
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Access-Control-Request-Method, Access-Control-Request-Headers'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
            response.headers['Access-Control-Expose-Headers'] = 'Content-Type, Authorization, X-File-IV, X-File-Algo, X-File-Name, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers'
            response.headers['Access-Control-Max-Age'] = '3600'
            return response, 200
    
    # Register routes
    register_routes(app)
    
    # Create upload directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Database initialization - already done in initialize_database()
    with app.app_context():
        try:
            # Database tables already exist, no need to create
            print("✓ Database tables ready")
        except Exception as e:
            print(f"Warning: Database setup issue: {e}")
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    @app.errorhandler(413)
    def file_too_large(error):
        return jsonify({'error': 'File too large'}), 413
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request'}), 400
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({'error': 'Method not allowed'}), 405
    
    # Global OPTIONS route handler for CORS
    @app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
    @app.route('/<path:path>', methods=['OPTIONS'])
    def options_handler(path):
        return '', 204
    
    # WebSocket Event Handlers
    @socketio.on('connect')
    def handle_connect(auth):
        """Handle WebSocket connection with JWT authentication"""
        try:
            # Extract token from auth dict
            token = None
            if auth and isinstance(auth, dict):
                token = auth.get('token')
            
            if not token:
                logger.warning("WebSocket connection attempt without token")
                disconnect()
                return False
            
            # Verify JWT token
            try:
                decoded_token = decode_token(token)
                user_id = decoded_token.get('sub')
                
                if not user_id:
                    logger.warning("WebSocket connection with invalid token")
                    disconnect()
                    return False
                
                # Join user's personal room
                room = f'user:{user_id}'
                join_room(room)
                logger.info(f"User {user_id} connected to WebSocket and joined room {room}")
                
                return True
                
            except Exception as e:
                logger.error(f"WebSocket token verification failed: {e}")
                disconnect()
                return False
                
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            disconnect()
            return False
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle WebSocket disconnection"""
        try:
            logger.info("Client disconnected from WebSocket")
        except Exception as e:
            logger.error(f"WebSocket disconnect error: {e}")
    
    @socketio.on('ping')
    def handle_ping():
        """Handle ping from client for connection health check"""
        return {'status': 'ok', 'timestamp': os.time()}
    
    return app

if __name__ == '__main__':
    app = create_app()
    # Use socketio.run instead of app.run for WebSocket support
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)

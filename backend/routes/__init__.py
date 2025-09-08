"""
Route registration module
Import all routes and register them with the Flask app
"""
from .health import health_bp
from .auth import auth_bp
from .files import files_bp
from .shares import shares_bp

def register_routes(app):
    """Register all blueprint routes with the app"""
    
    # Register blueprints with URL prefixes
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(files_bp, url_prefix='/api/files')
    app.register_blueprint(shares_bp, url_prefix='/api/shares')
    
    # Root route for API health check
    @app.route('/api', methods=['GET', 'OPTIONS'])
    def api_health_check():
        return {'status': 'ok', 'message': 'CryptoVault API is running'}

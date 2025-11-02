"""
Route registration module
Import all routes and register them with the Flask app
"""
from .health import health_bp
from .auth import auth_bp
from .files import files_bp
from .shares import shares_bp
from .sync import sync_bp
from .users import users_bp
from flask import Blueprint
from middleware.auth import auth_required

# Create bulk operations blueprint
bulk_bp = Blueprint('bulk', __name__)

# Import bulk controller functions
from .bulkController import bulk_delete_files, bulk_share_files, bulk_download_info

# Register bulk routes
@bulk_bp.route('/api/files/bulk-delete', methods=['POST'])
@auth_required
def bulk_delete():
    return bulk_delete_files()

@bulk_bp.route('/api/files/bulk-share', methods=['POST'])
@auth_required
def bulk_share():
    return bulk_share_files()

@bulk_bp.route('/api/files/bulk-download-info', methods=['POST'])
@auth_required
def bulk_download():
    return bulk_download_info()

def register_routes(app):
    """Register all blueprint routes with the app"""
    
    # Register blueprints with URL prefixes
    app.register_blueprint(health_bp)  # health_bp already has /health prefix in routes
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(files_bp, url_prefix='/api/files')  # files_bp is now files_v2
    app.register_blueprint(shares_bp)  # shares_bp has its own /api prefix in routes
    app.register_blueprint(sync_bp)    # sync_bp has its own /api prefix in routes
    app.register_blueprint(bulk_bp)    # Register bulk operations blueprint
    app.register_blueprint(users_bp)   # Register users blueprint for profile management
    
    # Root route for API health check
    @app.route('/api', methods=['GET', 'OPTIONS'])
    def api_health_check():
        return {'status': 'ok', 'message': 'CryptoVault API is running'}

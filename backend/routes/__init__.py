from flask import Blueprint

# Import all route modules
from .health import health_bp
from .auth import auth_bp
from .files import files_bp
from .shares import shares_bp

def register_routes(app):
    """Register all application routes"""
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(files_bp)
    app.register_blueprint(shares_bp)

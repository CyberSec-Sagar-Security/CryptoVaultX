import os
from flask import Flask, jsonify, request
from flask.cli import with_appcontext
from models import User, File, SharedFile, Session, get_db, init_database, engine
from sqlalchemy import text
from datetime import datetime

app = Flask(__name__)

# Configure app
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

@app.route('/')
def home():
    return jsonify({
        "message": "CryptoVault Backend Running!",
        "status": "healthy",
        "version": "1.0.0",
        "database": "connected" if check_db_connection() else "disconnected"
    })

@app.route('/health')
def health():
    db_status = check_db_connection()
    return jsonify({
        "status": "healthy",
        "database": "connected" if db_status else "disconnected",
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route('/api/stats')
def get_stats():
    """Get basic database statistics."""
    try:
        db = next(get_db())
        
        user_count = db.query(User).count()
        file_count = db.query(File).count()
        share_count = db.query(SharedFile).count()
        session_count = db.query(Session).filter(Session.is_active == True).count()
        
        return jsonify({
            "users": user_count,
            "files": file_count,
            "shares": share_count,
            "active_sessions": session_count,
            "status": "success"
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/users')
def get_users():
    """Get list of all users (for development/testing)."""
    try:
        db = next(get_db())
        users = db.query(User).all()
        
        users_data = []
        for user in users:
            users_data.append({
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat(),
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "file_count": len(user.uploaded_files),
                "shared_file_count": len(user.shared_files_received)
            })
        
        return jsonify({
            "users": users_data,
            "count": len(users_data),
            "status": "success"
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/files')
def get_files():
    """Get list of all files (for development/testing)."""
    try:
        db = next(get_db())
        files = db.query(File).all()
        
        files_data = []
        for file in files:
            files_data.append({
                "id": str(file.id),
                "filename": file.filename,
                "original_filename": file.original_filename,
                "file_size": file.file_size,
                "mime_type": file.mime_type,
                "description": file.description,
                "is_public": file.is_public,
                "download_count": file.download_count,
                "owner": {
                    "username": file.owner.username,
                    "full_name": file.owner.full_name
                },
                "created_at": file.created_at.isoformat(),
                "updated_at": file.updated_at.isoformat(),
                "share_count": len(file.shared_files)
            })
        
        return jsonify({
            "files": files_data,
            "count": len(files_data),
            "status": "success"
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

def check_db_connection():
    """Check if database connection is working."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return result.fetchone() is not None
    except Exception as e:
        print(f"Database connection error: {e}")
        return False

@app.cli.command('init-db')
@with_appcontext
def init_db_command():
    """Initialize the database with tables and sample data."""
    init_database()
    print('Database initialized successfully!')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

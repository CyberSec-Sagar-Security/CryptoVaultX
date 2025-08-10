import os
import hashlib
from flask import Flask, jsonify, request
from flask.cli import with_appcontext
from flask_cors import CORS
from datetime import datetime

# Try to import models for database access
try:
    from models import User, File, SharedFile, Session, get_db, init_database, engine
    from sqlalchemy import text
    USE_DB = True
    print("Using PostgreSQL database")
except Exception as e:
    print(f"Database connection failed: {e}")
    print("Using in-memory database instead")
    from in_memory_db import InMemoryDB
    USE_DB = False

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

# Configure app
app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY", "dev-secret-key-change-in-production"
)


@app.route("/")
def home():
    return jsonify(
        {
            "message": "CryptoVault Backend Running!",
            "status": "healthy",
            "version": "1.0.0",
            "database": "connected" if USE_DB and check_db_connection() else "in-memory",
        }
    )


@app.route("/health")
def health():
    db_status = USE_DB and check_db_connection()
    db_type = "PostgreSQL" if USE_DB else "In-Memory"
    return jsonify(
        {
            "status": "healthy",
            "database": f"{db_type} {'connected' if db_status else 'active'}",
            "timestamp": datetime.utcnow().isoformat(),
            "mode": "production" if USE_DB else "development"
        }
    )


@app.route("/api/stats")
def get_stats():
    """Get basic database statistics."""
    try:
        if USE_DB:
            try:
                # Use PostgreSQL database
                db = next(get_db())
                user_count = db.query(User).count()
                file_count = db.query(File).count()
                share_count = db.query(SharedFile).count()
                session_count = db.query(Session).filter(Session.is_active.is_(True)).count()
            except Exception as db_error:
                print(f"Database error: {db_error}")
                # Fall back to in-memory database
                file_count = len(InMemoryDB.get_all_files())
                user_count = 1  # Demo user
                share_count = 0
                session_count = 1  # Demo session
        else:
            # Use in-memory database
            file_count = len(InMemoryDB.get_all_files())
            user_count = 1  # Demo user
            share_count = 0
            session_count = 1  # Demo session

        return jsonify(
            {
                "users": user_count,
                "files": file_count,
                "shares": share_count,
                "active_sessions": session_count,
                "status": "success",
                "storage_mode": "database" if USE_DB else "in-memory",
            }
        )
    except Exception as e:
        print(f"Error getting stats: {str(e)}")
        return jsonify({"error": str(e), "status": "error"}), 500


@app.route("/api/users")
def get_users():
    """Get list of all users (for development/testing)."""
    try:
        if USE_DB:
            try:
                # Use PostgreSQL database
                db = next(get_db())
                users = db.query(User).all()

                users_data = []
                for user in users:
                    users_data.append(
                        {
                            "id": str(user.id),
                            "username": user.username,
                            "email": user.email,
                            "full_name": user.full_name,
                            "is_active": user.is_active,
                            "is_verified": user.is_verified,
                            "created_at": user.created_at.isoformat(),
                            "last_login": (
                                user.last_login.isoformat() if user.last_login else None
                            ),
                            "file_count": len(user.uploaded_files),
                            "shared_file_count": len(user.shared_files_received),
                        }
                    )
            except Exception as db_error:
                print(f"Database error: {db_error}")
                # Fall back to in-memory
                demo_user = InMemoryDB.get_demo_user()
                users_data = [{
                    "id": demo_user["id"],
                    "username": demo_user["username"],
                    "email": demo_user["email"],
                    "full_name": demo_user["full_name"],
                    "is_active": demo_user["is_active"],
                    "is_verified": demo_user["is_verified"],
                    "created_at": demo_user["created_at"],
                    "last_login": None,
                    "file_count": len(InMemoryDB.get_all_files()),
                    "shared_file_count": 0,
                }]
        else:
            # Use in-memory database
            demo_user = InMemoryDB.get_demo_user()
            users_data = [{
                "id": demo_user["id"],
                "username": demo_user["username"],
                "email": demo_user["email"],
                "full_name": demo_user["full_name"],
                "is_active": demo_user["is_active"],
                "is_verified": demo_user["is_verified"],
                "created_at": demo_user["created_at"],
                "last_login": None,
                "file_count": len(InMemoryDB.get_all_files()),
                "shared_file_count": 0,
            }]

        return jsonify(
            {"users": users_data, "count": len(users_data), "status": "success"}
        )
    except Exception as e:
        print(f"Error getting users: {str(e)}")
        return jsonify({"error": str(e), "status": "error"}), 500


@app.route("/api/files")
def get_files():
    """Get list of all files (for development/testing)."""
    try:
        if USE_DB:
            # Use PostgreSQL database
            try:
                db = next(get_db())
                files = db.query(File).all()

                files_data = []
                for file in files:
                    files_data.append(
                        {
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
                                "full_name": file.owner.full_name,
                            },
                            "created_at": file.created_at.isoformat(),
                            "updated_at": file.updated_at.isoformat(),
                            "share_count": len(file.shared_files),
                        }
                    )
            except Exception as db_error:
                print(f"Database error: {db_error}")
                # Fall back to in-memory if database fails
                files_data = get_files_from_memory()
        else:
            # Use in-memory database
            files_data = get_files_from_memory()

        return jsonify(
            {"files": files_data, "count": len(files_data), "status": "success"}
        )
    except Exception as e:
        print(f"Error getting files: {str(e)}")
        return jsonify({"error": str(e), "status": "error"}), 500


def get_files_from_memory():
    """Get files from in-memory database"""
    files = InMemoryDB.get_all_files()
    files_data = []
    
    for file in files:
        files_data.append({
            "id": file["id"],
            "filename": file["filename"],
            "original_filename": file["original_filename"],
            "file_size": file["file_size"],
            "mime_type": file["mime_type"],
            "owner": {
                "username": file["owner_username"],
            },
            "created_at": file["created_at"],
            "updated_at": file["updated_at"],
        })
        
    return files_data


@app.route("/api/upload", methods=["POST"])
def upload_file():
    """Upload an encrypted file to the server."""
    try:
        # Check if file is in request
        if "file" not in request.files:
            return jsonify({"error": "No file part", "status": "error"}), 400
            
        file = request.files["file"]
        
        # Check if file was selected
        if file.filename == "":
            return jsonify({"error": "No file selected", "status": "error"}), 400
            
        # Get file metadata from form
        original_filename = request.form.get("fileName", "unknown")
        file_size = request.form.get("fileSize", 0)
        mime_type = request.form.get("fileType", "application/octet-stream")
        iv = request.form.get("iv")
        
        if not iv:
            return jsonify({"error": "Missing initialization vector (IV)", "status": "error"}), 400
        
        # Read the encrypted file data
        encrypted_content = file.read()
        
        # Create a simple hash for file integrity
        file_hash = hashlib.sha256(encrypted_content).hexdigest()
        
        # Create a temporary filename based on timestamp and original filename
        filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{original_filename}.encrypted"
        
        if USE_DB:
            # Use PostgreSQL database
            try:
                # For Phase 4 demo, we'll save files without requiring authentication
                # In a real application, we would authenticate the user first
                # Hard-code a demo user for now (in Phase 5, we'll add authentication)
                db = next(get_db())
                demo_user = db.query(User).first()
                
                if not demo_user:
                    # Create a demo user if none exists
                    from werkzeug.security import generate_password_hash
                    demo_user = User(
                        username="demo_user",
                        email="demo@example.com",
                        hashed_password=generate_password_hash("password123"),
                        full_name="Demo User"
                    )
                    db.add(demo_user)
                    db.commit()
                
                # Create a placeholder for encryption key hash (in Phase 5 we'll implement proper key management)
                encryption_key_hash = hashlib.sha256(b"placeholder").hexdigest()
                
                # Create a new file record
                new_file = File(
                    filename=filename,
                    original_filename=original_filename,
                    file_size=file_size,
                    mime_type=mime_type,
                    file_hash=file_hash,
                    encryption_key_hash=encryption_key_hash,
                    initialization_vector=iv.encode(),
                    encrypted_content=encrypted_content,
                    owner_id=demo_user.id
                )
                
                # Save to database
                db.add(new_file)
                db.commit()
                file_id = str(new_file.id)
            except Exception as db_error:
                print(f"Database error: {db_error}")
                # Fall back to in-memory if database fails
                file_id = save_to_memory(filename, original_filename, file_size, mime_type, file_hash, iv, encrypted_content)
        else:
            # Use in-memory database
            file_id = save_to_memory(filename, original_filename, file_size, mime_type, file_hash, iv, encrypted_content)
        
        # Return success response with file ID
        return jsonify({
            "status": "success",
            "message": "File uploaded successfully",
            "fileId": file_id,
            "filename": original_filename
        })
        
    except Exception as e:
        print(f"Error uploading file: {str(e)}")
        return jsonify({"error": str(e), "status": "error"}), 500


def save_to_memory(filename, original_filename, file_size, mime_type, file_hash, iv, encrypted_content):
    """Save file to in-memory database"""
    # Get demo user
    demo_user = InMemoryDB.get_demo_user()
    
    # Create file record
    file_data = {
        "filename": filename,
        "original_filename": original_filename,
        "file_size": file_size,
        "mime_type": mime_type,
        "file_hash": file_hash,
        "initialization_vector": iv,
        "encrypted_content_length": len(encrypted_content),
        "encrypted_content": "BINARY_DATA_STORED",  # Not storing binary data in memory
        "owner_id": demo_user["id"],
        "owner_username": demo_user["username"]
    }
    
    # Save to in-memory database
    file_id = InMemoryDB.save_file(file_data)
    print(f"File saved to in-memory database with ID: {file_id}")
    return file_id


def check_db_connection():
    """Check if database connection is working."""
    if not USE_DB:
        # Using in-memory database, always "connected"
        return True
        
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return result.fetchone() is not None
    except Exception as e:
        print(f"Database connection error: {e}")
        return False


@app.cli.command("init-db")
@with_appcontext
def init_db_command():
    """Initialize the database with tables and sample data."""
    init_database()
    print("Database initialized successfully!")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

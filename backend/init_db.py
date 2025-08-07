"""
Database initialization and seed script for CryptoVault.
Creates tables and populates with sample data for development and testing.
"""

import sys
import os
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import hashlib
import secrets

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import (
    User,
    File,
    SharedFile,
    Session,
    engine,
    SessionLocal,
    Base,
    init_database,
)


def create_sample_users(db_session):
    """Create sample users for development and testing."""

    # Sample users data
    sample_users = [
        {
            "username": "tony_stark",
            "email": "tony@starkindustries.com",
            "password": "ironman123",
            "full_name": "Tony Stark",
            "is_verified": True,
        },
        {
            "username": "steve_rogers",
            "email": "steve@shield.gov",
            "password": "captain123",
            "full_name": "Steve Rogers",
            "is_verified": True,
        },
        {
            "username": "natasha_romanoff",
            "email": "natasha@shield.gov",
            "password": "widow123",
            "full_name": "Natasha Romanoff",
            "is_verified": True,
        },
        {
            "username": "bruce_banner",
            "email": "bruce@gamma.research",
            "password": "hulk123",
            "full_name": "Bruce Banner",
            "is_verified": False,
        },
    ]

    created_users = []

    for user_data in sample_users:
        # Check if user already exists
        existing_user = (
            db_session.query(User)
            .filter(User.username == user_data["username"])
            .first()
        )
        if existing_user:
            print(f"User {user_data['username']} already exists, skipping...")
            created_users.append(existing_user)
            continue

        # Create new user
        new_user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=generate_password_hash(user_data["password"]),
            full_name=user_data["full_name"],
            is_active=True,
            is_verified=user_data["is_verified"],
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow() - timedelta(days=1),
        )

        db_session.add(new_user)
        created_users.append(new_user)
        print(f"Created user: {user_data['username']}")

    db_session.commit()
    return created_users


def create_sample_files(db_session, users):
    """Create sample encrypted files for development and testing."""

    # Sample files data
    sample_files = [
        {
            "filename": "arc_reactor_blueprints.pdf",
            "original_filename": "Arc Reactor Blueprints v3.pdf",
            "content": b"This is encrypted content of Arc Reactor blueprints...",
            "description": "Confidential blueprints for the Arc Reactor technology",
            "mime_type": "application/pdf",
            "owner_username": "tony_stark",
            "is_public": False,
        },
        {
            "filename": "shield_protocols.docx",
            "original_filename": "SHIELD Security Protocols.docx",
            "content": b"This is encrypted content of SHIELD protocols...",
            "description": "Top secret SHIELD security protocols and procedures",
            "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "owner_username": "steve_rogers",
            "is_public": False,
        },
        {
            "filename": "gamma_radiation_study.pdf",
            "original_filename": "Gamma Radiation Effects Study.pdf",
            "content": b"This is encrypted content of gamma radiation research...",
            "description": "Research data on gamma radiation effects on human physiology",
            "mime_type": "application/pdf",
            "owner_username": "bruce_banner",
            "is_public": True,
        },
        {
            "filename": "mission_report_budapest.txt",
            "original_filename": "Budapest Mission Report - Classified.txt",
            "content": b"This is encrypted content of the Budapest mission report...",
            "description": "Classified mission report from Budapest operation",
            "mime_type": "text/plain",
            "owner_username": "natasha_romanoff",
            "is_public": False,
        },
    ]

    created_files = []
    user_map = {user.username: user for user in users}

    for file_data in sample_files:
        # Get owner user
        owner = user_map.get(file_data["owner_username"])
        if not owner:
            print(f"Owner {file_data['owner_username']} not found, skipping file...")
            continue

        # Check if file already exists
        existing_file = (
            db_session.query(File)
            .filter(File.filename == file_data["filename"], File.owner_id == owner.id)
            .first()
        )
        if existing_file:
            print(
                f"File {file_data['filename']} already exists for {owner.username}, skipping..."
            )
            created_files.append(existing_file)
            continue

        # Generate encryption metadata (simulated)
        content = file_data["content"]
        encryption_key = secrets.token_bytes(32)  # 256-bit key
        initialization_vector = secrets.token_bytes(16)  # 128-bit IV

        # Calculate hashes
        file_hash = hashlib.sha256(content).hexdigest()
        encryption_key_hash = hashlib.sha256(encryption_key).hexdigest()

        # Create new file
        new_file = File(
            filename=file_data["filename"],
            original_filename=file_data["original_filename"],
            file_size=len(content),
            mime_type=file_data["mime_type"],
            file_hash=file_hash,
            encryption_key_hash=encryption_key_hash,
            initialization_vector=initialization_vector,
            encrypted_content=content,  # In real implementation, this would be encrypted
            description=file_data["description"],
            is_public=file_data["is_public"],
            owner_id=owner.id,
            created_at=datetime.utcnow(),
            expires_at=(
                datetime.utcnow() + timedelta(days=365)
                if file_data["is_public"]
                else None
            ),
        )

        db_session.add(new_file)
        created_files.append(new_file)
        print(f"Created file: {file_data['filename']} for {owner.username}")

    db_session.commit()
    return created_files


def create_sample_shared_files(db_session, users, files):
    """Create sample file shares between users."""

    user_map = {user.username: user for user in users}
    file_map = {(file.filename, file.owner.username): file for file in files}

    # Sample sharing data
    sharing_data = [
        {
            "file_key": ("arc_reactor_blueprints.pdf", "tony_stark"),
            "shared_with": "steve_rogers",
            "shared_by": "tony_stark",
            "can_download": True,
            "can_reshare": False,
            "share_message": "Steve, please review these blueprints for security assessment.",
        },
        {
            "file_key": ("shield_protocols.docx", "steve_rogers"),
            "shared_with": "natasha_romanoff",
            "shared_by": "steve_rogers",
            "can_download": True,
            "can_reshare": True,
            "share_message": "Natasha, you need access to the updated protocols.",
        },
        {
            "file_key": ("gamma_radiation_study.pdf", "bruce_banner"),
            "shared_with": "tony_stark",
            "shared_by": "bruce_banner",
            "can_download": True,
            "can_reshare": False,
            "share_message": "Tony, this might help with your arc reactor research.",
        },
    ]

    created_shares = []

    for share_data in sharing_data:
        file = file_map.get(share_data["file_key"])
        shared_with_user = user_map.get(share_data["shared_with"])
        shared_by_user = user_map.get(share_data["shared_by"])

        if not all([file, shared_with_user, shared_by_user]):
            print(f"Missing data for share: {share_data}, skipping...")
            continue

        # Check if share already exists
        existing_share = (
            db_session.query(SharedFile)
            .filter(
                SharedFile.file_id == file.id,
                SharedFile.shared_with_user_id == shared_with_user.id,
            )
            .first()
        )
        if existing_share:
            print(
                f"Share already exists: {file.filename} with {shared_with_user.username}, skipping..."
            )
            created_shares.append(existing_share)
            continue

        # Create new share
        new_share = SharedFile(
            file_id=file.id,
            shared_with_user_id=shared_with_user.id,
            shared_by_user_id=shared_by_user.id,
            can_read=True,
            can_download=share_data["can_download"],
            can_reshare=share_data["can_reshare"],
            share_message=share_data["share_message"],
            shared_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=30),
        )

        db_session.add(new_share)
        created_shares.append(new_share)
        print(f"Created share: {file.filename} with {shared_with_user.username}")

    db_session.commit()
    return created_shares


def create_sample_sessions(db_session, users):
    """Create sample active sessions for users."""

    sample_sessions = [
        {
            "username": "tony_stark",
            "ip_address": "192.168.1.100",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "device_info": "Windows Desktop - Chrome",
            "location": "Malibu, CA",
        },
        {
            "username": "steve_rogers",
            "ip_address": "10.0.0.50",
            "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "device_info": "MacBook Pro - Safari",
            "location": "Washington, DC",
        },
    ]

    created_sessions = []
    user_map = {user.username: user for user in users}

    for session_data in sample_sessions:
        user = user_map.get(session_data["username"])
        if not user:
            print(f"User {session_data['username']} not found, skipping session...")
            continue

        # Generate session token
        session_token = secrets.token_urlsafe(32)

        # Create new session
        new_session = Session(
            session_token=session_token,
            user_id=user.id,
            ip_address=session_data["ip_address"],
            user_agent=session_data["user_agent"],
            device_info=session_data["device_info"],
            location=session_data["location"],
            is_active=True,
            login_method="password",
            created_at=datetime.utcnow(),
            last_activity=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=7),
        )

        db_session.add(new_session)
        created_sessions.append(new_session)
        print(f"Created session for: {user.username}")

    db_session.commit()
    return created_sessions


def main():
    """Main function to initialize database and create sample data."""
    print("=== CryptoVault Database Initialization ===")

    try:
        # Initialize database tables
        print("\n1. Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("   ✅ Database tables created successfully!")

        # Create database session
        db_session = SessionLocal()

        # Create sample data
        print("\n2. Creating sample users...")
        users = create_sample_users(db_session)
        print(f"   ✅ Created {len(users)} users")

        print("\n3. Creating sample files...")
        files = create_sample_files(db_session, users)
        print(f"   ✅ Created {len(files)} files")

        print("\n4. Creating sample file shares...")
        shares = create_sample_shared_files(db_session, users, files)
        print(f"   ✅ Created {len(shares)} file shares")

        print("\n5. Creating sample sessions...")
        sessions = create_sample_sessions(db_session, users)
        print(f"   ✅ Created {len(sessions)} active sessions")

        print("\n=== Database Initialization Complete! ===")
        print("\nSample Users Created:")
        for user in users:
            print(
                f"  • {user.username} ({user.email}) - {'Verified' if user.is_verified else 'Unverified'}"
            )

        print("\nSample Files Created:")
        for file in files:
            print(
                f"  • {file.filename} by {file.owner.username} - {'Public' if file.is_public else 'Private'}"
            )

        print("\nSample Credentials (for testing):")
        print("  Username: tony_stark | Password: ironman123")
        print("  Username: steve_rogers | Password: captain123")
        print("  Username: natasha_romanoff | Password: widow123")
        print("  Username: bruce_banner | Password: hulk123")

        print("\n🎉 CryptoVault database is ready for use!")

        # Close database session
        db_session.close()
    except Exception as e:
        print(f"❌ Error initializing database: {str(e)}")
        import traceback

        traceback.print_exc()
        return 1

    return 0


if __name__ == "__main__":
    exit(main())

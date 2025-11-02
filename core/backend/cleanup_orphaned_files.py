"""
Cleanup Orphaned Files - Remove physical files that no longer exist in database
This script should be run to clean up the storage after the fix is deployed.
"""
import os
import sys
from pathlib import Path

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent))

from storage_manager import storage_manager
from database import File, db_manager
from config import DB_CONFIG

def cleanup_orphaned_files(dry_run=True):
    """
    Remove physical files that don't have corresponding database records
    
    Args:
        dry_run: If True, only print what would be deleted without actually deleting
    """
    print("=" * 80)
    print("🧹 ORPHANED FILES CLEANUP UTILITY")
    print("=" * 80)
    print(f"Mode: {'DRY RUN (no files will be deleted)' if dry_run else 'LIVE (files will be deleted)'}")
    print()
    
    total_files_scanned = 0
    total_orphaned = 0
    total_size_freed = 0
    
    try:
        # Get all files from database
        query = "SELECT id, storage_path FROM files WHERE storage_path IS NOT NULL"
        db_files = db_manager.execute_query(query, fetch=True)
        db_storage_paths = {row['storage_path'] for row in db_files}
        
        print(f"📊 Database records: {len(db_storage_paths)} files")
        print()
        
        # Scan all user storage folders
        storage_root = storage_manager.storage_root
        
        if not storage_root.exists():
            print(f"❌ Storage root not found: {storage_root}")
            return
        
        print(f"📁 Scanning storage directory: {storage_root}")
        print()
        
        # Iterate through each user folder
        for user_folder in storage_root.iterdir():
            if not user_folder.is_dir():
                continue
            
            username = user_folder.name
            print(f"👤 Checking user: {username}")
            
            uploads_folder = user_folder / "uploads"
            
            if not uploads_folder.exists():
                print(f"   ⚠️  No uploads folder found")
                continue
            
            # Check each file in uploads folder
            user_orphaned = 0
            user_size_freed = 0
            
            for file_path in uploads_folder.iterdir():
                if not file_path.is_file():
                    continue
                
                total_files_scanned += 1
                
                # Get relative path from project root (same format as database)
                try:
                    relative_path = str(file_path.relative_to(Path.cwd()))
                except ValueError:
                    # If file is not relative to cwd, use absolute path comparison
                    relative_path = str(file_path)
                
                # Check if this file exists in database
                if relative_path not in db_storage_paths:
                    file_size = file_path.stat().st_size
                    total_orphaned += 1
                    user_orphaned += 1
                    total_size_freed += file_size
                    user_size_freed += file_size
                    
                    print(f"   🗑️  ORPHANED: {file_path.name} ({format_size(file_size)})")
                    
                    if not dry_run:
                        try:
                            os.remove(file_path)
                            print(f"   ✅ DELETED: {file_path.name}")
                        except Exception as e:
                            print(f"   ❌ FAILED TO DELETE: {e}")
            
            if user_orphaned > 0:
                print(f"   📊 User total: {user_orphaned} orphaned files, {format_size(user_size_freed)} freed")
            else:
                print(f"   ✅ No orphaned files found")
            
            print()
        
        # Summary
        print("=" * 80)
        print("📊 CLEANUP SUMMARY")
        print("=" * 80)
        print(f"Total files scanned: {total_files_scanned}")
        print(f"Orphaned files found: {total_orphaned}")
        print(f"Storage space {'that would be' if dry_run else ''} freed: {format_size(total_size_freed)}")
        
        if dry_run and total_orphaned > 0:
            print()
            print("⚠️  This was a DRY RUN. No files were actually deleted.")
            print("💡 To actually delete the files, run: python cleanup_orphaned_files.py --delete")
        elif total_orphaned > 0:
            print()
            print("✅ Cleanup completed successfully!")
        else:
            print()
            print("✅ No orphaned files found. Storage is clean!")
        
        print("=" * 80)
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Close database connection
        if hasattr(db_manager, 'close'):
            db_manager.close()

def format_size(bytes_size):
    """Format bytes to human-readable size"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.2f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.2f} TB"

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Cleanup orphaned files from storage')
    parser.add_argument('--delete', action='store_true', 
                       help='Actually delete orphaned files (default is dry run)')
    
    args = parser.parse_args()
    
    cleanup_orphaned_files(dry_run=not args.delete)

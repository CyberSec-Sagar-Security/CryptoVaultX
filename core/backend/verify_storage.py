"""
Verify database state - check files with storage_blob vs storage_path
"""
from database import db_manager

print("=" * 70)
print("CryptoVault File Storage Analysis")
print("=" * 70)

with db_manager.get_connection() as conn:
    cursor = conn.cursor()
    
    # Check total files
    cursor.execute("SELECT COUNT(*) FROM files")
    total_files = cursor.fetchone()[0]
    print(f"\n📊 Total Files: {total_files}")
    
    # Check files with storage_blob (old system)
    cursor.execute("SELECT COUNT(*) FROM files WHERE storage_blob IS NOT NULL")
    blob_files = cursor.fetchone()[0]
    print(f"   🗄️  Files with storage_blob (old): {blob_files}")
    
    # Check files with storage_path (new system)
    cursor.execute("SELECT COUNT(*) FROM files WHERE storage_path IS NOT NULL")
    path_files = cursor.fetchone()[0]
    print(f"   📁 Files with storage_path (new): {path_files}")
    
    # Check files with both
    cursor.execute("SELECT COUNT(*) FROM files WHERE storage_blob IS NOT NULL AND storage_path IS NOT NULL")
    both_files = cursor.fetchone()[0]
    print(f"   🔄 Files with both: {both_files}")
    
    # Check files with neither (should be 0!)
    cursor.execute("SELECT COUNT(*) FROM files WHERE storage_blob IS NULL AND storage_path IS NULL")
    neither_files = cursor.fetchone()[0]
    print(f"   ⚠️  Files with neither: {neither_files}")
    
    if neither_files > 0:
        print(f"\n⚠️  WARNING: {neither_files} files have no storage method!")
        cursor.execute("""
            SELECT id, original_filename, owner_id, created_at 
            FROM files 
            WHERE storage_blob IS NULL AND storage_path IS NULL
            LIMIT 5
        """)
        orphaned = cursor.fetchall()
        print("\nOrphaned files:")
        for file in orphaned:
            print(f"  - {file[1]} (ID: {file[0]}, Owner: {file[2]}, Created: {file[3]})")
    
    # Show recent files
    print(f"\n📋 Recent Files (last 5):")
    cursor.execute("""
        SELECT 
            id, 
            original_filename, 
            size_bytes,
            CASE 
                WHEN storage_path IS NOT NULL AND storage_blob IS NOT NULL THEN 'BOTH'
                WHEN storage_path IS NOT NULL THEN 'LOCAL'
                WHEN storage_blob IS NOT NULL THEN 'DATABASE'
                ELSE 'NONE'
            END as storage_type,
            created_at
        FROM files 
        ORDER BY created_at DESC 
        LIMIT 5
    """)
    recent = cursor.fetchall()
    for file in recent:
        print(f"   • {file[1]}")
        print(f"     Size: {file[2]} bytes | Storage: {file[3]} | Created: {file[4]}")
    
print("\n" + "=" * 70)
print("✅ Analysis Complete")
print("=" * 70)

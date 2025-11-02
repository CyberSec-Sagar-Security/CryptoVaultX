"""
Migration Script: Fix Timezone-Naive Timestamps
Converts existing timezone-aware timestamps that were incorrectly stored as local time back to UTC
"""

import psycopg2
from datetime import datetime, timezone, timedelta

# Database connection parameters
DB_PARAMS = {
    'host': 'localhost',
    'port': 5432,
    'database': 'cryptovault_db',
    'user': 'cryptovault_user',
    'password': 'sql123'
}

def fix_timestamps():
    """Fix all timestamps by converting from IST to UTC"""
    conn = None
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()
        
        print("🔧 Starting timestamp migration...")
        print("=" * 60)
        
        # IST is UTC+5:30
        ist_offset = timedelta(hours=5, minutes=30)
        
        # Fix users table
        print("\n📊 Fixing users table...")
        cur.execute("""
            UPDATE users 
            SET created_at = created_at - INTERVAL '5 hours 30 minutes',
                updated_at = updated_at - INTERVAL '5 hours 30 minutes'
            WHERE created_at AT TIME ZONE 'UTC' > NOW() - INTERVAL '7 days'
        """)
        users_updated = cur.rowcount
        print(f"✅ Updated {users_updated} user records")
        
        # Fix files table
        print("\n📁 Fixing files table...")
        cur.execute("""
            UPDATE files 
            SET created_at = created_at - INTERVAL '5 hours 30 minutes',
                updated_at = updated_at - INTERVAL '5 hours 30 minutes'
            WHERE created_at AT TIME ZONE 'UTC' > NOW() - INTERVAL '7 days'
        """)
        files_updated = cur.rowcount
        print(f"✅ Updated {files_updated} file records")
        
        # Fix shares table
        print("\n🔗 Fixing shares table...")
        cur.execute("""
            UPDATE shares 
            SET created_at = created_at - INTERVAL '5 hours 30 minutes'
            WHERE created_at AT TIME ZONE 'UTC' > NOW() - INTERVAL '7 days'
        """)
        shares_updated = cur.rowcount
        print(f"✅ Updated {shares_updated} share records")
        
        # Fix sync_events table (if exists)
        print("\n🔄 Fixing sync_events table...")
        try:
            cur.execute("""
                UPDATE sync_events 
                SET created_at = created_at - INTERVAL '5 hours 30 minutes'
                WHERE created_at AT TIME ZONE 'UTC' > NOW() - INTERVAL '7 days'
            """)
            sync_updated = cur.rowcount
            print(f"✅ Updated {sync_updated} sync event records")
        except psycopg2.errors.UndefinedTable:
            sync_updated = 0
            print("⚠️  sync_events table doesn't exist (skipping)")
        
        # Commit changes
        conn.commit()
        
        print("\n" + "=" * 60)
        print("✅ Timestamp migration completed successfully!")
        print(f"📈 Total records updated: {users_updated + files_updated + shares_updated + sync_updated}")
        print("=" * 60)
        
        # Show sample of fixed timestamps
        print("\n📋 Sample of fixed timestamps:")
        cur.execute("""
            SELECT original_filename, created_at, updated_at
            FROM files 
            ORDER BY created_at DESC 
            LIMIT 5
        """)
        for row in cur.fetchall():
            print(f"   • {row[0]}: {row[1]} (UTC)")
        
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    print("🚀 CryptoVault Timestamp Migration")
    print("This script will fix timezone-naive timestamps by converting from IST to UTC")
    print()
    
    response = input("⚠️  This will modify database records. Continue? (yes/no): ")
    if response.lower() == 'yes':
        fix_timestamps()
    else:
        print("❌ Migration cancelled")

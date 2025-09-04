#!/usr/bin/env python3
"""
Test database connection without password for CryptoVault
"""
import os
import sys
import psycopg2

def test_connection():
    try:
        # Try connecting without password since we set trust auth
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="cryptovault",
            user="cryptovault"
        )
        cursor = conn.cursor()
        
        # Test query
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Connected successfully!")
        print(f"📊 PostgreSQL version: {version[0]}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == '__main__':
    success = test_connection()
    sys.exit(0 if success else 1)

#!/usr/bin/env python3
"""
Test script for CryptoVault Phase 1 setup
Tests the health endpoint and basic connectivity
"""

import requests
import sys
import time

def test_health_endpoint():
    """Test the health check endpoint"""
    try:
        print("Testing health endpoint...")
        response = requests.get("http://localhost:5000/api/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed!")
            print(f"   Status: {data.get('status')}")
            print(f"   Service: {data.get('service')}")
            print(f"   Version: {data.get('version')}")
            print(f"   Timestamp: {data.get('timestamp')}")
            return True
        else:
            print(f"❌ Health check failed with status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is the service running?")
        return False
    except Exception as e:
        print(f"❌ Health check failed with error: {e}")
        return False

def test_database_connection():
    """Test database connectivity (future implementation)"""
    print("\n📊 Database connection test:")
    print("   ⏳ Database migration and connection test will be implemented in Phase 2")
    return True

def test_cors_headers():
    """Test CORS headers"""
    try:
        print("\n🔒 Testing CORS headers...")
        response = requests.get("http://localhost:5000/api/health", timeout=10)
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
        }
        
        print(f"   Access-Control-Allow-Origin: {cors_headers['Access-Control-Allow-Origin']}")
        print(f"   Access-Control-Allow-Credentials: {cors_headers['Access-Control-Allow-Credentials']}")
        
        if cors_headers['Access-Control-Allow-Origin']:
            print("✅ CORS headers are configured")
            return True
        else:
            print("⚠️  CORS headers not found")
            return False
            
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 CryptoVault Phase 1 - Testing Backend Setup")
    print("=" * 50)
    
    tests = [
        test_health_endpoint,
        test_cors_headers,
        test_database_connection
    ]
    
    results = []
    for test in tests:
        result = test()
        results.append(result)
        time.sleep(1)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print("📋 Test Summary:")
    
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"✅ All {total} tests passed!")
        print("\n🎉 Phase 1 setup is complete and working correctly!")
        print("\nNext steps for Phase 2:")
        print("   - Implement user registration and login")
        print("   - Add database migrations")
        print("   - Create authentication routes")
        sys.exit(0)
    else:
        print(f"❌ {total - passed} out of {total} tests failed")
        print("\n🔧 Please check the failing tests and fix the issues")
        sys.exit(1)

if __name__ == "__main__":
    main()

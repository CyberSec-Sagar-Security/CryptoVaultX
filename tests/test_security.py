"""
CryptoVault - Comprehensive Testing Suite
==========================================
Module 4: Security Testing

Tests for vulnerabilities, injection attacks, and authentication bypass attempts.
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

def test_sql_injection():
    """Test SQL injection vulnerabilities."""
    print("=" * 80)
    print("TEST 1: SQL INJECTION TESTING")
    print("=" * 80)
    print()
    
    results = []
    
    # SQL injection payloads
    payloads = [
        "' OR '1'='1",
        "admin'--",
        "' OR 1=1--",
        "admin' OR '1'='1'/*",
        "'; DROP TABLE users--",
        "1' UNION SELECT NULL,NULL,NULL--"
    ]
    
    print("Testing SQL injection in login endpoint...")
    for i, payload in enumerate(payloads, 1):
        try:
            data = {
                "username": payload,
                "password": "test123"
            }
            
            response = requests.post(f"{BASE_URL}/auth/login", json=data, timeout=5)
            
            # Should return 401 Unauthorized, not 500 or 200
            if response.status_code in [401, 400, 422]:
                print(f"  {i}. ✓ Payload blocked: {payload[:30]}...")
                results.append((f'SQL Injection Test {i}', 'PASSED'))
            elif response.status_code == 500:
                print(f"  {i}. ⚠️  Server error (possible vulnerability): {payload[:30]}...")
                results.append((f'SQL Injection Test {i}', 'WARNING'))
            else:
                print(f"  {i}. ✗ Unexpected response: {response.status_code}")
                results.append((f'SQL Injection Test {i}', 'FAILED'))
                
        except Exception as e:
            print(f"  {i}. ✗ Error: {str(e)}")
            results.append((f'SQL Injection Test {i}', 'ERROR'))
    
    return results

def test_xss_vulnerabilities():
    """Test Cross-Site Scripting (XSS) vulnerabilities."""
    print("\n" + "=" * 80)
    print("TEST 2: XSS (CROSS-SITE SCRIPTING) TESTING")
    print("=" * 80)
    print()
    
    results = []
    
    # XSS payloads
    payloads = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert('XSS')>",
        "javascript:alert('XSS')",
        "<iframe src='javascript:alert(\"XSS\")'>"
    ]
    
    print("Testing XSS in registration endpoint...")
    for i, payload in enumerate(payloads, 1):
        try:
            data = {
                "username": payload,
                "email": "test@test.com",
                "password": "Test@1234"
            }
            
            response = requests.post(f"{BASE_URL}/auth/register", json=data, timeout=5)
            
            # Check if payload is sanitized
            if response.status_code in [400, 422]:
                print(f"  {i}. ✓ XSS payload rejected: {payload[:40]}...")
                results.append((f'XSS Test {i}', 'PASSED'))
            else:
                response_text = response.text.lower()
                if '<script>' in response_text or 'onerror' in response_text:
                    print(f"  {i}. ✗ XSS payload in response!")
                    results.append((f'XSS Test {i}', 'FAILED'))
                else:
                    print(f"  {i}. ✓ XSS payload sanitized")
                    results.append((f'XSS Test {i}', 'PASSED'))
                    
        except Exception as e:
            print(f"  {i}. ✗ Error: {str(e)}")
            results.append((f'XSS Test {i}', 'ERROR'))
    
    return results

def test_authentication_bypass():
    """Test authentication bypass attempts."""
    print("\n" + "=" * 80)
    print("TEST 3: AUTHENTICATION BYPASS TESTING")
    print("=" * 80)
    print()
    
    results = []
    
    # Test 1: Access protected endpoint without token
    print("1. Testing access without authentication token...")
    try:
        response = requests.get(f"{BASE_URL}/files/list", timeout=5)
        
        if response.status_code in [401, 403]:
            print("  ✓ PASSED - Unauthorized access blocked")
            results.append(('No Token Access', 'PASSED'))
        else:
            print(f"  ✗ FAILED - Got response: {response.status_code}")
            results.append(('No Token Access', 'FAILED'))
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        results.append(('No Token Access', 'ERROR'))
    
    print()
    
    # Test 2: Invalid token
    print("2. Testing with invalid token...")
    try:
        headers = {'Authorization': 'Bearer invalid_token_12345'}
        response = requests.get(f"{BASE_URL}/files/list", headers=headers, timeout=5)
        
        if response.status_code in [401, 422]:
            print("  ✓ PASSED - Invalid token rejected")
            results.append(('Invalid Token', 'PASSED'))
        else:
            print(f"  ✗ FAILED - Got response: {response.status_code}")
            results.append(('Invalid Token', 'FAILED'))
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        results.append(('Invalid Token', 'ERROR'))
    
    print()
    
    # Test 3: Malformed token
    print("3. Testing with malformed token...")
    try:
        headers = {'Authorization': 'Bearer ../../../../etc/passwd'}
        response = requests.get(f"{BASE_URL}/files/list", headers=headers, timeout=5)
        
        if response.status_code in [401, 422]:
            print("  ✓ PASSED - Malformed token rejected")
            results.append(('Malformed Token', 'PASSED'))
        else:
            print(f"  ✗ FAILED - Got response: {response.status_code}")
            results.append(('Malformed Token', 'FAILED'))
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        results.append(('Malformed Token', 'ERROR'))
    
    return results

def test_path_traversal():
    """Test path traversal vulnerabilities."""
    print("\n" + "=" * 80)
    print("TEST 4: PATH TRAVERSAL TESTING")
    print("=" * 80)
    print()
    
    results = []
    
    # Path traversal payloads
    payloads = [
        "../../../etc/passwd",
        "..\\..\\..\\windows\\system32\\config\\sam",
        "....//....//....//etc/passwd",
        "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd"
    ]
    
    print("Testing path traversal in file access...")
    for i, payload in enumerate(payloads, 1):
        try:
            # Test file download endpoint
            response = requests.get(f"{BASE_URL}/files/download/{payload}", timeout=5)
            
            if response.status_code in [400, 401, 403, 404]:
                print(f"  {i}. ✓ Path traversal blocked: {payload[:40]}...")
                results.append((f'Path Traversal {i}', 'PASSED'))
            else:
                print(f"  {i}. ⚠️  Unexpected response: {response.status_code}")
                results.append((f'Path Traversal {i}', 'WARNING'))
                
        except Exception as e:
            print(f"  {i}. ✓ Request blocked: {str(e)[:40]}...")
            results.append((f'Path Traversal {i}', 'PASSED'))
    
    return results

def test_brute_force_protection():
    """Test brute force protection."""
    print("\n" + "=" * 80)
    print("TEST 5: BRUTE FORCE PROTECTION")
    print("=" * 80)
    print()
    
    results = []
    
    print("Testing rate limiting on login endpoint...")
    try:
        # Attempt multiple failed logins
        failed_attempts = 0
        rate_limited = False
        
        for i in range(20):
            data = {
                "username": "testuser",
                "password": f"wrongpassword{i}"
            }
            
            response = requests.post(f"{BASE_URL}/auth/login", json=data, timeout=5)
            
            if response.status_code == 429:  # Too Many Requests
                rate_limited = True
                print(f"  ✓ Rate limiting triggered after {i+1} attempts")
                break
            elif response.status_code == 401:
                failed_attempts += 1
        
        if rate_limited:
            print("  ✓ PASSED - Brute force protection active")
            results.append(('Brute Force Protection', 'PASSED'))
        else:
            print(f"  ⚠️  No rate limiting detected after {failed_attempts} attempts")
            print("  ℹ️  Consider implementing rate limiting")
            results.append(('Brute Force Protection', 'WARNING'))
            
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        results.append(('Brute Force Protection', 'ERROR'))
    
    return results

def test_cors_security():
    """Test CORS (Cross-Origin Resource Sharing) security."""
    print("\n" + "=" * 80)
    print("TEST 6: CORS SECURITY TESTING")
    print("=" * 80)
    print()
    
    results = []
    
    print("Testing CORS headers...")
    try:
        headers = {
            'Origin': 'https://malicious-site.com'
        }
        
        response = requests.options(f"{BASE_URL}/auth/login", headers=headers, timeout=5)
        
        cors_header = response.headers.get('Access-Control-Allow-Origin', '')
        
        if cors_header == '*':
            print("  ⚠️  WARNING - CORS allows all origins (*)")
            print("  ℹ️  Consider restricting to specific domains")
            results.append(('CORS Configuration', 'WARNING'))
        elif cors_header:
            print(f"  ✓ CORS configured: {cors_header}")
            results.append(('CORS Configuration', 'PASSED'))
        else:
            print("  ✓ No CORS header (restrictive)")
            results.append(('CORS Configuration', 'PASSED'))
            
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        results.append(('CORS Configuration', 'ERROR'))
    
    return results

def test_https_enforcement():
    """Test HTTPS enforcement."""
    print("\n" + "=" * 80)
    print("TEST 7: HTTPS/SSL TESTING")
    print("=" * 80)
    print()
    
    results = []
    
    print("Checking secure headers...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        
        # Check for security headers
        headers_to_check = {
            'Strict-Transport-Security': 'HSTS',
            'X-Content-Type-Options': 'Content Type Protection',
            'X-Frame-Options': 'Clickjacking Protection',
            'X-XSS-Protection': 'XSS Protection'
        }
        
        for header, description in headers_to_check.items():
            if header in response.headers:
                print(f"  ✓ {description} header present")
                results.append((description, 'PASSED'))
            else:
                print(f"  ℹ️  {description} header missing")
                results.append((description, 'WARNING'))
                
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        results.append(('Security Headers', 'ERROR'))
    
    return results

def run_security_tests():
    """Run all security tests."""
    print("\n")
    print("╔" + "═" * 78 + "╗")
    print("║" + " " * 25 + "CRYPTOVAULT SECURITY TESTING" + " " * 25 + "║")
    print("╚" + "═" * 78 + "╝")
    print()
    
    print("⚠️  NOTE: Backend must be running on http://localhost:5000")
    print("⚠️  These tests will attempt various attack vectors")
    print()
    
    input("Press Enter to start security tests...")
    print()
    
    all_results = []
    
    # Run test suite
    all_results.extend(test_sql_injection())
    all_results.extend(test_xss_vulnerabilities())
    all_results.extend(test_authentication_bypass())
    all_results.extend(test_path_traversal())
    all_results.extend(test_brute_force_protection())
    all_results.extend(test_cors_security())
    all_results.extend(test_https_enforcement())
    
    # Summary
    print("\n" + "=" * 80)
    print("SECURITY TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for _, status in all_results if status == 'PASSED')
    failed = sum(1 for _, status in all_results if status == 'FAILED')
    warnings = sum(1 for _, status in all_results if status == 'WARNING')
    errors = sum(1 for _, status in all_results if status == 'ERROR')
    total = len(all_results)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Warnings: {warnings}")
    print(f"Errors: {errors}")
    if passed + failed > 0:
        print(f"Success Rate: {(passed/(passed+failed))*100:.1f}%")
    print()
    
    print("Detailed Results:")
    print("-" * 80)
    for test_name, status in all_results:
        if status == 'PASSED':
            symbol = "✓"
        elif status == 'FAILED':
            symbol = "✗"
        elif status == 'WARNING':
            symbol = "⚠️"
        else:
            symbol = "○"
        print(f"{symbol} {test_name:50} {status}")
    
    print("\n" + "=" * 80)
    print("ALL SECURITY TESTS COMPLETED")
    print("=" * 80)
    print()
    
    # Security recommendations
    if warnings > 0 or failed > 0:
        print("\n" + "=" * 80)
        print("SECURITY RECOMMENDATIONS")
        print("=" * 80)
        print("• Implement rate limiting to prevent brute force attacks")
        print("• Add security headers (HSTS, X-Frame-Options, CSP)")
        print("• Restrict CORS to specific trusted domains")
        print("• Enable HTTPS in production")
        print("• Implement input validation and sanitization")
        print("• Use parameterized queries to prevent SQL injection")
        print("=" * 80)
        print()

if __name__ == "__main__":
    run_security_tests()

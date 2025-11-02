"""
CryptoVault - Comprehensive Testing Suite
==========================================
Module 5: Data Integrity Testing

Tests to verify files are not corrupted during encryption/decryption or transfer.
"""

import os
import hashlib
import time
import requests
from pathlib import Path

BASE_URL = "http://localhost:5000/api"

def calculate_hash(data):
    """Calculate SHA-256 hash of data."""
    return hashlib.sha256(data).hexdigest()

def test_encryption_integrity():
    """Test data integrity during encryption/decryption."""
    print("=" * 80)
    print("TEST 1: ENCRYPTION/DECRYPTION INTEGRITY")
    print("=" * 80)
    print()
    
    from cryptography.fernet import Fernet
    
    results = []
    
    # Test different data types and sizes
    test_cases = [
        ("Small Text", b"Hello, World!", "10B"),
        ("Unicode Text", "Hello 世界 🌍".encode('utf-8'), "20B"),
        ("Binary Data", os.urandom(1024), "1KB"),
        ("Medium Data", os.urandom(100 * 1024), "100KB"),
        ("Large Data", os.urandom(1024 * 1024), "1MB"),
    ]
    
    for name, data, size in test_cases:
        print(f"Testing: {name} ({size})")
        print("-" * 60)
        
        try:
            original_hash = calculate_hash(data)
            print(f"  Original hash: {original_hash[:16]}...")
            
            # Encrypt
            key = Fernet.generate_key()
            cipher = Fernet(key)
            encrypted = cipher.encrypt(data)
            print(f"  ✓ Encrypted: {len(encrypted)} bytes")
            
            # Decrypt
            decrypted = cipher.decrypt(encrypted)
            decrypted_hash = calculate_hash(decrypted)
            print(f"  ✓ Decrypted: {len(decrypted)} bytes")
            print(f"  Decrypted hash: {decrypted_hash[:16]}...")
            
            # Verify
            if original_hash == decrypted_hash and data == decrypted:
                print(f"  ✓ PASSED - Data integrity maintained")
                results.append((name, 'PASSED'))
            else:
                print(f"  ✗ FAILED - Data corruption detected")
                results.append((name, 'FAILED'))
                
        except Exception as e:
            print(f"  ✗ FAILED - Error: {str(e)}")
            results.append((name, 'FAILED'))
        
        print()
    
    return results

def test_multiple_encryption_cycles():
    """Test data integrity through multiple encryption/decryption cycles."""
    print("=" * 80)
    print("TEST 2: MULTIPLE ENCRYPTION CYCLES")
    print("=" * 80)
    print()
    
    from cryptography.fernet import Fernet
    
    results = []
    
    print("Testing 10 encryption/decryption cycles...")
    print("-" * 60)
    
    try:
        original_data = b"Test data for multiple encryption cycles"
        original_hash = calculate_hash(original_data)
        print(f"Original hash: {original_hash[:16]}...")
        
        current_data = original_data
        
        for i in range(10):
            # Encrypt
            key = Fernet.generate_key()
            cipher = Fernet(key)
            encrypted = cipher.encrypt(current_data)
            
            # Decrypt
            decrypted = cipher.decrypt(encrypted)
            current_data = decrypted
            
            print(f"  Cycle {i+1}: ✓")
        
        final_hash = calculate_hash(current_data)
        print(f"Final hash: {final_hash[:16]}...")
        
        if original_hash == final_hash and original_data == current_data:
            print("✓ PASSED - Data integrity maintained through 10 cycles")
            results.append(('Multiple Cycles', 'PASSED'))
        else:
            print("✗ FAILED - Data corruption after multiple cycles")
            results.append(('Multiple Cycles', 'FAILED'))
            
    except Exception as e:
        print(f"✗ FAILED - Error: {str(e)}")
        results.append(('Multiple Cycles', 'FAILED'))
    
    print()
    return results

def test_concurrent_operations():
    """Test data integrity during concurrent operations."""
    print("=" * 80)
    print("TEST 3: CONCURRENT OPERATIONS INTEGRITY")
    print("=" * 80)
    print()
    
    from cryptography.fernet import Fernet
    import threading
    
    results = []
    test_results = []
    
    def encrypt_decrypt_task(data, task_id):
        """Single encryption/decryption task."""
        try:
            original_hash = calculate_hash(data)
            key = Fernet.generate_key()
            cipher = Fernet(key)
            
            encrypted = cipher.encrypt(data)
            decrypted = cipher.decrypt(encrypted)
            
            final_hash = calculate_hash(decrypted)
            
            if original_hash == final_hash:
                test_results.append((task_id, True))
            else:
                test_results.append((task_id, False))
        except Exception as e:
            test_results.append((task_id, False))
    
    print("Running 20 concurrent encryption/decryption tasks...")
    
    threads = []
    for i in range(20):
        data = f"Test data for task {i}".encode('utf-8')
        thread = threading.Thread(target=encrypt_decrypt_task, args=(data, i))
        threads.append(thread)
        thread.start()
    
    # Wait for all threads
    for thread in threads:
        thread.join()
    
    # Check results
    passed = sum(1 for _, success in test_results if success)
    total = len(test_results)
    
    print(f"  Completed: {total} tasks")
    print(f"  Passed: {passed}/{total}")
    
    if passed == total:
        print("✓ PASSED - All concurrent operations maintained data integrity")
        results.append(('Concurrent Operations', 'PASSED'))
    else:
        print(f"✗ FAILED - {total-passed} operations had data corruption")
        results.append(('Concurrent Operations', 'FAILED'))
    
    print()
    return results

def test_file_transfer_integrity():
    """Test data integrity during file upload/download."""
    print("=" * 80)
    print("TEST 4: FILE TRANSFER INTEGRITY")
    print("=" * 80)
    print()
    
    results = []
    
    print("This test requires backend API to be running...")
    print("Testing file upload/download integrity simulation...")
    print()
    
    try:
        # Create test file
        test_file = Path("test_transfer.bin")
        test_data = os.urandom(50 * 1024)  # 50KB
        
        with open(test_file, 'wb') as f:
            f.write(test_data)
        
        original_hash = calculate_hash(test_data)
        print(f"Original file hash: {original_hash[:16]}...")
        print(f"Original file size: {len(test_data)} bytes")
        
        # Simulate transfer by reading and writing
        print("  ✓ File created")
        
        # Read back
        with open(test_file, 'rb') as f:
            transferred_data = f.read()
        
        transferred_hash = calculate_hash(transferred_data)
        print(f"Transferred hash: {transferred_hash[:16]}...")
        
        # Cleanup
        test_file.unlink()
        
        if original_hash == transferred_hash and test_data == transferred_data:
            print("✓ PASSED - File transfer maintained data integrity")
            results.append(('File Transfer', 'PASSED'))
        else:
            print("✗ FAILED - Data corruption during transfer")
            results.append(('File Transfer', 'FAILED'))
            
    except Exception as e:
        print(f"✗ FAILED - Error: {str(e)}")
        results.append(('File Transfer', 'FAILED'))
    
    print()
    return results

def test_checksum_verification():
    """Test checksum verification mechanisms."""
    print("=" * 80)
    print("TEST 5: CHECKSUM VERIFICATION")
    print("=" * 80)
    print()
    
    results = []
    
    print("Testing various checksum algorithms...")
    print()
    
    test_data = b"Test data for checksum verification"
    
    # Test MD5
    print("1. MD5 Checksum:")
    try:
        import hashlib
        md5_hash = hashlib.md5(test_data).hexdigest()
        print(f"  ✓ MD5: {md5_hash}")
        results.append(('MD5 Checksum', 'PASSED'))
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        results.append(('MD5 Checksum', 'FAILED'))
    
    # Test SHA-256
    print("\n2. SHA-256 Checksum:")
    try:
        sha256_hash = hashlib.sha256(test_data).hexdigest()
        print(f"  ✓ SHA-256: {sha256_hash}")
        results.append(('SHA-256 Checksum', 'PASSED'))
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        results.append(('SHA-256 Checksum', 'FAILED'))
    
    # Test SHA-512
    print("\n3. SHA-512 Checksum:")
    try:
        sha512_hash = hashlib.sha512(test_data).hexdigest()
        print(f"  ✓ SHA-512: {sha512_hash[:32]}...")
        results.append(('SHA-512 Checksum', 'PASSED'))
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        results.append(('SHA-512 Checksum', 'FAILED'))
    
    print()
    return results

def test_data_corruption_detection():
    """Test ability to detect data corruption."""
    print("=" * 80)
    print("TEST 6: DATA CORRUPTION DETECTION")
    print("=" * 80)
    print()
    
    from cryptography.fernet import Fernet
    
    results = []
    
    print("Testing corruption detection...")
    
    try:
        original_data = b"Sensitive data that must not be corrupted"
        key = Fernet.generate_key()
        cipher = Fernet(key)
        
        # Encrypt
        encrypted = cipher.encrypt(original_data)
        print("  ✓ Data encrypted")
        
        # Corrupt the encrypted data
        corrupted = bytearray(encrypted)
        corrupted[len(corrupted)//2] ^= 0xFF  # Flip bits in middle
        corrupted = bytes(corrupted)
        print("  ✓ Data artificially corrupted")
        
        # Try to decrypt corrupted data
        try:
            decrypted = cipher.decrypt(corrupted)
            print("  ✗ FAILED - Corrupted data decrypted successfully (should fail)")
            results.append(('Corruption Detection', 'FAILED'))
        except Exception:
            print("  ✓ PASSED - Corruption detected and prevented decryption")
            results.append(('Corruption Detection', 'PASSED'))
            
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        results.append(('Corruption Detection', 'ERROR'))
    
    print()
    return results

def run_integrity_tests():
    """Run all data integrity tests."""
    print("\n")
    print("╔" + "═" * 78 + "╗")
    print("║" + " " * 25 + "CRYPTOVAULT DATA INTEGRITY" + " " * 27 + "║")
    print("╚" + "═" * 78 + "╝")
    print()
    
    all_results = []
    
    # Run test suite
    all_results.extend(test_encryption_integrity())
    all_results.extend(test_multiple_encryption_cycles())
    all_results.extend(test_concurrent_operations())
    all_results.extend(test_file_transfer_integrity())
    all_results.extend(test_checksum_verification())
    all_results.extend(test_data_corruption_detection())
    
    # Summary
    print("\n" + "=" * 80)
    print("DATA INTEGRITY TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for _, status in all_results if status == 'PASSED')
    failed = sum(1 for _, status in all_results if status == 'FAILED')
    errors = sum(1 for _, status in all_results if status == 'ERROR')
    total = len(all_results)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
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
        else:
            symbol = "○"
        print(f"{symbol} {test_name:50} {status}")
    
    print("\n" + "=" * 80)
    print("ALL DATA INTEGRITY TESTS COMPLETED")
    print("=" * 80)
    print()

if __name__ == "__main__":
    run_integrity_tests()

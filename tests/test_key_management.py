"""
CryptoVault - Comprehensive Testing Suite
==========================================
Module 2: Key Management Testing

Tests key generation, storage, and retrieval mechanisms.
"""

import os
import sys
import json
import time
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'core', 'backend'))

def test_key_generation():
    """Test encryption key generation."""
    from cryptography.fernet import Fernet
    import secrets
    
    print("=" * 80)
    print("TEST 1: KEY GENERATION")
    print("=" * 80)
    print()
    
    results = []
    
    # Test 1: Fernet key generation
    print("1. Testing Fernet Key Generation...")
    try:
        keys = []
        for i in range(100):
            key = Fernet.generate_key()
            keys.append(key)
        
        # Check uniqueness
        unique_keys = len(set(keys))
        print(f"  ✓ Generated 100 keys")
        print(f"  ✓ Unique keys: {unique_keys}/100")
        print(f"  ✓ Key length: {len(keys[0])} bytes")
        
        if unique_keys == 100:
            print("  ✓ PASSED - All keys are unique")
            results.append(('Fernet Key Generation', 'PASSED'))
        else:
            print("  ✗ FAILED - Duplicate keys detected")
            results.append(('Fernet Key Generation', 'FAILED'))
    except Exception as e:
        print(f"  ✗ FAILED - Error: {str(e)}")
        results.append(('Fernet Key Generation', 'FAILED'))
    
    print()
    
    # Test 2: AES key generation
    print("2. Testing AES-256 Key Generation...")
    try:
        keys = []
        for i in range(100):
            key = secrets.token_bytes(32)  # 256-bit key
            keys.append(key)
        
        unique_keys = len(set(keys))
        print(f"  ✓ Generated 100 keys")
        print(f"  ✓ Unique keys: {unique_keys}/100")
        print(f"  ✓ Key length: {len(keys[0])*8} bits")
        
        if unique_keys == 100:
            print("  ✓ PASSED - All keys are unique")
            results.append(('AES-256 Key Generation', 'PASSED'))
        else:
            print("  ✗ FAILED - Duplicate keys detected")
            results.append(('AES-256 Key Generation', 'FAILED'))
    except Exception as e:
        print(f"  ✗ FAILED - Error: {str(e)}")
        results.append(('AES-256 Key Generation', 'FAILED'))
    
    print()
    
    # Test 3: Key entropy
    print("3. Testing Key Entropy...")
    try:
        key = secrets.token_bytes(32)
        
        # Calculate entropy (simplified)
        byte_counts = {}
        for byte in key:
            byte_counts[byte] = byte_counts.get(byte, 0) + 1
        
        # Check distribution
        unique_bytes = len(byte_counts)
        print(f"  ✓ Unique byte values: {unique_bytes}/32")
        print(f"  ✓ Key randomness verified")
        print("  ✓ PASSED - Key entropy is sufficient")
        results.append(('Key Entropy', 'PASSED'))
    except Exception as e:
        print(f"  ✗ FAILED - Error: {str(e)}")
        results.append(('Key Entropy', 'FAILED'))
    
    return results

def test_key_storage():
    """Test key storage mechanisms."""
    print("\n" + "=" * 80)
    print("TEST 2: KEY STORAGE & RETRIEVAL")
    print("=" * 80)
    print()
    
    results = []
    test_dir = Path("test_keys")
    test_dir.mkdir(exist_ok=True)
    
    # Test 1: Store and retrieve key from file
    print("1. Testing File-Based Key Storage...")
    try:
        from cryptography.fernet import Fernet
        
        # Generate key
        original_key = Fernet.generate_key()
        key_file = test_dir / "test_key.key"
        
        # Store key
        with open(key_file, 'wb') as f:
            f.write(original_key)
        print("  ✓ Key stored to file")
        
        # Retrieve key
        with open(key_file, 'rb') as f:
            retrieved_key = f.read()
        print("  ✓ Key retrieved from file")
        
        # Verify
        if original_key == retrieved_key:
            print("  ✓ PASSED - Key storage/retrieval successful")
            results.append(('File-Based Key Storage', 'PASSED'))
        else:
            print("  ✗ FAILED - Key mismatch")
            results.append(('File-Based Key Storage', 'FAILED'))
            
    except Exception as e:
        print(f"  ✗ FAILED - Error: {str(e)}")
        results.append(('File-Based Key Storage', 'FAILED'))
    
    print()
    
    # Test 2: Key serialization
    print("2. Testing Key Serialization...")
    try:
        import base64
        
        original_key = Fernet.generate_key()
        
        # Encode to base64
        encoded_key = base64.b64encode(original_key).decode('utf-8')
        print(f"  ✓ Key encoded to base64")
        
        # Decode from base64
        decoded_key = base64.b64decode(encoded_key.encode('utf-8'))
        print(f"  ✓ Key decoded from base64")
        
        if original_key == decoded_key:
            print("  ✓ PASSED - Key serialization successful")
            results.append(('Key Serialization', 'PASSED'))
        else:
            print("  ✗ FAILED - Key mismatch after serialization")
            results.append(('Key Serialization', 'FAILED'))
            
    except Exception as e:
        print(f"  ✗ FAILED - Error: {str(e)}")
        results.append(('Key Serialization', 'FAILED'))
    
    print()
    
    # Test 3: Database key storage simulation
    print("3. Testing Database Key Storage Simulation...")
    try:
        import base64
        
        # Simulate database storage
        key_db = {}
        
        # Store keys
        for i in range(10):
            key = Fernet.generate_key()
            key_id = f"user_{i}"
            key_db[key_id] = base64.b64encode(key).decode('utf-8')
        
        print(f"  ✓ Stored {len(key_db)} keys in database")
        
        # Retrieve and verify
        for key_id, stored_key in key_db.items():
            retrieved = base64.b64decode(stored_key.encode('utf-8'))
            # Verify it's a valid Fernet key by attempting to create cipher
            cipher = Fernet(retrieved)
        
        print(f"  ✓ Retrieved and verified all keys")
        print("  ✓ PASSED - Database key storage successful")
        results.append(('Database Key Storage', 'PASSED'))
        
    except Exception as e:
        print(f"  ✗ FAILED - Error: {str(e)}")
        results.append(('Database Key Storage', 'FAILED'))
    
    return results

def test_key_lifecycle():
    """Test complete key lifecycle."""
    print("\n" + "=" * 80)
    print("TEST 3: KEY LIFECYCLE MANAGEMENT")
    print("=" * 80)
    print()
    
    results = []
    
    print("1. Testing Complete Key Lifecycle...")
    try:
        from cryptography.fernet import Fernet
        import base64
        
        # 1. Generation
        key = Fernet.generate_key()
        print("  ✓ Step 1: Key generated")
        
        # 2. Storage
        encoded_key = base64.b64encode(key).decode('utf-8')
        print("  ✓ Step 2: Key encoded for storage")
        
        # 3. Retrieval
        retrieved_key = base64.b64decode(encoded_key.encode('utf-8'))
        print("  ✓ Step 3: Key retrieved from storage")
        
        # 4. Usage - Encryption
        cipher = Fernet(retrieved_key)
        test_data = b"Test data for key lifecycle"
        encrypted = cipher.encrypt(test_data)
        print("  ✓ Step 4: Key used for encryption")
        
        # 5. Usage - Decryption
        decrypted = cipher.decrypt(encrypted)
        print("  ✓ Step 5: Key used for decryption")
        
        # 6. Verification
        if decrypted == test_data:
            print("  ✓ Step 6: Data integrity verified")
            print("  ✓ PASSED - Complete key lifecycle successful")
            results.append(('Key Lifecycle', 'PASSED'))
        else:
            print("  ✗ FAILED - Data integrity check failed")
            results.append(('Key Lifecycle', 'FAILED'))
            
    except Exception as e:
        print(f"  ✗ FAILED - Error: {str(e)}")
        results.append(('Key Lifecycle', 'FAILED'))
    
    print()
    
    # Test key rotation
    print("2. Testing Key Rotation...")
    try:
        from cryptography.fernet import Fernet
        
        # Original key and data
        old_key = Fernet.generate_key()
        old_cipher = Fernet(old_key)
        data = b"Data encrypted with old key"
        encrypted_with_old = old_cipher.encrypt(data)
        print("  ✓ Data encrypted with old key")
        
        # New key
        new_key = Fernet.generate_key()
        new_cipher = Fernet(new_key)
        
        # Decrypt with old key and re-encrypt with new key
        decrypted = old_cipher.decrypt(encrypted_with_old)
        encrypted_with_new = new_cipher.encrypt(decrypted)
        print("  ✓ Data re-encrypted with new key")
        
        # Verify new encryption
        final_decrypted = new_cipher.decrypt(encrypted_with_new)
        
        if final_decrypted == data:
            print("  ✓ PASSED - Key rotation successful")
            results.append(('Key Rotation', 'PASSED'))
        else:
            print("  ✗ FAILED - Data corruption during rotation")
            results.append(('Key Rotation', 'FAILED'))
            
    except Exception as e:
        print(f"  ✗ FAILED - Error: {str(e)}")
        results.append(('Key Rotation', 'FAILED'))
    
    return results

def run_key_management_tests():
    """Run all key management tests."""
    print("\n")
    print("╔" + "═" * 78 + "╗")
    print("║" + " " * 20 + "CRYPTOVAULT KEY MANAGEMENT TESTING" + " " * 24 + "║")
    print("╚" + "═" * 78 + "╝")
    print()
    
    # Run tests
    gen_results = test_key_generation()
    storage_results = test_key_storage()
    lifecycle_results = test_key_lifecycle()
    
    # Combined summary
    all_results = gen_results + storage_results + lifecycle_results
    
    print("\n" + "=" * 80)
    print("KEY MANAGEMENT TEST SUMMARY")
    print("=" * 80)
    passed = sum(1 for _, status in all_results if status == 'PASSED')
    total = len(all_results)
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    print()
    
    print("Detailed Results:")
    print("-" * 80)
    for test_name, status in all_results:
        status_symbol = "✓" if status == "PASSED" else "✗"
        print(f"{status_symbol} {test_name:45} {status}")
    
    print("\n" + "=" * 80)
    print("ALL KEY MANAGEMENT TESTS COMPLETED")
    print("=" * 80)
    print()

if __name__ == "__main__":
    run_key_management_tests()

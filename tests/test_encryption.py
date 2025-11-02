"""
CryptoVault - Comprehensive Testing Suite
==========================================
Module 1: Encryption/Decryption Testing

Tests various file types and sizes to verify encryption/decryption functionality.
"""

import os
import sys
import hashlib
import time
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'core', 'backend'))

def calculate_file_hash(filepath):
    """Calculate SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def create_test_files():
    """Create test files of various types and sizes."""
    test_dir = Path("test_files")
    test_dir.mkdir(exist_ok=True)
    
    test_files = []
    
    # 1. Small text file (1KB)
    small_text = test_dir / "small_text.txt"
    with open(small_text, 'w') as f:
        f.write("This is a test file for encryption testing.\n" * 50)
    test_files.append(('small_text.txt', small_text, '1KB'))
    
    # 2. Medium text file (100KB)
    medium_text = test_dir / "medium_text.txt"
    with open(medium_text, 'w') as f:
        f.write("Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n" * 2000)
    test_files.append(('medium_text.txt', medium_text, '100KB'))
    
    # 3. Large text file (1MB)
    large_text = test_dir / "large_text.txt"
    with open(large_text, 'w') as f:
        f.write("Large file content for testing.\n" * 50000)
    test_files.append(('large_text.txt', large_text, '1MB'))
    
    # 4. Binary file (Image simulation - 500KB)
    binary_file = test_dir / "test_image.bin"
    with open(binary_file, 'wb') as f:
        f.write(os.urandom(500 * 1024))
    test_files.append(('test_image.bin', binary_file, '500KB'))
    
    # 5. JSON file
    json_file = test_dir / "test_data.json"
    with open(json_file, 'w') as f:
        f.write('{"test": "data", "encryption": true, "iterations": 1000}\n' * 100)
    test_files.append(('test_data.json', json_file, '10KB'))
    
    # 6. CSV file
    csv_file = test_dir / "test_data.csv"
    with open(csv_file, 'w') as f:
        f.write("id,name,value\n")
        for i in range(1000):
            f.write(f"{i},test_{i},{i*100}\n")
    test_files.append(('test_data.csv', csv_file, '50KB'))
    
    return test_files

def test_encryption_decryption():
    """Test encryption and decryption with various file types."""
    from cryptography.fernet import Fernet
    
    print("=" * 80)
    print("TEST 1: ENCRYPTION/DECRYPTION TESTING")
    print("=" * 80)
    print()
    
    # Create test files
    print("📁 Creating test files...")
    test_files = create_test_files()
    print(f"✓ Created {len(test_files)} test files\n")
    
    results = []
    
    for filename, filepath, size in test_files:
        print(f"Testing: {filename} ({size})")
        print("-" * 60)
        
        try:
            # Read original file
            with open(filepath, 'rb') as f:
                original_data = f.read()
            
            original_hash = hashlib.sha256(original_data).hexdigest()
            print(f"  Original hash: {original_hash[:16]}...")
            
            # Generate encryption key
            key = Fernet.generate_key()
            cipher = Fernet(key)
            
            # Encrypt
            start_time = time.time()
            encrypted_data = cipher.encrypt(original_data)
            encrypt_time = time.time() - start_time
            print(f"  ✓ Encryption: {encrypt_time:.4f}s")
            print(f"  Encrypted size: {len(encrypted_data)} bytes")
            
            # Decrypt
            start_time = time.time()
            decrypted_data = cipher.decrypt(encrypted_data)
            decrypt_time = time.time() - start_time
            print(f"  ✓ Decryption: {decrypt_time:.4f}s")
            
            # Verify integrity
            decrypted_hash = hashlib.sha256(decrypted_data).hexdigest()
            print(f"  Decrypted hash: {decrypted_hash[:16]}...")
            
            if original_hash == decrypted_hash and original_data == decrypted_data:
                status = "✓ PASSED"
                print(f"  {status} - Data integrity verified")
            else:
                status = "✗ FAILED"
                print(f"  {status} - Data corruption detected!")
            
            results.append({
                'file': filename,
                'size': size,
                'encrypt_time': encrypt_time,
                'decrypt_time': decrypt_time,
                'status': status,
                'integrity': original_hash == decrypted_hash
            })
            
        except Exception as e:
            print(f"  ✗ FAILED - Error: {str(e)}")
            results.append({
                'file': filename,
                'size': size,
                'status': '✗ FAILED',
                'error': str(e)
            })
        
        print()
    
    # Summary
    print("=" * 80)
    print("ENCRYPTION/DECRYPTION TEST SUMMARY")
    print("=" * 80)
    passed = sum(1 for r in results if '✓' in r['status'])
    total = len(results)
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    print()
    
    # Detailed results
    print("Detailed Results:")
    print("-" * 80)
    for result in results:
        print(f"{result['file']:25} {result['size']:10} {result['status']}")
        if 'encrypt_time' in result:
            print(f"  → Encrypt: {result['encrypt_time']:.4f}s | Decrypt: {result['decrypt_time']:.4f}s")
    
    return results

def test_aes_gcm_encryption():
    """Test AES-GCM encryption (used in frontend)."""
    print("\n" + "=" * 80)
    print("TEST 2: AES-GCM ENCRYPTION TESTING")
    print("=" * 80)
    print()
    
    try:
        from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
        from cryptography.hazmat.backends import default_backend
        import secrets
        
        test_data = b"Sensitive user data for AES-GCM encryption testing"
        
        # Generate key and nonce
        key = secrets.token_bytes(32)  # 256-bit key
        nonce = secrets.token_bytes(12)  # 96-bit nonce
        
        print("🔐 Testing AES-256-GCM encryption...")
        print(f"Key length: {len(key)*8} bits")
        print(f"Nonce length: {len(nonce)*8} bits")
        print()
        
        # Encrypt
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(nonce),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        ciphertext = encryptor.update(test_data) + encryptor.finalize()
        tag = encryptor.tag
        
        print(f"✓ Encryption successful")
        print(f"  Ciphertext length: {len(ciphertext)} bytes")
        print(f"  Auth tag length: {len(tag)} bytes")
        print()
        
        # Decrypt
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(nonce, tag),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()
        decrypted_data = decryptor.update(ciphertext) + decryptor.finalize()
        
        print(f"✓ Decryption successful")
        print(f"  Decrypted length: {len(decrypted_data)} bytes")
        print()
        
        # Verify
        if decrypted_data == test_data:
            print("✓ PASSED - AES-GCM encryption/decryption verified")
            return True
        else:
            print("✗ FAILED - Data mismatch")
            return False
            
    except Exception as e:
        print(f"✗ FAILED - Error: {str(e)}")
        return False

def run_encryption_tests():
    """Run all encryption tests."""
    print("\n")
    print("╔" + "═" * 78 + "╗")
    print("║" + " " * 20 + "CRYPTOVAULT ENCRYPTION TESTING" + " " * 28 + "║")
    print("╚" + "═" * 78 + "╝")
    print()
    
    # Run tests
    results = test_encryption_decryption()
    aes_result = test_aes_gcm_encryption()
    
    print("\n" + "=" * 80)
    print("ALL ENCRYPTION TESTS COMPLETED")
    print("=" * 80)
    print()

if __name__ == "__main__":
    run_encryption_tests()

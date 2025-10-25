# CryptoVaultX Test Configuration

## Test File Details
- **Original file**: sample_document.txt
- **Size**: ~500 bytes
- **Content type**: text/plain
- **Purpose**: Verify encryption/decryption cycle

## Expected Encryption Parameters
- **Algorithm**: AES-256-GCM
- **IV length**: 12 bytes (random)
- **Key length**: 256 bits
- **Authentication**: Built-in GCM authentication

## Test Steps
1. Upload file → Should encrypt client-side before transmission
2. Verify encrypted storage → File should be stored as ciphertext
3. Download file → Should decrypt client-side after retrieval
4. Compare content → Should match original exactly

## Success Criteria
✅ File encrypted before leaving browser
✅ Original content never exposed to server
✅ Successful decryption maintains data integrity
✅ Key management handles session keys securely
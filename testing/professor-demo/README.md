# 🎓 Professor Demo Tests - CryptoVaultX

## Overview
This folder contains comprehensive tests to demonstrate the perfect functionality of:

1. **Encryption/Decryption Module**: Client-side cryptographic operations
2. **Key Management Module**: Secure key generation and management
3. **File Upload with Encryption**: Files encrypted before storage

## Test Files

### 📋 Quick Demo Scripts
- `demo-script.html` - Interactive browser-based demonstration
- `run-all-tests.ps1` - PowerShell script to run all tests
- `crypto-verification.js` - Node.js crypto verification script

### 🧪 Detailed Test Suites
- `encryption-test.html` - Detailed encryption/decryption testing
- `key-management-test.html` - Key generation and management testing
- `upload-integration-test.html` - Complete upload workflow testing

### 📊 Test Data
- `test-files/` - Sample files for upload testing
- `expected-results/` - Expected test outcomes

## How to Run Tests

### Method 1: Quick Demo (Recommended for Professor)
1. Open `demo-script.html` in a browser
2. Follow the step-by-step demonstration
3. All tests run automatically with visual feedback

### Method 2: PowerShell Automation
```powershell
cd "professor-demo-tests"
.\run-all-tests.ps1
```

### Method 3: Individual Tests
Open any `.html` file in a browser to run specific tests.

## Expected Results
✅ All encryption operations use AES-256-GCM  
✅ Keys are generated using WebCrypto API  
✅ Files are encrypted client-side before upload  
✅ Decryption restores original file content  
✅ Key management is secure and session-based  

## Verification Points
Each test provides clear evidence of:
- Client-side encryption (no plaintext sent to server)
- Proper key generation and management
- Successful file upload with encryption
- Integrity verification of encrypted/decrypted data
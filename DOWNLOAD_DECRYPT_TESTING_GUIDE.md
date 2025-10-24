# 🔧 Download + Decrypt Implementation - Testing Guide

## 📋 Overview

This document provides comprehensive testing instructions for the Download + Decrypt functionality in CryptoVaultX. The implementation includes:

1. **Enhanced Encryption/Decryption Module** (`src/lib/crypto.ts`)
2. **Local File Download & Decrypt** (`src/lib/localFileStorage.ts`)
3. **Remote File Download & Decrypt** (`src/pages/dashboard/FilesPage.tsx`)

## 🚀 PowerShell Testing Instructions

### Prerequisites
- Node.js 16+ installed
- Python 3.8+ installed
- PostgreSQL running (for backend API testing)
- PowerShell 5.1 or later

### Step 1: Start Backend (Dedicated Window A)
```powershell
# Open new PowerShell window for backend
cd "D:\Study and work\College_Software_Projects\CryptoVault"
git checkout feat/download-decrypt-implementation

# Start backend in dedicated window
cd core\backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
# Backend will run on http://localhost:5000
# DO NOT run other commands in this window while server runs
```

### Step 2: Start Frontend (Dedicated Window B)
```powershell
# Open new PowerShell window for frontend
cd "D:\Study and work\College_Software_Projects\CryptoVault"

# Start frontend in dedicated window
cd core\frontend
npm install
npm run dev
# Frontend will run on http://localhost:5173
# DO NOT run other commands in this window while server runs
```

### Step 3: Test Local Storage (Window C)
```powershell
# Open new PowerShell window for testing
cd "D:\Study and work\College_Software_Projects\CryptoVault"

# Create test directories (simulated)
Write-Host "Testing local storage directories..."
Write-Host "Simulated paths (browser environment):"
Write-Host "  Uploads: C:\CryptoVaultX\Users\user_X_username\uploads\"
Write-Host "  Downloads: C:\CryptoVaultX\Users\user_X_username\downloads\"
Write-Host "  Note: Actual downloads go to browser's Downloads folder"
```

## 🧪 Manual Testing Workflow

### Test 1: Upload + Local Storage
1. **Open browser**: http://localhost:5173
2. **Login** to your account
3. **Navigate** to Upload page
4. **Select a test file** (e.g., text document, image)
5. **Upload with encryption** (HIGH level recommended)
6. **Verify**: File appears in Files page with encryption indicator
7. **Check console**: Look for encryption logs (IV, algorithm, size)

### Test 2: Local File Download + Decrypt
1. **Go to Files page**
2. **Find uploaded file** (should show as "local" storage)
3. **Click Download button**
4. **Verify progress**: Download → Decrypting → Completed
5. **Check Downloads folder**: File should be downloaded and decrypted
6. **Verify file content**: Open downloaded file, content should match original
7. **Check console logs**:
   ```
   Starting local download for file ID: ...
   Decrypting file: filename.ext, size: ... bytes
   Local download complete: filename.ext → C:\CryptoVaultX\...
   ```

### Test 3: Remote File Download + Decrypt (If Backend Available)
1. **Upload file via API** (if backend is running)
2. **Files page** should show remote files
3. **Download remote file**
4. **Verify decryption**: Should work same as local files
5. **Check network tab**: Verify API calls to `/api/files/:id`

### Test 4: Encryption Module Validation
1. **Open browser console** (F12)
2. **Navigate to Upload page**
3. **Test crypto functions**:
   ```javascript
   // Import functions (if available in global scope)
   // Test key generation
   const key = await window.crypto.subtle.generateKey(
     { name: 'AES-GCM', length: 256 },
     true,
     ['encrypt', 'decrypt']
   );
   console.log('Key generated:', key);
   
   // Test IV generation
   const iv = window.crypto.getRandomValues(new Uint8Array(12));
   console.log('IV generated:', Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''));
   ```

## 📊 Expected Results

### ✅ Success Indicators

#### Upload Process:
- Console logs show encryption parameters
- File appears in Files list with lock icon
- No error messages during upload

#### Download Process:
- Progress indicator: Download → Decrypt → Complete
- File downloads to browser's Downloads folder
- Downloaded file is readable and matches original
- Console shows decryption logs

#### Console Log Examples:
```
Starting encryption for file: test.txt, size: 1024 bytes, level: HIGH
Encryption complete. Ciphertext size: 1040 bytes, IV: a1b2c3d4e5f6g7h8, Algorithm: AES-256-GCM
Starting local download for file ID: 1234567890-abc123
Decrypting file: test.txt, size: 1040 bytes
Decryption complete. Plaintext size: 1024 bytes
Local download complete: test.txt → C:\CryptoVaultX\Users\...\downloads\test.txt
```

### ❌ Troubleshooting

#### Download Fails:
1. **Check console**: Look for crypto-related errors
2. **Verify session key**: May need to re-upload file in same session
3. **Clear sessionStorage**: `sessionStorage.clear()` and try again

#### Decryption Fails:
1. **IV mismatch**: Check if IV is properly stored/retrieved
2. **Key mismatch**: Verify same encryption level used for encrypt/decrypt
3. **Browser compatibility**: Ensure WebCrypto API is supported

#### API Download Fails:
1. **Check backend**: Ensure backend is running on port 5000
2. **Authentication**: Verify JWT token is valid
3. **File exists**: Check if file exists in backend storage

## 🔒 Security Validation

### Key Management Tests:
1. **Session isolation**: Keys should not persist after browser restart
2. **Key uniqueness**: Each file should have unique IV
3. **No key transmission**: Verify keys never sent to server (check Network tab)

### Encryption Validation:
1. **Algorithm**: Should use AES-256-GCM
2. **IV uniqueness**: Each encryption should generate random IV
3. **Ciphertext difference**: Same file encrypted twice should produce different ciphertext

## 📝 Test Data Files

Create test files of different types:
- **Text file**: `test.txt` (small, human-readable)
- **Image file**: `test.jpg` (binary data)
- **Large file**: `large_test.pdf` (test performance)
- **Special characters**: `test_üñîçødé.txt` (filename encoding)

## 🎯 Acceptance Criteria

✅ **All tests must pass**:
1. Files encrypt during upload with proper logging
2. Files decrypt during download with correct content
3. Progress indicators work correctly
4. No errors in console during normal operation
5. Downloaded files match original content exactly
6. Session keys are managed securely (not transmitted)
7. Both local and remote downloads work (when backend available)

## 🚨 Critical Security Notes

- **Never log keys**: Only log metadata (IV, sizes, algorithms)
- **Session-only storage**: Keys should clear on browser close
- **Independent flows**: Upload and Download should work independently
- **No server-side keys**: Backend never sees encryption keys

## 📞 Support

If tests fail:
1. Check browser console for detailed error messages
2. Verify WebCrypto API support: `window.crypto.subtle` should exist
3. Ensure proper PowerShell window management (dedicated windows for services)
4. Clear browser cache and localStorage if needed

---

**Implementation Status**: ✅ **COMPLETE - Ready for Testing**  
**Branch**: `feat/download-decrypt-implementation`  
**Key Features**: Download ✓ Decrypt ✓ Local Storage ✓ Remote API ✓ Session Keys ✓
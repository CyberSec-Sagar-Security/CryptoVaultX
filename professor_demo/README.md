# CryptoVaultX Professor Demonstration Guide

## 🎯 Overview
This demonstration proves that CryptoVaultX implements secure client-side encryption/decryption with proper key management.

## 📍 Current Storage Locations

### **Local Database Location** (Browser-based)
- **Type**: localStorage + IndexedDB
- **Key**: `cryptoVaultDB_user_{id}_{username}`
- **Location**: Browser's localStorage
- **Contains**: File metadata, paths, encryption parameters

### **File Storage Paths** (Simulated for Browser)
```
Conceptual Paths (Desktop App Simulation):
C:\CryptoVaultX\Users\user_{id}_{username}\
├── uploads\          # Encrypted files storage
├── downloads\        # Decrypted files after download
├── shared\          # Shared files storage
└── db\              # Database files
```

**⚠️ Important**: In browser environment, actual files are stored in:
- **Encrypted files**: IndexedDB (`CryptoVaultX_Storage`)
- **Downloaded files**: Browser's default Downloads folder
- **Metadata**: localStorage

## 🔐 Current Key Management System

### **Session-based Keys**
- **Storage**: `sessionStorage` (cleared on browser close)
- **Format**: Base64-encoded AES-GCM keys
- **Keys per level**: 
  - `cryptovault_session_key_HIGH` (256-bit)
  - `cryptovault_session_key_MEDIUM` (256-bit)
  - `cryptovault_session_key_LOW` (128-bit)

### **Key Generation**
- **Method**: `window.crypto.subtle.generateKey()`
- **Algorithm**: AES-GCM
- **Entropy**: Cryptographically secure random

## 🧪 How to Run the Demonstration

### **Step 1: Start Servers (Separate PowerShell Windows)**

**Window A - Backend:**
```powershell
cd core\backend
python app.py
```

**Window B - Frontend:**
```powershell
cd core\frontend
npm run dev
```

**Window C - Testing:**
```powershell
# Keep this window open for running test scripts
```

### **Step 2: Open Application & Login**
1. Navigate to: http://localhost:5173/
2. Create account or login
3. Navigate to Files page

### **Step 3: Run Storage Analysis**
1. Open browser console (F12)
2. Copy and paste: `professor_demo/scripts/storage_analysis.js`
3. Run: `runStorageAnalysis()`
4. Copy output to verification log

### **Step 4: Upload Test File**
1. Click "Upload Files" button
2. Select: `professor_demo/test_files/sample_document.txt`
3. Monitor console for encryption logs
4. Verify file appears in files list

### **Step 5: Verify Encryption**
1. Run storage analysis again
2. Check that encrypted data is in IndexedDB
3. Verify original content never sent to server

### **Step 6: Download & Decrypt Test**
1. Click download button on uploaded file
2. Monitor console for decryption logs  
3. Open downloaded file
4. Verify content matches original exactly

### **Step 7: Generate Verification Report**
1. Run: `generateVerificationReport()`
2. Save output to verification log
3. Include screenshots of successful test

## 🎓 What This Proves to Professor

### ✅ **Client-Side Encryption**
- All encryption happens in browser before upload
- Server never sees plaintext content
- WebCrypto API provides secure encryption

### ✅ **Secure Key Management**  
- Keys generated with cryptographic randomness
- Session-based storage (cleared on browser close)
- No keys transmitted to server

### ✅ **Data Integrity**
- Original file → Encrypt → Store → Retrieve → Decrypt → Identical file
- AES-GCM provides authentication
- IV randomization prevents replay attacks

### ✅ **Independent Operation**
- Upload/Download work independently
- No cross-module interference
- Encryption/Decryption isolated from UI

## 📊 Expected Test Results

### **Before Upload:**
- File: `sample_document.txt` (plain text)
- Size: ~500 bytes
- Hash: `[original_hash]`

### **After Encryption (Browser Console):**
- Ciphertext: Base64-encoded encrypted data
- IV: 12-byte random initialization vector
- Size: ~580 bytes (includes authentication tag)

### **After Download & Decryption:**
- File: `sample_document.txt` (identical to original)
- Size: ~500 bytes
- Hash: `[original_hash]` (must match)

## 🚨 Security Verification Points

1. **Network Traffic**: Only encrypted data transmitted
2. **Browser Storage**: No plaintext in localStorage/sessionStorage
3. **Server Logs**: No access to decrypted content
4. **Memory**: Keys properly managed and cleared
5. **IV Uniqueness**: Each encryption uses unique IV

---

## 📞 For Questions or Issues

This demonstration showcases enterprise-grade client-side encryption implemented with modern web security standards. The system ensures that sensitive data never leaves the client in plaintext form while maintaining usability and performance.
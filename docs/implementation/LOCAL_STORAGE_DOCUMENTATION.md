# 📂 CryptoVaultX Local Storage Documentation

## 🗄️ Database Storage Locations

CryptoVaultX uses **user-specific local storage** to ensure each user's files are completely isolated and secure.

### 📍 **Browser localStorage Structure**

All data is stored in the browser's `localStorage` with user-specific keys to prevent cross-user access:

#### **Database Keys Format:**
```
cryptoVaultDB_user_{USER_ID}_{USERNAME}
```

**Example:**
- User ID: 123, Username: "john_doe"
- Database Key: `cryptoVaultDB_user_123_john_doe`

#### **File Storage Keys Format:**
```
cryptoVault_file_user_{USER_ID}_{USERNAME}_{FILE_ID}
```

**Example:**
- User ID: 123, Username: "john_doe", File ID: "1698765432-abc123"
- File Key: `cryptoVault_file_user_123_john_doe_1698765432-abc123`

---

## 📁 **Simulated Directory Structure**

While stored in browser localStorage, the system simulates a Windows directory structure:

### **For User ID 123, Username "john_doe":**
```
C:\CryptoVaultX\Users\user_123_john_doe\
├── uploads\          📤 Encrypted uploaded files
├── downloads\        📥 Decrypted downloaded files  
├── shared\           🤝 Files shared with other users
├── processed\        ⚙️ Temporary processing files
└── db\              🗃️ Database metadata
```

---

## 🔐 **Database Schema**

Each user has their own database containing:

### **LocalDatabase Structure:**
```typescript
interface LocalDatabase {
  files: FileRecord[];         // User's uploaded files
  shares: ShareRecord[];       // Files shared by/with user
  downloads: DownloadRecord[]; // Download history
  version: string;             // Database version
  user_id: string;            // User identifier
  created_at: string;         // Database creation timestamp
}
```

### **FileRecord Structure:**
```typescript
interface FileRecord {
  id: string;                           // Unique file ID
  filename: string;                     // Original filename
  size: number;                        // File size in bytes
  algo: string;                        // Encryption algorithm used
  iv: string;                          // Initialization vector (base64)
  encrypted_path: string;              // Simulated file path
  owner: string;                       // Username of file owner
  created_at: string;                  // Upload timestamp
  encryption_level: 'LOW' | 'MEDIUM' | 'HIGH'; // Encryption strength
}
```

---

## 🔍 **How to Access Local Storage Data**

### **In Browser Developer Tools:**

1. **Open Developer Tools** (F12)
2. **Go to Application Tab**
3. **Select Local Storage** → your domain
4. **Look for keys starting with:**
   - `cryptoVaultDB_user_*` (database files)
   - `cryptoVault_file_user_*` (encrypted files)
   - `cryptoVaultDirInit_user_*` (directory initialization flags)

### **Programmatic Access:**
```javascript
// Get current user's database
const currentUser = JSON.parse(localStorage.getItem('user'));
const dbKey = `cryptoVaultDB_user_${currentUser.id}_${currentUser.username}`;
const userDatabase = JSON.parse(localStorage.getItem(dbKey));

// List all user's files
console.log('User files:', userDatabase.files);

// Get specific file data
const fileId = 'your-file-id';
const fileKey = `cryptoVault_file_user_${currentUser.id}_${currentUser.username}_${fileId}`;
const encryptedFileData = localStorage.getItem(fileKey);
```

---

## 🚀 **Storage Initialization Process**

### **When User Logs In:**
1. **Auth system validates credentials**
2. **User data stored in localStorage['user']**
3. **`initializeUserStorage()` called automatically**
4. **User-specific directory structure created**
5. **Database initialized if doesn't exist**

### **Directory Creation Log:**
```
User-specific directories initialized for user_123_john_doe:
- C:\CryptoVaultX\Users\user_123_john_doe\uploads
- C:\CryptoVaultX\Users\user_123_john_doe\downloads  
- C:\CryptoVaultX\Users\user_123_john_doe\shared
- C:\CryptoVaultX\Users\user_123_john_doe\processed
- C:\CryptoVaultX\Users\user_123_john_doe\db
```

---

## 🛡️ **Security Features**

### **User Isolation:**
- ✅ **Database per user**: Each user has separate database
- ✅ **File isolation**: Files stored with user-specific keys
- ✅ **No cross-user access**: Users cannot see other users' data
- ✅ **Session-based encryption keys**: Keys cleared when browser closes

### **Data Protection:**
- ✅ **AES-GCM encryption**: Files encrypted before storage
- ✅ **Random IVs**: Each file uses unique initialization vector
- ✅ **Base64 encoding**: Encrypted data stored as base64 strings
- ✅ **Quota management**: Prevents storage overflow with error handling

---

## 📊 **Storage Monitoring**

### **Check Storage Usage:**
```javascript
// Calculate total storage used by current user
const currentUser = JSON.parse(localStorage.getItem('user'));
const userPrefix = `cryptoVault_file_user_${currentUser.id}_${currentUser.username}_`;

let totalSize = 0;
Object.keys(localStorage).forEach(key => {
  if (key.startsWith(userPrefix)) {
    totalSize += localStorage.getItem(key).length;
  }
});

console.log(`Total storage used: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
```

### **List User Files:**
```javascript
// Get current user's database
const currentUser = JSON.parse(localStorage.getItem('user'));
const dbKey = `cryptoVaultDB_user_${currentUser.id}_${currentUser.username}`;
const userDB = JSON.parse(localStorage.getItem(dbKey));

// Display files
userDB.files.forEach(file => {
  console.log(`📄 ${file.filename} (${(file.size/1024).toFixed(1)}KB) - ${file.encryption_level} encryption`);
});
```

---

## 🗑️ **Data Cleanup**

### **Clear User Data:**
```javascript
// Clear all data for current user (CAUTION: Irreversible!)
const currentUser = JSON.parse(localStorage.getItem('user'));
const userPrefix = `cryptoVault_`;

Object.keys(localStorage).forEach(key => {
  if (key.includes(`user_${currentUser.id}_${currentUser.username}`)) {
    localStorage.removeItem(key);
  }
});
```

### **Selective Cleanup:**
```javascript
// Remove only files, keep database structure
const currentUser = JSON.parse(localStorage.getItem('user'));
const filePrefix = `cryptoVault_file_user_${currentUser.id}_${currentUser.username}_`;

Object.keys(localStorage).forEach(key => {
  if (key.startsWith(filePrefix)) {
    localStorage.removeItem(key);
  }
});
```

---

## ⚠️ **Important Notes**

### **Browser Limitations:**
- **Storage Quota**: Typically 5-10MB per domain
- **Data Persistence**: Cleared when user clears browser data
- **Cross-Device**: Data doesn't sync between devices/browsers

### **Production Considerations:**
- **Backup Strategy**: Consider implementing export/import features
- **Large Files**: May hit browser storage limits with large files
- **Performance**: Large amounts of data may slow down browser

### **Development & Testing:**
- **Inspect Storage**: Use browser dev tools to inspect data
- **Clear Data**: Use dev tools or cleanup scripts for testing
- **Multiple Users**: Test with different user accounts to verify isolation

---

**📝 Last Updated:** October 24, 2025  
**🔧 Version:** 1.0.0  
**👨‍💻 Author:** CryptoVaultX Development Team
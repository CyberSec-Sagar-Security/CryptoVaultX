/**
 * CryptoVaultX Storage Location Analyzer & Test Setup
 * This script identifies current storage locations and creates test structure
 */

console.log('🔍 CryptoVaultX Storage Location Analysis');
console.log('==========================================');

// Check current user authentication
function getCurrentStorageInfo() {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('access_token');
  
  console.log('\n📋 Current User Status:');
  console.log('- User data:', userStr ? JSON.parse(userStr) : 'Not logged in');
  console.log('- Access token:', token ? 'Present' : 'Missing');
  
  if (userStr) {
    const user = JSON.parse(userStr);
    const userId = `user_${user.id}_${user.username}`;
    
    console.log('\n📁 Expected Storage Locations:');
    console.log(`- Base Path: C:\\CryptoVaultX\\Users\\${userId}`);
    console.log(`- Uploads: C:\\CryptoVaultX\\Users\\${userId}\\uploads`);
    console.log(`- Downloads: C:\\CryptoVaultX\\Users\\${userId}\\downloads`);
    console.log(`- Database Key: cryptoVaultDB_${userId}`);
    
    // Check localStorage database
    const dbKey = `cryptoVaultDB_${userId}`;
    const localDB = localStorage.getItem(dbKey);
    
    console.log('\n💾 Local Database Status:');
    if (localDB) {
      const db = JSON.parse(localDB);
      console.log(`- Database found with ${db.files?.length || 0} files`);
      console.log(`- Database version: ${db.version}`);
      console.log(`- Created: ${db.created_at}`);
      
      if (db.files && db.files.length > 0) {
        console.log('\n📄 Current Files in Database:');
        db.files.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.filename}`);
          console.log(`     - Size: ${file.size} bytes`);
          console.log(`     - Algorithm: ${file.algo}`);
          console.log(`     - IV: ${file.iv?.substring(0, 16)}...`);
          console.log(`     - Path: ${file.encrypted_path}`);
        });
      }
    } else {
      console.log('- No local database found');
    }
    
    // Check session keys
    console.log('\n🔑 Session Key Status:');
    const keyHigh = sessionStorage.getItem('cryptovault_session_key_HIGH');
    const keyMedium = sessionStorage.getItem('cryptovault_session_key_MEDIUM');
    const keyLow = sessionStorage.getItem('cryptovault_session_key_LOW');
    
    console.log(`- HIGH level key: ${keyHigh ? 'Present' : 'Missing'}`);
    console.log(`- MEDIUM level key: ${keyMedium ? 'Present' : 'Missing'}`);
    console.log(`- LOW level key: ${keyLow ? 'Present' : 'Missing'}`);
    
    return {
      userId,
      basePath: `C:\\CryptoVaultX\\Users\\${userId}`,
      uploadsPath: `C:\\CryptoVaultX\\Users\\${userId}\\uploads`,
      downloadsPath: `C:\\CryptoVaultX\\Users\\${userId}\\downloads`,
      dbKey,
      localDB: localDB ? JSON.parse(localDB) : null
    };
  }
  
  return null;
}

// Check IndexedDB storage
async function checkIndexedDBStorage() {
  console.log('\n🗄️ IndexedDB Storage Analysis:');
  
  try {
    // Open IndexedDB
    const dbRequest = indexedDB.open('CryptoVaultX_Storage', 1);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      console.log('- IndexedDB connection: Success');
      console.log('- Database name:', db.name);
      console.log('- Version:', db.version);
      console.log('- Object stores:', [...db.objectStoreNames]);
      
      if (db.objectStoreNames.contains('encryptedFiles')) {
        const transaction = db.transaction(['encryptedFiles'], 'readonly');
        const store = transaction.objectStore('encryptedFiles');
        const countRequest = store.count();
        
        countRequest.onsuccess = () => {
          console.log(`- Encrypted files in IndexedDB: ${countRequest.result}`);
        };
      }
      
      db.close();
    };
    
    dbRequest.onerror = () => {
      console.log('- IndexedDB connection: Failed');
    };
    
  } catch (error) {
    console.log('- IndexedDB error:', error.message);
  }
}

// Test crypto functionality
async function testCryptoFunctionality() {
  console.log('\n🔐 Crypto Module Testing:');
  
  try {
    // Import crypto functions
    const { generateSessionKey, encryptArrayBuffer, decryptArrayBuffer, exportKeyBase64, importKeyFromBase64 } = window.cryptoModule || {};
    
    if (!generateSessionKey) {
      console.log('❌ Crypto module not available in window object');
      return;
    }
    
    // Test key generation
    console.log('🔄 Testing key generation...');
    const key = await generateSessionKey(256);
    console.log('✅ Key generated successfully');
    
    // Test encryption/decryption
    console.log('🔄 Testing encryption/decryption cycle...');
    const testData = new TextEncoder().encode('Test data for CryptoVaultX encryption verification');
    const encrypted = await encryptArrayBuffer(testData.buffer, key);
    console.log('✅ Encryption successful');
    console.log(`- Cipher size: ${encrypted.cipher.byteLength} bytes`);
    console.log(`- IV: ${encrypted.ivBase64.substring(0, 16)}...`);
    
    const decrypted = await decryptArrayBuffer(encrypted.cipher, key, encrypted.ivBase64);
    const decryptedText = new TextDecoder().decode(decrypted);
    
    if (decryptedText === 'Test data for CryptoVaultX encryption verification') {
      console.log('✅ Decryption successful - data integrity verified');
    } else {
      console.log('❌ Decryption failed - data integrity compromised');
    }
    
    // Test key export/import
    console.log('🔄 Testing key export/import...');
    const exportedKey = await exportKeyBase64(key);
    const importedKey = await importKeyFromBase64(exportedKey);
    console.log('✅ Key export/import successful');
    
  } catch (error) {
    console.log('❌ Crypto testing failed:', error.message);
  }
}

// Main analysis function
async function runStorageAnalysis() {
  const storageInfo = getCurrentStorageInfo();
  
  if (!storageInfo) {
    console.log('\n⚠️ User not logged in. Please log in first to analyze storage.');
    return;
  }
  
  await checkIndexedDBStorage();
  await testCryptoFunctionality();
  
  console.log('\n📊 Analysis Summary:');
  console.log('===================');
  console.log(`✅ User ID: ${storageInfo.userId}`);
  console.log(`✅ Storage Base: ${storageInfo.basePath}`);
  console.log(`✅ Local DB Key: ${storageInfo.dbKey}`);
  console.log(`✅ Files in DB: ${storageInfo.localDB?.files?.length || 0}`);
  console.log('\n🎯 Ready for test folder creation!');
  
  return storageInfo;
}

// Export for use
window.runStorageAnalysis = runStorageAnalysis;
window.getCurrentStorageInfo = getCurrentStorageInfo;

console.log('\n📌 Usage:');
console.log('- Run: runStorageAnalysis() to get full analysis');
console.log('- Run: getCurrentStorageInfo() to get current storage details');

// Auto-run if user is logged in
if (localStorage.getItem('user')) {
  console.log('\n🚀 Auto-running analysis...');
  setTimeout(runStorageAnalysis, 1000);
}
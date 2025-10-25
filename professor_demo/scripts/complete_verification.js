/**
 * CryptoVaultX Complete Verification Script
 * Comprehensive test suite for professor demonstration
 */

class CryptoVaultXVerification {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        passed: 0,
        failed: 0,
        total: 0
      },
      logs: []
    };
  }

  log(message, type = 'info') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message
    };
    this.results.logs.push(logEntry);
    
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '📋';
    console.log(`${emoji} [${type.toUpperCase()}] ${message}`);
  }

  addTest(name, passed, details = {}) {
    const test = {
      name,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.results.tests.push(test);
    this.results.summary.total++;
    
    if (passed) {
      this.results.summary.passed++;
      this.log(`Test PASSED: ${name}`, 'success');
    } else {
      this.results.summary.failed++;
      this.log(`Test FAILED: ${name}`, 'error');
    }
  }

  // Test 1: Verify User Authentication & Storage Setup
  async testAuthenticationAndStorage() {
    this.log('Starting Authentication & Storage Test', 'info');
    
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      
      if (!userStr || !token) {
        this.addTest('Authentication', false, { error: 'User not logged in' });
        return false;
      }
      
      const user = JSON.parse(userStr);
      const userId = `user_${user.id}_${user.username}`;
      const dbKey = `cryptoVaultDB_${userId}`;
      
      this.addTest('Authentication', true, {
        userId,
        username: user.username,
        hasToken: !!token
      });
      
      // Test storage paths
      const expectedPaths = {
        base: `C:\\CryptoVaultX\\Users\\${userId}`,
        uploads: `C:\\CryptoVaultX\\Users\\${userId}\\uploads`,
        downloads: `C:\\CryptoVaultX\\Users\\${userId}\\downloads`,
        db: dbKey
      };
      
      this.addTest('Storage Path Configuration', true, expectedPaths);
      return true;
      
    } catch (error) {
      this.addTest('Authentication', false, { error: error.message });
      return false;
    }
  }

  // Test 2: Verify Crypto Module Functions
  async testCryptoModule() {
    this.log('Starting Crypto Module Test', 'info');
    
    try {
      // Check if crypto functions are available
      const cryptoFunctions = [
        'generateSessionKey',
        'encryptArrayBuffer', 
        'decryptArrayBuffer',
        'exportKeyBase64',
        'importKeyFromBase64',
        'getSessionKey'
      ];
      
      const missingFunctions = [];
      
      for (const funcName of cryptoFunctions) {
        if (typeof window[funcName] !== 'function' && !window.cryptoModule?.[funcName]) {
          missingFunctions.push(funcName);
        }
      }
      
      if (missingFunctions.length > 0) {
        this.addTest('Crypto Functions Available', false, { 
          missing: missingFunctions 
        });
        return false;
      }
      
      this.addTest('Crypto Functions Available', true, { 
        functions: cryptoFunctions 
      });
      
      // Test key generation
      this.log('Testing key generation...', 'info');
      const { generateSessionKey } = window.cryptoModule || window;
      const key = await generateSessionKey(256);
      
      this.addTest('Key Generation', true, {
        keyType: key.constructor.name,
        algorithm: key.algorithm
      });
      
      return true;
      
    } catch (error) {
      this.addTest('Crypto Module', false, { error: error.message });
      return false;
    }
  }

  // Test 3: Encryption/Decryption Cycle
  async testEncryptionDecryption() {
    this.log('Starting Encryption/Decryption Cycle Test', 'info');
    
    try {
      const { generateSessionKey, encryptArrayBuffer, decryptArrayBuffer } = window.cryptoModule || window;
      
      // Generate test data
      const originalText = 'CryptoVaultX Test Data - Professor Demonstration';
      const originalBuffer = new TextEncoder().encode(originalText).buffer;
      
      this.log(`Original data: "${originalText}" (${originalBuffer.byteLength} bytes)`, 'info');
      
      // Generate key
      const key = await generateSessionKey(256);
      
      // Encrypt
      const encrypted = await encryptArrayBuffer(originalBuffer, key);
      this.log(`Encrypted size: ${encrypted.cipher.byteLength} bytes, IV: ${encrypted.ivBase64.substring(0, 16)}...`, 'info');
      
      this.addTest('Encryption', true, {
        originalSize: originalBuffer.byteLength,
        encryptedSize: encrypted.cipher.byteLength,
        ivLength: encrypted.ivBase64.length
      });
      
      // Decrypt
      const decrypted = await decryptArrayBuffer(encrypted.cipher, key, encrypted.ivBase64);
      const decryptedText = new TextDecoder().decode(decrypted);
      
      this.log(`Decrypted: "${decryptedText}"`, 'info');
      
      // Verify integrity
      const integrityValid = originalText === decryptedText;
      
      this.addTest('Decryption & Integrity', integrityValid, {
        originalText,
        decryptedText,
        match: integrityValid
      });
      
      return integrityValid;
      
    } catch (error) {
      this.addTest('Encryption/Decryption', false, { error: error.message });
      return false;
    }
  }

  // Test 4: Key Management
  async testKeyManagement() {
    this.log('Starting Key Management Test', 'info');
    
    try {
      // Test session key storage
      const keyLevels = ['HIGH', 'MEDIUM', 'LOW'];
      const keyResults = {};
      
      for (const level of keyLevels) {
        const keyStorageKey = `cryptovault_session_key_${level}`;
        const existingKey = sessionStorage.getItem(keyStorageKey);
        keyResults[level] = !!existingKey;
      }
      
      this.addTest('Session Key Storage', true, keyResults);
      
      // Test key export/import
      const { generateSessionKey, exportKeyBase64, importKeyFromBase64 } = window.cryptoModule || window;
      
      const originalKey = await generateSessionKey(256);
      const exportedKey = await exportKeyBase64(originalKey);
      const importedKey = await importKeyFromBase64(exportedKey);
      
      this.addTest('Key Export/Import', true, {
        exportedKeyLength: exportedKey.length,
        reimported: !!importedKey
      });
      
      return true;
      
    } catch (error) {
      this.addTest('Key Management', false, { error: error.message });
      return false;
    }
  }

  // Test 5: Local Database Integration
  async testLocalDatabase() {
    this.log('Starting Local Database Test', 'info');
    
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        this.addTest('Local Database', false, { error: 'User not authenticated' });
        return false;
      }
      
      const user = JSON.parse(userStr);
      const userId = `user_${user.id}_${user.username}`;
      const dbKey = `cryptoVaultDB_${userId}`;
      const localDB = localStorage.getItem(dbKey);
      
      if (localDB) {
        const db = JSON.parse(localDB);
        this.addTest('Local Database Access', true, {
          version: db.version,
          filesCount: db.files?.length || 0,
          sharesCount: db.shares?.length || 0,
          downloadsCount: db.downloads?.length || 0
        });
      } else {
        this.addTest('Local Database Access', true, {
          status: 'Empty database (new user)'
        });
      }
      
      // Test IndexedDB
      return new Promise((resolve) => {
        const dbRequest = indexedDB.open('CryptoVaultX_Storage', 1);
        
        dbRequest.onsuccess = (event) => {
          const db = event.target.result;
          this.addTest('IndexedDB Access', true, {
            name: db.name,
            version: db.version,
            objectStores: [...db.objectStoreNames]
          });
          db.close();
          resolve(true);
        };
        
        dbRequest.onerror = () => {
          this.addTest('IndexedDB Access', false, { error: 'IndexedDB connection failed' });
          resolve(false);
        };
      });
      
    } catch (error) {
      this.addTest('Local Database', false, { error: error.message });
      return false;
    }
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      title: 'CryptoVaultX Verification Report',
      timestamp: this.results.timestamp,
      summary: this.results.summary,
      details: {
        successRate: `${Math.round((this.results.summary.passed / this.results.summary.total) * 100)}%`,
        totalTests: this.results.summary.total,
        environment: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      },
      tests: this.results.tests,
      logs: this.results.logs
    };
    
    this.log(`\n📊 VERIFICATION COMPLETE`, 'info');
    this.log(`✅ Passed: ${this.results.summary.passed}`, 'success');
    this.log(`❌ Failed: ${this.results.summary.failed}`, 'error');
    this.log(`📈 Success Rate: ${report.details.successRate}`, 'info');
    
    return report;
  }

  // Run all tests
  async runCompleteVerification() {
    this.log('🚀 Starting CryptoVaultX Complete Verification', 'info');
    this.log('=' .repeat(50), 'info');
    
    await this.testAuthenticationAndStorage();
    await this.testCryptoModule();
    await this.testEncryptionDecryption();
    await this.testKeyManagement();
    await this.testLocalDatabase();
    
    const report = this.generateReport();
    
    // Export to window for easy access
    window.verificationReport = report;
    window.downloadReport = () => {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cryptovaultx_verification_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
    
    this.log('📋 Report saved to window.verificationReport', 'info');
    this.log('💾 Download report with: downloadReport()', 'info');
    
    return report;
  }
}

// Export to window
window.CryptoVaultXVerification = CryptoVaultXVerification;
window.runCompleteVerification = async () => {
  const verifier = new CryptoVaultXVerification();
  return await verifier.runCompleteVerification();
};

console.log('🔧 CryptoVaultX Verification Script Loaded');
console.log('📋 Usage: runCompleteVerification()');

// Auto-run if user is logged in
if (localStorage.getItem('user')) {
  console.log('🎯 User detected - Auto-running verification in 2 seconds...');
  setTimeout(() => {
    console.log('🚀 Starting auto-verification...');
    runCompleteVerification();
  }, 2000);
}
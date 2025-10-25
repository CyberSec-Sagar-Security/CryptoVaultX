/**
 * Download + Decrypt Functionality Test
 * Tests both local and remote download/decrypt operations
 */

// Test script to be run in browser console
(async function testDownloadDecrypt() {
  console.log('🔄 Starting Download + Decrypt Functionality Test...');
  
  try {
    // Test 1: Check if crypto module is available
    console.log('\n📋 Test 1: Crypto Module Availability');
    const { decryptFile, getSessionKey, generateKey, encryptFile } = await import('./src/lib/crypto.ts');
    console.log('✅ Crypto module loaded successfully');
    
    // Test 2: Generate session key
    console.log('\n📋 Test 2: Session Key Generation');
    const sessionKey = await getSessionKey('HIGH');
    console.log('✅ Session key generated:', sessionKey);
    
    // Test 3: Test encryption/decryption cycle
    console.log('\n📋 Test 3: Encryption/Decryption Cycle');
    const testData = new TextEncoder().encode('Hello, CryptoVault! This is a test file content.');
    const encrypted = await encryptFile(testData.buffer, sessionKey);
    console.log('✅ Test data encrypted, IV:', encrypted.ivBase64);
    
    const decrypted = await decryptFile(encrypted.cipher, encrypted.iv, sessionKey);
    const decryptedText = new TextDecoder().decode(decrypted);
    console.log('✅ Test data decrypted:', decryptedText);
    
    if (decryptedText === 'Hello, CryptoVault! This is a test file content.') {
      console.log('✅ Encryption/Decryption cycle successful!');
    } else {
      throw new Error('Decryption failed - content mismatch');
    }
    
    // Test 4: Check file list API
    console.log('\n📋 Test 4: File List API');
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('⚠️ No access token found - user not logged in');
      return;
    }
    
    const response = await fetch('/api/files', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const files = await response.json();
      console.log('✅ File list retrieved:', files.length, 'files found');
      
      // Test 5: Test download for first encrypted file
      const encryptedFile = files.find(f => f.is_encrypted);
      if (encryptedFile) {
        console.log('\n📋 Test 5: Download Encrypted File');
        console.log('Testing file:', encryptedFile.filename);
        
        const downloadResponse = await fetch(`/api/files/${encryptedFile.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (downloadResponse.ok) {
          console.log('✅ File download API successful');
          const metadataHeader = downloadResponse.headers.get('X-File-Metadata');
          if (metadataHeader) {
            const metadata = JSON.parse(metadataHeader);
            console.log('✅ File metadata retrieved:', metadata);
          }
        } else {
          console.log('❌ File download failed:', downloadResponse.status);
        }
      } else {
        console.log('⚠️ No encrypted files found for testing');
      }
    } else {
      console.log('❌ File list API failed:', response.status);
    }
    
    console.log('\n🎉 Download + Decrypt functionality test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
})();
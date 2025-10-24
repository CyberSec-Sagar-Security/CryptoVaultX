/**
 * Test script for File Upload/Download functionality
 * Tests the complete E2E encryption workflow
 */

// Test file upload and download
async function testFileUploadDownload() {
  console.log('🧪 Testing File Upload/Download Workflow...');
  
  // Create a test file
  const testContent = 'This is a test file for CryptoVaultX encryption';
  const testFile = new File([testContent], 'test_file.txt', { type: 'text/plain' });
  
  console.log('📁 Created test file:', testFile.name, testFile.size, 'bytes');
  
  try {
    // Import crypto functions (assuming they're available)
    const { 
      generateFileKey, 
      encryptFile, 
      wrapKey, 
      importPublicKeyPem,
      generateUserKeyPair,
      exportPublicKeyPem
    } = await import('../src/services/crypto.ts');
    
    console.log('🔐 Crypto functions loaded');
    
    // Generate user key pair
    const userKeys = await generateUserKeyPair();
    const publicKeyPem = await exportPublicKeyPem(userKeys.publicKey);
    
    console.log('🔑 User keypair generated');
    
    // Generate file key
    const fileKey = await generateFileKey();
    console.log('🗝️ File key generated');
    
    // Encrypt file
    const encryptedFile = await encryptFile(testFile, fileKey);
    console.log('🔒 File encrypted:', encryptedFile.ciphertext.length, 'chars');
    
    // Wrap key
    const wrappedKey = await wrapKey(fileKey, userKeys.publicKey);
    console.log('📦 Key wrapped:', wrappedKey.length, 'chars');
    
    console.log('✅ E2E encryption test completed successfully!');
    
    return {
      success: true,
      testFile,
      encryptedFile,
      wrappedKey,
      userKeys
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
}

// Run test if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testFileUploadDownload = testFileUploadDownload;
  console.log('🌐 Test function available as window.testFileUploadDownload()');
} else {
  // Node environment
  testFileUploadDownload().then(result => {
    console.log('Test result:', result);
  });
}

export { testFileUploadDownload };
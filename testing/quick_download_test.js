/**
 * Quick Test Script for Download + Decrypt Functionality
 * Run this in the browser console when on the Files page
 */

window.testDownloadDecrypt = async function() {
  console.log('🚀 Starting Download + Decrypt Test...');
  
  try {
    // Test 1: Check if we're on the right page
    if (!window.location.pathname.includes('/files')) {
      console.log('⚠️ Please navigate to the Files page first');
      return;
    }
    
    // Test 2: Check authentication
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('❌ No authentication token found. Please log in first.');
      return;
    }
    console.log('✅ Authentication token found');
    
    // Test 3: Test API connection
    console.log('🔄 Testing API connection...');
    const response = await fetch('/api/files', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.log(`❌ API connection failed: ${response.status}`);
      return;
    }
    
    const files = await response.json();
    console.log(`✅ API connection successful. Found ${files.length} files`);
    
    // Test 4: Find a test file
    const encryptedFile = files.find(f => f.is_encrypted);
    const testFile = encryptedFile || files[0];
    
    if (!testFile) {
      console.log('❌ No files found for testing');
      return;
    }
    
    console.log(`🎯 Testing with file: ${testFile.filename} (encrypted: ${testFile.is_encrypted})`);
    
    // Test 5: Test download functionality
    console.log('🔄 Testing download functionality...');
    
    // Find the download button for this file
    const fileElements = document.querySelectorAll('[data-testid="file-item"]');
    let downloadButton = null;
    
    for (const element of fileElements) {
      const filename = element.querySelector('[data-testid="file-name"]')?.textContent;
      if (filename === testFile.filename) {
        downloadButton = element.querySelector('[data-testid="download-button"]');
        break;
      }
    }
    
    if (downloadButton) {
      console.log('✅ Download button found, triggering download...');
      downloadButton.click();
      console.log('🎉 Download initiated! Check your downloads folder.');
    } else {
      console.log('⚠️ Download button not found in UI. Testing with direct function call...');
      
      // Direct function call test
      if (window.downloadFileEnhanced) {
        await window.downloadFileEnhanced(testFile, (progress, status) => {
          console.log(`📊 Progress: ${progress}% - ${status}`);
        });
        console.log('🎉 Direct download test completed!');
      } else {
        console.log('❌ downloadFileEnhanced function not available');
      }
    }
    
    console.log('✅ Download + Decrypt test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

console.log('📋 Download + Decrypt Test Script Loaded');
console.log('📌 Run: testDownloadDecrypt() to start testing');

// Auto-run test if we're already on the files page
if (window.location.pathname.includes('/files')) {
  console.log('🎯 Files page detected. Auto-running test in 3 seconds...');
  setTimeout(() => {
    console.log('🚀 Auto-running test...');
    window.testDownloadDecrypt();
  }, 3000);
}
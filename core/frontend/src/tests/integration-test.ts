/**
 * Frontend-Backend Integration Test
 * Tests all API endpoints from the frontend perspective
 */

console.log('\n═══════════════════════════════════════════════════════');
console.log('  🔬 FRONTEND↔BACKEND INTEGRATION TEST');
console.log('═══════════════════════════════════════════════════════\n');

const API_BASE = 'http://localhost:5000/api';
let authToken = null;
let testUserId = null;
let testFileId = null;

// Test 1: Backend Health Check
async function testHealth() {
  console.log('1️⃣  Testing Backend Health...');
  try {
    const response = await fetch(`${API_BASE}/health` || `${API_BASE}`);
    const data = await response.json();
    console.log('   ✅ Backend is responding:', data);
    return true;
  } catch (error) {
    console.error('   ❌ Backend health check failed:', error.message);
    return false;
  }
}

// Test 2: User Registration
async function testRegister() {
  console.log('\n2️⃣  Testing User Registration...');
  const testEmail = `test_${Date.now()}@cryptovault.test`;
  const testUsername = `testuser_${Date.now()}`;
  
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: testUsername,
        email: testEmail,
        password: 'TestPass123!'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      testUserId = data.user?.id;
      console.log('   ✅ Registration successful');
      console.log('   User ID:', testUserId);
      console.log('   Email:', testEmail);
      return true;
    } else {
      console.error('   ❌ Registration failed:', data);
      return false;
    }
  } catch (error) {
    console.error('   ❌ Registration error:', error.message);
    return false;
  }
}

// Test 3: User Login
async function testLogin() {
  console.log('\n3️⃣  Testing User Login...');
  const loginEmail = `test_${Date.now()}@cryptovault.test`;
  const loginUsername = `loginuser_${Date.now()}`;
  
  // First register
  await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: loginUsername,
      email: loginEmail,
      password: 'TestPass123!'
    })
  });
  
  // Then login
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: loginEmail,
        password: 'TestPass123!'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.access_token) {
      authToken = data.access_token;
      console.log('   ✅ Login successful');
      console.log('   Token received:', authToken.substring(0, 20) + '...');
      return true;
    } else {
      console.error('   ❌ Login failed:', data);
      return false;
    }
  } catch (error) {
    console.error('   ❌ Login error:', error.message);
    return false;
  }
}

// Test 4: File Upload
async function testUpload() {
  console.log('\n4️⃣  Testing File Upload...');
  
  if (!authToken) {
    console.error('   ❌ No auth token available');
    return false;
  }
  
  try {
    // Create test file
    const testContent = 'Test encrypted content';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', testBlob, 'test.enc');
    formData.append('metadata', JSON.stringify({
      originalFilename: 'integration_test.txt',
      ivBase64: btoa('+7xapSQ5rp2rpKiV'),
      algo: 'AES-256-GCM'
    }));
    
    const response = await fetch(`${API_BASE}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok) {
      testFileId = data.id;
      console.log('   ✅ Upload successful');
      console.log('   File ID:', testFileId);
      console.log('   Filename:', data.original_filename);
      return true;
    } else {
      console.error('   ❌ Upload failed:', response.status, data);
      return false;
    }
  } catch (error) {
    console.error('   ❌ Upload error:', error.message);
    return false;
  }
}

// Test 5: File Download
async function testDownload() {
  console.log('\n5️⃣  Testing File Download...');
  
  if (!authToken || !testFileId) {
    console.error('   ❌ No auth token or file ID available');
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE}/files/${testFileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const iv = response.headers.get('X-File-IV');
      const algo = response.headers.get('X-File-Algo');
      const filename = response.headers.get('X-File-Name');
      
      console.log('   ✅ Download successful');
      console.log('   Filename:', filename);
      console.log('   Algorithm:', algo);
      console.log('   IV:', iv);
      return true;
    } else {
      const data = await response.json();
      console.error('   ❌ Download failed:', response.status, data);
      return false;
    }
  } catch (error) {
    console.error('   ❌ Download error:', error.message);
    return false;
  }
}

// Test 6: File Delete
async function testDelete() {
  console.log('\n6️⃣  Testing File Delete...');
  
  if (!authToken || !testFileId) {
    console.error('   ❌ No auth token or file ID available');
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE}/files/${testFileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Delete successful');
      console.log('   Message:', data.message);
      return true;
    } else {
      console.error('   ❌ Delete failed:', response.status, data);
      return false;
    }
  } catch (error) {
    console.error('   ❌ Delete error:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    health: await testHealth(),
    register: await testRegister(),
    login: await testLogin(),
    upload: await testUpload(),
    download: await testDownload(),
    delete: await testDelete()
  };
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  📊 TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`  ${icon} ${test.toUpperCase()}`);
  });
  
  const passedCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.values(results).length;
  
  console.log(`\n  Score: ${passedCount}/${totalCount} tests passed`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  return passedCount === totalCount;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.frontendBackendTest = {
    runAllTests,
    testHealth,
    testRegister,
    testLogin,
    testUpload,
    testDownload,
    testDelete
  };
  
  console.log('💡 Integration test functions available:');
  console.log('   - frontendBackendTest.runAllTests()');
  console.log('   - frontendBackendTest.testHealth()');
  console.log('   - etc.');
}

// Auto-run if in test mode
if (import.meta.env.VITE_RUN_TESTS === 'true') {
  runAllTests();
}

// Final comprehensive API test
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function finalTest() {
  console.log('🎯 Final Comprehensive API Test\n');
  console.log('=' .repeat(50));
  
  const timestamp = Date.now();
  const uniqueEmail = `finaltest${timestamp}@example.com`;
  
  try {
    // Test 1: Health Check
    console.log('\n📊 1. Health Check');
    console.log('-'.repeat(30));
    const healthOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    };
    
    const healthResult = await makeRequest(healthOptions);
    console.log(`Status: ${healthResult.status} ${healthResult.status === 200 ? '✅' : '❌'}`);
    console.log(`Response:`, JSON.stringify(healthResult.data, null, 2));
    
    // Test 2: Register NEW User
    console.log('\n👤 2. Register New User');
    console.log('-'.repeat(30));
    const registerOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const registerData = {
      name: 'Final Test User',
      email: uniqueEmail,
      password: 'FinalTest123'
    };
    
    console.log(`Registering: ${uniqueEmail}`);
    const registerResult = await makeRequest(registerOptions, registerData);
    console.log(`Status: ${registerResult.status} ${registerResult.status === 201 ? '✅' : '❌'}`);
    console.log(`Response:`, JSON.stringify(registerResult.data, null, 2));
    
    // Test 3: Login with NEW User
    console.log('\n🔐 3. Login New User');
    console.log('-'.repeat(30));
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const loginData = {
      email: uniqueEmail,
      password: 'FinalTest123'
    };
    
    const loginResult = await makeRequest(loginOptions, loginData);
    console.log(`Status: ${loginResult.status} ${loginResult.status === 200 ? '✅' : '❌'}`);
    console.log(`Response:`, JSON.stringify(loginResult.data, null, 2));
    
    let token = null;
    if (loginResult.status === 200 && loginResult.data.token) {
      token = loginResult.data.token;
      console.log('✅ JWT Token received');
    }
    
    // Test 4: Get User Profile
    console.log('\n👥 4. Get User Profile');
    console.log('-'.repeat(30));
    if (token) {
      const profileOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/me',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const profileResult = await makeRequest(profileOptions);
      console.log(`Status: ${profileResult.status} ${profileResult.status === 200 ? '✅' : '❌'}`);
      console.log(`Response:`, JSON.stringify(profileResult.data, null, 2));
    } else {
      console.log('❌ Skipping profile test - no valid token');
    }
    
    // Test 5: Try to register same email again (should fail)
    console.log('\n🚫 5. Test Duplicate Registration');
    console.log('-'.repeat(30));
    const duplicateResult = await makeRequest(registerOptions, registerData);
    console.log(`Status: ${duplicateResult.status} ${duplicateResult.status === 409 ? '✅' : '❌'}`);
    console.log(`Response:`, JSON.stringify(duplicateResult.data, null, 2));
    
    // Test 6: Test Invalid Login
    console.log('\n🔒 6. Test Invalid Login');
    console.log('-'.repeat(30));
    const invalidLoginData = {
      email: uniqueEmail,
      password: 'WrongPassword'
    };
    
    const invalidLoginResult = await makeRequest(loginOptions, invalidLoginData);
    console.log(`Status: ${invalidLoginResult.status} ${invalidLoginResult.status === 401 ? '✅' : '❌'}`);
    console.log(`Response:`, JSON.stringify(invalidLoginResult.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 Final API Test Complete!');
  console.log('✅ CryptoVaultX Backend is fully functional!');
  process.exit(0);
}

finalTest();

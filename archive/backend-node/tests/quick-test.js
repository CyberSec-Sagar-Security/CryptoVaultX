// Quick test script for API endpoints
const https = require('https');
const http = require('http');

// Helper function to make HTTP requests
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

async function testAPI() {
  console.log('🧪 Testing CryptoVaultX Backend API\n');
  
  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    };
    
    const healthResult = await makeRequest(healthOptions);
    console.log(`✅ Status: ${healthResult.status}`);
    console.log(`Response:`, healthResult.data);
    console.log('');
    
    // Test 2: Register User
    console.log('2. Testing User Registration...');
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
      name: 'Sagar Kumar',
      email: 'sagar@example.com',
      password: 'SecurePass123'
    };
    
    const registerResult = await makeRequest(registerOptions, registerData);
    console.log(`Status: ${registerResult.status}`);
    console.log(`Response:`, registerResult.data);
    console.log('');
    
    // Test 3: Login User
    console.log('3. Testing User Login...');
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
      email: 'sagar@example.com',
      password: 'SecurePass123'
    };
    
    const loginResult = await makeRequest(loginOptions, loginData);
    console.log(`Status: ${loginResult.status}`);
    console.log(`Response:`, loginResult.data);
    
    let token = null;
    if (loginResult.status === 200 && loginResult.data.token) {
      token = loginResult.data.token;
      console.log('✅ Token received');
    }
    console.log('');
    
    // Test 4: Get User Profile
    if (token) {
      console.log('4. Testing Get User Profile...');
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
      console.log(`Status: ${profileResult.status}`);
      console.log(`Response:`, profileResult.data);
    } else {
      console.log('4. Skipping profile test - no valid token');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n✅ API Testing Complete!');
  process.exit(0);
}

testAPI();

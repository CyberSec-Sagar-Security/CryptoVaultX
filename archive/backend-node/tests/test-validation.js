// Test validation issues
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

async function testValidation() {
  console.log('🧪 Testing Validation Issues\n');
  
  const registerOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  // Test 1: Valid data
  console.log('1. Testing with valid data...');
  const validData = {
    name: 'Test User',
    email: `valid${Date.now()}@example.com`,
    password: 'SecurePass123'
  };
  
  let result = await makeRequest(registerOptions, validData);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, JSON.stringify(result.data, null, 2));
  console.log('');
  
  // Test 2: Invalid password (too short)
  console.log('2. Testing with short password...');
  const shortPassData = {
    name: 'Test User',
    email: `short${Date.now()}@example.com`,
    password: '123'
  };
  
  result = await makeRequest(registerOptions, shortPassData);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, JSON.stringify(result.data, null, 2));
  console.log('');
  
  // Test 3: Invalid email
  console.log('3. Testing with invalid email...');
  const invalidEmailData = {
    name: 'Test User',
    email: 'invalid-email',
    password: 'SecurePass123'
  };
  
  result = await makeRequest(registerOptions, invalidEmailData);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, JSON.stringify(result.data, null, 2));
  
  process.exit(0);
}

testValidation();

// Test registration with new user
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

async function testNewRegistration() {
  console.log('🧪 Testing Registration with New User\n');
  
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
    name: 'Test User New',
    email: `test${Date.now()}@example.com`,
    password: 'SecurePass123'
  };
  
  console.log('Registering user:', registerData);
  
  try {
    const result = await makeRequest(registerOptions, registerData);
    console.log(`\nStatus: ${result.status}`);
    console.log(`Response:`, result.data);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  process.exit(0);
}

testNewRegistration();

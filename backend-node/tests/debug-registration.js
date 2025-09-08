// Debug registration test
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

async function debugRegistration() {
  console.log('🔍 Debug Registration Process\n');
  
  // First, let's check what users exist
  console.log('1. Checking existing users...');
  const db = require('../database');
  
  try {
    const existingUsers = await db('users').select('id', 'username', 'email').limit(5);
    console.log('Existing users:', existingUsers);
    
    // Test if we can insert manually
    console.log('\n2. Testing manual insertion...');
    const testEmail = `debug${Date.now()}@example.com`;
    const testUsername = `debug_${Date.now()}`;
    
    const [newUser] = await db('users').insert({
      name: 'Debug User',
      username: testUsername,
      email: testEmail,
      password_hash: '$2b$12$test.hash.value'
    }).returning(['id', 'name', 'username', 'email']);
    
    console.log('Manual insertion result:', newUser);
    
  } catch (error) {
    console.error('Database error:', error.message);
    console.error('Full error:', error);
  }
  
  process.exit(0);
}

debugRegistration();

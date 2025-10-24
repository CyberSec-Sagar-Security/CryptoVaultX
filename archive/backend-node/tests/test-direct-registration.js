// Test the registration logic directly without API
require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');
const db = require('../database');

async function testRegistrationLogic() {
  console.log('🔍 Testing Registration Logic Directly\n');
  
  try {
    const name = 'Direct Test User';
    const email = `direct${Date.now()}@example.com`;
    const password = 'SecurePass123';
    
    console.log('1. Testing bcrypt hash...');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed successfully:', passwordHash.substring(0, 20) + '...');
    
    console.log('\n2. Creating username...');
    const emailPrefix = email.split('@')[0];
    const username = `${emailPrefix}_${Date.now()}`.substring(0, 50);
    console.log('✅ Username created:', username);
    
    console.log('\n3. Checking for existing user...');
    const existingUser = await db('users')
      .where('email', email)
      .orWhere('username', username)
      .first();
    console.log('✅ Existing user check:', existingUser ? 'Found' : 'None found');
    
    console.log('\n4. Inserting new user...');
    const [insertResult] = await db('users').insert({
      name,
      username,
      email,
      password_hash: passwordHash
    }).returning('id');
    
    console.log('✅ Insert result:', insertResult);
    
    const userId = typeof insertResult === 'object' ? insertResult.id : insertResult;
    console.log('✅ Extracted user ID:', userId);
    
    console.log('\n5. Fetching created user...');
    const newUser = await db('users')
      .select('id', 'name', 'username', 'email')
      .where('id', userId)
      .first();
    
    console.log('✅ Created user:', newUser);
    
    console.log('\n🎉 Registration logic test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in registration logic:', error.message);
    console.error('Full error:', error);
  }
  
  process.exit(0);
}

testRegistrationLogic();

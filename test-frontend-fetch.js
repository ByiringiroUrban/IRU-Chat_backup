// Test script to simulate frontend fetch calls
// This mimics exactly what Auth.tsx does

import fetch from 'node-fetch';

const API_BASE_URL = ''; // Empty = relative URL (uses proxy)
const BACKEND_URL = 'http://localhost:5000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testFrontendRegistration() {
  log('\n' + '='.repeat(70), 'blue');
  log('🧪 TESTING FRONTEND REGISTRATION (Like Auth.tsx)', 'blue');
  log('='.repeat(70), 'blue');
  
  try {
    const testEmail = `testfrontend${Date.now()}@test.com`;
    const url = `${API_BASE_URL}/api/users/register`;
    
    log(`\n🔵 Frontend making request to: ${url || '(relative URL)'}`, 'cyan');
    log(`   Method: POST`, 'cyan');
    log(`   Body: { name: 'Test User', email: '${testEmail}', password: '***', role: 'USER' }`, 'cyan');
    
    const startTime = Date.now();
    const response = await fetch(`http://localhost:8080${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: testEmail,
        password: 'test123',
        role: 'USER'
      })
    });
    const duration = Date.now() - startTime;
    
    log(`\n📥 Response received:`, 'cyan');
    log(`   Status: ${response.status} ${response.statusText}`, 'cyan');
    log(`   Duration: ${duration}ms`, 'cyan');
    log(`   Headers:`, 'cyan');
    response.headers.forEach((value, key) => {
      log(`     ${key}: ${value}`, 'cyan');
    });
    
    const contentType = response.headers.get('content-type');
    log(`\n📄 Content-Type: ${contentType}`, 'cyan');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      log(`\n❌ ERROR: Expected JSON but got ${contentType}`, 'red');
      log(`   Response (first 200 chars): ${text.substring(0, 200)}`, 'yellow');
      return false;
    }
    
    const data = await response.json();
    log(`\n✅ Success! Response data:`, 'green');
    log(JSON.stringify(data, null, 2), 'green');
    
    if (response.ok && data.token) {
      log(`\n✅ Registration successful!`, 'green');
      log(`   User ID: ${data.id}`, 'green');
      log(`   Email: ${data.email}`, 'green');
      log(`   Role: ${data.role}`, 'green');
      log(`   Token: ${data.token.substring(0, 20)}...`, 'green');
      return true;
    } else {
      log(`\n❌ Registration failed:`, 'red');
      log(JSON.stringify(data, null, 2), 'red');
      return false;
    }
  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, 'red');
    log(`   Stack: ${error.stack}`, 'yellow');
    return false;
  }
}

async function testFrontendLogin() {
  log('\n' + '='.repeat(70), 'blue');
  log('🧪 TESTING FRONTEND LOGIN (Like Auth.tsx)', 'blue');
  log('='.repeat(70), 'blue');
  
  try {
    const url = `${API_BASE_URL}/api/users/login`;
    
    log(`\n🔵 Frontend making request to: ${url || '(relative URL)'}`, 'cyan');
    log(`   Method: POST`, 'cyan');
    log(`   Body: { email: 'test@test.com', password: '***' }`, 'cyan');
    
    const startTime = Date.now();
    const response = await fetch(`http://localhost:8080${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'nonexistent@test.com',
        password: 'wrong'
      })
    });
    const duration = Date.now() - startTime;
    
    log(`\n📥 Response received:`, 'cyan');
    log(`   Status: ${response.status} ${response.statusText}`, 'cyan');
    log(`   Duration: ${duration}ms`, 'cyan');
    
    const contentType = response.headers.get('content-type');
    log(`\n📄 Content-Type: ${contentType}`, 'cyan');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      log(`\n❌ ERROR: Expected JSON but got ${contentType}`, 'red');
      log(`   Response (first 200 chars): ${text.substring(0, 200)}`, 'yellow');
      return false;
    }
    
    const data = await response.json();
    log(`\n📄 Response data:`, 'cyan');
    log(JSON.stringify(data, null, 2), 'cyan');
    
    if (response.status === 401) {
      log(`\n✅ Expected 401 (wrong credentials) - Login endpoint working!`, 'green');
      return true;
    } else if (response.ok && data.token) {
      log(`\n✅ Login successful!`, 'green');
      return true;
    } else {
      log(`\n❌ Unexpected response`, 'red');
      return false;
    }
  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, 'red');
    log(`   Stack: ${error.stack}`, 'yellow');
    return false;
  }
}

async function runTests() {
  log('\n🚀 Starting Frontend-Backend Connection Tests\n', 'blue');
  
  const test1 = await testFrontendRegistration();
  const test2 = await testFrontendLogin();
  
  log('\n' + '='.repeat(70), 'blue');
  log('📊 TEST SUMMARY', 'blue');
  log('='.repeat(70), 'blue');
  log(`\nRegistration Test: ${test1 ? '✅ PASSED' : '❌ FAILED'}`, test1 ? 'green' : 'red');
  log(`Login Test: ${test2 ? '✅ PASSED' : '❌ FAILED'}`, test2 ? 'green' : 'red');
  
  if (test1 && test2) {
    log('\n🎉 All frontend tests passed! Frontend is successfully receiving responses from backend.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the details above.', 'yellow');
  }
  
  log('\n' + '='.repeat(70) + '\n', 'blue');
}

runTests().catch(console.error);



// Automated Backend Connection Test Script
import http from 'http';

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

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const contentType = res.headers['content-type'] || '';
          const parsed = contentType.includes('application/json') 
            ? JSON.parse(data) 
            : data;
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            body: parsed,
            raw: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            body: data,
            raw: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTest(name, options, body = null, expectedStatus = null) {
  const startTime = Date.now();
  try {
    const result = await makeRequest(options, body);
    const duration = Date.now() - startTime;
    const isSuccess = expectedStatus 
      ? result.status === expectedStatus 
      : result.status >= 200 && result.status < 300;

    if (isSuccess) {
      log(`✅ ${name}`, 'green');
      log(`   Status: ${result.status} ${result.statusText} (${duration}ms)`, 'cyan');
    } else {
      log(`❌ ${name}`, 'red');
      log(`   Status: ${result.status} ${result.statusText} (Expected: ${expectedStatus || '2xx'})`, 'yellow');
      log(`   Response: ${JSON.stringify(result.body).substring(0, 200)}`, 'yellow');
    }

    return { success: isSuccess, result, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`❌ ${name}`, 'red');
    log(`   Error: ${error.message}`, 'yellow');
    return { success: false, error: error.message, duration };
  }
}

async function runAllTests() {
  log('\n' + '='.repeat(70), 'blue');
  log('🔍 BACKEND CONNECTION DIAGNOSTIC TEST', 'blue');
  log('='.repeat(70) + '\n', 'blue');

  const results = [];

  // Test 1: Backend Health Check (Direct)
  results.push(await runTest(
    '1. Backend Health Check (Direct)',
    {
      hostname: 'localhost',
      port: 5000,
      path: '/',
      method: 'GET'
    },
    null,
    200
  ));

  // Test 2: Backend API Endpoint (Direct)
  results.push(await runTest(
    '2. Backend API Endpoint (Direct)',
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api',
      method: 'GET'
    },
    null,
    200
  ));

  // Test 3: Backend via Proxy (Frontend)
  results.push(await runTest(
    '3. Backend via Proxy (Frontend)',
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api',
      method: 'GET'
    },
    null,
    200
  ));

  // Test 4: Registration Endpoint (Direct)
  const testEmail1 = `test${Date.now()}@test.com`;
  results.push(await runTest(
    '4. Registration Endpoint (Direct)',
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Test User',
      email: testEmail1,
      password: 'test123'
    },
    201
  ));

  // Test 5: Registration Endpoint (via Proxy)
  const testEmail2 = `testproxy${Date.now()}@test.com`;
  results.push(await runTest(
    '5. Registration Endpoint (via Proxy)',
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/users/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Test User Proxy',
      email: testEmail2,
      password: 'test123'
    },
    201
  ));

  // Test 6: Login Endpoint (Direct) - Expected to fail with wrong credentials
  results.push(await runTest(
    '6. Login Endpoint (Direct) - Wrong Credentials',
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    {
      email: 'nonexistent@test.com',
      password: 'wrong'
    },
    401
  ));

  // Test 7: Login Endpoint (via Proxy) - Expected to fail with wrong credentials
  results.push(await runTest(
    '7. Login Endpoint (via Proxy) - Wrong Credentials',
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/users/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    {
      email: 'nonexistent@test.com',
      password: 'wrong'
    },
    401
  ));

  // Summary
  log('\n' + '='.repeat(70), 'blue');
  log('📊 TEST SUMMARY', 'blue');
  log('='.repeat(70), 'blue');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  log(`\n✅ Passed: ${successCount}/${totalCount}`, successCount === totalCount ? 'green' : 'yellow');
  log(`❌ Failed: ${totalCount - successCount}/${totalCount}`, totalCount - successCount > 0 ? 'red' : 'green');
  
  if (successCount === totalCount) {
    log('\n🎉 All tests passed! Backend connection is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the details above.', 'yellow');
    log('\n💡 Next steps:', 'cyan');
    log('   1. Check backend terminal for detailed logs', 'cyan');
    log('   2. Verify backend is running on port 5000', 'cyan');
    log('   3. Verify frontend is running on port 8080', 'cyan');
    log('   4. Check Vite proxy configuration in vite.config.ts', 'cyan');
  }
  
  log('\n' + '='.repeat(70) + '\n', 'blue');
}

// Run the tests
runAllTests().catch(console.error);


const http = require('http');

function request(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...headers
      }
    }, res => {
      let chunks = '';
      res.on('data', c => chunks += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(chunks) });
        } catch (e) {
          resolve({ status: res.statusCode, data: chunks });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('TVS Sensing Solutions Backend Integration Test Suite');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health
    console.log('\n[1/7] Testing Health Checks:');
    const health = await request('/api/health');
    assert(health.status === 200 && health.data.success === true, 'GET /api/health returned 200 OK');

    const dbHealth = await request('/api/health/database');
    assert(dbHealth.status === 200, 'GET /api/health/database returned 200 OK');

    // 2. Auth - Invalid Login
    console.log('\n[2/7] Testing Authentication (Invalid Credentials):');
    const badLogin = await request('/api/auth/login', 'POST', { email: 'wrong@admin.com', password: 'badpassword' });
    assert(badLogin.status === 401 && badLogin.data.success === false, 'POST /api/auth/login rejected invalid login with 401');

    // 3. Auth - Valid Login
    console.log('\n[3/7] Testing Authentication (Valid Credentials):');
    const goodLogin = await request('/api/auth/login', 'POST', { email: 'admin@tvsss.co.in', password: 'Admin@TVSS2026' });
    assert(goodLogin.status === 200 && !!goodLogin.data.token, 'POST /api/auth/login returned 200 with JWT token');
    const token = goodLogin.data.token;

    // 4. Auth - Forgot & Reset Password
    console.log('\n[4/7] Testing Forgot Password & Password Reset:');
    const forgotRes = await request('/api/auth/forgot-password', 'POST', { email: 'admin@tvsss.co.in' });
    assert(forgotRes.status === 200 && !!forgotRes.data.resetToken, 'POST /api/auth/forgot-password generated reset token');

    const resetRes = await request('/api/auth/reset-password', 'POST', {
      token: forgotRes.data.resetToken,
      newPassword: 'Admin@TVSS2026'
    });
    assert(resetRes.status === 200 && resetRes.data.success === true, 'POST /api/auth/reset-password reset password successfully');

    // 5. Dashboard Summary (Protected)
    console.log('\n[5/7] Testing Admin Dashboard Summary (Protected Route):');
    const dashUnauth = await request('/api/dashboard/summary', 'GET');
    assert(dashUnauth.status === 401, 'GET /api/dashboard/summary blocked unauthenticated access with 401');

    const dashAuth = await request('/api/dashboard/summary', 'GET', null, { 'Authorization': `Bearer ${token}` });
    assert(dashAuth.status === 200 && typeof dashAuth.data.totalMedia === 'number', 'GET /api/dashboard/summary returned metrics');

    // 6. Careers & Media (Public & Protected)
    console.log('\n[6/7] Testing Careers & Media APIs:');
    const careers = await request('/api/careers');
    assert(careers.status === 200 && Array.isArray(careers.data), 'GET /api/careers returned job listings');

    const media = await request('/api/media');
    assert(media.status === 200 && Array.isArray(media.data), 'GET /api/media returned media listings');

    // 7. Enquiries
    console.log('\n[7/7] Testing Public Enquiries & Admin View:');
    const newEnquiry = await request('/api/enquiries', 'POST', {
      name: 'Integration Test Bot',
      email: 'testbot@tvsss.co.in',
      phone: '+91 9999999999',
      company: 'TVS QA Labs',
      subject: 'Automated Test Enquiry',
      message: 'Automated verification test.'
    });
    assert(newEnquiry.status === 201 || newEnquiry.status === 200, 'POST /api/enquiries successfully submitted new enquiry');

    const listEnquiries = await request('/api/enquiries', 'GET', null, { 'Authorization': `Bearer ${token}` });
    assert(listEnquiries.status === 200 && Array.isArray(listEnquiries.data), 'GET /api/enquiries retrieved records for authenticated admin');

    console.log('====================================================');
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('\n❌ Fatal Test Runner Error:', err.message);
    console.error('Make sure Node.js server is running on http://localhost:5000 before running tests.');
    process.exit(1);
  }
}

runTestSuite();

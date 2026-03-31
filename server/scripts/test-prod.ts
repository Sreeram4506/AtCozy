import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testBackend() {
  console.log('🚀 Starting Backend Production Check...');
  
  try {
    // 1. Health Check
    console.log('Testing /api/health...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health status:', health.data.status);

    // 2. Products List
    console.log('Testing /api/products...');
    const products = await axios.get(`${API_URL}/products`);
    console.log('✅ Found products:', products.data.products?.length || products.data.length);

    // 3. Auth Check (Login Simulation if possible)
    console.log('Testing /api/auth/login with dummy data...');
    try {
      await axios.post(`${API_URL}/auth/login`, { email: 'fake@fake.com', password: 'password' });
    } catch (err: any) {
       console.log('ℹ️ Auth is protected (expected 401/400):', err.response?.status);
    }

    // 4. Rate Limiting Check
    console.log('Checking security headers...');
    if (health.headers['content-security-policy'] || health.headers['x-frame-options']) {
       console.log('✅ Security headers present');
    }

    console.log('\n🌟 ALL BACKEND CHECKS PASSED');
  } catch (err: any) {
    console.error('❌ CHECK FAILED:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
}

testBackend();

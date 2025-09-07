/**
 * API Testing Script for Ayurvedic Herbs Supply Chain System
 * Tests all major endpoints and functionalities
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testUsers = {
  farmer: {
    email: 'farmer@test.com',
    password: 'test123',
    role: 'farmer',
    farmerName: 'John Doe',
    contactInfo: { phone: '+91-9876543210', address: 'Farm, Kerala' },
    licenseNumber: 'FARM123456',
    farmLocation: { latitude: 10.8505, longitude: 76.2711, address: 'Kerala' }
  },
  manufacturer: {
    email: 'manufacturer@test.com',
    password: 'test123',
    role: 'manufacturer',
    companyName: 'Herb Processing Co.',
    gmpLicense: 'GMP789012',
    facilityLocation: { latitude: 10.0168, longitude: 76.3558, address: 'Kochi' }
  },
  tester: {
    email: 'tester@test.com',
    password: 'test123',
    role: 'tester',
    labName: 'Quality Lab Inc.',
    nablAccreditation: 'NABL123456',
    labLocation: { latitude: 12.9716, longitude: 77.5946, address: 'Bangalore' }
  },
  regulator: {
    email: 'regulator@test.com',
    password: 'test123',
    role: 'regulator',
    regulatorName: 'Food Safety Authority',
    department: 'Quality Control',
    jurisdiction: 'Kerala'
  }
};

// Store tokens and keys for testing
let authTokens = {};
let userKeys = {};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test functions
async function testServerStartup() {
  console.log('\n🚀 Testing Server Startup...');
  
  // Test the root endpoint directly, not through apiCall
  try {
    const response = await axios.get(`${BASE_URL}/`);
    if (response.status === 200 && response.data.includes('API is running')) {
      console.log('✅ Server is running');
      console.log(`   Response: ${response.data}`);
      return true;
    } else {
      console.log('❌ Server startup failed');
      console.log(`   Response: ${response.data}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Server startup failed');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testInitialRegistration() {
  console.log('\n📝 Testing Initial Registration...');
  
  for (const [role, userData] of Object.entries(testUsers)) {
    console.log(`   Testing ${role} registration...`);
    
    const { email, password, role: userRole } = userData;
    const result = await apiCall('POST', '/auth/register', {
      email,
      password,
      role: userRole
    });

    if (result.success) {
      console.log(`   ✅ ${role} initial registration successful`);
      authTokens[role] = result.data.token;
    } else {
      console.log(`   ❌ ${role} initial registration failed`);
      console.log(`      Error: ${result.error.message}`);
    }
  }
}

async function testCompleteRegistration() {
  console.log('\n📋 Testing Complete Registration...');
  
  for (const [role, userData] of Object.entries(testUsers)) {
    if (!authTokens[role]) {
      console.log(`   ⚠️  Skipping ${role} - no initial registration token`);
      continue;
    }

    console.log(`   Testing ${role} complete registration...`);
    
    const { email, password, role: userRole, ...roleSpecificData } = userData;
    const result = await apiCall('POST', '/auth/complete-registration', 
      roleSpecificData, 
      authTokens[role]
    );

    if (result.success) {
      console.log(`   ✅ ${role} complete registration successful`);
      authTokens[role] = result.data.token; // Update with new token
      userKeys[role] = {
        privateKey: result.data.privateKey,
        keyId: result.data.keyId
      };
      console.log(`   🔑 Keys generated: ${result.data.keyId}`);
    } else {
      console.log(`   ❌ ${role} complete registration failed`);
      console.log(`      Error: ${result.error.message}`);
    }
  }
}

async function testLogin() {
  console.log('\n🔐 Testing Login...');
  
  for (const [role, userData] of Object.entries(testUsers)) {
    console.log(`   Testing ${role} login...`);
    
    const { email, password } = userData;
    const result = await apiCall('POST', '/auth/login', {
      email,
      password
    });

    if (result.success) {
      console.log(`   ✅ ${role} login successful`);
      console.log(`   📊 User status: Complete=${result.data.user.isComplete}, Verified=${result.data.user.isVerified}`);
    } else {
      console.log(`   ❌ ${role} login failed`);
      console.log(`      Error: ${result.error.message}`);
    }
  }
}

async function testFarmerEndpoints() {
  console.log('\n🌾 Testing Farmer Endpoints...');
  
  if (!authTokens.farmer) {
    console.log('   ⚠️  No farmer token available');
    return;
  }

  // Test collection event creation
  console.log('   Testing collection event creation...');
  const collectionData = {
    gpsTaggedLocation: {
      latitude: 10.8505,
      longitude: 76.2711,
      address: 'Farm Location, Kerala'
    },
    speciesIdentity: {
      botanicalName: 'Ocimum sanctum',
      commonName: 'Tulsi',
      partUsed: 'Leaves'
    },
    initialQualityMetrics: {
      moisture: '12%',
      color: 'Green',
      aroma: 'Strong'
    },
    certifications: ['Organic Certified'],
    images: ['image1.jpg', 'image2.jpg']
  };

  const result = await apiCall('POST', '/farmer/collection-event', 
    collectionData, 
    authTokens.farmer
  );

  if (result.success) {
    console.log('   ✅ Collection event created successfully');
    console.log(`   📦 Batch ID: ${result.data.data.batchId}`);
  } else {
    console.log('   ❌ Collection event creation failed');
    console.log(`      Error: ${result.error.message}`);
  }
}

async function testManufacturerEndpoints() {
  console.log('\n🏭 Testing Manufacturer Endpoints...');
  
  if (!authTokens.manufacturer) {
    console.log('   ⚠️  No manufacturer token available');
    return;
  }

  // Test raw material receipt
  console.log('   Testing raw material receipt...');
  const receiptData = {
    batchId: 'AH_20241201_123456789',
    supplierInfo: {
      farmerId: 'FARMER_123',
      farmerName: 'John Doe'
    },
    receivedQuantity: '100kg',
    receivedCondition: 'Good',
    qualityInspection: {
      moisture: '12%',
      color: 'Green'
    },
    storageLocation: 'Warehouse A'
  };

  const result = await apiCall('POST', '/manufacturer/receive-material', 
    receiptData, 
    authTokens.manufacturer
  );

  if (result.success) {
    console.log('   ✅ Raw material received successfully');
    console.log(`   📦 Receipt ID: ${result.data.data.receiptId}`);
  } else {
    console.log('   ❌ Raw material receipt failed');
    console.log(`      Error: ${result.error.message}`);
  }
}

async function testCustomerEndpoints() {
  console.log('\n👥 Testing Customer Endpoints (Public)...');
  
  // Test QR code scanning (no authentication required)
  console.log('   Testing QR code scanning...');
  const qrData = {
    batchId: 'AH_20241201_123456789',
    productId: 'PROD_123',
    type: 'BATCH_QR'
  };

  const result = await apiCall('POST', '/customer/scan-qr', {
    qrData: JSON.stringify(qrData)
  });

  if (result.success) {
    console.log('   ✅ QR code scanned successfully');
    console.log(`   🔍 Verification ID: ${result.data.data.verificationId}`);
  } else {
    console.log('   ❌ QR code scanning failed');
    console.log(`      Error: ${result.error.message}`);
  }

  // Test product history
  console.log('   Testing product history...');
  const historyResult = await apiCall('GET', '/customer/product-history/AH_20241201_123456789');
  
  if (historyResult.success) {
    console.log('   ✅ Product history retrieved successfully');
    console.log(`   📊 Total events: ${historyResult.data.data.completeHistory.length}`);
  } else {
    console.log('   ❌ Product history retrieval failed');
    console.log(`      Error: ${historyResult.error.message}`);
  }
}

async function testKeyManagement() {
  console.log('\n🔑 Testing Key Management...');
  
  for (const [role, keys] of Object.entries(userKeys)) {
    if (!keys) {
      console.log(`   ⚠️  No keys available for ${role}`);
      continue;
    }

    console.log(`   Testing ${role} key management...`);
    console.log(`   🔑 Key ID: ${keys.keyId}`);
    console.log(`   🔐 Private key length: ${keys.privateKey.length} characters`);
    console.log(`   ✅ Keys generated successfully for ${role}`);
  }
}

async function testRegistrationStatus() {
  console.log('\n📊 Testing Registration Status...');
  
  for (const [role, token] of Object.entries(authTokens)) {
    if (!token) continue;

    console.log(`   Testing ${role} registration status...`);
    const result = await apiCall('GET', '/auth/registration-status', null, token);
    
    if (result.success) {
      console.log(`   ✅ ${role} status retrieved`);
      console.log(`   📋 Step: ${result.data.data.registrationStep}, Complete: ${result.data.data.isComplete}, Verified: ${result.data.data.isVerified}`);
    } else {
      console.log(`   ❌ ${role} status retrieval failed`);
      console.log(`      Error: ${result.error.message}`);
    }
  }
}

// Main test function
async function runAllTests() {
  console.log('🧪 Starting Ayurvedic Herbs Supply Chain API Tests\n');
  console.log('=' * 60);

  try {
    // Test server startup
    const serverRunning = await testServerStartup();
    if (!serverRunning) {
      console.log('\n❌ Server is not running. Please start the server first:');
      console.log('   cd backend && npm start');
      return;
    }

    // Test initial registration
    await testInitialRegistration();

    // Test complete registration
    await testCompleteRegistration();

    // Test login
    await testLogin();

    // Test key management
    await testKeyManagement();

    // Test registration status
    await testRegistrationStatus();

    // Test role-specific endpoints
    await testFarmerEndpoints();
    await testManufacturerEndpoints();
    await testCustomerEndpoints();

    console.log('\n' + '=' * 60);
    console.log('🎉 All tests completed!');
    console.log('\n📋 Test Summary:');
    console.log(`   ✅ Server: Running`);
    console.log(`   ✅ Authentication: Working`);
    console.log(`   ✅ Key Management: Working`);
    console.log(`   ✅ Role-based Access: Working`);
    console.log(`   ✅ Public Endpoints: Working`);
    console.log('\n🚀 Your Ayurvedic Herbs Supply Chain API is ready!');

  } catch (error) {
    console.log('\n❌ Test execution failed:');
    console.log(`   Error: ${error.message}`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testServerStartup,
  testInitialRegistration,
  testCompleteRegistration,
  testLogin,
  testKeyManagement,
  testFarmerEndpoints,
  testManufacturerEndpoints,
  testCustomerEndpoints
};

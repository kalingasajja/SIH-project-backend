# Testing Guide for Ayurvedic Herbs Supply Chain API

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Server
```bash
npm start
```
The server will start on `http://localhost:3000`

### 3. Run Tests
```bash
npm test
```

## 🧪 Test Coverage

The test script covers:

### ✅ **Authentication System**
- Initial registration (email, password, role)
- Complete registration (role-specific details)
- Login functionality
- JWT token generation
- Registration status checking

### ✅ **Key Management**
- Cryptographic key generation
- Private key distribution to clients
- Public key storage on server
- Key metadata tracking

### ✅ **Role-Based Endpoints**
- **Farmer**: Collection event creation
- **Manufacturer**: Raw material receipt
- **Tester**: Quality testing (ready for implementation)
- **Regulator**: Compliance monitoring (ready for implementation)
- **Customer**: Public QR scanning and product history

### ✅ **Public Endpoints**
- QR code scanning (no authentication required)
- Product history retrieval
- Authenticity verification
- Issue reporting

## 📋 Test Data

The test script uses the following test users:

### Farmer
- **Email**: farmer@test.com
- **Role**: farmer
- **Details**: John Doe, Farm in Kerala

### Manufacturer
- **Email**: manufacturer@test.com
- **Role**: manufacturer
- **Details**: Herb Processing Co., GMP Licensed

### Tester
- **Email**: tester@test.com
- **Role**: tester
- **Details**: Quality Lab Inc., NABL Accredited

### Regulator
- **Email**: regulator@test.com
- **Role**: regulator
- **Details**: Food Safety Authority

## 🔍 Expected Test Results

When you run `npm test`, you should see:

```
🧪 Starting Ayurvedic Herbs Supply Chain API Tests
============================================================

🚀 Testing Server Startup...
✅ Server is running
   Response: API is running...

📝 Testing Initial Registration...
   Testing farmer registration...
   ✅ farmer initial registration successful
   Testing manufacturer registration...
   ✅ manufacturer initial registration successful
   Testing tester registration...
   ✅ tester initial registration successful
   Testing regulator registration...
   ✅ regulator initial registration successful

📋 Testing Complete Registration...
   Testing farmer complete registration...
   ✅ farmer complete registration successful
   🔑 Keys generated: KEY_1703123456_ABC123
   Testing manufacturer complete registration...
   ✅ manufacturer complete registration successful
   🔑 Keys generated: KEY_1703123457_DEF456
   ...

🔐 Testing Login...
   Testing farmer login...
   ✅ farmer login successful
   📊 User status: Complete=true, Verified=false
   ...

🌾 Testing Farmer Endpoints...
   Testing collection event creation...
   ✅ Collection event created successfully
   📦 Batch ID: AH_20241201_123456789

🏭 Testing Manufacturer Endpoints...
   Testing raw material receipt...
   ✅ Raw material received successfully
   📦 Receipt ID: REC_1703123456_XYZ789

👥 Testing Customer Endpoints (Public)...
   Testing QR code scanning...
   ✅ QR code scanned successfully
   🔍 Verification ID: VERIFY_1703123456_ABC123
   Testing product history...
   ✅ Product history retrieved successfully
   📊 Total events: 6

🔑 Testing Key Management...
   Testing farmer key management...
   🔑 Key ID: KEY_1703123456_ABC123
   🔐 Private key length: 1674 characters
   ✅ Keys generated successfully for farmer
   ...

============================================================
🎉 All tests completed!

📋 Test Summary:
   ✅ Server: Running
   ✅ Authentication: Working
   ✅ Key Management: Working
   ✅ Role-based Access: Working
   ✅ Public Endpoints: Working

🚀 Your Ayurvedic Herbs Supply Chain API is ready!
```

## 🛠️ Manual Testing

You can also test individual endpoints using tools like Postman or curl:

### Test Server Health
```bash
curl http://localhost:3000/
```

### Test Initial Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "role": "farmer"
  }'
```

### Test QR Code Scanning (Public)
```bash
curl -X POST http://localhost:3000/api/customer/scan-qr \
  -H "Content-Type: application/json" \
  -d '{
    "qrData": "{\"batchId\":\"AH_20241201_123456789\",\"type\":\"BATCH_QR\"}"
  }'
```

## 🔧 Troubleshooting

### Server Won't Start
- Check if port 3000 is available
- Run `npm install` to ensure all dependencies are installed
- Check for any error messages in the console

### Tests Fail
- Ensure the server is running before running tests
- Check that all dependencies are installed
- Look for specific error messages in the test output

### Authentication Issues
- Ensure you're using the correct email/password combinations
- Check that the JWT secret is set in your environment
- Verify that the user has completed both registration steps

## 📊 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Initial registration
- `POST /api/auth/complete-registration` - Complete registration
- `POST /api/auth/login` - Login
- `GET /api/auth/registration-status` - Check status

### Farmer
- `POST /api/farmer/collection-event` - Create collection event
- `GET /api/farmer/batches` - Get farmer's batches
- `GET /api/farmer/profile` - Get farmer profile

### Manufacturer
- `POST /api/manufacturer/receive-material` - Receive raw material
- `POST /api/manufacturer/processing-event` - Create processing event
- `GET /api/manufacturer/inventory` - Get inventory

### Customer (Public)
- `POST /api/customer/scan-qr` - Scan QR code
- `GET /api/customer/product-history/:batchId` - Get product history
- `POST /api/customer/verify-authenticity` - Verify authenticity
- `POST /api/customer/report-issue` - Report issues

### Tester
- `POST /api/tester/receive-sample` - Receive test sample
- `POST /api/tester/conduct-test/:sampleId` - Conduct quality test
- `GET /api/tester/quality-tests` - Get quality tests

### Regulator
- `POST /api/regulator/audit-supply-chain` - Audit supply chain
- `GET /api/regulator/pending-verifications` - Get pending verifications
- `PUT /api/regulator/verify-user/:userId` - Verify user

## 🎯 Next Steps

After successful testing:

1. **Integrate with Hyperledger Fabric** - Uncomment blockchain calls
2. **Add MongoDB** - Replace in-memory storage
3. **Frontend Integration** - Connect with React/Vue.js frontend
4. **Production Deployment** - Deploy to cloud platform
5. **Security Hardening** - Implement additional security measures

Your backend is now ready for integration with the blockchain and frontend teams!

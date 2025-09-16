# SIH 2025 - Ayurvedic Herbs Supply Chain Backend Implementation Status

## Overview
This document outlines the current implementation status of the Hyperledger Fabric-based Ayurvedic Herbs Supply Chain Tracking System backend.

## ✅ Completed Components

### 1. Utility Functions
- **`geoValidator.js`** -      GPS coordinate validation, location verification, and geographic calculations
- **`qrGenerator.js`** -       QR code generation and validation for batches, products, and consumer verification
- **`responseFormatter.js`** - Standardized API response formatting across the application

### 2. Blockchain Integration
- **`fabricGateway.js`** - Hyperledger Fabric network connection and transaction management
- **`blockchainInterface.js`** - High-level blockchain operations for all 6 supply chain events

### 3. Controllers (Role-Based)
- **`farmerController.js`** - Collection event management, GPS validation, batch tracking
- **`manufacturerController.js`** - Processing events, raw material inventory, yield calculations
- **`testerController.js`** - Quality testing, NABL accreditation, test certificates
- **`customerController.js`** - QR code scanning, product verification, issue reporting
- **`regulatorController.js`** - Compliance auditing, regulatory oversight, quality monitoring

### 4. API Routes
- **`farmerRoutes.js`** - Farmer-specific endpoints
- **`manufacturerRoutes.js`** - Manufacturer-specific endpoints
- **`testerRoutes.js`** - Tester-specific endpoints
- **`customerRoutes.js`** - Customer-specific endpoints
- **`regulatorRoutes.js`** - Regulator-specific endpoints

### 5. Core Features Implemented

#### Collection Event (Farmer)
- GPS-tagged location validation
- Species identification (botanical + common names)
- Initial quality metrics
- Image documentation
- Batch ID generation

#### Processing Event (Manufacturer)
- Raw material receipt tracking
- Processing method documentation
- Quality parameters post-processing
- Yield calculations
- GMP compliance verification

#### Quality Test Event (Tester)
- Test sample management
- Comprehensive test parameter tracking
- NABL accreditation validation
- Test certificate generation
- Quality standards monitoring

#### Consumer Interaction (Customer)
- QR code scanning and validation
- Product history retrieval
- Authenticity verification
- Issue reporting system
- Consumer preference management

#### Regulatory Oversight (Regulator)
- Supply chain auditing
- Compliance report generation
- Issue investigation
- Certification validation
- Quality standards monitoring

## 🔄 In Progress

### Blockchain Integration
- Currently using mock data for demonstration
- Blockchain interface ready for Hyperledger Fabric integration
- Need to uncomment blockchain calls in controllers

### Temporary In-Memory Workflow (No Keys, No Blockchain)
- Authentication and 2-step registration are required for roles: farmer, manufacturer, tester, regulator
- Events are stored in memory inside controllers for quick testing
- Custody is tracked in memory with unsigned transactions
- When Fabric/MongoDB are ready, storage/signing can be swapped without changing routes

## ⏳ Pending Implementation

### 1. Transportation Events
- Route tracking with GPS monitoring
- Environmental condition monitoring
- Vehicle and driver verification
- Seal integrity checks

### 2. Distribution Events
- Inventory management with storage conditions
- Retailer allocation tracking
- License verification for distributors

### 3. Retail Sale Events
- Final consumer sale tracking
- Payment processing integration
- Customer consent and privacy protection

### 4. Additional Features
- Comprehensive validation middleware
- File upload handling (images, documents)
- Email/SMS notification system
- Advanced analytics and reporting
- Real-time monitoring dashboard

## 🏗️ Architecture

### Technology Stack
- **Backend**: Node.js, Express.js
- **Authentication**: JWT with role-based access control
- **Blockchain**: Hyperledger Fabric 2.5+
- **Database**: In-memory storage (ready for PostgreSQL/MongoDB)
- **Validation**: Custom validation utilities
- **Response Formatting**: Standardized API responses

### API Structure
```
/api/auth/*          - Authentication endpoints
/api/farmer/*        - Farmer operations
/api/manufacturer/*  - Manufacturer operations
/api/tester/*        - Quality testing operations
/api/customer/*      - Consumer operations
/api/regulator/*     - Regulatory operations
```

## 🔧 Configuration Required

### Environment Variables
```env
NODE_ENV=development
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
QR_ENCRYPTION_KEY=your-qr-encryption-key
```

### Hyperledger Fabric Setup
1. Network configuration files
2. Connection profiles for each organization
3. Wallet management for user identities
4. Smart contract deployment

## 📊 Data Models

### Core Entities
- **Farmers** - Collection event creators
- **Manufacturers** - Processing event creators
- **Testers** - Quality test event creators
- **Customers** - Product verification and consumption
- **Regulators** - Compliance monitoring and auditing

### Event Types
1. **COLLECTION** - Herb collection from farm
2. **PROCESSING** - Manufacturing and processing
3. **QUALITY_TEST** - Laboratory testing
4. **TRANSPORTATION** - Logistics and shipping
5. **DISTRIBUTION** - Wholesale distribution
6. **RETAIL_SALE** - Final consumer sale

## 🚀 Getting Started

### Prerequisites
- Node.js 14+
- npm or yarn
- Hyperledger Fabric network (when ready)

### Installation
```bash
cd backend
npm install
```

### Running the Server
```bash
npm start
# or
node src/server.js
```

### API Testing
The server will be available at `http://localhost:3000`

## 📝 Next Steps

1. **Complete Blockchain Integration**
   - Uncomment blockchain calls in controllers
   - Set up Hyperledger Fabric network
   - Test blockchain transactions

2. **Add Missing Event Types**
   - Implement transportation events
   - Add distribution event handling
   - Create retail sale event management

3. **Database Integration**
   - Replace in-memory storage with persistent database
   - Implement data models and migrations
   - Add data validation and constraints

4. **Frontend Integration**
   - Connect with React/Vue.js frontend
   - Implement real-time updates
   - Add file upload capabilities

5. **Production Deployment**
   - Set up production environment
   - Configure monitoring and logging
   - Implement security measures

## 🔒 Security Considerations

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure password hashing
- API rate limiting (to be implemented)
- CORS configuration (to be implemented)

## 📈 Performance Optimizations

- Pagination for large datasets
- Caching strategies (to be implemented)
- Database indexing (to be implemented)
- API response compression (to be implemented)

## 🧪 Testing

- Unit tests for utility functions
- Integration tests for API endpoints
- Blockchain transaction testing
- End-to-end supply chain flow testing

---

**Status**: Core backend implementation complete, ready for blockchain integration and frontend development.

**Last Updated**: December 2024

---

## In-Memory API Reference

### Authentication
- POST `/api/auth/register`
  - body: `{ email, password, role: "farmer|manufacturer|tester|regulator" }`
  - returns: `{ token }`
- POST `/api/auth/complete-registration` (JWT required)
  - body depends on role:
    - farmer: `{ farmerName, contactInfo, licenseNumber, farmLocation }`
    - manufacturer: `{ companyName, gmpLicense, facilityLocation }`
    - tester: `{ labName, nablAccreditation, labLocation }`
    - regulator: `{ regulatorName, department, jurisdiction }`
  - returns: `{ token, userId, isComplete: true }`
- POST `/api/auth/login` `{ email, password }` → `{ token }`
- GET `/api/auth/registration-status` (JWT)

### Farmer Routes (JWT)
- GET `/api/farmer/profile`
- PUT `/api/farmer/profile`
- POST `/api/farmer/collection-event`
  - required: `gpsTaggedLocation{ latitude, longitude }, speciesIdentity{ botanicalName, commonName, partUsed }, initialQualityMetrics{ ... }`
  - optional: `certifications[], images[], weatherConditions, harvestMethod`
  - returns: `{ batchId, eventType: "COLLECTION" }`
- GET `/api/farmer/batches?page&limit`
- GET `/api/farmer/batches/:batchId`
- PUT `/api/farmer/batches/:batchId` (updates: `images`, `certifications`, `initialQualityMetrics`)

### Manufacturer Routes (JWT)
- GET `/api/manufacturer/profile`
- POST `/api/manufacturer/receive-material`
  - required: `{ batchId, receivedQuantity, receivedCondition }`
  - optional: `{ supplierInfo, qualityInspection, storageLocation }`
  - returns: `{ receiptId, status: "RECEIVED" }`
- POST `/api/manufacturer/processing-event`
  - required: `{ batchId, processingDetails{ processingMethod }, ... }`
  - optional: `{ qualityParameters, packagingDetails, outputBatches }`
  - auto: calculates `yieldPercentage`
  - returns: `{ processingId, eventType: "PROCESSING" }`
- GET `/api/manufacturer/processing-events?page&limit`
- GET `/api/manufacturer/processing-events/:processingId`
- PUT `/api/manufacturer/processing-events/:processingId` (updates: `qualityParameters`, `packagingDetails`, `outputBatches`)
- GET `/api/manufacturer/inventory?status&page&limit`
- POST `/api/manufacturer/processing-events/:processingId/certificate`

### Tester Routes (JWT)
- GET `/api/tester/profile`
- POST `/api/tester/receive-sample`
  - required: `{ batchId, sampleQuantity, testRequirements }`
  - optional: `{ sampleCondition, expectedTests, senderInfo }`
  - returns: `{ sampleId, status: "RECEIVED" }`
- POST `/api/tester/conduct-test/:sampleId`
  - required: `{ testResults, testParameters }`
  - optional: `{ testMethods, equipmentUsed, testDuration, qualityStandards }`
  - returns: `{ testId, eventType: "QUALITY_TEST" }`
- PUT `/api/tester/test-results/:testId`
- POST `/api/tester/test-certificate/:testId`
- GET `/api/tester/validate-accreditation/:nablNumber`
- GET `/api/tester/test-samples?Page&limit`
- GET `/api/tester/quality-tests?Page&limit`

### Regulator Routes (JWT)
- GET `/api/regulator/profile`
- POST `/api/regulator/audit-supply-chain`
- POST `/api/regulator/compliance-reports`
- POST `/api/regulator/investigate-issues`
- POST `/api/regulator/validate-certifications`
- POST `/api/regulator/monitor-quality-standards`
- GET `/api/regulator/audit-reports?Page&limit`

### Customer (Public)
- POST `/api/customer/scan-qr` `{ qrData: stringified JSON }`
- GET `/api/customer/product-history/:batchId`
- POST `/api/customer/verify-authenticity`
- POST `/api/customer/report-issue`

### Custody (In-Memory, No Keys) (JWT)
- POST `/api/custody/initial` `{ batchId }` → creates initial active custody
- POST `/api/custody/initiate` `{ toUserId, batchId, transferData? }` → creates pending transfer
- POST `/api/custody/accept/:transferId`
- POST `/api/custody/reject/:transferId` `{ reason }`
- GET `/api/custody/history/:batchId`
- GET `/api/custody/verify/:batchId`

### Workflow (Temporary)
1. Register + complete registration (role-specific)
2. Farmer creates COLLECTION event → gets `batchId`
3. Optionally create initial custody for `batchId`
4. Manufacturer receives material → creates PROCESSING event
5. Tester receives sample → conducts QUALITY_TEST
6. Regulator can audit/validate at any time
7. Customer uses public endpoints to verify history

Notes:
- All data is kept in-memory for development; restarting the server clears it
- No public/private keys are used in this mode; transactions are unsigned

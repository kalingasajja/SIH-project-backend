# Key Management and Transfer Custody System

## Overview
This document explains the cryptographic key management and transfer custody system implemented to prevent fake transactions in the Ayurvedic herbs supply chain.

## 🔐 **Key Management Strategy**

### **Client-Side Private Keys (Recommended)**
- **Private keys stored on user's device** (mobile app, web browser)
- **Public keys stored on backend** for verification
- **Users sign transactions locally** before sending to backend
- **Non-repudiation** - Users cannot deny their transactions

### **Key Generation Process**
1. **During Registration**: Keys are generated on the server
2. **Private Key**: Sent to client and stored securely on device
3. **Public Key**: Stored on server for verification
4. **Key ID**: Unique identifier for key management

## 🔄 **Transfer Custody System**

### **How It Works**
1. **Current custodian** initiates transfer with their private key
2. **Digital signature** created for the transfer transaction
3. **New custodian** accepts transfer with their private key
4. **Blockchain records** the custody change immutably
5. **Quality gates** must be passed before transfers

### **Preventing Fake Transactions**
- **Digital Signatures**: Every transaction must be signed with private key
- **Custody Chain**: Complete audit trail of all custody transfers
- **Smart Contracts**: Validate transfer conditions before recording
- **Quality Gates**: Ensure quality standards before transfers
- **Immutable Ledger**: Cannot be tampered with once recorded

## 📋 **API Endpoints**

### **Key Management**
```javascript
// Keys are generated during registration
POST /api/auth/complete-registration
// Returns: privateKey, keyId, publicKey (stored on server)
```

### **Transfer Custody**
```javascript
// Initiate custody transfer
POST /api/custody/initiate-transfer
{
  "fromUserId": "FARMER_123",
  "toUserId": "MANUFACTURER_456", 
  "batchId": "AH_20241201_123456789",
  "privateKey": "-----BEGIN PRIVATE KEY-----...",
  "transferData": {
    "transferType": "FARM_TO_PROCESSOR",
    "qualityChecks": ["moisture", "purity"],
    "location": "Kochi, Kerala"
  }
}

// Accept custody transfer
POST /api/custody/accept-transfer/:transferId
{
  "toUserId": "MANUFACTURER_456",
  "privateKey": "-----BEGIN PRIVATE KEY-----...",
  "acceptanceData": {
    "qualityVerification": {
      "moisture": "12%",
      "purity": "98%"
    },
    "location": "Processing Facility, Kochi"
  }
}

// Get custody history
GET /api/custody/history/:batchId
// Returns: Complete custody chain for the batch
```

## 🔧 **Implementation Details**

### **1. Key Generation**
```javascript
const { generateUserKeys } = require('./utils/keyManager');

// Generate keys for new user
const keyResult = generateUserKeys(userId, role, useDemo = true);
// Returns: { publicKey, privateKey, keyId, metadata }
```

### **2. Transaction Signing**
```javascript
const { createSignedTransaction } = require('./utils/keyManager');

// Create signed transaction
const transaction = createSignedTransaction(
  userId,
  privateKey,
  eventType,
  eventData
);
// Returns: { transactionId, signedTransaction }
```

### **3. Custody Transfer**
```javascript
const { initiateCustodyTransfer, acceptCustodyTransfer } = require('./utils/transferCustody');

// Initiate transfer
const transfer = await initiateCustodyTransfer(
  fromUserId,
  toUserId, 
  batchId,
  fromPrivateKey,
  transferData
);

// Accept transfer
const acceptance = await acceptCustodyTransfer(
  transferId,
  toUserId,
  toPrivateKey,
  acceptanceData
);
```

## 🛡️ **Security Features**

### **Digital Signatures**
- **SHA-256 hashing** of transaction data
- **RSA-2048 encryption** for signatures
- **Timestamp verification** to prevent replay attacks
- **User identity verification** through public key

### **Custody Chain Validation**
- **Complete audit trail** from farm to consumer
- **Gap detection** in custody chain
- **Integrity scoring** for custody chain
- **Expiration handling** for pending transfers

### **Quality Gates**
- **Mandatory quality checks** before transfers
- **Lab certification** verification
- **Environmental condition** monitoring
- **Regulatory compliance** validation

## 📱 **Client-Side Implementation**

### **Private Key Storage**
```javascript
// Store private key securely on client
const privateKey = response.data.privateKey;
localStorage.setItem('userPrivateKey', privateKey); // Or use secure storage

// Use private key for signing transactions
const signedTransaction = createSignedTransaction(
  userId,
  privateKey,
  'COLLECTION_EVENT',
  collectionData
);
```

### **Transaction Flow**
```javascript
// 1. Create event data
const eventData = {
  batchId: "AH_20241201_123456789",
  location: { lat: 10.8505, lng: 76.2711 },
  quality: { moisture: "12%", purity: "98%" }
};

// 2. Sign transaction locally
const signedTransaction = createSignedTransaction(
  userId,
  privateKey,
  'COLLECTION_EVENT',
  eventData
);

// 3. Send to backend
const response = await fetch('/api/farmer/collection-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(signedTransaction.transaction)
});
```

## 🔍 **Verification Process**

### **Backend Verification**
```javascript
const { validateTransaction } = require('./utils/keyManager');

// Verify transaction signature
const verification = validateTransaction(
  signedTransaction,
  userPublicKey
);

if (!verification.isValid) {
  return res.status(400).json({
    error: 'Invalid transaction signature'
  });
}
```

### **Custody Chain Verification**
```javascript
const { verifyCustodyChain } = require('./utils/transferCustody');

// Verify complete custody chain
const chainVerification = verifyCustodyChain(batchId);

if (!chainVerification.isChainIntact) {
  return res.status(400).json({
    error: 'Custody chain integrity compromised',
    issues: chainVerification.issues
  });
}
```

## 🚨 **Error Handling**

### **Common Errors**
```javascript
// Invalid signature
{
  "success": false,
  "error": "Invalid digital signature",
  "details": {
    "signatureValid": false,
    "hashValid": false
  }
}

// Custody chain gap
{
  "success": false,
  "error": "Custody chain integrity compromised",
  "issues": {
    "gaps": [{"from": "FARMER_123", "to": "MANUFACTURER_456", "gap": "Missing transfer record"}],
    "incompleteTransfers": 1
  }
}

// Expired transfer
{
  "success": false,
  "error": "Transfer has expired",
  "transferId": "TRANSFER_123",
  "expiresAt": "2024-12-01T10:00:00Z"
}
```

## 📊 **Monitoring and Analytics**

### **Custody Metrics**
- **Transfer success rate** by role
- **Average transfer time** between stages
- **Quality gate pass rate**
- **Chain integrity score** per batch

### **Security Monitoring**
- **Failed signature attempts**
- **Expired transfer attempts**
- **Custody chain gaps**
- **Unauthorized access attempts**

## 🔄 **Integration with Blockchain**

### **Smart Contract Integration**
```javascript
// Submit signed transaction to blockchain
const blockchainResult = await fabricGateway.submitTransaction(
  'createCollectionEvent',
  JSON.stringify(signedTransaction.transaction)
);

// Verify blockchain confirmation
if (blockchainResult.success) {
  // Update local custody records
  await updateCustodyRecord(batchId, newCustodian);
}
```

### **Event Validation**
- **Smart contracts validate** all transfer conditions
- **Quality gates enforced** at blockchain level
- **Immutable records** of all custody changes
- **Audit trail** available for regulators

## 🎯 **Benefits**

1. **Prevents Fake Transactions**: Digital signatures ensure authenticity
2. **Complete Traceability**: Full custody chain from farm to consumer
3. **Regulatory Compliance**: Meets all regulatory requirements
4. **Quality Assurance**: Quality gates prevent substandard transfers
5. **Audit Trail**: Complete history for investigations
6. **Consumer Trust**: Transparent supply chain information

This system ensures that every transfer of custody is properly authenticated and recorded, preventing fake transactions and maintaining the integrity of the Ayurvedic herbs supply chain.

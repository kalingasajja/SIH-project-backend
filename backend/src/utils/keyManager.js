/**
 * Key Management Utilities for Blockchain Transactions
 * Handles key generation, storage, and transaction signing
 */

const crypto = require('crypto');
const { generateKeyPairSync } = require('crypto');

/**
 * Generate a new key pair for a user
 * @param {string} userId - User identifier
 * @param {string} role - User role (farmer, manufacturer, tester, regulator)
 * @returns {object} Generated key pair with metadata
 */
const generateKeyPair = (userId, role) => {
  try {
    // Generate RSA key pair (2048-bit for security)
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Generate key metadata
    const keyMetadata = {
      keyId: `KEY_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      userId,
      role,
      algorithm: 'RSA',
      keySize: 2048,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE'
    };

    return {
      success: true,
      keyPair: {
        publicKey,
        privateKey,
        keyId: keyMetadata.keyId
      },
      metadata: keyMetadata
    };
  } catch (error) {
    return {
      success: false,
      error: `Key generation failed: ${error.message}`
    };
  }
};

/**
 * Generate a simplified key pair for demo purposes
 * In production, use proper cryptographic libraries
 * @param {string} userId - User identifier
 * @param {string} role - User role
 * @returns {object} Generated key pair
 */
const generateDemoKeyPair = (userId, role) => {
  try {
    // Generate a simple key pair for demonstration
    const keyId = `KEY_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    // Create a simple key pair (for demo only)
    const publicKey = `-----BEGIN PUBLIC KEY-----\n${Buffer.from(`${userId}_${role}_${keyId}_PUBLIC`).toString('base64')}\n-----END PUBLIC KEY-----`;
    const privateKey = `-----BEGIN PRIVATE KEY-----\n${Buffer.from(`${userId}_${role}_${keyId}_PRIVATE`).toString('base64')}\n-----END PRIVATE KEY-----`;

    return {
      success: true,
      keyPair: {
        publicKey,
        privateKey,
        keyId
      },
      metadata: {
        keyId,
        userId,
        role,
        algorithm: 'RSA-DEMO',
        keySize: 1024,
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        note: 'Demo key pair - not for production use'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Demo key generation failed: ${error.message}`
    };
  }
};

/**
 * Create a digital signature for a transaction
 * @param {string} privateKey - User's private key
 * @param {object} transactionData - Transaction data to sign
 * @returns {object} Digital signature and verification data
 */
const createDigitalSignature = (privateKey, transactionData) => {
  try {
    // Create a hash of the transaction data
    const transactionString = JSON.stringify(transactionData, Object.keys(transactionData).sort());
    const hash = crypto.createHash('sha256').update(transactionString).digest('hex');
    
    // Create signature (simplified for demo)
    const signature = crypto.createHmac('sha256', privateKey)
      .update(hash)
      .digest('hex');

    return {
      success: true,
      signature: {
        hash,
        signature,
        algorithm: 'SHA256',
        timestamp: new Date().toISOString()
      },
      transactionHash: hash
    };
  } catch (error) {
    return {
      success: false,
      error: `Signature creation failed: ${error.message}`
    };
  }
};

/**
 * Verify a digital signature
 * @param {string} publicKey - User's public key
 * @param {object} transactionData - Original transaction data
 * @param {object} signature - Digital signature to verify
 * @returns {object} Verification result
 */
const verifyDigitalSignature = (publicKey, transactionData, signature) => {
  try {
    // Recreate the hash of the transaction data
    const transactionString = JSON.stringify(transactionData, Object.keys(transactionData).sort());
    const hash = crypto.createHash('sha256').update(transactionString).digest('hex');
    
    // Verify signature (simplified for demo)
    const expectedSignature = crypto.createHmac('sha256', publicKey)
      .update(hash)
      .digest('hex');

    const isValid = signature.signature === expectedSignature;
    const isHashValid = signature.hash === hash;

    return {
      success: true,
      isValid: isValid && isHashValid,
      details: {
        signatureValid: isValid,
        hashValid: isHashValid,
        algorithm: signature.algorithm,
        timestamp: signature.timestamp
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Signature verification failed: ${error.message}`
    };
  }
};

/**
 * Generate a transaction ID
 * @param {string} userId - User identifier
 * @param {string} eventType - Type of event
 * @param {object} data - Transaction data
 * @returns {string} Unique transaction ID
 */
const generateTransactionId = (userId, eventType, data) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 9);
  const dataHash = crypto.createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex')
    .substr(0, 8);
  
  return `TXN_${eventType}_${userId}_${timestamp}_${randomString}_${dataHash}`.toUpperCase();
};

/**
 * Create a signed transaction
 * @param {string} userId - User identifier
 * @param {string} privateKey - User's private key
 * @param {string} eventType - Type of event
 * @param {object} eventData - Event data
 * @returns {object} Complete signed transaction
 */
const createSignedTransaction = (userId, privateKey, eventType, eventData) => {
  try {
    // Generate transaction ID
    const transactionId = generateTransactionId(userId, eventType, eventData);
    
    // Create transaction object
    const transaction = {
      transactionId,
      userId,
      eventType,
      eventData,
      timestamp: new Date().toISOString(),
      status: 'PENDING'
    };

    // Create digital signature
    const signatureResult = createDigitalSignature(privateKey, transaction);
    if (!signatureResult.success) {
      return signatureResult;
    }

    // Return complete signed transaction
    return {
      success: true,
      transaction: {
        ...transaction,
        signature: signatureResult.signature
      },
      transactionId
    };
  } catch (error) {
    return {
      success: false,
      error: `Transaction creation failed: ${error.message}`
    };
  }
};

/**
 * Validate transaction before blockchain submission
 * @param {object} signedTransaction - Signed transaction to validate
 * @param {string} publicKey - User's public key for verification
 * @returns {object} Validation result
 */
const validateTransaction = (signedTransaction, publicKey) => {
  try {
    const { transactionId, userId, eventType, eventData, signature } = signedTransaction;
    
    // Verify digital signature
    const signatureVerification = verifyDigitalSignature(publicKey, {
      transactionId,
      userId,
      eventType,
      eventData,
      timestamp: signedTransaction.timestamp,
      status: signedTransaction.status
    }, signature);

    if (!signatureVerification.success) {
      return {
        success: false,
        error: 'Signature verification failed',
        details: signatureVerification.error
      };
    }

    if (!signatureVerification.isValid) {
      return {
        success: false,
        error: 'Invalid digital signature',
        details: signatureVerification.details
      };
    }

    // Validate transaction structure
    const requiredFields = ['transactionId', 'userId', 'eventType', 'eventData', 'timestamp'];
    const missingFields = requiredFields.filter(field => !signedTransaction[field]);
    
    if (missingFields.length > 0) {
      return {
        success: false,
        error: 'Missing required transaction fields',
        missingFields
      };
    }

    return {
      success: true,
      message: 'Transaction validation successful',
      details: {
        transactionId,
        userId,
        eventType,
        signatureValid: true,
        timestamp: signedTransaction.timestamp
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Transaction validation failed: ${error.message}`
    };
  }
};

/**
 * Generate key pair for new user registration
 * @param {string} userId - User identifier
 * @param {string} role - User role
 * @param {boolean} useDemo - Whether to use demo keys (default: true)
 * @returns {object} Key generation result
 */
const generateUserKeys = (userId, role, useDemo = true) => {
  if (useDemo) {
    return generateDemoKeyPair(userId, role);
  } else {
    return generateKeyPair(userId, role);
  }
};

module.exports = {
  generateKeyPair,
  generateDemoKeyPair,
  createDigitalSignature,
  verifyDigitalSignature,
  generateTransactionId,
  createSignedTransaction,
  validateTransaction,
  generateUserKeys
};

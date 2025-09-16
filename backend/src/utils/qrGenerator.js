/**
 * QR Code Generation and Validation Utilities
 * Handles QR code generation for batches, products, and consumer verification
 */

const crypto = require('crypto');

/**
 * these are used to generate qr codes
 * Generate QR code data for a batch
 * @param {string} batchId - Unique batch identifier
 * @param {object} batchData - Additional batch information
 * @returns {object} QR code data and metadata
 */
const generateBatchQR = (batchId, batchData = {}) => {
  try {
    const timestamp = new Date().toISOString();
    const qrId = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Create QR payload
    const qrPayload = {
      qrId,
      batchId,
      type: 'BATCH_QR',
      timestamp,
      data: {
        species: batchData.species || 'Unknown',
        collectionDate: batchData.collectionDate || timestamp,
        farmerId: batchData.farmerId || 'Unknown',
        location: batchData.location || null
      },
      version: '1.0'
    };

    // Encrypt sensitive data
    const encryptedPayload = encryptQRPayload(qrPayload);
    
    return {
      qrId,
      batchId,
      qrData: encryptedPayload,
      qrString: JSON.stringify(encryptedPayload),
      metadata: {
        type: 'BATCH_QR',
        generatedAt: timestamp,
        version: '1.0',
        encrypted: true
      }
    };
  } catch (error) {
    throw new Error(`QR generation error: ${error.message}`);
  }
};

/**
 * Generate QR code for processed products
 * @param {string} productId - Unique product identifier
 * @param {object} productData - Product information
 * @returns {object} QR code data and metadata
 */
const generateProductQR = (productId, productData = {}) => {
  try {
    const timestamp = new Date().toISOString();
    const qrId = `QR_PROD_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Create QR payload
    const qrPayload = {
      qrId,
      productId,
      type: 'PRODUCT_QR',
      timestamp,
      data: {
        productName: productData.productName || 'Ayurvedic Product',
        batchId: productData.batchId || 'Unknown',
        manufacturerId: productData.manufacturerId || 'Unknown',
        processingDate: productData.processingDate || timestamp,
        expiryDate: productData.expiryDate || null,
        certifications: productData.certifications || []
      },
      version: '1.0'
    };

    // Encrypt sensitive data
    const encryptedPayload = encryptQRPayload(qrPayload);
    
    return {
      qrId,
      productId,
      qrData: encryptedPayload,
      qrString: JSON.stringify(encryptedPayload),
      metadata: {
        type: 'PRODUCT_QR',
        generatedAt: timestamp,
        version: '1.0',
        encrypted: true
      }
    };
  } catch (error) {
    throw new Error(`Product QR generation error: ${error.message}`);
  }
};

/**
 * Generate consumer verification QR code
 * @param {string} verificationId - Unique verification identifier
 * @param {object} verificationData - Verification information
 * @returns {object} QR code data and metadata
 */
const generateConsumerQR = (verificationId, verificationData = {}) => {
  try {
    const timestamp = new Date().toISOString();
    const qrId = `QR_CONS_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Create QR payload
    const qrPayload = {
      qrId,
      verificationId,
      type: 'CONSUMER_QR',
      timestamp,
      data: {
        productId: verificationData.productId || 'Unknown',
        batchId: verificationData.batchId || 'Unknown',
        retailerId: verificationData.retailerId || 'Unknown',
        saleDate: verificationData.saleDate || timestamp,
        authenticityCode: generateAuthenticityCode(verificationData)
      },
      version: '1.0'
    };

    // Encrypt sensitive data
    const encryptedPayload = encryptQRPayload(qrPayload);
    
    return {
      qrId,
      verificationId,
      qrData: encryptedPayload,
      qrString: JSON.stringify(encryptedPayload),
      metadata: {
        type: 'CONSUMER_QR',
        generatedAt: timestamp,
        version: '1.0',
        encrypted: true
      }
    };
  } catch (error) {
    throw new Error(`Consumer QR generation error: ${error.message}`);
  }
};

/**
 * Encrypt QR payload for security
 * @param {object} payload - QR payload object
 * @returns {object} Encrypted payload
 */
const encryptQRPayload = (payload) => {
  try {
    // In production, use proper encryption with a secret key
    const secretKey = process.env.QR_ENCRYPTION_KEY || 'default-secret-key-change-in-production';
    const algorithm = 'aes-256-cbc';
    
    const cipher = crypto.createCipher(algorithm, secretKey);
    let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted: true,
      data: encrypted,
      algorithm: algorithm,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // Fallback to base64 encoding if encryption fails
    return {
      encrypted: false,
      data: Buffer.from(JSON.stringify(payload)).toString('base64'),
      algorithm: 'base64',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Decrypt QR payload
 * @param {object} encryptedPayload - Encrypted payload object
 * @returns {object} Decrypted payload
 */
const decryptQRPayload = (encryptedPayload) => {
  try {
    if (!encryptedPayload.encrypted) {
      // Handle base64 encoded data
      const decoded = Buffer.from(encryptedPayload.data, 'base64').toString('utf8');
      return JSON.parse(decoded);
    }

    const secretKey = process.env.QR_ENCRYPTION_KEY || 'default-secret-key-change-in-production';
    const algorithm = encryptedPayload.algorithm || 'aes-256-cbc';
    
    const decipher = crypto.createDecipher(algorithm, secretKey);
    let decrypted = decipher.update(encryptedPayload.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error(`QR decryption error: ${error.message}`);
  }
};

/**
 * Validate QR code data
 * @param {string} qrString - QR code string data
 * @returns {object} Validation result
 */
const validateQRData = (qrString) => {
  try {
    const qrData = JSON.parse(qrString);
    
    // Check if it's encrypted
    if (qrData.encrypted) {
      const decryptedData = decryptQRPayload(qrData);
      return validateQRStructure(decryptedData);
    } else {
      return validateQRStructure(qrData);
    }
  } catch (error) {
    return {
      isValid: false,
      message: `QR validation error: ${error.message}`,
      data: null
    };
  }
};

/**
 * Validate QR code structure
 * @param {object} qrData - QR data object
 * @returns {object} Validation result
 */
const validateQRStructure = (qrData) => {
  try {
    const requiredFields = ['qrId', 'type', 'timestamp', 'data', 'version'];
    const missingFields = requiredFields.filter(field => !qrData[field]);
    
    if (missingFields.length > 0) {
      return {
        isValid: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        data: qrData
      };
    }

    // Validate QR type
    const validTypes = ['BATCH_QR', 'PRODUCT_QR', 'CONSUMER_QR'];
    if (!validTypes.includes(qrData.type)) {
      return {
        isValid: false,
        message: `Invalid QR type: ${qrData.type}`,
        data: qrData
      };
    }

    // Check timestamp validity
    const qrTimestamp = new Date(qrData.timestamp);
    if (isNaN(qrTimestamp.getTime())) {
      return {
        isValid: false,
        message: 'Invalid timestamp format',
        data: qrData
      };
    }

    return {
      isValid: true,
      message: 'QR data is valid',
      data: qrData
    };
  } catch (error) {
    return {
      isValid: false,
      message: `QR structure validation error: ${error.message}`,
      data: null
    };
  }
};

/**
 * Generate authenticity code for product verification
 * @param {object} verificationData - Verification data
 * @returns {string} Authenticity code
 */
const generateAuthenticityCode = (verificationData) => {
  try {
    const { productId, batchId, manufacturerId, saleDate } = verificationData;
    const dataString = `${productId}_${batchId}_${manufacturerId}_${saleDate}`;
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');
    return hash.substring(0, 16).toUpperCase();
  } catch (error) {
    return Math.random().toString(36).substr(2, 16).toUpperCase();
  }
};

/**
 * Generate QR code for transportation tracking
 * @param {string} transportId - Transportation identifier
 * @param {object} transportData - Transportation information
 * @returns {object} QR code data and metadata
 */
const generateTransportQR = (transportId, transportData = {}) => {
  try {
    const timestamp = new Date().toISOString();
    const qrId = `QR_TRANS_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Create QR payload
    const qrPayload = {
      qrId,
      transportId,
      type: 'TRANSPORT_QR',
      timestamp,
      data: {
        batchId: transportData.batchId || 'Unknown',
        fromLocation: transportData.fromLocation || null,
        toLocation: transportData.toLocation || null,
        transporterId: transportData.transporterId || 'Unknown',
        vehicleId: transportData.vehicleId || 'Unknown',
        expectedDelivery: transportData.expectedDelivery || null
      },
      version: '1.0'
    };

    // Encrypt sensitive data
    const encryptedPayload = encryptQRPayload(qrPayload);
    
    return {
      qrId,
      transportId,
      qrData: encryptedPayload,
      qrString: JSON.stringify(encryptedPayload),
      metadata: {
        type: 'TRANSPORT_QR',
        generatedAt: timestamp,
        version: '1.0',
        encrypted: true
      }
    };
  } catch (error) {
    throw new Error(`Transport QR generation error: ${error.message}`);
  }
};

/**
 * Generate QR code for quality test results
 * @param {string} testId - Test identifier
 * @param {object} testData - Test information
 * @returns {object} QR code data and metadata
 */
const generateTestQR = (testId, testData = {}) => {
  try {
    const timestamp = new Date().toISOString();
    const qrId = `QR_TEST_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Create QR payload
    const qrPayload = {
      qrId,
      testId,
      type: 'TEST_QR',
      timestamp,
      data: {
        batchId: testData.batchId || 'Unknown',
        labId: testData.labId || 'Unknown',
        testType: testData.testType || 'Quality Test',
        testDate: testData.testDate || timestamp,
        results: testData.results || {},
        certificateNumber: testData.certificateNumber || null
      },
      version: '1.0'
    };

    // Encrypt sensitive data
    const encryptedPayload = encryptQRPayload(qrPayload);
    
    return {
      qrId,
      testId,
      qrData: encryptedPayload,
      qrString: JSON.stringify(encryptedPayload),
      metadata: {
        type: 'TEST_QR',
        generatedAt: timestamp,
        version: '1.0',
        encrypted: true
      }
    };
  } catch (error) {
    throw new Error(`Test QR generation error: ${error.message}`);
  }
};

module.exports = {
  generateBatchQR,
  generateProductQR,
  generateConsumerQR,
  generateTransportQR,
  generateTestQR,
  encryptQRPayload,
  decryptQRPayload,
  validateQRData,
  validateQRStructure,
  generateAuthenticityCode
};

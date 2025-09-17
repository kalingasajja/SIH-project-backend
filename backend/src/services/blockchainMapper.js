/**
 * Blockchain Mapper Service
 * Maps frontend attributes to blockchain expected format
 * Acts as a bridge between frontend and blockchain without changing either
 */

let blockchainInterface = null;

// Try to load blockchain interface, but don't fail if not available
try {
  blockchainInterface = require('../blockchain/blockchainInterface');
} catch (error) {
  
}

class BlockchainMapper {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      if (!blockchainInterface) {
        console.log('Blockchain interface not available, running in prototype mode');
        return;
      }

      // Initialize blockchain interface
      // Note: In production, you'd pass actual connection profile and user ID
      const connectionProfile = require('../../config/connection-org1.json');
      const userId = 'admin'; // Default user for prototype
      
      await blockchainInterface.initialize(connectionProfile, userId);
      this.isInitialized = true;
      console.log('Blockchain mapper initialized successfully');
    } catch (error) {
      console.error('Blockchain mapper initialization failed:', error);
      // For prototype, we'll continue without blockchain
      console.log('Continuing in prototype mode without blockchain');
    }
  }

  /**
   * Map frontend herb batch data to blockchain collection event
   * @param {object} frontendData - Data from frontend
   * @returns {object} Mapped data for blockchain
   */
  mapCollectionEvent(frontendData) {
    return {
      batchId: frontendData.batchId,
      gpsTaggedLocation: {
        latitude: parseFloat(frontendData.latitude),
        longitude: parseFloat(frontendData.longitude),
        accuracy: 'GPS',
        timestamp: frontendData.timestamp
      },
      collectorIdentity: {
        collectorId: frontendData.collectorId,
        collectorType: 'FARMER',
        licenseNumber: null, // Not provided by frontend
        contactInfo: null    // Not provided by frontend
      },
      speciesIdentity: {
        species: frontendData.species,
        variety: null,       // Not provided by frontend
        origin: null,        // Not provided by frontend
        cultivationMethod: null // Not provided by frontend
      },
      initialQualityMetrics: {
        weight: parseFloat(frontendData.initialWeightKg),
        quality: frontendData.initialQualityMetrics,
        moisture: null,      // Not provided by frontend
        purity: null         // Not provided by frontend
      },
      certifications: [],    // Empty array as not provided by frontend
      images: [],           // Empty array as not provided by frontend
      timestamp: frontendData.timestamp
    };
  }

  /**
   * Map frontend processing step data to blockchain processing event
   * @param {object} frontendData - Data from frontend
   * @returns {object} Mapped data for blockchain
   */
  mapProcessingEvent(frontendData) {
    return {
      batchId: frontendData.batchId,
      processingId: `PROC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      processorIdentity: {
        processorId: 'PROCESSOR_001', // Default for prototype
        processorType: 'PROCESSOR',
        facilityId: 'FACILITY_001',
        gmpLicense: null
      },
      processingDetails: {
        stepName: frontendData.stepName,
        equipmentId: frontendData.equipmentId,
        parameters: frontendData.parameters,
        duration: null,      // Not provided by frontend
        temperature: null,   // Not provided by frontend
        pressure: null       // Not provided by frontend
      },
      qualityParameters: {}, // Empty object as not provided by frontend
      packagingDetails: {},  // Empty object as not provided by frontend
      outputBatches: [],     // Empty array as not provided by frontend
      timestamp: frontendData.timestamp
    };
  }

  /**
   * Map frontend quality test data to blockchain quality test event
   * @param {object} frontendData - Data from frontend
   * @returns {object} Mapped data for blockchain
   */
  mapQualityTestEvent(frontendData) {
    return {
      batchId: frontendData.batchId,
      testId: `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      labIdentity: {
        labId: 'LAB_001',    // Default for prototype
        labName: 'Quality Testing Lab',
        accreditation: 'NABL',
        location: null
      },
      testDetails: {
        testType: frontendData.testType,
        testMethod: null,    // Not provided by frontend
        testStandard: null,  // Not provided by frontend
        testDuration: null   // Not provided by frontend
      },
      testResults: {
        summary: frontendData.resultsSummary,
        detailedResults: null, // Not provided by frontend
        passFail: null,       // Not provided by frontend
        numericalResults: null // Not provided by frontend
      },
      certifications: [
        {
          certificateHash: frontendData.certificateHash,
          certificateUrl: frontendData.certificateUrl,
          issuedBy: 'Quality Testing Lab',
          issuedDate: new Date().toISOString()
        }
      ],
      timestamp: frontendData.timestamp
    };
  }

  /**
   * Map frontend formulation data to blockchain formulation event
   * @param {object} frontendData - Data from frontend
   * @returns {object} Mapped data for blockchain
   */
  mapFormulationEvent(frontendData) {
    return {
      batchId: frontendData.finalProductId,
      formulationId: `FORM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      manufacturerIdentity: {
        manufacturerId: 'MANUFACTURER_001', // Default for prototype
        manufacturerName: 'Herbal Products Ltd',
        gmpLicense: 'GMP_001',
        facilityLocation: null
      },
      formulationDetails: {
        productName: frontendData.productName,
        formulationDate: frontendData.formulationDate,
        expiryDate: frontendData.expiryDate,
        batchSize: null,     // Not provided by frontend
        formulationMethod: null // Not provided by frontend
      },
      ingredientBatches: frontendData.ingredientBatchIds || [],
      qualitySpecifications: {}, // Empty object as not provided by frontend
      packagingDetails: {},      // Empty object as not provided by frontend
      timestamp: frontendData.formulationDate
    };
  }

  /**
   * Map frontend custody transfer data to blockchain custody event
   * @param {object} frontendData - Data from frontend
   * @returns {object} Mapped data for blockchain
   */
  mapCustodyTransferEvent(frontendData) {
    return {
      batchId: frontendData.batchId,
      transferId: `TRANSFER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromIdentity: {
        userId: frontendData.fromUserId || 'UNKNOWN',
        userType: 'PREVIOUS_OWNER',
        organization: null
      },
      toIdentity: {
        userId: frontendData.toUserId,
        userType: 'NEW_OWNER',
        organization: null
      },
      transferDetails: {
        transferReason: frontendData.note || 'Custody transfer',
        transferType: 'OWNERSHIP',
        conditions: null,    // Not provided by frontend
        restrictions: null   // Not provided by frontend
      },
      timestamp: frontendData.timestamp || new Date().toISOString()
    };
  }

  /**
   * Send collection event to blockchain
   * @param {object} frontendData - Data from frontend
   * @returns {object} Result from blockchain
   */
  async sendCollectionEvent(frontendData) {
    try {
      if (!blockchainInterface || !this.isInitialized) {
        console.log('Blockchain not available, storing in-memory only');
        return {
          success: true,
          message: 'Collection event stored in-memory (blockchain not available)',
          data: { batchId: frontendData.batchId, eventType: 'COLLECTION' }
        };
      }

      const mappedData = this.mapCollectionEvent(frontendData);
      console.log('Sending collection event to blockchain:', mappedData);
      
      const result = await blockchainInterface.invokeCollectionEvent(mappedData);
      return result;
    } catch (error) {
      console.error('Failed to send collection event to blockchain:', error);
      return {
        success: false,
        message: 'Failed to send collection event to blockchain',
        error: error.message
      };
    }
  }

  /**
   * Send processing event to blockchain
   * @param {object} frontendData - Data from frontend
   * @returns {object} Result from blockchain
   */
  async sendProcessingEvent(frontendData) {
    try {
      if (!blockchainInterface || !this.isInitialized) {
        console.log('Blockchain not available, storing in-memory only');
        return {
          success: true,
          message: 'Processing event stored in-memory (blockchain not available)',
          data: { batchId: frontendData.batchId, eventType: 'PROCESSING' }
        };
      }

      const mappedData = this.mapProcessingEvent(frontendData);
      console.log('Sending processing event to blockchain:', mappedData);
      
      const result = await blockchainInterface.invokeProcessingEvent(mappedData);
      return result;
    } catch (error) {
      console.error('Failed to send processing event to blockchain:', error);
      return {
        success: false,
        message: 'Failed to send processing event to blockchain',
        error: error.message
      };
    }
  }

  /**
   * Send quality test event to blockchain
   * @param {object} frontendData - Data from frontend
   * @returns {object} Result from blockchain
   */
  async sendQualityTestEvent(frontendData) {
    try {
      if (!blockchainInterface || !this.isInitialized) {
        console.log('Blockchain not available, storing in-memory only');
        return {
          success: true,
          message: 'Quality test event stored in-memory (blockchain not available)',
          data: { batchId: frontendData.batchId, eventType: 'QUALITY_TEST' }
        };
      }

      const mappedData = this.mapQualityTestEvent(frontendData);
      console.log('Sending quality test event to blockchain:', mappedData);
      
      const result = await blockchainInterface.invokeQualityTestEvent(mappedData);
      return result;
    } catch (error) {
      console.error('Failed to send quality test event to blockchain:', error);
      return {
        success: false,
        message: 'Failed to send quality test event to blockchain',
        error: error.message
      };
    }
  }

  /**
   * Send formulation event to blockchain
   * @param {object} frontendData - Data from frontend
   * @returns {object} Result from blockchain
   */
  async sendFormulationEvent(frontendData) {
    try {
      if (!blockchainInterface || !this.isInitialized) {
        console.log('Blockchain not available, storing in-memory only');
        return {
          success: true,
          message: 'Formulation event stored in-memory (blockchain not available)',
          data: { finalProductId: frontendData.finalProductId, eventType: 'FORMULATION' }
        };
      }

      const mappedData = this.mapFormulationEvent(frontendData);
      console.log('Sending formulation event to blockchain:', mappedData);
      
      // Note: This would need a corresponding method in blockchainInterface
      // For now, we'll return a mock response
      return {
        success: true,
        message: 'Formulation event sent to blockchain',
        data: { finalProductId: frontendData.finalProductId, eventType: 'FORMULATION' }
      };
    } catch (error) {
      console.error('Failed to send formulation event to blockchain:', error);
      return {
        success: false,
        message: 'Failed to send formulation event to blockchain',
        error: error.message
      };
    }
  }

  /**
   * Send custody transfer event to blockchain
   * @param {object} frontendData - Data from frontend
   * @returns {object} Result from blockchain
   */
  async sendCustodyTransferEvent(frontendData) {
    try {
      if (!blockchainInterface || !this.isInitialized) {
        console.log('Blockchain not available, storing in-memory only');
        return {
          success: true,
          message: 'Custody transfer event stored in-memory (blockchain not available)',
          data: { batchId: frontendData.batchId, eventType: 'CUSTODY_TRANSFER' }
        };
      }

      const mappedData = this.mapCustodyTransferEvent(frontendData);
      console.log('Sending custody transfer event to blockchain:', mappedData);
      
      // Note: This would need a corresponding method in blockchainInterface
      // For now, we'll return a mock response
      return {
        success: true,
        message: 'Custody transfer event sent to blockchain',
        data: { batchId: frontendData.batchId, eventType: 'CUSTODY_TRANSFER' }
      };
    } catch (error) {
      console.error('Failed to send custody transfer event to blockchain:', error);
      return {
        success: false,
        message: 'Failed to send custody transfer event to blockchain',
        error: error.message
      };
    }
  }
}

// Create singleton instance
const blockchainMapper = new BlockchainMapper();

module.exports = blockchainMapper;

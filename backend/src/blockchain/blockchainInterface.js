/**
 * Blockchain Interface for Ayurvedic Herbs Supply Chain
 * Handles all blockchain interactions for the supply chain system
 */

const fabricGateway = require('./fabricGateway');
const { formatBlockchainResponse, formatErrorResponse } = require('../utils/responseFormatter');

class BlockchainInterface {
  constructor() {
    this.isInitialized = false;
    this.contractName = 'herbSupplyChain';
    this.channelName = 'supply-chain-channel';
  }

  /**
   * Initialize blockchain connection
   * @param {object} connectionProfile - Network connection profile
   * @param {string} userId - User identity
   */
  async initialize(connectionProfile, userId) {
    try {
      await fabricGateway.initializeWallet();
      await fabricGateway.connectToNetwork(
        connectionProfile, 
        userId, 
        this.channelName, 
        this.contractName
      );
      this.isInitialized = true;
      console.log('Blockchain interface initialized successfully');
    } catch (error) {
      console.error('Blockchain initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create collection event on blockchain
   * @param {object} collectionEvent - Collection event data
   * @returns {object} Blockchain transaction result
   */
  async invokeCollectionEvent(collectionEvent) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain interface not initialized');
      }

      const args = [
        collectionEvent.batchId,
        JSON.stringify(collectionEvent.gpsTaggedLocation),
        JSON.stringify(collectionEvent.collectorIdentity),
        JSON.stringify(collectionEvent.speciesIdentity),
        JSON.stringify(collectionEvent.initialQualityMetrics),
        JSON.stringify(collectionEvent.certifications || []),
        JSON.stringify(collectionEvent.images || []),
        collectionEvent.timestamp
      ];

      const result = await fabricGateway.submitTransaction('createCollectionEvent', ...args);
      
      return formatBlockchainResponse(result, 'Collection Event Creation', {
        batchId: collectionEvent.batchId,
        eventType: 'COLLECTION'
      });
    } catch (error) {
      console.error('Collection event creation failed:', error);
      return formatErrorResponse(
        'Failed to create collection event on blockchain',
        500,
        error,
        { operation: 'invokeCollectionEvent' }
      );
    }
  }

  /**
   * Create processing event on blockchain
   * @param {object} processingEvent - Processing event data
   * @returns {object} Blockchain transaction result
   */
  async invokeProcessingEvent(processingEvent) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain interface not initialized');
      }

      const args = [
        processingEvent.batchId,
        processingEvent.processingId,
        JSON.stringify(processingEvent.processorIdentity),
        JSON.stringify(processingEvent.processingDetails),
        JSON.stringify(processingEvent.qualityParameters || {}),
        JSON.stringify(processingEvent.packagingDetails || {}),
        JSON.stringify(processingEvent.outputBatches || []),
        processingEvent.timestamp
      ];

      const result = await fabricGateway.submitTransaction('createProcessingEvent', ...args);
      
      return formatBlockchainResponse(result, 'Processing Event Creation', {
        batchId: processingEvent.batchId,
        processingId: processingEvent.processingId,
        eventType: 'PROCESSING'
      });
    } catch (error) {
      console.error('Processing event creation failed:', error);
      return formatErrorResponse(
        'Failed to create processing event on blockchain',
        500,
        error,
        { operation: 'invokeProcessingEvent' }
      );
    }
  }

  /**
   * Create quality test event on blockchain
   * @param {object} testEvent - Quality test event data
   * @returns {object} Blockchain transaction result
   */
  async invokeQualityTestEvent(testEvent) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain interface not initialized');
      }

      const args = [
        testEvent.batchId,
        testEvent.testId,
        JSON.stringify(testEvent.labIdentity),
        JSON.stringify(testEvent.testDetails),
        JSON.stringify(testEvent.testResults),
        JSON.stringify(testEvent.certifications || []),
        testEvent.timestamp
      ];

      const result = await fabricGateway.submitTransaction('createQualityTestEvent', ...args);
      
      return formatBlockchainResponse(result, 'Quality Test Event Creation', {
        batchId: testEvent.batchId,
        testId: testEvent.testId,
        eventType: 'QUALITY_TEST'
      });
    } catch (error) {
      console.error('Quality test event creation failed:', error);
      return formatErrorResponse(
        'Failed to create quality test event on blockchain',
        500,
        error,
        { operation: 'invokeQualityTestEvent' }
      );
    }
  }

  /**
   * Create transportation event on blockchain
   * @param {object} transportEvent - Transportation event data
   * @returns {object} Blockchain transaction result
   */
  async invokeTransportationEvent(transportEvent) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain interface not initialized');
      }

      const args = [
        transportEvent.batchId,
        transportEvent.transportId,
        JSON.stringify(transportEvent.transporterIdentity),
        JSON.stringify(transportEvent.routeDetails),
        JSON.stringify(transportEvent.environmentalConditions),
        JSON.stringify(transportEvent.vehicleDetails),
        transportEvent.timestamp
      ];

      const result = await fabricGateway.submitTransaction('createTransportationEvent', ...args);
      
      return formatBlockchainResponse(result, 'Transportation Event Creation', {
        batchId: transportEvent.batchId,
        transportId: transportEvent.transportId,
        eventType: 'TRANSPORTATION'
      });
    } catch (error) {
      console.error('Transportation event creation failed:', error);
      return formatErrorResponse(
        'Failed to create transportation event on blockchain',
        500,
        error,
        { operation: 'invokeTransportationEvent' }
      );
    }
  }

  /**
   * Create distribution event on blockchain
   * @param {object} distributionEvent - Distribution event data
   * @returns {object} Blockchain transaction result
   */
  async invokeDistributionEvent(distributionEvent) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain interface not initialized');
      }

      const args = [
        distributionEvent.batchId,
        distributionEvent.distributionId,
        JSON.stringify(distributionEvent.distributorIdentity),
        JSON.stringify(distributionEvent.inventoryDetails),
        JSON.stringify(distributionEvent.storageConditions),
        JSON.stringify(distributionEvent.retailerAllocations || []),
        distributionEvent.timestamp
      ];

      const result = await fabricGateway.submitTransaction('createDistributionEvent', ...args);
      
      return formatBlockchainResponse(result, 'Distribution Event Creation', {
        batchId: distributionEvent.batchId,
        distributionId: distributionEvent.distributionId,
        eventType: 'DISTRIBUTION'
      });
    } catch (error) {
      console.error('Distribution event creation failed:', error);
      return formatErrorResponse(
        'Failed to create distribution event on blockchain',
        500,
        error,
        { operation: 'invokeDistributionEvent' }
      );
    }
  }

  /**
   * Create retail sale event on blockchain
   * @param {object} retailEvent - Retail sale event data
   * @returns {object} Blockchain transaction result
   */
  async invokeRetailSaleEvent(retailEvent) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain interface not initialized');
      }

      const args = [
        retailEvent.batchId,
        retailEvent.saleId,
        JSON.stringify(retailEvent.retailerIdentity),
        JSON.stringify(retailEvent.customerInfo),
        JSON.stringify(retailEvent.saleDetails),
        JSON.stringify(retailEvent.paymentInfo || {}),
        retailEvent.timestamp
      ];

      const result = await fabricGateway.submitTransaction('createRetailSaleEvent', ...args);
      
      return formatBlockchainResponse(result, 'Retail Sale Event Creation', {
        batchId: retailEvent.batchId,
        saleId: retailEvent.saleId,
        eventType: 'RETAIL_SALE'
      });
    } catch (error) {
      console.error('Retail sale event creation failed:', error);
      return formatErrorResponse(
        'Failed to create retail sale event on blockchain',
        500,
        error,
        { operation: 'invokeRetailSaleEvent' }
      );
    }
  }

  /**
   * Query batch history from blockchain
   * @param {string} batchId - Batch identifier
   * @returns {object} Batch history data
   */
  async queryBatchHistory(batchId) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain interface not initialized');
      }

      const result = await fabricGateway.evaluateTransaction('queryBatchHistory', batchId);
      
      return {
        success: true,
        data: result.result,
        batchId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Batch history query failed:', error);
      return formatErrorResponse(
        'Failed to query batch history from blockchain',
        500,
        error,
        { operation: 'queryBatchHistory', batchId }
      );
    }
  }

  /**
   * Query events by type from blockchain
   * @param {string} eventType - Event type to query
   * @param {string} userId - User identifier (optional)
   * @returns {object} Events data
   */
  async queryEventsByType(eventType, userId = null) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain interface not initialized');
      }

      const args = userId ? [eventType, userId] : [eventType];
      const result = await fabricGateway.evaluateTransaction('queryEventsByType', ...args);
      
      return {
        success: true,
        data: result.result,
        eventType,
        userId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Events query failed:', error);
      return formatErrorResponse(
        'Failed to query events from blockchain',
        500,
        error,
        { operation: 'queryEventsByType', eventType, userId }
      );
    }
  }

  /**
   * Query batch by ID from blockchain
   * @param {string} batchId - Batch identifier
   * @returns {object} Batch data
   */
  async queryBatchById(batchId) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain interface not initialized');
      }

      const result = await fabricGateway.evaluateTransaction('queryBatchById', batchId);
      
      return {
        success: true,
        data: result.result,
        batchId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Batch query failed:', error);
      return formatErrorResponse(
        'Failed to query batch from blockchain',
        500,
        error,
        { operation: 'queryBatchById', batchId }
      );
    }
  }

  /**
   * Validate GPS location on blockchain
   * @param {object} locationData - GPS location data
   * @returns {object} Validation result
   */
  async validateGPSLocation(locationData) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain interface not initialized');
      }

      const result = await fabricGateway.evaluateTransaction(
        'validateGPSLocation', 
        JSON.stringify(locationData)
      );
      
      return {
        success: true,
        data: result.result,
        locationData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('GPS validation failed:', error);
      return formatErrorResponse(
        'Failed to validate GPS location on blockchain',
        500,
        error,
        { operation: 'validateGPSLocation' }
      );
    }
  }

  /**
   * Generate QR code data on blockchain
   * @param {string} batchId - Batch identifier
   * @param {string} qrType - Type of QR code
   * @returns {object} QR code data
   */
  async generateQRCode(batchId, qrType = 'BATCH') {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain interface not initialized');
      }

      const result = await fabricGateway.evaluateTransaction(
        'generateQRCode', 
        batchId, 
        qrType
      );
      
      return {
        success: true,
        data: result.result,
        batchId,
        qrType,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('QR code generation failed:', error);
      return formatErrorResponse(
        'Failed to generate QR code on blockchain',
        500,
        error,
        { operation: 'generateQRCode', batchId, qrType }
      );
    }
  }

  /**
   * Get blockchain network status
   * @returns {object} Network status information
   */
  async getNetworkStatus() {
    try {
      const status = fabricGateway.getConnectionStatus();
      return {
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Network status query failed:', error);
      return formatErrorResponse(
        'Failed to get network status',
        500,
        error,
        { operation: 'getNetworkStatus' }
      );
    }
  }

  /**
   * Disconnect from blockchain network
   */
  async disconnect() {
    try {
      await fabricGateway.disconnect();
      this.isInitialized = false;
      console.log('Blockchain interface disconnected');
    } catch (error) {
      console.error('Disconnection failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const blockchainInterface = new BlockchainInterface();

module.exports = blockchainInterface;

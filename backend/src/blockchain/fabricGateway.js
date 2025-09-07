/**
 * Hyperledger Fabric Gateway Configuration
 * Handles connection to Hyperledger Fabric network
 */

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

class FabricGateway {
  constructor() {
    this.gateway = new Gateway();
    this.wallet = null;
    this.network = null;
    this.contract = null;
    this.isConnected = false;
  }

  /**
   * Initialize wallet for user identity management
   * @param {string} walletPath - Path to wallet directory
   */
  async initializeWallet(walletPath = './wallet') {
    try {
      // Create wallet directory if it doesn't exist
      if (!fs.existsSync(walletPath)) {
        fs.mkdirSync(walletPath, { recursive: true });
      }

      // Create wallet instance
      this.wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log('Wallet initialized successfully');
    } catch (error) {
      console.error('Wallet initialization failed:', error);
      throw new Error(`Wallet initialization failed: ${error.message}`);
    }
  }

  /**
   * Connect to Hyperledger Fabric network
   * @param {object} connectionProfile - Network connection profile
   * @param {string} userId - User identity for connection
   * @param {string} channelName - Channel name
   * @param {string} contractName - Smart contract name
   */
  async connectToNetwork(connectionProfile, userId, channelName, contractName) {
    try {
      // Check if user identity exists in wallet
      const userExists = await this.wallet.get(userId);
      if (!userExists) {
        throw new Error(`User identity ${userId} not found in wallet`);
      }

      // Connect to gateway
      await this.gateway.connect(connectionProfile, {
        wallet: this.wallet,
        identity: userId,
        discovery: { enabled: true, asLocalhost: true }
      });

      // Get network and contract
      this.network = await this.gateway.getNetwork(channelName);
      this.contract = this.network.getContract(contractName);
      this.isConnected = true;

      console.log(`Connected to network: ${channelName}, Contract: ${contractName}`);
    } catch (error) {
      console.error('Network connection failed:', error);
      throw new Error(`Network connection failed: ${error.message}`);
    }
  }

  /**
   * Submit transaction to blockchain
   * @param {string} functionName - Smart contract function name
   * @param {array} args - Function arguments
   * @returns {object} Transaction result
   */
  async submitTransaction(functionName, ...args) {
    try {
      if (!this.isConnected || !this.contract) {
        throw new Error('Not connected to blockchain network');
      }

      console.log(`Submitting transaction: ${functionName} with args:`, args);
      
      const result = await this.contract.submitTransaction(functionName, ...args);
      
      // Parse result if it's a buffer
      let parsedResult;
      try {
        parsedResult = JSON.parse(result.toString());
      } catch (parseError) {
        parsedResult = result.toString();
      }

      console.log(`Transaction submitted successfully: ${functionName}`);
      
      return {
        success: true,
        txId: result.toString(),
        result: parsedResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Transaction submission failed: ${functionName}`, error);
      throw new Error(`Transaction submission failed: ${error.message}`);
    }
  }

  /**
   * Evaluate transaction (query) on blockchain
   * @param {string} functionName - Smart contract function name
   * @param {array} args - Function arguments
   * @returns {object} Query result
   */
  async evaluateTransaction(functionName, ...args) {
    try {
      if (!this.isConnected || !this.contract) {
        throw new Error('Not connected to blockchain network');
      }

      console.log(`Evaluating transaction: ${functionName} with args:`, args);
      
      const result = await this.contract.evaluateTransaction(functionName, ...args);
      
      // Parse result if it's a buffer
      let parsedResult;
      try {
        parsedResult = JSON.parse(result.toString());
      } catch (parseError) {
        parsedResult = result.toString();
      }

      console.log(`Transaction evaluated successfully: ${functionName}`);
      
      return {
        success: true,
        result: parsedResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Transaction evaluation failed: ${functionName}`, error);
      throw new Error(`Transaction evaluation failed: ${error.message}`);
    }
  }

  /**
   * Handle blockchain events
   * @param {string} eventName - Event name to listen for
   * @param {function} callback - Callback function for event handling
   */
  async handleBlockchainEvents(eventName, callback) {
    try {
      if (!this.isConnected || !this.network) {
        throw new Error('Not connected to blockchain network');
      }

      // Set up event listener
      const listener = async (event) => {
        try {
          const eventData = {
            eventName: event.eventName,
            payload: event.payload,
            timestamp: new Date().toISOString(),
            txId: event.txId
          };
          
          await callback(eventData);
        } catch (callbackError) {
          console.error('Event callback error:', callbackError);
        }
      };

      // Register event listener
      await this.network.addBlockListener(listener);
      console.log(`Event listener registered for: ${eventName}`);
    } catch (error) {
      console.error('Event listener setup failed:', error);
      throw new Error(`Event listener setup failed: ${error.message}`);
    }
  }

  /**
   * Disconnect from blockchain network
   */
  async disconnect() {
    try {
      if (this.gateway) {
        await this.gateway.disconnect();
        this.isConnected = false;
        this.network = null;
        this.contract = null;
        console.log('Disconnected from blockchain network');
      }
    } catch (error) {
      console.error('Disconnection failed:', error);
      throw new Error(`Disconnection failed: ${error.message}`);
    }
  }

  /**
   * Get connection status
   * @returns {object} Connection status information
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      hasWallet: !!this.wallet,
      hasNetwork: !!this.network,
      hasContract: !!this.contract,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create user identity
   * @param {string} userId - User identifier
   * @param {object} identity - User identity data
   */
  async createUserIdentity(userId, identity) {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }

      // Check if identity already exists
      const existingIdentity = await this.wallet.get(userId);
      if (existingIdentity) {
        throw new Error(`Identity ${userId} already exists`);
      }

      // Create identity object
      const userIdentity = {
        credentials: {
          certificate: identity.certificate,
          privateKey: identity.privateKey
        },
        mspId: identity.mspId || 'Org1MSP',
        type: 'X.509'
      };

      // Store identity in wallet
      await this.wallet.put(userId, userIdentity);
      console.log(`User identity created: ${userId}`);
      
      return {
        success: true,
        userId,
        mspId: userIdentity.mspId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Identity creation failed:', error);
      throw new Error(`Identity creation failed: ${error.message}`);
    }
  }

  /**
   * Get user identity
   * @param {string} userId - User identifier
   * @returns {object} User identity information
   */
  async getUserIdentity(userId) {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }

      const identity = await this.wallet.get(userId);
      if (!identity) {
        throw new Error(`Identity ${userId} not found`);
      }

      return {
        success: true,
        userId,
        mspId: identity.mspId,
        type: identity.type,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Get identity failed:', error);
      throw new Error(`Get identity failed: ${error.message}`);
    }
  }
}

// Create singleton instance
const fabricGateway = new FabricGateway();

module.exports = fabricGateway;

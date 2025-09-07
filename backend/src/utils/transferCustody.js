/**
 * Transfer Custody Management System
 * Handles custody transfers and prevents fake transactions
 */

const { validateTransaction, createSignedTransaction } = require('./keyManager');

// In-memory storage for custody records (replace with database in production)
let custodyRecords = [];
let transferHistory = [];

/**
 * Initiate a custody transfer
 * @param {string} fromUserId - Current custodian user ID
 * @param {string} toUserId - New custodian user ID
 * @param {string} batchId - Batch being transferred
 * @param {string} fromPrivateKey - Current custodian's private key
 * @param {object} transferData - Additional transfer data
 * @returns {object} Transfer initiation result
 */
const initiateCustodyTransfer = async (fromUserId, toUserId, batchId, fromPrivateKey, transferData = {}) => {
  try {
    // Validate required parameters
    if (!fromUserId || !toUserId || !batchId || !fromPrivateKey) {
      return {
        success: false,
        error: 'Missing required parameters for custody transfer',
        required: ['fromUserId', 'toUserId', 'batchId', 'fromPrivateKey']
      };
    }

    // Check if batch exists and is in custody of fromUserId
    const currentCustody = custodyRecords.find(record => 
      record.batchId === batchId && record.currentCustodian === fromUserId && record.status === 'ACTIVE'
    );

    if (!currentCustody) {
      return {
        success: false,
        error: 'Batch not found or not in custody of specified user',
        batchId,
        fromUserId
      };
    }

    // Create transfer event data
    const transferEventData = {
      batchId,
      fromCustodian: fromUserId,
      toCustodian: toUserId,
      transferType: transferData.transferType || 'CUSTODY_TRANSFER',
      transferReason: transferData.transferReason || 'Supply chain progression',
      qualityChecks: transferData.qualityChecks || [],
      conditions: transferData.conditions || [],
      location: transferData.location || null,
      timestamp: new Date().toISOString()
    };

    // Create signed transaction
    const transactionResult = createSignedTransaction(
      fromUserId,
      fromPrivateKey,
      'CUSTODY_TRANSFER',
      transferEventData
    );

    if (!transactionResult.success) {
      return transactionResult;
    }

    // Create transfer record
    const transferId = `TRANSFER_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const transferRecord = {
      transferId,
      batchId,
      fromCustodian: fromUserId,
      toCustodian: toUserId,
      transaction: transactionResult.transaction,
      status: 'PENDING_ACCEPTANCE',
      initiatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      transferData: transferEventData
    };

    // Store transfer record
    transferHistory.push(transferRecord);

    return {
      success: true,
      message: 'Custody transfer initiated successfully',
      data: {
        transferId: transferRecord.transferId,
        batchId: transferRecord.batchId,
        fromCustodian: transferRecord.fromCustodian,
        toCustodian: transferRecord.toCustodian,
        status: transferRecord.status,
        expiresAt: transferRecord.expiresAt,
        transactionId: transactionResult.transactionId
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Custody transfer initiation failed: ${error.message}`
    };
  }
};

/**
 * Accept a custody transfer
 * @param {string} transferId - Transfer ID to accept
 * @param {string} toUserId - User accepting the transfer
 * @param {string} toPrivateKey - Accepting user's private key
 * @param {object} acceptanceData - Additional acceptance data
 * @returns {object} Transfer acceptance result
 */
const acceptCustodyTransfer = async (transferId, toUserId, toPrivateKey, acceptanceData = {}) => {
  try {
    // Find the transfer record
    const transferIndex = transferHistory.findIndex(transfer => 
      transfer.transferId === transferId && 
      transfer.toCustodian === toUserId && 
      transfer.status === 'PENDING_ACCEPTANCE'
    );

    if (transferIndex === -1) {
      return {
        success: false,
        error: 'Transfer not found or not pending acceptance',
        transferId,
        toUserId
      };
    }

    const transfer = transferHistory[transferIndex];

    // Check if transfer has expired
    if (new Date() > new Date(transfer.expiresAt)) {
      transferHistory[transferIndex].status = 'EXPIRED';
      return {
        success: false,
        error: 'Transfer has expired',
        transferId,
        expiresAt: transfer.expiresAt
      };
    }

    // Create acceptance event data
    const acceptanceEventData = {
      transferId,
      batchId: transfer.batchId,
      fromCustodian: transfer.fromCustodian,
      toCustodian: toUserId,
      acceptanceTimestamp: new Date().toISOString(),
      acceptanceConditions: acceptanceData.conditions || [],
      qualityVerification: acceptanceData.qualityVerification || {},
      location: acceptanceData.location || null
    };

    // Create signed acceptance transaction
    const acceptanceTransaction = createSignedTransaction(
      toUserId,
      toPrivateKey,
      'CUSTODY_ACCEPTANCE',
      acceptanceEventData
    );

    if (!acceptanceTransaction.success) {
      return acceptanceTransaction;
    }

    // Update custody records
    const custodyIndex = custodyRecords.findIndex(record => 
      record.batchId === transfer.batchId && record.status === 'ACTIVE'
    );

    if (custodyIndex !== -1) {
      // End previous custody
      custodyRecords[custodyIndex].status = 'TRANSFERRED';
      custodyRecords[custodyIndex].transferredAt = new Date().toISOString();
      custodyRecords[custodyIndex].transferredTo = toUserId;
    }

    // Create new custody record
    const newCustodyRecord = {
      custodyId: `CUSTODY_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      batchId: transfer.batchId,
      currentCustodian: toUserId,
      previousCustodian: transfer.fromCustodian,
      status: 'ACTIVE',
      custodyStartDate: new Date().toISOString(),
      transferId: transferId,
      acceptanceTransaction: acceptanceTransaction.transaction
    };

    custodyRecords.push(newCustodyRecord);

    // Update transfer status
    transferHistory[transferIndex].status = 'COMPLETED';
    transferHistory[transferIndex].acceptedAt = new Date().toISOString();
    transferHistory[transferIndex].acceptanceTransaction = acceptanceTransaction.transaction;

    return {
      success: true,
      message: 'Custody transfer accepted successfully',
      data: {
        transferId: transfer.transferId,
        batchId: transfer.batchId,
        newCustodian: toUserId,
        custodyId: newCustodyRecord.custodyId,
        status: 'COMPLETED',
        acceptanceTransactionId: acceptanceTransaction.transactionId
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Custody transfer acceptance failed: ${error.message}`
    };
  }
};

/**
 * Reject a custody transfer
 * @param {string} transferId - Transfer ID to reject
 * @param {string} toUserId - User rejecting the transfer
 * @param {string} rejectionReason - Reason for rejection
 * @returns {object} Transfer rejection result
 */
const rejectCustodyTransfer = async (transferId, toUserId, rejectionReason) => {
  try {
    const transferIndex = transferHistory.findIndex(transfer => 
      transfer.transferId === transferId && 
      transfer.toCustodian === toUserId && 
      transfer.status === 'PENDING_ACCEPTANCE'
    );

    if (transferIndex === -1) {
      return {
        success: false,
        error: 'Transfer not found or not pending acceptance',
        transferId,
        toUserId
      };
    }

    // Update transfer status
    transferHistory[transferIndex].status = 'REJECTED';
    transferHistory[transferIndex].rejectedAt = new Date().toISOString();
    transferHistory[transferIndex].rejectionReason = rejectionReason;

    return {
      success: true,
      message: 'Custody transfer rejected successfully',
      data: {
        transferId: transferHistory[transferIndex].transferId,
        batchId: transferHistory[transferIndex].batchId,
        status: 'REJECTED',
        rejectionReason,
        rejectedAt: transferHistory[transferIndex].rejectedAt
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Custody transfer rejection failed: ${error.message}`
    };
  }
};

/**
 * Get custody history for a batch
 * @param {string} batchId - Batch ID to query
 * @returns {object} Custody history
 */
const getCustodyHistory = (batchId) => {
  try {
    const batchCustodyRecords = custodyRecords.filter(record => record.batchId === batchId);
    const batchTransfers = transferHistory.filter(transfer => transfer.batchId === batchId);

    // Sort by timestamp
    const sortedRecords = batchCustodyRecords.sort((a, b) => 
      new Date(a.custodyStartDate) - new Date(b.custodyStartDate)
    );

    const sortedTransfers = batchTransfers.sort((a, b) => 
      new Date(a.initiatedAt) - new Date(b.initiatedAt)
    );

    return {
      success: true,
      data: {
        batchId,
        custodyRecords: sortedRecords,
        transferHistory: sortedTransfers,
        currentCustodian: sortedRecords.find(r => r.status === 'ACTIVE')?.currentCustodian || null,
        totalCustodians: sortedRecords.length,
        totalTransfers: sortedTransfers.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get custody history: ${error.message}`
    };
  }
};

/**
 * Verify custody chain integrity
 * @param {string} batchId - Batch ID to verify
 * @returns {object} Verification result
 */
const verifyCustodyChain = (batchId) => {
  try {
    const history = getCustodyHistory(batchId);
    if (!history.success) {
      return history;
    }

    const { custodyRecords, transferHistory } = history.data;
    
    // Check for gaps in custody chain
    const gaps = [];
    for (let i = 1; i < custodyRecords.length; i++) {
      const prevRecord = custodyRecords[i - 1];
      const currentRecord = custodyRecords[i];
      
      if (prevRecord.transferredTo !== currentRecord.currentCustodian) {
        gaps.push({
          from: prevRecord.currentCustodian,
          to: currentRecord.currentCustodian,
          gap: 'Missing transfer record'
        });
      }
    }

    // Check for incomplete transfers
    const incompleteTransfers = transferHistory.filter(transfer => 
      transfer.status === 'PENDING_ACCEPTANCE' && 
      new Date() > new Date(transfer.expiresAt)
    );

    // Check for rejected transfers
    const rejectedTransfers = transferHistory.filter(transfer => 
      transfer.status === 'REJECTED'
    );

    const isChainIntact = gaps.length === 0 && incompleteTransfers.length === 0;
    const integrityScore = Math.max(0, 100 - (gaps.length * 20) - (incompleteTransfers.length * 10));

    return {
      success: true,
      data: {
        batchId,
        isChainIntact,
        integrityScore,
        issues: {
          gaps,
          incompleteTransfers: incompleteTransfers.length,
          rejectedTransfers: rejectedTransfers.length
        },
        custodyChain: custodyRecords.map(record => ({
          custodian: record.currentCustodian,
          startDate: record.custodyStartDate,
          status: record.status
        }))
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Custody chain verification failed: ${error.message}`
    };
  }
};

/**
 * Create initial custody record (for new batches)
 * @param {string} batchId - Batch ID
 * @param {string} initialCustodian - Initial custodian user ID
 * @param {string} privateKey - Initial custodian's private key
 * @param {object} custodyData - Additional custody data
 * @returns {object} Initial custody creation result
 */
const createInitialCustody = async (batchId, initialCustodian, privateKey, custodyData = {}) => {
  try {
    // Check if batch already has custody record
    const existingCustody = custodyRecords.find(record => 
      record.batchId === batchId && record.status === 'ACTIVE'
    );

    if (existingCustody) {
      return {
        success: false,
        error: 'Batch already has an active custody record',
        batchId,
        currentCustodian: existingCustody.currentCustodian
      };
    }

    // Create initial custody event data
    const custodyEventData = {
      batchId,
      custodian: initialCustodian,
      custodyType: 'INITIAL_CUSTODY',
      location: custodyData.location || null,
      conditions: custodyData.conditions || [],
      timestamp: new Date().toISOString()
    };

    // Create signed transaction
    const transactionResult = createSignedTransaction(
      initialCustodian,
      privateKey,
      'INITIAL_CUSTODY',
      custodyEventData
    );

    if (!transactionResult.success) {
      return transactionResult;
    }

    // Create custody record
    const custodyId = `CUSTODY_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const custodyRecord = {
      custodyId,
      batchId,
      currentCustodian: initialCustodian,
      previousCustodian: null,
      status: 'ACTIVE',
      custodyStartDate: new Date().toISOString(),
      transferId: null,
      initialTransaction: transactionResult.transaction
    };

    custodyRecords.push(custodyRecord);

    return {
      success: true,
      message: 'Initial custody created successfully',
      data: {
        custodyId: custodyRecord.custodyId,
        batchId: custodyRecord.batchId,
        custodian: custodyRecord.currentCustodian,
        status: custodyRecord.status,
        transactionId: transactionResult.transactionId
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Initial custody creation failed: ${error.message}`
    };
  }
};

module.exports = {
  initiateCustodyTransfer,
  acceptCustodyTransfer,
  rejectCustodyTransfer,
  getCustodyHistory,
  verifyCustodyChain,
  createInitialCustody
};

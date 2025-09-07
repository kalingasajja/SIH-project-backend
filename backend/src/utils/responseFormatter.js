/**
 * Response Formatting Utilities
 * Standardizes API responses across the application
 */

/**
 * Format successful response
 * @param {object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {object} metadata - Additional metadata
 * @returns {object} Formatted success response
 */
const formatSuccessResponse = (data, message = "Operation completed successfully", statusCode = 200, metadata = {}) => {
  return {
    success: true,
    message,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      statusCode,
      ...metadata
    }
  };
};

/**
 * Format error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {object} error - Error details
 * @param {object} metadata - Additional metadata
 * @returns {object} Formatted error response
 */
const formatErrorResponse = (message = "An error occurred", statusCode = 500, error = null, metadata = {}) => {
  const response = {
    success: false,
    message,
    metadata: {
      timestamp: new Date().toISOString(),
      statusCode,
      ...metadata
    }
  };

  // Add error details in development mode
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = {
      message: error.message,
      stack: error.stack,
      ...error
    };
  }

  return response;
};

/**
 * Format blockchain response
 * @param {object} blockchainData - Data from blockchain transaction
 * @param {string} operation - Operation performed
 * @param {object} metadata - Additional metadata
 * @returns {object} Formatted blockchain response
 */
const formatBlockchainResponse = (blockchainData, operation, metadata = {}) => {
  return {
    success: true,
    message: `Blockchain ${operation} completed successfully`,
    data: {
      transactionId: blockchainData.txId || blockchainData.transactionId,
      blockNumber: blockchainData.blockNumber,
      timestamp: blockchainData.timestamp || new Date().toISOString(),
      operation,
      status: blockchainData.status || 'SUCCESS'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      blockchain: true,
      ...metadata
    }
  };
};

/**
 * Format validation response
 * @param {boolean} isValid - Validation result
 * @param {string} message - Validation message
 * @param {object} details - Validation details
 * @param {object} metadata - Additional metadata
 * @returns {object} Formatted validation response
 */
const formatValidationResponse = (isValid, message, details = {}, metadata = {}) => {
  return {
    success: isValid,
    message,
    data: {
      isValid,
      details
    },
    metadata: {
      timestamp: new Date().toISOString(),
      validation: true,
      ...metadata
    }
  };
};

/**
 * Format paginated response
 * @param {array} items - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message
 * @param {object} metadata - Additional metadata
 * @returns {object} Formatted paginated response
 */
const formatPaginatedResponse = (items, page, limit, total, message = "Data retrieved successfully", metadata = {}) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    message,
    data: {
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        startIndex: (page - 1) * limit + 1,
        endIndex: Math.min(page * limit, total)
      }
    },
    metadata: {
      timestamp: new Date().toISOString(),
      paginated: true,
      ...metadata
    }
  };
};

/**
 * Format batch history response
 * @param {array} events - Array of batch events
 * @param {string} batchId - Batch identifier
 * @param {object} metadata - Additional metadata
 * @returns {object} Formatted batch history response
 */
const formatHistoryResponse = (events, batchId, metadata = {}) => {
  // Sort events by timestamp
  const sortedEvents = events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // Group events by type
  const eventsByType = sortedEvents.reduce((acc, event) => {
    if (!acc[event.eventType]) {
      acc[event.eventType] = [];
    }
    acc[event.eventType].push(event);
    return acc;
  }, {});

  return {
    success: true,
    message: "Batch history retrieved successfully",
    data: {
      batchId,
      totalEvents: events.length,
      events: sortedEvents,
      eventsByType,
      timeline: {
        firstEvent: sortedEvents[0]?.timestamp || null,
        lastEvent: sortedEvents[sortedEvents.length - 1]?.timestamp || null,
        duration: sortedEvents.length > 1 
          ? new Date(sortedEvents[sortedEvents.length - 1].timestamp) - new Date(sortedEvents[0].timestamp)
          : 0
      }
    },
    metadata: {
      timestamp: new Date().toISOString(),
      history: true,
      ...metadata
    }
  };
};

/**
 * Format authentication response
 * @param {object} user - User data
 * @param {string} token - JWT token
 * @param {string} message - Success message
 * @param {object} metadata - Additional metadata
 * @returns {object} Formatted authentication response
 */
const formatAuthResponse = (user, token, message = "Authentication successful", metadata = {}) => {
  return {
    success: true,
    message,
    data: {
      user: {
        id: user.id || user.farmerId || user.manufacturerId || user.testerId || user.customerId || user.regulatorId,
        username: user.username,
        role: user.role,
        name: user.farmerName || user.companyName || user.labName || user.customerName || user.regulatorName
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      authenticated: true,
      ...metadata
    }
  };
};

/**
 * Format file upload response
 * @param {object} fileData - File information
 * @param {string} message - Success message
 * @param {object} metadata - Additional metadata
 * @returns {object} Formatted file upload response
 */
const formatFileUploadResponse = (fileData, message = "File uploaded successfully", metadata = {}) => {
  return {
    success: true,
    message,
    data: {
      fileId: fileData.fileId || fileData.id,
      filename: fileData.filename || fileData.name,
      originalName: fileData.originalname,
      size: fileData.size,
      mimetype: fileData.mimetype,
      url: fileData.url || fileData.path,
      uploadedAt: fileData.uploadedAt || new Date().toISOString()
    },
    metadata: {
      timestamp: new Date().toISOString(),
      fileUpload: true,
      ...metadata
    }
  };
};

/**
 * Format certificate response
 * @param {object} certificate - Certificate data
 * @param {string} message - Success message
 * @param {object} metadata - Additional metadata
 * @returns {object} Formatted certificate response
 */
const formatCertificateResponse = (certificate, message = "Certificate generated successfully", metadata = {}) => {
  return {
    success: true,
    message,
    data: {
      certificateId: certificate.certificateId || certificate.id,
      certificateType: certificate.certificateType || certificate.type,
      issuedDate: certificate.issuedDate || certificate.createdAt,
      validityPeriod: certificate.validityPeriod,
      status: certificate.status || 'ACTIVE',
      downloadUrl: certificate.downloadUrl || certificate.url,
      verificationCode: certificate.verificationCode
    },
    metadata: {
      timestamp: new Date().toISOString(),
      certificate: true,
      ...metadata
    }
  };
};

/**
 * Format analytics response
 * @param {object} analyticsData - Analytics data
 * @param {string} message - Success message
 * @param {object} metadata - Additional metadata
 * @returns {object} Formatted analytics response
 */
const formatAnalyticsResponse = (analyticsData, message = "Analytics data retrieved successfully", metadata = {}) => {
  return {
    success: true,
    message,
    data: analyticsData,
    metadata: {
      timestamp: new Date().toISOString(),
      analytics: true,
      ...metadata
    }
  };
};

/**
 * Format compliance response
 * @param {object} complianceData - Compliance data
 * @param {string} message - Success message
 * @param {object} metadata - Additional metadata
 * @returns {object} Formatted compliance response
 */
const formatComplianceResponse = (complianceData, message = "Compliance data retrieved successfully", metadata = {}) => {
  return {
    success: true,
    message,
    data: {
      complianceStatus: complianceData.status || 'UNKNOWN',
      complianceScore: complianceData.score || 0,
      requirements: complianceData.requirements || [],
      violations: complianceData.violations || [],
      recommendations: complianceData.recommendations || [],
      lastAudit: complianceData.lastAudit || null,
      nextAudit: complianceData.nextAudit || null
    },
    metadata: {
      timestamp: new Date().toISOString(),
      compliance: true,
      ...metadata
    }
  };
};

/**
 * Format notification response
 * @param {object} notification - Notification data
 * @param {string} message - Success message
 * @param {object} metadata - Additional metadata
 * @returns {object} Formatted notification response
 */
const formatNotificationResponse = (notification, message = "Notification sent successfully", metadata = {}) => {
  return {
    success: true,
    message,
    data: {
      notificationId: notification.notificationId || notification.id,
      type: notification.type,
      recipient: notification.recipient,
      title: notification.title,
      message: notification.message,
      sentAt: notification.sentAt || new Date().toISOString(),
      status: notification.status || 'SENT'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      notification: true,
      ...metadata
    }
  };
};

module.exports = {
  formatSuccessResponse,
  formatErrorResponse,
  formatBlockchainResponse,
  formatValidationResponse,
  formatPaginatedResponse,
  formatHistoryResponse,
  formatAuthResponse,
  formatFileUploadResponse,
  formatCertificateResponse,
  formatAnalyticsResponse,
  formatComplianceResponse,
  formatNotificationResponse
};

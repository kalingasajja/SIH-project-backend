// Import required modules
const bcrypt = require("bcryptjs");
const { generateToken } = require("../auth/jwt");
// TODO: Import blockchain interface when implemented
// const { invokeProcessingEvent, queryBatchHistory, queryBatchEvents } = require("../blockchain/blockchainInterface");
// TODO: Import utility functions when implemented
// const { validateProcessingParameters, calculateYield } = require("../utils/processingValidator");
// const { generateProcessingCertificate } = require("../utils/certificateGenerator");
// const { formatSuccessResponse, formatErrorResponse } = require("../utils/responseFormatter");

const { manufacturers } = require("../data/store");
let processingEvents = [];
let rawMaterialInventory = [];




/**
 * Receive raw material batch for processing
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const receiveRawMaterial = async (req, res) => {
  try {
    const {
      batchId,
      supplierInfo,
      receivedQuantity,
      receivedCondition,
      qualityInspection,
      storageLocation
    } = req.body;

    const manufacturerId = req.user?.id;
    const manufacturerInfo = manufacturers.find(m => m.manufacturerId === manufacturerId);
    
    if (!manufacturerInfo) {
      return res.status(404).json({
        success: false,
        message: "Manufacturer not found. Please ensure you are registered."
      });
    }

    // Validate required fields
    if (!batchId || !receivedQuantity || !receivedCondition) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        requiredFields: ["batchId", "receivedQuantity", "receivedCondition"]
      });
    }

    // TODO: Verify batch exists on blockchain
    // const batchExists = await queryBatchEvents(batchId);
    // if (!batchExists) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Batch not found on blockchain"
    //   });
    // }

    // Generate receipt ID
    const receiptId = `REC_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Create raw material inventory entry
    const inventoryEntry = {
      receiptId,
      batchId,
      manufacturerId,
      manufacturerName: manufacturerInfo.companyName,
      supplierInfo: supplierInfo || {},
      receivedQuantity,
      receivedCondition,
      qualityInspection: qualityInspection || {},
      storageLocation: storageLocation || "Default Storage",
      receiptDate: new Date().toISOString(),
      status: "RECEIVED",
      processedQuantity: 0,
      remainingQuantity: receivedQuantity
    };

    // Save to inventory
    rawMaterialInventory.push(inventoryEntry);

    console.log("Raw material received:", receiptId);

    res.status(201).json({
      success: true,
      message: "Raw material received successfully",
      data: {
        receiptId: inventoryEntry.receiptId,
        batchId: inventoryEntry.batchId,
        receivedQuantity: inventoryEntry.receivedQuantity,
        receiptDate: inventoryEntry.receiptDate,
        status: inventoryEntry.status
      }
    });

  } catch (error) {
    console.error("Receive raw material error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while receiving raw material",
      error: error.message
    });
  }
};

/**
 * Create a new processing event
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const createProcessingEvent = async (req, res) => {
  try {
    const {
      batchId,
      processingDetails,
      qualityParameters,
      packagingDetails,
      outputBatches
    } = req.body;

    const manufacturerId = req.user?.id;
    const manufacturerInfo = manufacturers.find(m => m.manufacturerId === manufacturerId);
    
    if (!manufacturerInfo) {
      return res.status(404).json({
        success: false,
        message: "Manufacturer not found"
      });
    }

    // Validate required fields
    if (!batchId || !processingDetails) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        requiredFields: ["batchId", "processingDetails"]
      });
    }

    // Check if raw material is available in inventory
    const inventoryItem = rawMaterialInventory.find(item => 
      item.batchId === batchId && 
      item.manufacturerId === manufacturerId && 
      item.status === "RECEIVED"
    );

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: "Raw material batch not found in your inventory or already processed"
      });
    }

    // Generate processing ID
    const processingId = `PROC_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Calculate yield percentage
    const inputQuantity = parseFloat(inventoryItem.receivedQuantity) || 0;
    const outputQuantity = parseFloat(processingDetails.outputQuantity) || 0;
    const yieldPercentage = inputQuantity > 0 ? ((outputQuantity / inputQuantity) * 100).toFixed(2) : 0;

    // Create processing event object
    const processingEvent = {
      eventType: "PROCESSING",
      batchId,
      processingId,
      timestamp: new Date().toISOString(),
      processorIdentity: {
        manufacturerId: manufacturerInfo.manufacturerId,
        companyName: manufacturerInfo.companyName,
        gmpLicense: manufacturerInfo.gmpLicense,
        facilityLocation: manufacturerInfo.facilityLocation
      },
      processingDetails: {
        receiptDate: inventoryItem.receiptDate,
        processingMethod: processingDetails.processingMethod,
        temperatureRange: processingDetails.temperatureRange,
        processingDuration: processingDetails.processingDuration,
        outputQuantity: outputQuantity.toString(),
        yieldPercentage: `${yieldPercentage}%`,
        inputQuantity: inputQuantity.toString(),
        ...processingDetails
      },
      qualityParameters: qualityParameters || {},
      packagingDetails: packagingDetails || {},
      outputBatches: outputBatches || [],
      blockchainTxId: null, // Will be set after blockchain transaction
      status: "PROCESSED",
      createdAt: new Date().toISOString()
    };

    // TODO: Submit to blockchain
    // const blockchainResult = await invokeProcessingEvent(processingEvent);
    // processingEvent.blockchainTxId = blockchainResult.txId;

    // Save processing event
    processingEvents.push(processingEvent);

    // Update inventory status
    const inventoryIndex = rawMaterialInventory.findIndex(item => item.receiptId === inventoryItem.receiptId);
    if (inventoryIndex !== -1) {
      rawMaterialInventory[inventoryIndex].status = "PROCESSED";
      rawMaterialInventory[inventoryIndex].processedQuantity = outputQuantity;
      rawMaterialInventory[inventoryIndex].processingId = processingId;
      rawMaterialInventory[inventoryIndex].processedDate = new Date().toISOString();
    }

    console.log("Processing event created:", processingId);

    res.status(201).json({
      success: true,
      message: "Processing event created successfully",
      data: {
        batchId: processingEvent.batchId,
        processingId: processingEvent.processingId,
        eventType: processingEvent.eventType,
        timestamp: processingEvent.timestamp,
        yieldPercentage: yieldPercentage,
        status: processingEvent.status
      }
    });

  } catch (error) {
    console.error("Processing event creation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during processing event creation",
      error: error.message
    });
  }
};

/**
 * Get all processing events by the manufacturer
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getMyProcessingEvents = async (req, res) => {
  try {
    const manufacturerId = req.user?.id;
    
    // Filter processing events by manufacturer ID
    const myProcessingEvents = processingEvents.filter(event => 
      event.processorIdentity.manufacturerId === manufacturerId
    );

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedEvents = myProcessingEvents.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      message: "Processing events retrieved successfully",
      data: {
        processingEvents: paginatedEvents,
        pagination: {
          currentPage: page,
          totalEvents: myProcessingEvents.length,
          totalPages: Math.ceil(myProcessingEvents.length / limit),
          hasNextPage: endIndex < myProcessingEvents.length,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get processing events error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving processing events",
      error: error.message
    });
  }
};

/**
 * Get raw material inventory for the manufacturer
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getInventory = async (req, res) => {
  try {
    const manufacturerId = req.user?.id;
    
    // Filter inventory by manufacturer ID
    const myInventory = rawMaterialInventory.filter(item => 
      item.manufacturerId === manufacturerId
    );

    // Filter by status if provided
    const status = req.query.status;
    const filteredInventory = status 
      ? myInventory.filter(item => item.status === status.toUpperCase())
      : myInventory;

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedInventory = filteredInventory.slice(startIndex, endIndex);

    // Calculate inventory summary
    const summary = {
      totalBatches: myInventory.length,
      receivedBatches: myInventory.filter(item => item.status === "RECEIVED").length,
      processedBatches: myInventory.filter(item => item.status === "PROCESSED").length,
      totalReceivedQuantity: myInventory.reduce((sum, item) => sum + parseFloat(item.receivedQuantity || 0), 0),
      totalProcessedQuantity: myInventory.reduce((sum, item) => sum + parseFloat(item.processedQuantity || 0), 0)
    };

    res.status(200).json({
      success: true,
      message: "Inventory retrieved successfully",
      data: {
        inventory: paginatedInventory,
        summary,
        pagination: {
          currentPage: page,
          totalItems: filteredInventory.length,
          totalPages: Math.ceil(filteredInventory.length / limit),
          hasNextPage: endIndex < filteredInventory.length,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving inventory",
      error: error.message
    });
  }
};

/**
 * Get processing details for a specific batch
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getProcessingDetails = async (req, res) => {
  try {
    const { processingId } = req.params;
    const manufacturerId = req.user?.id;

    // Find the processing event
    const processingEvent = processingEvents.find(event => 
      event.processingId === processingId && 
      event.processorIdentity.manufacturerId === manufacturerId
    );

    if (!processingEvent) {
      return res.status(404).json({
        success: false,
        message: "Processing event not found or you don't have permission to view it"
      });
    }

    // Get related inventory item
    const inventoryItem = rawMaterialInventory.find(item => 
      item.batchId === processingEvent.batchId && 
      item.manufacturerId === manufacturerId
    );

    res.status(200).json({
      success: true,
      message: "Processing details retrieved successfully",
      data: {
        processingEvent,
        rawMaterialInfo: inventoryItem || null
      }
    });

  } catch (error) {
    console.error("Get processing details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving processing details",
      error: error.message
    });
  }
};

/**
 * Update processing event with additional information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const updateProcessingEvent = async (req, res) => {
  try {
    const { processingId } = req.params;
    const manufacturerId = req.user?.id;
    const updateData = req.body;

    // Find the processing event
    const eventIndex = processingEvents.findIndex(event => 
      event.processingId === processingId && 
      event.processorIdentity.manufacturerId === manufacturerId
    );

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Processing event not found or you don't have permission to update it"
      });
    }

    // Define allowed fields for update
    const allowedUpdates = ['qualityParameters', 'packagingDetails', 'outputBatches'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field]) {
        updates[field] = updateData[field];
      }
    });

    // Apply updates
    processingEvents[eventIndex] = {
      ...processingEvents[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: "Processing event updated successfully",
      data: {
        processingId,
        updatedFields: Object.keys(updates),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Update processing event error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating processing event",
      error: error.message
    });
  }
};

/**
 * Get manufacturer profile information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getManufacturerProfile = async (req, res) => {
  try {
    const manufacturerId = req.user?.id;
    
    const manufacturer = manufacturers.find(m => m.manufacturerId === manufacturerId);
    
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: "Manufacturer profile not found"
      });
    }

    // Return profile without sensitive information
    const { password, ...manufacturerProfile } = manufacturer;

    res.status(200).json({
      success: true,
      message: "Manufacturer profile retrieved successfully",
      data: manufacturerProfile
    });

  } catch (error) {
    console.error("Get manufacturer profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving manufacturer profile",
      error: error.message
    });
  }
};

/**
 * Generate processing certificate
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const generateProcessingCertificate = async (req, res) => {
  try {
    const { processingId } = req.params;
    const manufacturerId = req.user?.id;

    // Find the processing event
    const processingEvent = processingEvents.find(event => 
      event.processingId === processingId && 
      event.processorIdentity.manufacturerId === manufacturerId
    );

    if (!processingEvent) {
      return res.status(404).json({
        success: false,
        message: "Processing event not found"
      });
    }

    // Generate certificate data
    const certificate = {
      certificateId: `CERT_PROC_${Date.now()}`,
      processingId: processingEvent.processingId,
      batchId: processingEvent.batchId,
      manufacturerInfo: processingEvent.processorIdentity,
      processingDetails: processingEvent.processingDetails,
      qualityParameters: processingEvent.qualityParameters,
      issuedDate: new Date().toISOString(),
      validityPeriod: "2 years",
      certificateType: "PROCESSING_CERTIFICATE"
    };

    // TODO: Generate actual PDF certificate
    // const pdfCertificate = await generateProcessingCertificatePDF(certificate);

    res.status(200).json({
      success: true,
      message: "Processing certificate generated successfully",
      data: {
        certificate,
        // pdfUrl: pdfCertificate.url // URL to download PDF
      }
    });

  } catch (error) {
    console.error("Generate certificate error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while generating certificate",
      error: error.message
    });
  }
};

module.exports = {
 
  receiveRawMaterial,
  createProcessingEvent,
  getMyProcessingEvents,
  getInventory,
  getProcessingDetails,
  updateProcessingEvent,
  getManufacturerProfile,
  generateProcessingCertificate
};
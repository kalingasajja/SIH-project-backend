// Import required modules
const bcrypt = require("bcryptjs");
const { generateToken } = require("../auth/jwt");
// TODO: Import blockchain interface when implemented
// const { invokeCollectionEvent, queryBatchHistory } = require("../blockchain/blockchainInterface");
// TODO: Import utility functions when implemented
// const { validateGPSCoordinates, generateBatchId } = require("../utils/geoValidator");
// const { generateQRCode } = require("../utils/qrGenerator");
// const { formatSuccessResponse, formatErrorResponse } = require("../utils/responseFormatter");

// In-memory storage for demonstration (replace with database in production)
let farmers = [];
let collectionEvents = [];

/**
 * Register a new farmer in the system
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const registerFarmer = async (req, res) => {
  try {
    const {
      farmerName,
      contactInfo,
      licenseNumber,
      farmLocation,
      certifications,
      username,
      password
    } = req.body;

    // Basic validation
    if (!farmerName || !contactInfo || !licenseNumber || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
        requiredFields: ["farmerName", "contactInfo", "licenseNumber", "username", "password"]
      });
    }

    // Check if farmer already exists
    const existingFarmer = farmers.find(farmer => 
      farmer.username === username || farmer.licenseNumber === licenseNumber
    );
    
    if (existingFarmer) {
      return res.status(400).json({
        success: false,
        message: "Farmer with this username or license number already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate farmer ID
    const farmerId = `FARM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create farmer object
    const newFarmer = {
      farmerId,
      farmerName,
      contactInfo,
      licenseNumber,
      farmLocation: farmLocation || {},
      certifications: certifications || [],
      username,
      password: hashedPassword,
      role: "farmer",
      registrationDate: new Date().toISOString(),
      isActive: true
    };

    // Save farmer (in production, save to database)
    farmers.push(newFarmer);

    console.log("Farmer registered successfully:", farmerId);
    
    res.status(201).json({
      success: true,
      message: "Farmer registered successfully",
      data: {
        farmerId: newFarmer.farmerId,
        farmerName: newFarmer.farmerName,
        licenseNumber: newFarmer.licenseNumber
      }
    });

  } catch (error) {
    console.error("Farmer registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during farmer registration",
      error: error.message
    });
  }
};

/**
 * Create a new collection event (herb collection)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const createCollectionEvent = async (req, res) => {
  try {
    const {
      gpsTaggedLocation,
      speciesIdentity,
      initialQualityMetrics,
      certifications,
      images,
      weatherConditions,
      harvestMethod
    } = req.body;

    // Get farmer info from JWT token (set by authMiddleware)
    const farmerId = req.user?.id;
    const farmerInfo = farmers.find(f => f.farmerId === farmerId);
    
    if (!farmerInfo) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found. Please ensure you are registered."
      });
    }

    // Validate required fields
    if (!gpsTaggedLocation || !speciesIdentity || !initialQualityMetrics) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        requiredFields: ["gpsTaggedLocation", "speciesIdentity", "initialQualityMetrics"]
      });
    }

    // Validate GPS coordinates
    const { latitude, longitude } = gpsTaggedLocation;
    if (!latitude || !longitude || 
        Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid GPS coordinates provided"
      });
    }

    // Generate unique batch ID
    const batchId = `AH_${new Date().toISOString().split('T')[0].replace(/-/g, '')}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create collection event object
    const collectionEvent = {
      eventType: "COLLECTION",
      batchId,
      gpsTaggedLocation: {
        ...gpsTaggedLocation,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      collectorIdentity: {
        farmerId: farmerInfo.farmerId,
        farmerName: farmerInfo.farmerName,
        licenseNumber: farmerInfo.licenseNumber,
        contactInfo: farmerInfo.contactInfo
      },
      speciesIdentity: {
        botanicalName: speciesIdentity.botanicalName,
        commonName: speciesIdentity.commonName,
        partUsed: speciesIdentity.partUsed,
        variety: speciesIdentity.variety || "Indigenous",
        harvestMaturity: speciesIdentity.harvestMaturity
      },
      initialQualityMetrics: {
        ...initialQualityMetrics,
        harvestMethod: harvestMethod || "Hand-picked",
        weatherConditions: weatherConditions || "Not specified"
      },
      certifications: certifications || [],
      images: images || [],
      blockchainTxId: null, // Will be set after blockchain transaction
      status: "COLLECTED",
      createdAt: new Date().toISOString()
    };

    // TODO: Submit to blockchain
    // const blockchainResult = await invokeCollectionEvent(collectionEvent);
    // collectionEvent.blockchainTxId = blockchainResult.txId;

    // Save to in-memory storage (replace with database in production)
    collectionEvents.push(collectionEvent);

    console.log("Collection event created:", batchId);

    res.status(201).json({
      success: true,
      message: "Collection event created successfully",
      data: {
        batchId: collectionEvent.batchId,
        eventType: collectionEvent.eventType,
        timestamp: collectionEvent.timestamp,
        status: collectionEvent.status,
        // qrCode: await generateQRCode(batchId) // TODO: Implement QR generation
      }
    });

  } catch (error) {
    console.error("Collection event creation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during collection event creation",
      error: error.message
    });
  }
};

/**
 * Get all batches created by the authenticated farmer
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getMyBatches = async (req, res) => {
  try {
    const farmerId = req.user?.id;
    
    // Filter collection events by farmer ID
    const myBatches = collectionEvents.filter(event => 
      event.collectorIdentity.farmerId === farmerId
    );

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedBatches = myBatches.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      message: "Batches retrieved successfully",
      data: {
        batches: paginatedBatches,
        pagination: {
          currentPage: page,
          totalBatches: myBatches.length,
          totalPages: Math.ceil(myBatches.length / limit),
          hasNextPage: endIndex < myBatches.length,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get batches error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving batches",
      error: error.message
    });
  }
};

/**
 * Get detailed information about a specific batch
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getBatchDetails = async (req, res) => {
  try {
    const { batchId } = req.params;
    const farmerId = req.user?.id;

    // Find the batch
    const batch = collectionEvents.find(event => 
      event.batchId === batchId && event.collectorIdentity.farmerId === farmerId
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found or you don't have permission to view it"
      });
    }

    // TODO: Get complete batch history from blockchain
    // const blockchainHistory = await queryBatchHistory(batchId);

    res.status(200).json({
      success: true,
      message: "Batch details retrieved successfully",
      data: {
        batch,
        // blockchainHistory: blockchainHistory || []
      }
    });

  } catch (error) {
    console.error("Get batch details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving batch details",
      error: error.message
    });
  }
};

/**
 * Update collection event with additional information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const updateCollectionEvent = async (req, res) => {
  try {
    const { batchId } = req.params;
    const farmerId = req.user?.id;
    const updateData = req.body;

    // Find the batch
    const batchIndex = collectionEvents.findIndex(event => 
      event.batchId === batchId && event.collectorIdentity.farmerId === farmerId
    );

    if (batchIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Batch not found or you don't have permission to update it"
      });
    }

    // Check if batch is still in COLLECTED status (can only update before processing)
    if (collectionEvents[batchIndex].status !== "COLLECTED") {
      return res.status(400).json({
        success: false,
        message: "Cannot update batch that has moved to processing stage"
      });
    }

    // Update allowed fields
    const allowedUpdates = ['images', 'certifications', 'initialQualityMetrics'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field]) {
        updates[field] = updateData[field];
      }
    });

    // Apply updates
    collectionEvents[batchIndex] = {
      ...collectionEvents[batchIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: "Collection event updated successfully",
      data: {
        batchId,
        updatedFields: Object.keys(updates),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Update collection event error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating collection event",
      error: error.message
    });
  }
};

/**
 * Upload images for a collection event
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const uploadCollectionImages = async (req, res) => {
  try {
    const { batchId } = req.params;
    const farmerId = req.user?.id;
    
    // In a real implementation, you'd handle file uploads using multer
    const { images } = req.body; // Assuming base64 encoded images or URLs

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: "Images array is required"
      });
    }

    // Find the batch
    const batchIndex = collectionEvents.findIndex(event => 
      event.batchId === batchId && event.collectorIdentity.farmerId === farmerId
    );

    if (batchIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Batch not found or you don't have permission to update it"
      });
    }

    // Update images
    collectionEvents[batchIndex].images = [
      ...(collectionEvents[batchIndex].images || []),
      ...images
    ];
    collectionEvents[batchIndex].updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      data: {
        batchId,
        totalImages: collectionEvents[batchIndex].images.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Upload images error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while uploading images",
      error: error.message
    });
  }
};

/**
 * Get farmer profile information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getFarmerProfile = async (req, res) => {
  try {
    const farmerId = req.user?.id;
    
    const farmer = farmers.find(f => f.farmerId === farmerId);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found"
      });
    }

    // Return profile without sensitive information
    const { password, ...farmerProfile } = farmer;

    res.status(200).json({
      success: true,
      message: "Farmer profile retrieved successfully",
      data: farmerProfile
    });

  } catch (error) {
    console.error("Get farmer profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving farmer profile",
      error: error.message
    });
  }
};

/**
 * Update farmer profile
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const updateFarmerProfile = async (req, res) => {
  try {
    const farmerId = req.user?.id;
    const updateData = req.body;

    const farmerIndex = farmers.findIndex(f => f.farmerId === farmerId);
    
    if (farmerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found"
      });
    }

    // Define allowed fields for update
    const allowedUpdates = ['farmerName', 'contactInfo', 'farmLocation', 'certifications'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field]) {
        updates[field] = updateData[field];
      }
    });

    // Apply updates
    farmers[farmerIndex] = {
      ...farmers[farmerIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: "Farmer profile updated successfully",
      data: {
        farmerId,
        updatedFields: Object.keys(updates),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Update farmer profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating farmer profile",
      error: error.message
    });
  }
};

module.exports = {
  registerFarmer,
  createCollectionEvent,
  getMyBatches,
  getBatchDetails,
  updateCollectionEvent,
  uploadCollectionImages,
  getFarmerProfile,
  updateFarmerProfile
};
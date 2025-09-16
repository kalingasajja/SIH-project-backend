const express = require("express");
const router = express.Router();

// Import the farmer controller functions
const {
  createCollectionEvent,
  getMyBatches,
  getBatchDetails,
  updateCollectionEvent,
  uploadCollectionImages,
  getFarmerProfile,
  updateFarmerProfile
} = require("../controllers/farmerController");

// Import the authentication middleware
const authMiddleware = require("../auth/middleware/authMiddleware");

// TODO: Import role middleware when implemented
// const roleMiddleware = require("../auth/middleware/roleMiddleware");

// @route   POST /api/farmer/register
// @desc    Register a new farmer in the system
// @access  Public


// @route   GET /api/farmer/profile
// @desc    Get farmer profile information
// @access  Private (Farmer only)
router.get("/profile", authMiddleware, getFarmerProfile);

// @route   PUT /api/farmer/profile
// @desc    Update farmer profile information
// @access  Private (Farmer only)
router.put("/profile", authMiddleware, updateFarmerProfile);

// @route   POST /api/farmer/collection-event
// @desc    Create a new collection event (herb collection)
// @access  Private (Farmer only)
router.post("/collection-event", authMiddleware, createCollectionEvent);

// @route   GET /api/farmer/batches
// @desc    Get all batches created by the authenticated farmer
// @access  Private (Farmer only)
// @query   page, limit for pagination
router.get("/batches", authMiddleware, getMyBatches);

// @route   GET /api/farmer/batches/:batchId
// @desc    Get detailed information about a specific batch
// @access  Private (Farmer only)
router.get("/batches/:batchId", authMiddleware, getBatchDetails);

// @route   PUT /api/farmer/batches/:batchId
// @desc    Update collection event with additional information
// @access  Private (Farmer only)
router.put("/batches/:batchId", authMiddleware, updateCollectionEvent);

// @route   POST /api/farmer/batches/:batchId/images
// @desc    Upload images for a collection event
// @access  Private (Farmer only)
router.post("/batches/:batchId/images", authMiddleware, uploadCollectionImages);

module.exports = router;
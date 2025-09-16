const express = require("express");
const router = express.Router();

// Import the manufacturer controller functions
const {
  receiveRawMaterial,
  createProcessingEvent,
  getMyProcessingEvents,
  getInventory,
  getProcessingDetails,
  updateProcessingEvent,
  getManufacturerProfile,
  generateProcessingCertificate
} = require("../controllers/manufacturerController");

// Import the authentication middleware
const authMiddleware = require("../auth/middleware/authMiddleware");

// TODO: Import role middleware when implemented
// const roleMiddleware = require("../auth/middleware/roleMiddleware");

// @route   POST /api/manufacturer/register
// @desc    Register a new manufacturer/processor in the system
// @access  Public


// @route   GET /api/manufacturer/profile
// @desc    Get manufacturer profile information
// @access  Private (Manufacturer only)
router.get("/profile", authMiddleware, getManufacturerProfile);

// @route   POST /api/manufacturer/receive-material
// @desc    Receive raw material batch for processing
// @access  Private (Manufacturer only)
router.post("/receive-material", authMiddleware, receiveRawMaterial);

// @route   POST /api/manufacturer/processing-event
// @desc    Create a new processing event
// @access  Private (Manufacturer only)
router.post("/processing-event", authMiddleware, createProcessingEvent);

// @route   GET /api/manufacturer/processing-events
// @desc    Get all processing events by the manufacturer
// @access  Private (Manufacturer only)
// @query   page, limit for pagination
router.get("/processing-events", authMiddleware, getMyProcessingEvents);

// @route   GET /api/manufacturer/processing-events/:processingId
// @desc    Get processing details for a specific batch
// @access  Private (Manufacturer only)
router.get("/processing-events/:processingId", authMiddleware, getProcessingDetails);

// @route   PUT /api/manufacturer/processing-events/:processingId
// @desc    Update processing event with additional information
// @access  Private (Manufacturer only)
router.put("/processing-events/:processingId", authMiddleware, updateProcessingEvent);

// @route   GET /api/manufacturer/inventory
// @desc    Get raw material inventory for the manufacturer
// @access  Private (Manufacturer only)
// @query   status, page, limit for filtering and pagination
router.get("/inventory", authMiddleware, getInventory);

// @route   POST /api/manufacturer/processing-events/:processingId/certificate
// @desc    Generate processing certificate
// @access  Private (Manufacturer only)
router.post("/processing-events/:processingId/certificate", authMiddleware, generateProcessingCertificate);

module.exports = router;
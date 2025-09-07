const express = require("express");
const router = express.Router();

// Import the customer controller functions
const {
  scanQRCode,
  getProductHistory,
  verifyAuthenticity,
  reportIssues
} = require("../controllers/customerController");

// Customer registration removed - customers don't need accounts
// They can scan QR codes directly without authentication

// @route   POST /api/customer/scan-qr
// @desc    Scan QR code to get product information
// @access  Public (No authentication required)
router.post("/scan-qr", scanQRCode);

// @route   GET /api/customer/product-history/:batchId
// @desc    Get product history for a specific batch
// @access  Public (No authentication required)
router.get("/product-history/:batchId", getProductHistory);

// @route   POST /api/customer/verify-authenticity
// @desc    Verify product authenticity
// @access  Public (No authentication required)
router.post("/verify-authenticity", verifyAuthenticity);

// @route   POST /api/customer/report-issue
// @desc    Report issues with a product
// @access  Public (No authentication required)
router.post("/report-issue", reportIssues);

module.exports = router;

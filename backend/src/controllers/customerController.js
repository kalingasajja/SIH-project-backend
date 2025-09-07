/**
 * Customer Controller for Consumer Interactions
 * Handles consumer-facing operations for product verification and information
 */

const bcrypt = require("bcryptjs");
const { generateToken } = require("../auth/jwt");
// TODO: Import blockchain interface when implemented
// const { queryBatchHistory, queryBatchById } = require("../blockchain/blockchainInterface");
// TODO: Import utility functions when implemented
// const { validateQRData, generateConsumerQR } = require("../utils/qrGenerator");
// const { formatSuccessResponse, formatErrorResponse } = require("../utils/responseFormatter");

// In-memory storage for demonstration (replace with database in production)
let customers = [];
let productVerifications = [];
let consumerReports = [];

// Customer registration removed - customers don't need accounts
// They can scan QR codes directly without authentication

/**
 * Scan QR code to get product information (Public endpoint - no authentication required)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const scanQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: "QR code data is required"
      });
    }

    // TODO: Validate QR code data
    // const qrValidation = validateQRData(qrData);
    // if (!qrValidation.isValid) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid QR code format"
    //   });
    // }

    // Parse QR data (simplified for demo)
    let parsedQRData;
    try {
      parsedQRData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR code data format"
      });
    }

    const { batchId, productId, type } = parsedQRData;

    // TODO: Query blockchain for complete batch history
    // const batchHistory = await queryBatchHistory(batchId);
    // const productInfo = await queryBatchById(productId);

    // For demo purposes, create mock data
    const mockBatchHistory = {
      batchId: batchId || "AH_20241201_123456789",
      events: [
        {
          eventType: "COLLECTION",
          timestamp: "2024-12-01T08:00:00Z",
          location: "Farm Location, Kerala",
          farmer: "John Doe",
          species: "Tulsi (Ocimum sanctum)"
        },
        {
          eventType: "PROCESSING",
          timestamp: "2024-12-02T10:00:00Z",
          processor: "Herb Processing Co.",
          method: "Solar Drying"
        },
        {
          eventType: "QUALITY_TEST",
          timestamp: "2024-12-03T14:00:00Z",
          lab: "Quality Lab Inc.",
          results: "PASSED"
        }
      ]
    };

    // Record verification attempt (no customer ID needed)
    const verificationId = `VERIFY_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const verification = {
      verificationId,
      qrData: parsedQRData,
      batchId: batchId || mockBatchHistory.batchId,
      productId: productId || null,
      scanDate: new Date().toISOString(),
      status: "VERIFIED",
      ipAddress: req.ip || req.connection.remoteAddress // Track for analytics
    };

    productVerifications.push(verification);

    res.status(200).json({
      success: true,
      message: "QR code scanned successfully",
      data: {
        verificationId: verification.verificationId,
        batchId: mockBatchHistory.batchId,
        productInfo: {
          species: "Tulsi (Ocimum sanctum)",
          origin: "Kerala, India",
          collectionDate: "2024-12-01",
          processingDate: "2024-12-02",
          qualityStatus: "PASSED"
        },
        supplyChainHistory: mockBatchHistory.events,
        authenticity: {
          verified: true,
          verificationDate: verification.scanDate
        }
      }
    });

  } catch (error) {
    console.error("QR code scan error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while scanning QR code",
      error: error.message
    });
  }
};

/**
 * Get product history for a specific batch (Public endpoint - no authentication required)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getProductHistory = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID is required"
      });
    }

    // TODO: Query blockchain for batch history
    // const batchHistory = await queryBatchHistory(batchId);

    // For demo purposes, create mock data
    const mockHistory = {
      batchId,
      productName: "Tulsi (Ocimum sanctum)",
      completeHistory: [
        {
          eventType: "COLLECTION",
          timestamp: "2024-12-01T08:00:00Z",
          location: "Farm Location, Kerala",
          coordinates: { latitude: 10.8505, longitude: 76.2711 },
          farmer: {
            name: "John Doe",
            license: "FARM123456",
            contact: "+91-9876543210"
          },
          species: {
            botanicalName: "Ocimum sanctum",
            commonName: "Tulsi",
            partUsed: "Leaves"
          },
          quality: {
            moisture: "12%",
            color: "Green",
            aroma: "Strong"
          }
        },
        {
          eventType: "PROCESSING",
          timestamp: "2024-12-02T10:00:00Z",
          processor: {
            name: "Herb Processing Co.",
            license: "GMP789012",
            location: "Kochi, Kerala"
          },
          method: "Solar Drying",
          temperature: "40-45°C",
          duration: "48 hours",
          yield: "85%"
        },
        {
          eventType: "QUALITY_TEST",
          timestamp: "2024-12-03T14:00:00Z",
          lab: {
            name: "Quality Lab Inc.",
            accreditation: "NABL123456",
            location: "Bangalore, Karnataka"
          },
          tests: [
            { name: "Moisture Content", result: "11.5%", status: "PASS" },
            { name: "Pesticide Residue", result: "Not Detected", status: "PASS" },
            { name: "Heavy Metals", result: "Within Limits", status: "PASS" }
          ],
          overallStatus: "PASSED"
        },
        {
          eventType: "TRANSPORTATION",
          timestamp: "2024-12-04T09:00:00Z",
          transporter: "Safe Transport Ltd.",
          route: "Kochi to Bangalore",
          vehicle: "Refrigerated Truck",
          temperature: "15-20°C",
          duration: "8 hours"
        },
        {
          eventType: "DISTRIBUTION",
          timestamp: "2024-12-05T11:00:00Z",
          distributor: "Herb Distributors",
          storage: "Climate Controlled Warehouse",
          location: "Bangalore, Karnataka"
        },
        {
          eventType: "RETAIL_SALE",
          timestamp: "2024-12-06T15:00:00Z",
          retailer: "Ayurvedic Store",
          location: "Mall Road, Bangalore",
          price: "₹150 per 100g"
        }
      ],
      timeline: {
        totalDuration: "5 days",
        firstEvent: "2024-12-01T08:00:00Z",
        lastEvent: "2024-12-06T15:00:00Z"
      }
    };

    res.status(200).json({
      success: true,
      message: "Product history retrieved successfully",
      data: mockHistory
    });

  } catch (error) {
    console.error("Get product history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving product history",
      error: error.message
    });
  }
};

/**
 * Verify product authenticity (Public endpoint - no authentication required)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const verifyAuthenticity = async (req, res) => {
  try {
    const { batchId, productId, verificationCode } = req.body;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID is required"
      });
    }

    // TODO: Implement actual authenticity verification
    // const authenticityCheck = await verifyProductAuthenticity(batchId, productId, verificationCode);

    // For demo purposes, create mock verification
    const mockVerification = {
      batchId,
      productId: productId || null,
      verificationCode: verificationCode || null,
      isAuthentic: true,
      verificationDate: new Date().toISOString(),
      confidence: 95,
      details: {
        blockchainVerified: true,
        supplyChainComplete: true,
        qualityTestsPassed: true,
        noTamperingDetected: true
      }
    };

    res.status(200).json({
      success: true,
      message: "Product authenticity verified",
      data: mockVerification
    });

  } catch (error) {
    console.error("Authenticity verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authenticity verification",
      error: error.message
    });
  }
};

/**
 * Report issues with a product (Public endpoint - no authentication required)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const reportIssues = async (req, res) => {
  try {
    const {
      batchId,
      productId,
      issueType,
      description,
      severity,
      contactInfo
    } = req.body;

    // Validate required fields
    if (!batchId || !issueType || !description) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        requiredFields: ["batchId", "issueType", "description"]
      });
    }

    // Generate report ID
    const reportId = `REPORT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Create issue report (no customer ID needed)
    const issueReport = {
      reportId,
      batchId,
      productId: productId || null,
      issueType,
      description,
      severity: severity || "MEDIUM",
      contactInfo: contactInfo || {},
      reportDate: new Date().toISOString(),
      status: "PENDING",
      resolution: null,
      ipAddress: req.ip || req.connection.remoteAddress // Track for analytics
    };

    // Save issue report
    consumerReports.push(issueReport);

    console.log("Issue report created:", reportId);

    res.status(201).json({
      success: true,
      message: "Issue report submitted successfully",
      data: {
        reportId: issueReport.reportId,
        batchId: issueReport.batchId,
        issueType: issueReport.issueType,
        reportDate: issueReport.reportDate,
        status: issueReport.status
      }
    });

  } catch (error) {
    console.error("Issue reporting error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while reporting issue",
      error: error.message
    });
  }
};

// Customer profile management functions removed
// Customers don't need accounts - they can scan QR codes directly

module.exports = {
  scanQRCode,
  getProductHistory,
  verifyAuthenticity,
  reportIssues
};

/**
 * Tester Controller for Quality Testing Labs
 * Handles quality testing operations for Ayurvedic herbs
 */

const bcrypt = require("bcryptjs");
const { generateToken } = require("../auth/jwt");
// TODO: Import blockchain interface when implemented
// const { invokeQualityTestEvent, queryBatchHistory } = require("../blockchain/blockchainInterface");
// TODO: Import utility functions when implemented
// const { validateLabAccreditation, generateTestCertificate } = require("../utils/testValidator");
// const { formatSuccessResponse, formatErrorResponse } = require("../utils/responseFormatter");

// In-memory storage for demonstration (replace with database in production)

let qualityTestEvents = [];
let testSamples = [];

/**
 * Register a new testing lab in the system
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */

/**
 * Receive test sample for quality testing
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const receiveTestSample = async (req, res) => {
  try {
    const {
      batchId,
      sampleQuantity,
      sampleCondition,
      testRequirements,
      senderInfo,
      expectedTests
    } = req.body;

    const testerId = req.user?.id;
    const testerInfo = testers.find(t => t.testerId === testerId);
    
    if (!testerInfo) {
      return res.status(404).json({
        success: false,
        message: "Testing lab not found. Please ensure you are registered."
      });
    }

    // Validate required fields
    if (!batchId || !sampleQuantity || !testRequirements) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        requiredFields: ["batchId", "sampleQuantity", "testRequirements"]
      });
    }

    // Generate sample ID
    const sampleId = `SAMPLE_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Create test sample entry
    const testSample = {
      sampleId,
      batchId,
      testerId,
      labName: testerInfo.labName,
      sampleQuantity,
      sampleCondition: sampleCondition || "Good",
      testRequirements: testRequirements || [],
      expectedTests: expectedTests || [],
      senderInfo: senderInfo || {},
      receivedDate: new Date().toISOString(),
      status: "RECEIVED",
      testResults: null,
      completedTests: []
    };

    // Save test sample
    testSamples.push(testSample);

    console.log("Test sample received:", sampleId);

    res.status(201).json({
      success: true,
      message: "Test sample received successfully",
      data: {
        sampleId: testSample.sampleId,
        batchId: testSample.batchId,
        receivedDate: testSample.receivedDate,
        status: testSample.status
      }
    });

  } catch (error) {
    console.error("Receive test sample error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while receiving test sample",
      error: error.message
    });
  }
};

/**
 * Conduct quality tests on received sample
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const conductQualityTests = async (req, res) => {
  try {
    const { sampleId } = req.params;
    const {
      testResults,
      testParameters,
      testMethods,
      equipmentUsed,
      testDuration,
      qualityStandards
    } = req.body;

    const testerId = req.user?.id;
    const testerInfo = testers.find(t => t.testerId === testerId);
    
    if (!testerInfo) {
      return res.status(404).json({
        success: false,
        message: "Testing lab not found"
      });
    }

    // Find the test sample
    const sampleIndex = testSamples.findIndex(sample => 
      sample.sampleId === sampleId && sample.testerId === testerId
    );

    if (sampleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Test sample not found or you don't have permission to test it"
      });
    }

    // Check if sample is in RECEIVED status
    if (testSamples[sampleIndex].status !== "RECEIVED") {
      return res.status(400).json({
        success: false,
        message: "Test sample is not in RECEIVED status"
      });
    }

    // Validate required fields
    if (!testResults || !testParameters) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        requiredFields: ["testResults", "testParameters"]
      });
    }

    // Generate test ID
    const testId = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Create quality test event
    const qualityTestEvent = {
      eventType: "QUALITY_TEST",
      batchId: testSamples[sampleIndex].batchId,
      testId,
      sampleId,
      timestamp: new Date().toISOString(),
      labIdentity: {
        testerId: testerInfo.testerId,
        labName: testerInfo.labName,
        nablAccreditation: testerInfo.nablAccreditation,
        labLocation: testerInfo.labLocation
      },
      testDetails: {
        testParameters: testParameters || {},
        testMethods: testMethods || [],
        equipmentUsed: equipmentUsed || [],
        testDuration: testDuration || "Not specified",
        qualityStandards: qualityStandards || [],
        testDate: new Date().toISOString()
      },
      testResults: testResults || {},
      certifications: testerInfo.certifications || [],
      blockchainTxId: null, // Will be set after blockchain transaction
      status: "COMPLETED",
      createdAt: new Date().toISOString()
    };

    // TODO: Submit to blockchain
    // const blockchainResult = await invokeQualityTestEvent(qualityTestEvent);
    // qualityTestEvent.blockchainTxId = blockchainResult.txId;

    // Save quality test event
    qualityTestEvents.push(qualityTestEvent);

    // Update test sample status
    testSamples[sampleIndex].status = "TESTED";
    testSamples[sampleIndex].testResults = testResults;
    testSamples[sampleIndex].completedTests = testParameters;
    testSamples[sampleIndex].testId = testId;
    testSamples[sampleIndex].testedDate = new Date().toISOString();

    console.log("Quality test completed:", testId);

    res.status(201).json({
      success: true,
      message: "Quality test completed successfully",
      data: {
        batchId: qualityTestEvent.batchId,
        testId: qualityTestEvent.testId,
        sampleId: qualityTestEvent.sampleId,
        eventType: qualityTestEvent.eventType,
        timestamp: qualityTestEvent.timestamp,
        status: qualityTestEvent.status
      }
    });

  } catch (error) {
    console.error("Quality test error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during quality testing",
      error: error.message
    });
  }
};

/**
 * Generate test certificate
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const generateTestCertificate = async (req, res) => {
  try {
    const { testId } = req.params;
    const testerId = req.user?.id;

    // Find the quality test event
    const testEvent = qualityTestEvents.find(event => 
      event.testId === testId && event.labIdentity.testerId === testerId
    );

    if (!testEvent) {
      return res.status(404).json({
        success: false,
        message: "Test event not found or you don't have permission to generate certificate"
      });
    }

    // Generate certificate data
    const certificate = {
      certificateId: `CERT_TEST_${Date.now()}`,
      testId: testEvent.testId,
      batchId: testEvent.batchId,
      sampleId: testEvent.sampleId,
      labInfo: testEvent.labIdentity,
      testDetails: testEvent.testDetails,
      testResults: testEvent.testResults,
      issuedDate: new Date().toISOString(),
      validityPeriod: "1 year",
      certificateType: "QUALITY_TEST_CERTIFICATE",
      status: "ACTIVE"
    };

    // TODO: Generate actual PDF certificate
    // const pdfCertificate = await generateTestCertificatePDF(certificate);

    res.status(200).json({
      success: true,
      message: "Test certificate generated successfully",
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

/**
 * Update test results
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const updateTestResults = async (req, res) => {
  try {
    const { testId } = req.params;
    const testerId = req.user?.id;
    const updateData = req.body;

    // Find the quality test event
    const eventIndex = qualityTestEvents.findIndex(event => 
      event.testId === testId && event.labIdentity.testerId === testerId
    );

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Test event not found or you don't have permission to update it"
      });
    }

    // Check if test is still in progress
    if (qualityTestEvents[eventIndex].status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Cannot update completed test results"
      });
    }

    // Define allowed fields for update
    const allowedUpdates = ['testResults', 'testDetails', 'testParameters'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field]) {
        updates[field] = updateData[field];
      }
    });

    // Apply updates
    qualityTestEvents[eventIndex] = {
      ...qualityTestEvents[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: "Test results updated successfully",
      data: {
        testId,
        updatedFields: Object.keys(updates),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Update test results error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating test results",
      error: error.message
    });
  }
};

/**
 * Validate lab accreditation
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const validateLabAccreditation = async (req, res) => {
  try {
    const { nablNumber } = req.params;
    const testerId = req.user?.id;

    // Find the tester
    const tester = testers.find(t => t.testerId === testerId);
    
    if (!tester) {
      return res.status(404).json({
        success: false,
        message: "Testing lab not found"
      });
    }

    // Check if NABL number matches
    const isAccredited = tester.nablAccreditation === nablNumber;

    // TODO: Implement actual NABL validation API call
    // const nablValidation = await validateNABLAccreditation(nablNumber);

    res.status(200).json({
      success: true,
      message: "Lab accreditation validation completed",
      data: {
        nablNumber,
        isAccredited,
        labName: tester.labName,
        accreditationStatus: isAccredited ? "VALID" : "INVALID",
        validationDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Lab accreditation validation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during accreditation validation",
      error: error.message
    });
  }
};

/**
 * Get all test samples for the testing lab
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getMyTestSamples = async (req, res) => {
  try {
    const testerId = req.user?.id;
    
    // Filter test samples by tester ID
    const myTestSamples = testSamples.filter(sample => 
      sample.testerId === testerId
    );

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedSamples = myTestSamples.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      message: "Test samples retrieved successfully",
      data: {
        testSamples: paginatedSamples,
        pagination: {
          currentPage: page,
          totalSamples: myTestSamples.length,
          totalPages: Math.ceil(myTestSamples.length / limit),
          hasNextPage: endIndex < myTestSamples.length,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get test samples error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving test samples",
      error: error.message
    });
  }
};

/**
 * Get all quality test events by the testing lab
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getMyQualityTests = async (req, res) => {
  try {
    const testerId = req.user?.id;
    
    // Filter quality test events by tester ID
    const myQualityTests = qualityTestEvents.filter(event => 
      event.labIdentity.testerId === testerId
    );

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedTests = myQualityTests.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      message: "Quality tests retrieved successfully",
      data: {
        qualityTests: paginatedTests,
        pagination: {
          currentPage: page,
          totalTests: myQualityTests.length,
          totalPages: Math.ceil(myQualityTests.length / limit),
          hasNextPage: endIndex < myQualityTests.length,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Get quality tests error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving quality tests",
      error: error.message
    });
  }
};

/**
 * Get tester profile information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getTesterProfile = async (req, res) => {
  try {
    const testerId = req.user?.id;
    
    const tester = testers.find(t => t.testerId === testerId);
    
    if (!tester) {
      return res.status(404).json({
        success: false,
        message: "Tester profile not found"
      });
    }

    // Return profile without sensitive information
    const { password, ...testerProfile } = tester;

    res.status(200).json({
      success: true,
      message: "Tester profile retrieved successfully",
      data: testerProfile
    });

  } catch (error) {
    console.error("Get tester profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving tester profile",
      error: error.message
    });
  }
};

module.exports = {
 
  receiveTestSample,
  conductQualityTests,
  generateTestCertificate,
  updateTestResults,
  validateLabAccreditation,
  getMyTestSamples,
  getMyQualityTests,
  getTesterProfile
};

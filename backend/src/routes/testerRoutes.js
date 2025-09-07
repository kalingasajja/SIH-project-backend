const express = require("express");
const router = express.Router();

// Import the tester controller functions
const {
  registerTester,
  receiveTestSample,
  conductQualityTests,
  generateTestCertificate,
  updateTestResults,
  validateLabAccreditation,
  getMyTestSamples,
  getMyQualityTests,
  getTesterProfile
} = require("../controllers/testerController");

// Import the authentication middleware
const authMiddleware = require("../auth/middleware/authMiddleware");

// TODO: Import role middleware when implemented
// const roleMiddleware = require("../auth/middleware/roleMiddleware");

// @route   POST /api/tester/register
// @desc    Register a new testing lab in the system
// @access  Public
router.post("/register", registerTester);

// @route   GET /api/tester/profile
// @desc    Get tester profile information
// @access  Private (Tester only)
router.get("/profile", authMiddleware, getTesterProfile);

// @route   POST /api/tester/receive-sample
// @desc    Receive test sample for quality testing
// @access  Private (Tester only)
router.post("/receive-sample", authMiddleware, receiveTestSample);

// @route   POST /api/tester/conduct-test/:sampleId
// @desc    Conduct quality tests on received sample
// @access  Private (Tester only)
router.post("/conduct-test/:sampleId", authMiddleware, conductQualityTests);

// @route   PUT /api/tester/test-results/:testId
// @desc    Update test results
// @access  Private (Tester only)
router.put("/test-results/:testId", authMiddleware, updateTestResults);

// @route   POST /api/tester/test-certificate/:testId
// @desc    Generate test certificate
// @access  Private (Tester only)
router.post("/test-certificate/:testId", authMiddleware, generateTestCertificate);

// @route   GET /api/tester/validate-accreditation/:nablNumber
// @desc    Validate lab accreditation
// @access  Private (Tester only)
router.get("/validate-accreditation/:nablNumber", authMiddleware, validateLabAccreditation);

// @route   GET /api/tester/test-samples
// @desc    Get all test samples for the testing lab
// @access  Private (Tester only)
// @query   page, limit for pagination
router.get("/test-samples", authMiddleware, getMyTestSamples);

// @route   GET /api/tester/quality-tests
// @desc    Get all quality test events by the testing lab
// @access  Private (Tester only)
// @query   page, limit for pagination
router.get("/quality-tests", authMiddleware, getMyQualityTests);

module.exports = router;

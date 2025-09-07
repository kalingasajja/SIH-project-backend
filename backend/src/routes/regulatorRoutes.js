const express = require("express");
const router = express.Router();

// Import the regulator controller functions
const {
  registerRegulator,
  auditSupplyChain,
  generateComplianceReports,
  investigateIssues,
  validateCertifications,
  monitorQualityStandards,
  getAuditReports,
  getRegulatorProfile
} = require("../controllers/regulatorController");

// Import the authentication middleware
const authMiddleware = require("../auth/middleware/authMiddleware");

// TODO: Import role middleware when implemented
// const roleMiddleware = require("../auth/middleware/roleMiddleware");

// @route   POST /api/regulator/register
// @desc    Register a new regulator in the system
// @access  Public
router.post("/register", registerRegulator);

// @route   GET /api/regulator/profile
// @desc    Get regulator profile information
// @access  Private (Regulator only)
router.get("/profile", authMiddleware, getRegulatorProfile);

// @route   POST /api/regulator/audit-supply-chain
// @desc    Audit supply chain for compliance
// @access  Private (Regulator only)
router.post("/audit-supply-chain", authMiddleware, auditSupplyChain);

// @route   POST /api/regulator/compliance-reports
// @desc    Generate compliance reports
// @access  Private (Regulator only)
router.post("/compliance-reports", authMiddleware, generateComplianceReports);

// @route   POST /api/regulator/investigate-issues
// @desc    Investigate specific issues
// @access  Private (Regulator only)
router.post("/investigate-issues", authMiddleware, investigateIssues);

// @route   POST /api/regulator/validate-certifications
// @desc    Validate certifications
// @access  Private (Regulator only)
router.post("/validate-certifications", authMiddleware, validateCertifications);

// @route   POST /api/regulator/monitor-quality-standards
// @desc    Monitor quality standards
// @access  Private (Regulator only)
router.post("/monitor-quality-standards", authMiddleware, monitorQualityStandards);

// @route   GET /api/regulator/audit-reports
// @desc    Get all audit reports
// @access  Private (Regulator only)
// @query   page, limit for pagination
router.get("/audit-reports", authMiddleware, getAuditReports);

module.exports = router;

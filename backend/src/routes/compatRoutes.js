const express = require("express");
const router = express.Router();

const {
  createHerbBatchCompat,
  recordProcessingStepCompat,
  recordQualityTestCompat,
  formulateProductCompat,
  transferCustodyCompat,
  getDebugEvents
} = require("../controllers/compatController");

// Frontend-compat endpoints that accept UI field names as-is
// These endpoints are intentionally open (no JWT) to match current frontend
router.post("/createHerbBatch", createHerbBatchCompat);
router.post("/recordProcessingStep", recordProcessingStepCompat);
router.post("/recordQualityTest", recordQualityTestCompat);
router.post("/formulateProduct", formulateProductCompat);
router.post("/transferCustody", transferCustodyCompat);

// Debug endpoint to see all received events
router.get("/debug-events", getDebugEvents);

module.exports = router;



const express = require("express");
const router = express.Router();

const authMiddleware = require("../auth/middleware/authMiddleware");
const {
  initiateCustodyTransfer,
  acceptCustodyTransfer,
  rejectCustodyTransfer,
  getCustodyHistory,
  verifyCustodyChain,
  createInitialCustody
} = require("../utils/transferCustody");

// Create initial custody for a batch (owner only)
router.post("/initial", authMiddleware, async (req, res) => {
  const { batchId } = req.body;
  if (!batchId) return res.status(400).json({ success: false, message: "batchId is required" });
  const result = await createInitialCustody(batchId, req.user.id, null, req.body.custodyData || {});
  const status = result.success ? 201 : 400;
  res.status(status).json(result);
});

// Initiate custody transfer
router.post("/initiate", authMiddleware, async (req, res) => {
  const { toUserId, batchId, transferData } = req.body;
  if (!toUserId || !batchId) return res.status(400).json({ success: false, message: "toUserId and batchId are required" });
  const result = await initiateCustodyTransfer(req.user.id, toUserId, batchId, null, transferData || {});
  const status = result.success ? 201 : 400;
  res.status(status).json(result);
});

// Accept custody transfer
router.post("/accept/:transferId", authMiddleware, async (req, res) => {
  const { transferId } = req.params;
  const result = await acceptCustodyTransfer(transferId, req.user.id, null, req.body || {});
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
});

// Reject custody transfer
router.post("/reject/:transferId", authMiddleware, async (req, res) => {
  const { transferId } = req.params;
  const { reason } = req.body;
  const result = await rejectCustodyTransfer(transferId, req.user.id, reason || "No reason provided");
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
});

// Get custody history for a batch
router.get("/history/:batchId", authMiddleware, async (req, res) => {
  const { batchId } = req.params;
  const result = getCustodyHistory(batchId);
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
});

// Verify custody chain integrity
router.get("/verify/:batchId", authMiddleware, async (req, res) => {
  const { batchId } = req.params;
  const result = verifyCustodyChain(batchId);
  const status = result.success ? 200 : 400;
  res.status(status).json(result);
});

module.exports = router;



// Compatibility controller to accept frontend field names as-is, log, store in-memory, and send to blockchain

const blockchainMapper = require('../services/blockchainMapper');

let compatStore = {
  herbBatches: [],
  processingSteps: [],
  qualityTests: [],
  formulations: [],
  custodyTransfers: []
};

const ok = (res, message, data) => res.status(200).json({ success: true, message, data });
const bad = (res, message, details = {}) => res.status(400).json({ success: false, message, details });

// POST /api/createHerbBatch
const createHerbBatchCompat = async (req, res) => {
  try {
    const body = req.body || {};
    console.log("[Compat] CreateHerbBatch payload:", body);

    const required = ["batchId", "collectorId", "species", "timestamp", "latitude", "longitude", "initialWeightKg"];
    const missing = required.filter((k) => body[k] === undefined || body[k] === null || body[k] === "");
    if (missing.length) return bad(res, "Missing required fields", { missing });

    const record = {
      eventType: "COLLECTION",
      batchId: body.batchId,
      collectorId: body.collectorId,
      species: body.species,
      timestamp: body.timestamp,
      location: { latitude: body.latitude, longitude: body.longitude },
      initialWeightKg: body.initialWeightKg,
      initialQualityMetrics: body.initialQualityMetrics || {},
      submittedBy: req.user?.email || body.submittedBy || null,
      createdAt: new Date().toISOString()
    };
    
    // Store in-memory
    compatStore.herbBatches.push(record);
    
    // Send to blockchain
    console.log("[Compat] Sending to blockchain...");
    const blockchainResult = await blockchainMapper.sendCollectionEvent(body);
    console.log("[Compat] Blockchain result:", blockchainResult);
    
    return ok(res, "Herb batch recorded", { 
      batchId: record.batchId, 
      record,
      blockchain: blockchainResult
    });
  } catch (e) {
    console.error("[Compat] createHerbBatch error", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/recordProcessingStep
const recordProcessingStepCompat = async (req, res) => {
  try {
    const body = req.body || {};
    console.log("[Compat] RecordProcessingStep payload:", body);

    const required = ["batchId", "stepName", "timestamp"]; // equipmentId and processingParameters optional
    const missing = required.filter((k) => body[k] === undefined || body[k] === null || body[k] === "");
    if (missing.length) return bad(res, "Missing required fields", { missing });

    const record = {
      eventType: "PROCESSING_STEP",
      batchId: body.batchId,
      stepName: body.stepName,
      timestamp: body.timestamp,
      equipmentId: body.equipmentId || null,
      processingParameters: body.processingParameters || {},
      submittedBy: req.user?.email || body.submittedBy || null,
      createdAt: new Date().toISOString()
    };
    
    // Store in-memory
    compatStore.processingSteps.push(record);
    
    // Send to blockchain
    console.log("[Compat] Sending to blockchain...");
    const blockchainResult = await blockchainMapper.sendProcessingEvent(body);
    console.log("[Compat] Blockchain result:", blockchainResult);
    
    return ok(res, "Processing step recorded", { 
      batchId: record.batchId, 
      record,
      blockchain: blockchainResult
    });
  } catch (e) {
    console.error("[Compat] recordProcessingStep error", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/recordQualityTest
const recordQualityTestCompat = async (req, res) => {
  try {
    const body = req.body || {};
    console.log("[Compat] RecordQualityTest payload:", body);

    const required = ["batchId", "testType"]; // certificateHash/url and resultsSummary optional
    const missing = required.filter((k) => body[k] === undefined || body[k] === null || body[k] === "");
    if (missing.length) return bad(res, "Missing required fields", { missing });

    const record = {
      eventType: "QUALITY_TEST",
      batchId: body.batchId,
      testType: body.testType,
      certificateHash: body.certificateHash || null,
      certificateUrl: body.certificateUrl || null,
      resultsSummary: body.resultsSummary || null,
      submittedBy: req.user?.email || body.submittedBy || null,
      createdAt: new Date().toISOString()
    };
    
    // Store in-memory
    compatStore.qualityTests.push(record);
    
    // Send to blockchain
    console.log("[Compat] Sending to blockchain...");
    const blockchainResult = await blockchainMapper.sendQualityTestEvent(body);
    console.log("[Compat] Blockchain result:", blockchainResult);
    
    return ok(res, "Quality test recorded", { 
      batchId: record.batchId, 
      record,
      blockchain: blockchainResult
    });
  } catch (e) {
    console.error("[Compat] recordQualityTest error", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/formulateProduct
const formulateProductCompat = async (req, res) => {
  try {
    const body = req.body || {};
    console.log("[Compat] FormulateProduct payload:", body);

    const required = ["finalProductId", "productName", "formulationDate", "ingredientBatchIds"];
    const missing = required.filter((k) => body[k] === undefined || body[k] === null || body[k] === "");
    if (missing.length) return bad(res, "Missing required fields", { missing });

    const record = {
      eventType: "FORMULATION",
      finalProductId: body.finalProductId,
      productName: body.productName,
      formulationDate: body.formulationDate,
      expiryDate: body.expiryDate || null,
      ingredientBatchIds: Array.isArray(body.ingredientBatchIds) ? body.ingredientBatchIds : [],
      submittedBy: req.user?.email || body.submittedBy || null,
      createdAt: new Date().toISOString()
    };
    
    // Store in-memory
    compatStore.formulations.push(record);
    
    // Send to blockchain
    console.log("[Compat] Sending to blockchain...");
    const blockchainResult = await blockchainMapper.sendFormulationEvent(body);
    console.log("[Compat] Blockchain result:", blockchainResult);
    
    return ok(res, "Product formulation recorded", { 
      finalProductId: record.finalProductId, 
      record,
      blockchain: blockchainResult
    });
  } catch (e) {
    console.error("[Compat] formulateProduct error", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/transferCustody
const transferCustodyCompat = async (req, res) => {
  try {
    const body = req.body || {};
    console.log("[Compat] TransferCustody payload:", body);

    const required = ["toUserId", "batchId"]; // from user inferred from token
    const missing = required.filter((k) => body[k] === undefined || body[k] === null || body[k] === "");
    if (missing.length) return bad(res, "Missing required fields", { missing });

    const record = {
      eventType: "CUSTODY_TRANSFER",
      batchId: body.batchId,
      fromUserId: req.user?.id || body.fromUserId || null,
      toUserId: body.toUserId,
      note: body.note || null,
      createdAt: new Date().toISOString()
    };
    
    // Store in-memory
    compatStore.custodyTransfers.push(record);
    
    // Send to blockchain
    console.log("[Compat] Sending to blockchain...");
    const blockchainResult = await blockchainMapper.sendCustodyTransferEvent(body);
    console.log("[Compat] Blockchain result:", blockchainResult);
    
    return ok(res, "Custody transfer recorded", { 
      transferPreview: record,
      blockchain: blockchainResult
    });
  } catch (e) {
    console.error("[Compat] transferCustody error", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/debug-events - Debug endpoint to see all received events
const getDebugEvents = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "All compatibility events received",
      data: {
        herbBatches: compatStore.herbBatches,
        processingSteps: compatStore.processingSteps,
        qualityTests: compatStore.qualityTests,
        formulations: compatStore.formulations,
        custodyTransfers: compatStore.custodyTransfers,
        summary: {
          totalHerbBatches: compatStore.herbBatches.length,
          totalProcessingSteps: compatStore.processingSteps.length,
          totalQualityTests: compatStore.qualityTests.length,
          totalFormulations: compatStore.formulations.length,
          totalCustodyTransfers: compatStore.custodyTransfers.length
        }
      }
    });
  } catch (e) {
    console.error("[Compat] getDebugEvents error", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createHerbBatchCompat,
  recordProcessingStepCompat,
  recordQualityTestCompat,
  formulateProductCompat,
  transferCustodyCompat,
  getDebugEvents
};



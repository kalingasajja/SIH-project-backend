// Shared in-memory data store for demo/testing

// User stores
const users = [];
const pendingRegistrations = [];

// Role-specific stores
const farmers = [];
const manufacturers = [];
const testers = [];
const regulators = [];

// Event stores
const collectionEvents = [];
const processingEvents = [];
const rawMaterialInventory = [];
const qualityTestEvents = [];
const testSamples = [];
const auditReports = [];
const complianceViolations = [];
const regulatoryAlerts = [];
const productVerifications = [];
const consumerReports = [];

// Custody stores
const custodyRecords = [];
const transferHistory = [];

// Compatibility events (for frontend integration)
const compatEvents = [];

module.exports = {
  // User stores
  users,
  pendingRegistrations,
  
  // Role-specific stores
  farmers,
  manufacturers,
  testers,
  regulators,
  
  // Event stores
  collectionEvents,
  processingEvents,
  rawMaterialInventory,
  qualityTestEvents,
  testSamples,
  auditReports,
  complianceViolations,
  regulatoryAlerts,
  productVerifications,
  consumerReports,
  
  // Custody stores
  custodyRecords,
  transferHistory,
  
  // Compatibility events
  compatEvents
};



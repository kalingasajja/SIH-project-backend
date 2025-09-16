// Mock database service - in production, this would connect to a real database
export interface Processor {
  id: string
  userId: string
  companyName: string
  licenseNumber: string
  licenseType: string
  facilityLocation: string
  equipmentTypes: string[]
  capacity: number
  capacityUnit: string
  qualityCertifications: string[]
  registrationDate: string
}

export interface BatchRecord {
  id: string
  processorId: string
  batchId: string
  rawMaterialSource: string
  processingMethod: string
  temperature: number
  temperatureUnit: string
  duration: number
  durationUnit: string
  outputQuantity: number
  outputUnit: string
  qualityTests: string[]
  processingDate: string
  status: "processing" | "completed" | "quality_check" | "failed"
}

export interface InventoryItem {
  id: string
  processorId: string
  batchId: string
  productName: string
  productType: string
  currentStock: number
  unit: string
  expiryDate: string
  location: string
  minStockLevel: number
  maxStockLevel: number
  costPerUnit: number
  lastUpdated: string
  status: "in_stock" | "low_stock" | "out_of_stock" | "expired"
}

export interface StockMovement {
  id: string
  inventoryItemId: string
  type: "in" | "out" | "adjustment"
  quantity: number
  reason: string
  date: string
  userId: string
}

export interface QualityTest {
  id: string
  batchId: string
  testType: string
  testDate: string
  testerId: string
  parameters: QualityParameter[]
  overallResult: "pass" | "fail" | "pending"
  notes: string
  complianceStandards: string[]
  correctiveActions?: string[]
  status: "scheduled" | "in_progress" | "completed" | "rejected"
}

export interface QualityParameter {
  name: string
  expectedValue: string
  actualValue: string
  unit: string
  result: "pass" | "fail" | "within_range"
  tolerance: string
}

export interface ComplianceReport {
  id: string
  reportDate: string
  reportType: string
  batchesTested: number
  passRate: number
  failedBatches: string[]
  complianceStandards: string[]
  generatedBy: string
  auditTrail: AuditEntry[]
}

export interface AuditEntry {
  id: string
  timestamp: string
  action: string
  userId: string
  details: string
  batchId?: string
  testId?: string
}

export interface Shipment {
  id: string
  processorId: string
  distributorId: string
  batchIds: string[]
  shipmentDate: string
  estimatedDelivery: string
  actualDelivery?: string
  status: "preparing" | "shipped" | "in_transit" | "delivered" | "delayed" | "returned"
  trackingNumber: string
  destination: ShipmentDestination
  items: ShipmentItem[]
  carrier: string
  totalValue: number
  notes: string
  returnReason?: string
}

export interface ShipmentDestination {
  companyName: string
  contactPerson: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
}

export interface ShipmentItem {
  inventoryItemId: string
  productName: string
  batchId: string
  quantity: number
  unit: string
  unitPrice: number
}

export interface DeliveryUpdate {
  id: string
  shipmentId: string
  timestamp: string
  location: string
  status: string
  notes: string
  updatedBy: string
}

export interface Farmer {
  id: string
  userId: string
  name: string
  contactInfo: {
    phone: string
    email: string
    address: string
  }
  farmLocation: {
    gps: string
    address: string
    area: number
    areaUnit: string
  }
  herbTypes: string[]
  experience: number
  certifications: string[]
  registrationDate: string
  status: "pending" | "approved" | "rejected"
}

export interface HerbCollection {
  id: string
  farmerId: string
  herbName: string
  quantity: number
  quantityUnit: string
  harvestDate: string
  location: string
  qualityGrade: "A" | "B" | "C"
  photos: string[]
  status: "pending" | "approved" | "rejected"
  processorId?: string
  rejectionReason?: string
  submissionDate: string
  approvalDate?: string
}

export interface FarmerNotification {
  id: string
  farmerId: string
  type: "approval" | "rejection" | "update" | "payment"
  title: string
  message: string
  relatedId?: string
  relatedType?: "collection" | "registration" | "batch"
  isRead: boolean
  createdDate: string
}

class DatabaseService {
  private processors: Processor[] = []
  private batches: BatchRecord[] = []
  private inventory: InventoryItem[] = []
  private stockMovements: StockMovement[] = []
  private qualityTests: QualityTest[] = []
  private complianceReports: ComplianceReport[] = []
  private auditTrail: AuditEntry[] = []
  private shipments: Shipment[] = []
  private deliveryUpdates: DeliveryUpdate[] = []
  private farmers: Farmer[] = []
  private herbCollections: HerbCollection[] = []
  private farmerNotifications: FarmerNotification[] = []

  constructor() {
    this.initializeDefaultData()
  }

  private initializeDefaultData() {
    // Create default farmer profile for Raj Farmer
    const defaultFarmer: Farmer = {
      id: "farmer_raj_001",
      userId: "farmer",
      name: "Raj Farmer",
      contactInfo: {
        phone: "+91 98765 43210",
        email: "farmer@ayurtrace.com",
        address: "Village Herbal Gardens, Uttarakhand, India",
      },
      farmLocation: {
        gps: "30.0668° N, 79.0193° E",
        address: "Herbal Valley, Dehradun District, Uttarakhand",
        area: 5.2,
        areaUnit: "acres",
      },
      herbTypes: ["Ashwagandha", "Turmeric", "Brahmi", "Neem", "Tulsi"],
      experience: 12,
      certifications: ["Organic Farming Certificate", "Ayurvedic Herb Cultivation License"],
      registrationDate: "2024-01-15T10:30:00Z",
      status: "approved",
    }

    // Default herb collections
    const defaultCollections: HerbCollection[] = [
      {
        id: "herb_001",
        farmerId: "farmer_raj_001",
        herbName: "Ashwagandha",
        quantity: 25,
        quantityUnit: "kg",
        harvestDate: "2024-12-01",
        location: "Field A - North Section",
        qualityGrade: "A",
        photos: ["/fresh-ashwagandha-roots.jpg"],
        status: "approved",
        processorId: "proc_001",
        submissionDate: "2024-12-02T08:00:00Z",
        approvalDate: "2024-12-03T14:30:00Z",
      },
      {
        id: "herb_002",
        farmerId: "farmer_raj_001",
        herbName: "Turmeric",
        quantity: 40,
        quantityUnit: "kg",
        harvestDate: "2024-11-28",
        location: "Field B - South Section",
        qualityGrade: "A",
        photos: ["/fresh-turmeric-rhizomes.jpg"],
        status: "pending",
        submissionDate: "2024-11-29T09:15:00Z",
      },
      {
        id: "herb_003",
        farmerId: "farmer_raj_001",
        herbName: "Brahmi",
        quantity: 15,
        quantityUnit: "kg",
        harvestDate: "2024-11-25",
        location: "Field C - East Section",
        qualityGrade: "B",
        photos: ["/fresh-brahmi-leaves.jpg"],
        status: "rejected",
        rejectionReason: "Moisture content too high. Please dry properly before resubmission.",
        submissionDate: "2024-11-26T11:00:00Z",
      },
    ]

    // Default notifications
    const defaultNotifications: FarmerNotification[] = [
      {
        id: "notif_001",
        farmerId: "farmer_raj_001",
        type: "approval",
        title: "Ashwagandha Collection Approved",
        message:
          "Your Ashwagandha collection (25kg) has been approved and is ready for processing. Payment will be processed within 3-5 business days.",
        relatedId: "herb_001",
        relatedType: "collection",
        isRead: false,
        createdDate: "2024-12-03T14:30:00Z",
      },
      {
        id: "notif_002",
        farmerId: "farmer_raj_001",
        type: "rejection",
        title: "Brahmi Collection Rejected",
        message:
          "Your Brahmi collection has been rejected due to high moisture content. Please dry properly and resubmit for quality approval.",
        relatedId: "herb_003",
        relatedType: "collection",
        isRead: false,
        createdDate: "2024-11-26T16:45:00Z",
      },
      {
        id: "notif_003",
        farmerId: "farmer_raj_001",
        type: "update",
        title: "Turmeric Collection Under Review",
        message:
          "Your Turmeric collection (40kg) is currently under quality review. You will be notified once the assessment is complete.",
        relatedId: "herb_002",
        relatedType: "collection",
        isRead: true,
        createdDate: "2024-11-29T10:00:00Z",
      },
      {
        id: "notif_004",
        farmerId: "farmer_raj_001",
        type: "update",
        title: "New Quality Standards Updated",
        message:
          "Updated quality standards for organic herb certification are now available. Please review the new guidelines in your farmer portal.",
        isRead: true,
        createdDate: "2024-11-20T09:00:00Z",
      },
    ]

    // Only initialize if data doesn't exist
    this.loadFromStorage()
    if (this.farmers.length === 0) {
      this.farmers = [defaultFarmer]
      this.herbCollections = defaultCollections
      this.farmerNotifications = defaultNotifications
      this.saveToStorage()
    }
  }

  // Processor methods
  async saveProcessor(processor: Omit<Processor, "id" | "registrationDate">): Promise<Processor> {
    const newProcessor: Processor = {
      ...processor,
      id: `proc_${Date.now()}`,
      registrationDate: new Date().toISOString(),
    }
    this.processors.push(newProcessor)
    this.saveToStorage()
    return newProcessor
  }

  async getProcessorByUserId(userId: string): Promise<Processor | null> {
    this.loadFromStorage()
    return this.processors.find((p) => p.userId === userId) || null
  }

  async updateProcessor(id: string, updates: Partial<Processor>): Promise<Processor | null> {
    this.loadFromStorage()
    const index = this.processors.findIndex((p) => p.id === id)
    if (index === -1) return null

    this.processors[index] = { ...this.processors[index], ...updates }
    this.saveToStorage()
    return this.processors[index]
  }

  // Batch methods
  async saveBatch(batch: Omit<BatchRecord, "id" | "processingDate">): Promise<BatchRecord> {
    const newBatch: BatchRecord = {
      ...batch,
      id: `batch_${Date.now()}`,
      processingDate: new Date().toISOString(),
    }
    this.batches.push(newBatch)
    this.saveToStorage()
    return newBatch
  }

  async getBatchesByProcessorId(processorId: string): Promise<BatchRecord[]> {
    this.loadFromStorage()
    return this.batches.filter((b) => b.processorId === processorId)
  }

  async getBatchById(id: string): Promise<BatchRecord | null> {
    this.loadFromStorage()
    return this.batches.find((b) => b.id === id) || null
  }

  async updateBatch(id: string, updates: Partial<BatchRecord>): Promise<BatchRecord | null> {
    this.loadFromStorage()
    const index = this.batches.findIndex((b) => b.id === id)
    if (index === -1) return null

    this.batches[index] = { ...this.batches[index], ...updates }
    this.saveToStorage()
    return this.batches[index]
  }

  // Inventory methods
  async saveInventoryItem(item: Omit<InventoryItem, "id" | "lastUpdated" | "status">): Promise<InventoryItem> {
    const newItem: InventoryItem = {
      ...item,
      id: `inv_${Date.now()}`,
      lastUpdated: new Date().toISOString(),
      status: this.calculateStockStatus(item.currentStock, item.minStockLevel, item.expiryDate),
    }
    this.inventory.push(newItem)
    this.saveToStorage()
    return newItem
  }

  async getInventoryByProcessorId(processorId: string): Promise<InventoryItem[]> {
    this.loadFromStorage()
    return this.inventory.filter((item) => item.processorId === processorId)
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
    this.loadFromStorage()
    const index = this.inventory.findIndex((item) => item.id === id)
    if (index === -1) return null

    const updatedItem = {
      ...this.inventory[index],
      ...updates,
      lastUpdated: new Date().toISOString(),
    }
    updatedItem.status = this.calculateStockStatus(
      updatedItem.currentStock,
      updatedItem.minStockLevel,
      updatedItem.expiryDate,
    )

    this.inventory[index] = updatedItem
    this.saveToStorage()
    return updatedItem
  }

  async addStockMovement(movement: Omit<StockMovement, "id" | "date">): Promise<StockMovement> {
    const newMovement: StockMovement = {
      ...movement,
      id: `mov_${Date.now()}`,
      date: new Date().toISOString(),
    }
    this.stockMovements.push(newMovement)

    // Update inventory item stock
    const inventoryItem = this.inventory.find((item) => item.id === movement.inventoryItemId)
    if (inventoryItem) {
      const newStock =
        movement.type === "in"
          ? inventoryItem.currentStock + movement.quantity
          : inventoryItem.currentStock - movement.quantity

      await this.updateInventoryItem(inventoryItem.id, { currentStock: Math.max(0, newStock) })
    }

    this.saveToStorage()
    return newMovement
  }

  async getStockMovements(inventoryItemId?: string): Promise<StockMovement[]> {
    this.loadFromStorage()
    return inventoryItemId
      ? this.stockMovements.filter((mov) => mov.inventoryItemId === inventoryItemId)
      : this.stockMovements
  }

  // Quality Control methods
  async saveQualityTest(test: Omit<QualityTest, "id">): Promise<QualityTest> {
    const newTest: QualityTest = {
      ...test,
      id: `test_${Date.now()}`,
    }
    this.qualityTests.push(newTest)

    // Add audit entry
    await this.addAuditEntry({
      action: "Quality test created",
      userId: test.testerId,
      details: `Test ${test.testType} created for batch ${test.batchId}`,
      batchId: test.batchId,
      testId: newTest.id,
    })

    this.saveToStorage()
    return newTest
  }

  async getQualityTestsByBatch(batchId: string): Promise<QualityTest[]> {
    this.loadFromStorage()
    return this.qualityTests.filter((test) => test.batchId === batchId)
  }

  async getAllQualityTests(): Promise<QualityTest[]> {
    this.loadFromStorage()
    return this.qualityTests
  }

  async updateQualityTest(id: string, updates: Partial<QualityTest>): Promise<QualityTest | null> {
    this.loadFromStorage()
    const index = this.qualityTests.findIndex((test) => test.id === id)
    if (index === -1) return null

    this.qualityTests[index] = { ...this.qualityTests[index], ...updates }

    // Add audit entry
    await this.addAuditEntry({
      action: "Quality test updated",
      userId: updates.testerId || "system",
      details: `Test ${this.qualityTests[index].testType} updated`,
      testId: id,
    })

    this.saveToStorage()
    return this.qualityTests[index]
  }

  async saveComplianceReport(report: Omit<ComplianceReport, "id">): Promise<ComplianceReport> {
    const newReport: ComplianceReport = {
      ...report,
      id: `report_${Date.now()}`,
    }
    this.complianceReports.push(newReport)

    // Add audit entry
    await this.addAuditEntry({
      action: "Compliance report generated",
      userId: report.generatedBy,
      details: `${report.reportType} report generated with ${report.batchesTested} batches tested`,
    })

    this.saveToStorage()
    return newReport
  }

  async getComplianceReports(): Promise<ComplianceReport[]> {
    this.loadFromStorage()
    return this.complianceReports
  }

  async addAuditEntry(entry: Omit<AuditEntry, "id" | "timestamp">): Promise<AuditEntry> {
    const newEntry: AuditEntry = {
      ...entry,
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }
    this.auditTrail.push(newEntry)
    this.saveToStorage()
    return newEntry
  }

  async getAuditTrail(limit?: number): Promise<AuditEntry[]> {
    this.loadFromStorage()
    const sorted = this.auditTrail.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return limit ? sorted.slice(0, limit) : sorted
  }

  // Distribution methods
  async saveShipment(shipment: Omit<Shipment, "id">): Promise<Shipment> {
    const newShipment: Shipment = {
      ...shipment,
      id: `ship_${Date.now()}`,
    }
    this.shipments.push(newShipment)

    // Update inventory for shipped items
    for (const item of shipment.items) {
      const inventoryItem = this.inventory.find((inv) => inv.id === item.inventoryItemId)
      if (inventoryItem) {
        await this.updateInventoryItem(inventoryItem.id, {
          currentStock: Math.max(0, inventoryItem.currentStock - item.quantity),
        })
      }
    }

    // Add audit entry
    await this.addAuditEntry({
      action: "Shipment created",
      userId: shipment.distributorId,
      details: `Shipment ${newShipment.trackingNumber} created with ${shipment.items.length} items`,
    })

    this.saveToStorage()
    return newShipment
  }

  async getShipmentsByDistributor(distributorId: string): Promise<Shipment[]> {
    this.loadFromStorage()
    return this.shipments.filter((shipment) => shipment.distributorId === distributorId)
  }

  async getShipmentsByProcessor(processorId: string): Promise<Shipment[]> {
    this.loadFromStorage()
    return this.shipments.filter((shipment) => shipment.processorId === processorId)
  }

  async getAllShipments(): Promise<Shipment[]> {
    this.loadFromStorage()
    return this.shipments
  }

  async updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment | null> {
    this.loadFromStorage()
    const index = this.shipments.findIndex((shipment) => shipment.id === id)
    if (index === -1) return null

    this.shipments[index] = { ...this.shipments[index], ...updates }

    // Add audit entry
    await this.addAuditEntry({
      action: "Shipment updated",
      userId: updates.distributorId || "system",
      details: `Shipment ${this.shipments[index].trackingNumber} status updated to ${updates.status}`,
    })

    this.saveToStorage()
    return this.shipments[index]
  }

  async addDeliveryUpdate(update: Omit<DeliveryUpdate, "id">): Promise<DeliveryUpdate> {
    const newUpdate: DeliveryUpdate = {
      ...update,
      id: `update_${Date.now()}`,
    }
    this.deliveryUpdates.push(newUpdate)

    // Update shipment status if needed
    const shipment = this.shipments.find((s) => s.id === update.shipmentId)
    if (shipment && update.status === "delivered") {
      await this.updateShipment(shipment.id, {
        status: "delivered",
        actualDelivery: update.timestamp,
      })
    }

    this.saveToStorage()
    return newUpdate
  }

  async getDeliveryUpdates(shipmentId: string): Promise<DeliveryUpdate[]> {
    this.loadFromStorage()
    return this.deliveryUpdates
      .filter((update) => update.shipmentId === shipmentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  // Farmer methods
  async saveFarmer(farmer: Omit<Farmer, "id" | "registrationDate" | "status">): Promise<Farmer> {
    const newFarmer: Farmer = {
      ...farmer,
      id: `farmer_${Date.now()}`,
      registrationDate: new Date().toISOString(),
      status: "pending",
    }
    this.farmers.push(newFarmer)

    // Create welcome notification
    await this.addFarmerNotification({
      farmerId: newFarmer.id,
      type: "update",
      title: "Registration Submitted",
      message: "Your farmer registration has been submitted and is under review. You will be notified once approved.",
    })

    this.saveToStorage()
    return newFarmer
  }

  async getFarmerByUserId(userId: string): Promise<Farmer | null> {
    this.loadFromStorage()
    return this.farmers.find((f) => f.userId === userId) || null
  }

  async updateFarmer(id: string, updates: Partial<Farmer>): Promise<Farmer | null> {
    this.loadFromStorage()
    const index = this.farmers.findIndex((f) => f.id === id)
    if (index === -1) return null

    this.farmers[index] = { ...this.farmers[index], ...updates }
    this.saveToStorage()
    return this.farmers[index]
  }

  // Herb Collection methods
  async saveHerbCollection(
    collection: Omit<HerbCollection, "id" | "submissionDate" | "status">,
  ): Promise<HerbCollection> {
    const newCollection: HerbCollection = {
      ...collection,
      id: `herb_${Date.now()}`,
      submissionDate: new Date().toISOString(),
      status: "pending",
    }
    this.herbCollections.push(newCollection)

    // Create notification
    await this.addFarmerNotification({
      farmerId: collection.farmerId,
      type: "update",
      title: "Collection Submitted",
      message: `Your ${collection.herbName} collection has been submitted for review.`,
      relatedId: newCollection.id,
      relatedType: "collection",
    })

    this.saveToStorage()
    return newCollection
  }

  async getHerbCollectionsByFarmerId(farmerId: string): Promise<HerbCollection[]> {
    this.loadFromStorage()
    return this.herbCollections.filter((c) => c.farmerId === farmerId)
  }

  async getAllHerbCollections(): Promise<HerbCollection[]> {
    this.loadFromStorage()
    return this.herbCollections
  }

  async updateHerbCollection(id: string, updates: Partial<HerbCollection>): Promise<HerbCollection | null> {
    this.loadFromStorage()
    const index = this.herbCollections.findIndex((c) => c.id === id)
    if (index === -1) return null

    const oldCollection = this.herbCollections[index]
    this.herbCollections[index] = { ...oldCollection, ...updates }

    // Create notification if status changed
    if (updates.status && updates.status !== oldCollection.status) {
      const notificationType = updates.status === "approved" ? "approval" : "rejection"
      const message =
        updates.status === "approved"
          ? `Your ${oldCollection.herbName} collection has been approved and is ready for processing.`
          : `Your ${oldCollection.herbName} collection has been rejected. ${updates.rejectionReason || "Please contact support for details."}`

      await this.addFarmerNotification({
        farmerId: oldCollection.farmerId,
        type: notificationType,
        title: `Collection ${updates.status === "approved" ? "Approved" : "Rejected"}`,
        message,
        relatedId: id,
        relatedType: "collection",
      })
    }

    this.saveToStorage()
    return this.herbCollections[index]
  }

  // Farmer Notification methods
  async addFarmerNotification(
    notification: Omit<FarmerNotification, "id" | "isRead" | "createdDate">,
  ): Promise<FarmerNotification> {
    const newNotification: FarmerNotification = {
      ...notification,
      id: `notif_${Date.now()}`,
      isRead: false,
      createdDate: new Date().toISOString(),
    }
    this.farmerNotifications.push(newNotification)
    this.saveToStorage()
    return newNotification
  }

  async getFarmerNotifications(farmerId: string): Promise<FarmerNotification[]> {
    this.loadFromStorage()
    return this.farmerNotifications
      .filter((n) => n.farmerId === farmerId)
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
  }

  async markNotificationAsRead(id: string): Promise<void> {
    this.loadFromStorage()
    const notification = this.farmerNotifications.find((n) => n.id === id)
    if (notification) {
      notification.isRead = true
      this.saveToStorage()
    }
  }

  private calculateStockStatus(currentStock: number, minStock: number, expiryDate: string): InventoryItem["status"] {
    const now = new Date()
    const expiry = new Date(expiryDate)

    if (expiry <= now) return "expired"
    if (currentStock === 0) return "out_of_stock"
    if (currentStock <= minStock) return "low_stock"
    return "in_stock"
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("ayurtrace_processors", JSON.stringify(this.processors))
      localStorage.setItem("ayurtrace_batches", JSON.stringify(this.batches))
      localStorage.setItem("ayurtrace_inventory", JSON.stringify(this.inventory))
      localStorage.setItem("ayurtrace_stock_movements", JSON.stringify(this.stockMovements))
      localStorage.setItem("ayurtrace_quality_tests", JSON.stringify(this.qualityTests))
      localStorage.setItem("ayurtrace_compliance_reports", JSON.stringify(this.complianceReports))
      localStorage.setItem("ayurtrace_audit_trail", JSON.stringify(this.auditTrail))
      localStorage.setItem("ayurtrace_shipments", JSON.stringify(this.shipments))
      localStorage.setItem("ayurtrace_delivery_updates", JSON.stringify(this.deliveryUpdates))
      localStorage.setItem("ayurtrace_farmers", JSON.stringify(this.farmers))
      localStorage.setItem("ayurtrace_herb_collections", JSON.stringify(this.herbCollections))
      localStorage.setItem("ayurtrace_farmer_notifications", JSON.stringify(this.farmerNotifications))
    }
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const processorsData = localStorage.getItem("ayurtrace_processors")
      const batchesData = localStorage.getItem("ayurtrace_batches")
      const inventoryData = localStorage.getItem("ayurtrace_inventory")
      const stockMovementsData = localStorage.getItem("ayurtrace_stock_movements")
      const qualityTestsData = localStorage.getItem("ayurtrace_quality_tests")
      const complianceReportsData = localStorage.getItem("ayurtrace_compliance_reports")
      const auditTrailData = localStorage.getItem("ayurtrace_audit_trail")
      const shipmentsData = localStorage.getItem("ayurtrace_shipments")
      const deliveryUpdatesData = localStorage.getItem("ayurtrace_delivery_updates")
      const farmersData = localStorage.getItem("ayurtrace_farmers")
      const herbCollectionsData = localStorage.getItem("ayurtrace_herb_collections")
      const farmerNotificationsData = localStorage.getItem("ayurtrace_farmer_notifications")

      if (processorsData) {
        this.processors = JSON.parse(processorsData)
      }
      if (batchesData) {
        this.batches = JSON.parse(batchesData)
      }
      if (inventoryData) {
        this.inventory = JSON.parse(inventoryData)
      }
      if (stockMovementsData) {
        this.stockMovements = JSON.parse(stockMovementsData)
      }
      if (qualityTestsData) {
        this.qualityTests = JSON.parse(qualityTestsData)
      }
      if (complianceReportsData) {
        this.complianceReports = JSON.parse(complianceReportsData)
      }
      if (auditTrailData) {
        this.auditTrail = JSON.parse(auditTrailData)
      }
      if (shipmentsData) {
        this.shipments = JSON.parse(shipmentsData)
      }
      if (deliveryUpdatesData) {
        this.deliveryUpdates = JSON.parse(deliveryUpdatesData)
      }
      if (farmersData) {
        this.farmers = JSON.parse(farmersData)
      }
      if (herbCollectionsData) {
        this.herbCollections = JSON.parse(herbCollectionsData)
      }
      if (farmerNotificationsData) {
        this.farmerNotifications = JSON.parse(farmerNotificationsData)
      }
    }
  }
}

export const db = new DatabaseService()

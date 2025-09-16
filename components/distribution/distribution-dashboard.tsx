"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/auth"
import { db, type Shipment, type DeliveryUpdate, type InventoryItem } from "@/lib/database"
import { Truck, Package, MapPin, Clock, Plus, Search, Filter, CheckCircle, AlertTriangle } from "lucide-react"
import { CreateShipmentDialog } from "./create-shipment-dialog"
import { ShipmentDetailsDialog } from "./shipment-details-dialog"
import { DeliveryUpdateDialog } from "./delivery-update-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DistributionDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadDistributionData()
  }, [])

  const loadDistributionData = async () => {
    try {
      const user = AuthService.getCurrentUser()
      if (user) {
        let shipmentsData: Shipment[] = []
        let inventoryData: InventoryItem[] = []

        if (user.role === "distributor") {
          shipmentsData = await db.getShipmentsByDistributor(user.id)
        } else if (user.role === "processor") {
          shipmentsData = await db.getShipmentsByProcessor(user.id)
          const processor = await db.getProcessorByUserId(user.id)
          if (processor) {
            inventoryData = await db.getInventoryByProcessorId(processor.id)
          }
        } else {
          shipmentsData = await db.getAllShipments()
        }

        setShipments(shipmentsData)
        setInventory(inventoryData)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load distribution data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateShipment = async (newShipment: Shipment) => {
    setShipments((prev) => [...prev, newShipment])
    setShowCreateDialog(false)
    await loadDistributionData() // Refresh data
    toast({
      title: "Shipment Created",
      description: `Shipment ${newShipment.trackingNumber} has been created successfully`,
    })
  }

  const handleUpdateShipment = async (updatedShipment: Shipment) => {
    setShipments((prev) => prev.map((shipment) => (shipment.id === updatedShipment.id ? updatedShipment : shipment)))
    toast({
      title: "Shipment Updated",
      description: "Shipment has been updated successfully",
    })
  }

  const handleDeliveryUpdate = async (update: DeliveryUpdate) => {
    setShowUpdateDialog(false)
    await loadDistributionData() // Refresh to get updated shipment status
    toast({
      title: "Delivery Updated",
      description: "Delivery status has been updated successfully",
    })
  }

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: Shipment["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
      case "in_transit":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-yellow-100 text-yellow-800"
      case "delayed":
        return "bg-orange-100 text-orange-800"
      case "returned":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: Shipment["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "shipped":
      case "in_transit":
        return <Truck className="h-4 w-4 text-blue-600" />
      case "preparing":
        return <Package className="h-4 w-4 text-yellow-600" />
      case "delayed":
      case "returned":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const calculateDeliveryStatus = (shipment: Shipment) => {
    const now = new Date()
    const estimated = new Date(shipment.estimatedDelivery)
    const diffDays = Math.ceil((estimated.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (shipment.status === "delivered") return "Delivered"
    if (diffDays < 0) return "Overdue"
    if (diffDays === 0) return "Due Today"
    if (diffDays === 1) return "Due Tomorrow"
    return `${diffDays} days remaining`
  }

  const stats = {
    totalShipments: shipments.length,
    activeShipments: shipments.filter((s) => ["preparing", "shipped", "in_transit"].includes(s.status)).length,
    deliveredShipments: shipments.filter((s) => s.status === "delivered").length,
    delayedShipments: shipments.filter((s) => s.status === "delayed").length,
    onTimeRate:
      shipments.length > 0
        ? (shipments.filter((s) => s.status === "delivered" && !s.returnReason).length / shipments.length) * 100
        : 0,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading distribution data...</p>
        </div>
      </div>
    )
  }

  const user = AuthService.getCurrentUser()

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.deliveredShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.delayedShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onTimeRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="shipments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          {user?.role === "processor" && <TabsTrigger value="inventory">Available Inventory</TabsTrigger>}
        </TabsList>

        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Distribution Tracking</CardTitle>
                  <CardDescription>Track shipments and delivery status</CardDescription>
                </div>
                {user?.role === "distributor" && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Shipment
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by tracking number or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredShipments.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No shipments found</h3>
                    <p className="text-muted-foreground">Create your first shipment to get started</p>
                  </div>
                ) : (
                  filteredShipments.map((shipment) => (
                    <Card key={shipment.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(shipment.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{shipment.trackingNumber}</h3>
                              <Badge className={getStatusColor(shipment.status)}>
                                {shipment.status.replace("_", " ").toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              To: {shipment.destination.companyName} • {shipment.destination.city}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Items: {shipment.items.length} • Value: ₹{shipment.totalValue.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Carrier: {shipment.carrier} • {calculateDeliveryStatus(shipment)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedShipment(shipment)
                              setShowDetailsDialog(true)
                            }}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Track
                          </Button>
                          {user?.role === "distributor" && shipment.status !== "delivered" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedShipment(shipment)
                                setShowUpdateDialog(true)
                              }}
                            >
                              Update
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === "processor" && (
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Inventory</CardTitle>
                <CardDescription>Products available for distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory.filter((item) => item.currentStock > 0).length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No inventory available</h3>
                      <p className="text-muted-foreground">
                        Add inventory items to make them available for distribution
                      </p>
                    </div>
                  ) : (
                    inventory
                      .filter((item) => item.currentStock > 0)
                      .map((item) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{item.productName}</h3>
                              <p className="text-sm text-muted-foreground">
                                Batch: {item.batchId} • Stock: {item.currentStock} {item.unit}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Location: {item.location} • Expires: {new Date(item.expiryDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                ₹{item.costPerUnit}/{item.unit}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Total: ₹{(item.currentStock * item.costPerUnit).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Dialogs */}
      <CreateShipmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreateShipment}
      />
      {selectedShipment && (
        <>
          <ShipmentDetailsDialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            shipment={selectedShipment}
            onUpdate={handleUpdateShipment}
          />
          <DeliveryUpdateDialog
            open={showUpdateDialog}
            onOpenChange={setShowUpdateDialog}
            shipment={selectedShipment}
            onUpdate={handleDeliveryUpdate}
          />
        </>
      )}
    </div>
  )
}

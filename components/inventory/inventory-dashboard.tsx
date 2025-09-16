"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/auth"
import { db, type InventoryItem, type Processor, type StockMovement } from "@/lib/database"
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Search, Filter } from "lucide-react"
import { AddInventoryDialog } from "./add-inventory-dialog"
import { StockMovementDialog } from "./stock-movement-dialog"

export function InventoryDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [processor, setProcessor] = useState<Processor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showMovementDialog, setShowMovementDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadInventoryData()
  }, [])

  const loadInventoryData = async () => {
    try {
      const user = AuthService.getCurrentUser()
      if (user) {
        const processorData = await db.getProcessorByUserId(user.id)
        setProcessor(processorData)

        if (processorData) {
          const inventoryData = await db.getInventoryByProcessorId(processorData.id)
          setInventory(inventoryData)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddInventory = async (newItem: InventoryItem) => {
    setInventory((prev) => [...prev, newItem])
    setShowAddDialog(false)
    toast({
      title: "Item Added",
      description: "Inventory item has been added successfully",
    })
  }

  const handleStockMovement = async (movement: StockMovement, updatedItem: InventoryItem) => {
    setInventory((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
    setShowMovementDialog(false)
    setSelectedItem(null)
    toast({
      title: "Stock Updated",
      description: "Stock movement has been recorded successfully",
    })
  }

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: InventoryItem["status"]) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800"
      case "low_stock":
        return "bg-yellow-100 text-yellow-800"
      case "out_of_stock":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: InventoryItem["status"]) => {
    switch (status) {
      case "in_stock":
        return <Package className="h-4 w-4 text-green-600" />
      case "low_stock":
      case "out_of_stock":
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const calculateDaysToExpiry = (expiryDate: string) => {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const stats = {
    totalItems: inventory.length,
    inStock: inventory.filter((item) => item.status === "in_stock").length,
    lowStock: inventory.filter((item) => item.status === "low_stock").length,
    expired: inventory.filter((item) => item.status === "expired").length,
    totalValue: inventory.reduce((sum, item) => sum + item.currentStock * item.costPerUnit, 0),
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading inventory data...</p>
        </div>
      </div>
    )
  }

  if (!processor) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Setup Required</CardTitle>
          <CardDescription>You need to complete your profile setup before managing inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/profile">Complete Profile Setup</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-heading font-bold align-numeric">{stats.totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body font-medium">In Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-heading font-bold text-green-600 align-numeric">{stats.inStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-heading font-bold text-yellow-600 align-numeric">{stats.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body font-medium">Expired</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-heading font-bold text-red-600 align-numeric">{stats.expired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-heading font-bold align-numeric">₹{stats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Track and manage your processed products</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product name or batch ID..."
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
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Table */}
          <div className="space-y-4">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No inventory items found</h3>
                <p className="text-muted-foreground">Add your first inventory item to get started</p>
              </div>
            ) : (
              filteredInventory.map((item) => {
                const daysToExpiry = calculateDaysToExpiry(item.expiryDate)
                return (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(item.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-subheading font-medium">{item.productName}</h3>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-body text-muted-foreground">
                            Batch: {item.batchId} • Location: {item.location}
                          </p>
                          <p className="text-body text-muted-foreground">
                            Stock: {item.currentStock} {item.unit} • Min: {item.minStockLevel} {item.unit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item)
                              setShowMovementDialog(true)
                            }}
                          >
                            Update Stock
                          </Button>
                        </div>
                        <p className="text-body text-muted-foreground">
                          Expires: {new Date(item.expiryDate).toLocaleDateString()}
                          {daysToExpiry <= 30 && daysToExpiry > 0 && (
                            <span className="text-yellow-600 ml-1">({daysToExpiry} days)</span>
                          )}
                          {daysToExpiry <= 0 && <span className="text-red-600 ml-1">(Expired)</span>}
                        </p>
                        <p className="text-body font-medium align-numeric">
                          ₹{(item.currentStock * item.costPerUnit).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {processor && (
        <>
          <AddInventoryDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            processorId={processor.id}
            onAdd={handleAddInventory}
          />
          {selectedItem && (
            <StockMovementDialog
              open={showMovementDialog}
              onOpenChange={setShowMovementDialog}
              item={selectedItem}
              onMovement={handleStockMovement}
            />
          )}
        </>
      )}
    </div>
  )
}

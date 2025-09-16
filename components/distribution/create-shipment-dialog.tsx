"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/auth"
import { db, type Shipment, type InventoryItem, type ShipmentItem } from "@/lib/database"
import { Plus, Trash2 } from "lucide-react"

interface CreateShipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (shipment: Shipment) => void
}

const carriers = ["DHL", "FedEx", "UPS", "Blue Dart", "DTDC", "Delhivery", "Ecom Express", "India Post"]

export function CreateShipmentDialog({ open, onOpenChange, onCreate }: CreateShipmentDialogProps) {
  const [formData, setFormData] = useState({
    processorId: "",
    trackingNumber: "",
    shipmentDate: "",
    estimatedDelivery: "",
    carrier: "",
    notes: "",
    destination: {
      companyName: "",
      contactPerson: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
      phone: "",
      email: "",
    },
  })
  const [availableInventory, setAvailableInventory] = useState<InventoryItem[]>([])
  const [selectedItems, setSelectedItems] = useState<ShipmentItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadAvailableInventory()
      generateTrackingNumber()
    }
  }, [open])

  const loadAvailableInventory = async () => {
    try {
      // For demo purposes, get all inventory items
      // In production, this would be filtered by processor/distributor relationships
      const allInventory = await db.getInventoryByProcessorId("")
      setAvailableInventory(allInventory.filter((item) => item.currentStock > 0))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available inventory",
        variant: "destructive",
      })
    }
  }

  const generateTrackingNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    setFormData((prev) => ({ ...prev, trackingNumber: `TRK-${timestamp}-${random}` }))
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("destination.")) {
      const destField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        destination: { ...prev.destination, [destField]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const addItem = () => {
    setSelectedItems((prev) => [
      ...prev,
      {
        inventoryItemId: "",
        productName: "",
        batchId: "",
        quantity: 0,
        unit: "",
        unitPrice: 0,
      },
    ])
  }

  const updateItem = (index: number, field: keyof ShipmentItem, value: string | number) => {
    setSelectedItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          if (field === "inventoryItemId" && typeof value === "string") {
            const inventoryItem = availableInventory.find((inv) => inv.id === value)
            if (inventoryItem) {
              return {
                ...item,
                inventoryItemId: value,
                productName: inventoryItem.productName,
                batchId: inventoryItem.batchId,
                unit: inventoryItem.unit,
                unitPrice: inventoryItem.costPerUnit,
              }
            }
          }
          return { ...item, [field]: value }
        }
        return item
      }),
    )
  }

  const removeItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index))
  }

  const calculateTotalValue = () => {
    return selectedItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = AuthService.getCurrentUser()
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        })
        return
      }

      if (selectedItems.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one item to the shipment",
          variant: "destructive",
        })
        return
      }

      const shipmentData: Omit<Shipment, "id"> = {
        processorId: formData.processorId || "demo_processor",
        distributorId: user.id,
        batchIds: selectedItems.map((item) => item.batchId),
        shipmentDate: formData.shipmentDate,
        estimatedDelivery: formData.estimatedDelivery,
        status: "preparing",
        trackingNumber: formData.trackingNumber,
        destination: formData.destination,
        items: selectedItems,
        carrier: formData.carrier,
        totalValue: calculateTotalValue(),
        notes: formData.notes,
      }

      const newShipment = await db.saveShipment(shipmentData)
      onCreate(newShipment)

      // Reset form
      setFormData({
        processorId: "",
        trackingNumber: "",
        shipmentDate: "",
        estimatedDelivery: "",
        carrier: "",
        notes: "",
        destination: {
          companyName: "",
          contactPerson: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India",
          phone: "",
          email: "",
        },
      })
      setSelectedItems([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shipment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shipment</DialogTitle>
          <DialogDescription>Create a new shipment for distribution tracking</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number *</Label>
              <div className="flex gap-2">
                <Input
                  id="trackingNumber"
                  value={formData.trackingNumber}
                  onChange={(e) => handleInputChange("trackingNumber", e.target.value)}
                  required
                />
                <Button type="button" variant="outline" onClick={generateTrackingNumber}>
                  Generate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipmentDate">Shipment Date *</Label>
              <Input
                id="shipmentDate"
                type="date"
                value={formData.shipmentDate}
                onChange={(e) => handleInputChange("shipmentDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedDelivery">Estimated Delivery *</Label>
              <Input
                id="estimatedDelivery"
                type="date"
                value={formData.estimatedDelivery}
                onChange={(e) => handleInputChange("estimatedDelivery", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="carrier">Carrier *</Label>
            <Select value={formData.carrier} onValueChange={(value) => handleInputChange("carrier", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                {carriers.map((carrier) => (
                  <SelectItem key={carrier} value={carrier}>
                    {carrier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Destination Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.destination.companyName}
                  onChange={(e) => handleInputChange("destination.companyName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.destination.contactPerson}
                  onChange={(e) => handleInputChange("destination.contactPerson", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.destination.address}
                onChange={(e) => handleInputChange("destination.address", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.destination.city}
                  onChange={(e) => handleInputChange("destination.city", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.destination.state}
                  onChange={(e) => handleInputChange("destination.state", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.destination.zipCode}
                  onChange={(e) => handleInputChange("destination.zipCode", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.destination.phone}
                  onChange={(e) => handleInputChange("destination.phone", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Shipment Items</h3>
              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            {selectedItems.map((item, index) => (
              <div key={index} className="grid gap-4 md:grid-cols-5 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select
                    value={item.inventoryItemId}
                    onValueChange={(value) => updateItem(index, "inventoryItemId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableInventory.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.productName} - {inv.batchId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input value={item.unit} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <Input value={`₹${item.unitPrice}`} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Actions</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {selectedItems.length > 0 && (
              <div className="text-right">
                <p className="text-lg font-medium">Total Value: ₹{calculateTotalValue().toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes or special instructions"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Creating..." : "Create Shipment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

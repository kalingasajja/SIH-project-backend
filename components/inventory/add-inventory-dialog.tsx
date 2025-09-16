"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { db, type InventoryItem } from "@/lib/database"

interface AddInventoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  processorId: string
  onAdd: (item: InventoryItem) => void
}

const productTypes = [
  "Essential Oil",
  "Powder",
  "Extract",
  "Capsules",
  "Tablets",
  "Tincture",
  "Raw Herb",
  "Processed Herb",
]

const units = ["kg", "grams", "liters", "ml", "units", "bottles", "packets"]

export function AddInventoryDialog({ open, onOpenChange, processorId, onAdd }: AddInventoryDialogProps) {
  const [formData, setFormData] = useState({
    productName: "",
    productType: "",
    batchId: "",
    currentStock: "",
    unit: "kg",
    expiryDate: "",
    location: "",
    minStockLevel: "",
    maxStockLevel: "",
    costPerUnit: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const inventoryData = {
        processorId,
        productName: formData.productName,
        productType: formData.productType,
        batchId: formData.batchId,
        currentStock: Number.parseFloat(formData.currentStock),
        unit: formData.unit,
        expiryDate: formData.expiryDate,
        location: formData.location,
        minStockLevel: Number.parseFloat(formData.minStockLevel),
        maxStockLevel: Number.parseFloat(formData.maxStockLevel),
        costPerUnit: Number.parseFloat(formData.costPerUnit),
      }

      const newItem = await db.saveInventoryItem(inventoryData)
      onAdd(newItem)

      // Reset form
      setFormData({
        productName: "",
        productType: "",
        batchId: "",
        currentStock: "",
        unit: "kg",
        expiryDate: "",
        location: "",
        minStockLevel: "",
        maxStockLevel: "",
        costPerUnit: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
          <DialogDescription>Add a new product to your inventory</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleInputChange("productName", e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productType">Product Type *</Label>
              <Select value={formData.productType} onValueChange={(value) => handleInputChange("productType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="batchId">Batch ID *</Label>
              <Input
                id="batchId"
                value={formData.batchId}
                onChange={(e) => handleInputChange("batchId", e.target.value)}
                placeholder="Enter batch ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Storage Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Warehouse A, Shelf 1"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock *</Label>
              <Input
                id="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={(e) => handleInputChange("currentStock", e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Min Stock Level *</Label>
              <Input
                id="minStockLevel"
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => handleInputChange("minStockLevel", e.target.value)}
                placeholder="Minimum quantity"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxStockLevel">Max Stock Level *</Label>
              <Input
                id="maxStockLevel"
                type="number"
                value={formData.maxStockLevel}
                onChange={(e) => handleInputChange("maxStockLevel", e.target.value)}
                placeholder="Maximum quantity"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPerUnit">Cost per Unit (₹) *</Label>
              <Input
                id="costPerUnit"
                type="number"
                step="0.01"
                value={formData.costPerUnit}
                onChange={(e) => handleInputChange("costPerUnit", e.target.value)}
                placeholder="Cost per unit"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

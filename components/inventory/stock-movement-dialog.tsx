"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/auth"
import { db, type InventoryItem, type StockMovement } from "@/lib/database"

interface StockMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem
  onMovement: (movement: StockMovement, updatedItem: InventoryItem) => void
}

export function StockMovementDialog({ open, onOpenChange, item, onMovement }: StockMovementDialogProps) {
  const [formData, setFormData] = useState({
    type: "in" as "in" | "out" | "adjustment",
    quantity: "",
    reason: "",
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
      const user = AuthService.getCurrentUser()
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        })
        return
      }

      const quantity = Number.parseFloat(formData.quantity)
      if (quantity <= 0) {
        toast({
          title: "Error",
          description: "Quantity must be greater than 0",
          variant: "destructive",
        })
        return
      }

      if (formData.type === "out" && quantity > item.currentStock) {
        toast({
          title: "Error",
          description: "Cannot remove more stock than available",
          variant: "destructive",
        })
        return
      }

      const movementData = {
        inventoryItemId: item.id,
        type: formData.type,
        quantity,
        reason: formData.reason,
        userId: user.id,
      }

      const movement = await db.addStockMovement(movementData)
      const updatedItem = await db.getInventoryByProcessorId(item.processorId)
      const currentItem = updatedItem.find((i) => i.id === item.id)

      if (currentItem) {
        onMovement(movement, currentItem)
      }

      // Reset form
      setFormData({
        type: "in",
        quantity: "",
        reason: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record stock movement",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getNewStockLevel = () => {
    const quantity = Number.parseFloat(formData.quantity) || 0
    switch (formData.type) {
      case "in":
        return item.currentStock + quantity
      case "out":
        return Math.max(0, item.currentStock - quantity)
      case "adjustment":
        return quantity
      default:
        return item.currentStock
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Stock</DialogTitle>
          <DialogDescription>Record stock movement for {item.productName}</DialogDescription>
        </DialogHeader>
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Current Stock:</strong> {item.currentStock} {item.unit}
          </p>
          <p className="text-sm">
            <strong>Batch:</strong> {item.batchId}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Movement Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "in" | "out" | "adjustment") => handleInputChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Stock In (Add)</SelectItem>
                <SelectItem value="out">Stock Out (Remove)</SelectItem>
                <SelectItem value="adjustment">Adjustment (Set to)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity ({item.unit}) *{formData.type === "adjustment" && " (New total)"}
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", e.target.value)}
              placeholder={formData.type === "adjustment" ? "Enter new total" : "Enter quantity"}
              required
            />
            {formData.quantity && (
              <p className="text-sm text-muted-foreground">
                New stock level: {getNewStockLevel()} {item.unit}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              placeholder="Enter reason for stock movement"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Recording..." : "Record Movement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

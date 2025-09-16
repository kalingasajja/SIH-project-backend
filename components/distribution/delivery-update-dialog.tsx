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
import { db, type Shipment, type DeliveryUpdate } from "@/lib/database"

interface DeliveryUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipment: Shipment
  onUpdate: (update: DeliveryUpdate) => void
}

const statusOptions = [
  "Picked up",
  "In transit",
  "Out for delivery",
  "Delivered",
  "Delivery attempted",
  "Delayed",
  "Exception",
  "Returned",
]

export function DeliveryUpdateDialog({ open, onOpenChange, shipment, onUpdate }: DeliveryUpdateDialogProps) {
  const [formData, setFormData] = useState({
    status: "",
    location: "",
    notes: "",
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

      const updateData: Omit<DeliveryUpdate, "id"> = {
        shipmentId: shipment.id,
        timestamp: new Date().toISOString(),
        location: formData.location,
        status: formData.status,
        notes: formData.notes,
        updatedBy: user.id,
      }

      const newUpdate = await db.addDeliveryUpdate(updateData)
      onUpdate(newUpdate)

      // Reset form
      setFormData({
        status: "",
        location: "",
        notes: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add delivery update",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Delivery Update</DialogTitle>
          <DialogDescription>Update the delivery status for {shipment.trackingNumber}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g., Mumbai Distribution Center"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional details about the update"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Adding..." : "Add Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db, type Shipment, type DeliveryUpdate } from "@/lib/database"
import { MapPin, Package, Clock, Truck, CheckCircle } from "lucide-react"

interface ShipmentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipment: Shipment
  onUpdate: (shipment: Shipment) => void
}

export function ShipmentDetailsDialog({ open, onOpenChange, shipment, onUpdate }: ShipmentDetailsDialogProps) {
  const [deliveryUpdates, setDeliveryUpdates] = useState<DeliveryUpdate[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && shipment) {
      loadDeliveryUpdates()
    }
  }, [open, shipment])

  const loadDeliveryUpdates = async () => {
    setIsLoading(true)
    try {
      const updates = await db.getDeliveryUpdates(shipment.id)
      setDeliveryUpdates(updates)
    } catch (error) {
      console.error("Failed to load delivery updates:", error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const getUpdateIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "shipped":
      case "in_transit":
        return <Truck className="h-4 w-4 text-blue-600" />
      case "preparing":
        return <Package className="h-4 w-4 text-yellow-600" />
      default:
        return <MapPin className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipment Details - {shipment.trackingNumber}
          </DialogTitle>
          <DialogDescription>Track shipment progress and delivery status</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Shipment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Shipment Overview
                <Badge className={getStatusColor(shipment.status)}>
                  {shipment.status.replace("_", " ").toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Shipment Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Tracking Number:</strong> {shipment.trackingNumber}
                    </p>
                    <p>
                      <strong>Carrier:</strong> {shipment.carrier}
                    </p>
                    <p>
                      <strong>Shipment Date:</strong> {new Date(shipment.shipmentDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Estimated Delivery:</strong> {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                    </p>
                    {shipment.actualDelivery && (
                      <p>
                        <strong>Actual Delivery:</strong> {new Date(shipment.actualDelivery).toLocaleDateString()}
                      </p>
                    )}
                    <p>
                      <strong>Total Value:</strong> ₹{shipment.totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Destination</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>{shipment.destination.companyName}</strong>
                    </p>
                    <p>{shipment.destination.contactPerson}</p>
                    <p>{shipment.destination.address}</p>
                    <p>
                      {shipment.destination.city}, {shipment.destination.state} {shipment.destination.zipCode}
                    </p>
                    <p>{shipment.destination.phone}</p>
                    <p>{shipment.destination.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipment Items */}
          <Card>
            <CardHeader>
              <CardTitle>Shipment Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shipment.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">Batch: {item.batchId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.quantity} {item.unit}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ₹{(item.quantity * item.unitPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Delivery Timeline
              </CardTitle>
              <CardDescription>Track the progress of your shipment</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading delivery updates...</p>
                </div>
              ) : deliveryUpdates.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No delivery updates yet</h3>
                  <p className="text-muted-foreground">Updates will appear as the shipment progresses</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveryUpdates.map((update, index) => (
                    <div key={update.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">{getUpdateIcon(update.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{update.status}</p>
                          <p className="text-sm text-muted-foreground">{new Date(update.timestamp).toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{update.location}</p>
                        {update.notes && <p className="text-sm">{update.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {shipment.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{shipment.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

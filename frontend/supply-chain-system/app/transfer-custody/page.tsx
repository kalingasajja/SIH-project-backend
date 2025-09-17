"use client"

import type React from "react"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight } from "lucide-react"

interface TransferCustodyData {
  batchId: string
  newOwner: string
  timestamp: string
  from: string
  to: string
}

const roles = [
  { value: "farmer", label: "Farmer" },
  { value: "processor", label: "Processor" },
  { value: "testing", label: "Testing Lab" },
  { value: "regulator", label: "Regulator" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "end-customer", label: "End Customer" },
]

export default function TransferCustodyPage() {
  const [formData, setFormData] = useState<TransferCustodyData>({
    batchId: "",
    newOwner: "",
    timestamp: "",
    from: "",
    to: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof TransferCustodyData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Prepare data in the format for backend
    const payload = {
      tx: "i", // Transaction identifier
      ...formData,
    }

    try {
      console.log("Sending to backend:", payload)

      // Send to backend API
      const response = await fetch("/api/transferCustody", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert("Custody transferred successfully!")
        // Reset form
        setFormData({
          batchId: "",
          newOwner: "",
          timestamp: "",
          from: "",
          to: "",
        })
      } else {
        alert("Failed to transfer custody")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error transferring custody")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentTimestamp = () => {
    const now = new Date()
    const timestamp = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
    handleInputChange("timestamp", timestamp)
  }

  return (
    <DashboardLayout title="Transfer Custody" showTransferCustody={false}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRight className="h-5 w-5" />
              <span>Transfer Batch Custody</span>
            </CardTitle>
            <CardDescription>
              Transfer ownership of a batch from one party to another in the supply chain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batchId">Batch ID</Label>
                <Input
                  id="batchId"
                  value={formData.batchId}
                  onChange={(e) => handleInputChange("batchId", e.target.value)}
                  placeholder="Enter batch ID to transfer"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newOwner">New Owner</Label>
                <Input
                  id="newOwner"
                  value={formData.newOwner}
                  onChange={(e) => handleInputChange("newOwner", e.target.value)}
                  placeholder="Enter new owner's identifier"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timestamp">Timestamp</Label>
                <div className="flex space-x-2">
                  <Input
                    id="timestamp"
                    value={formData.timestamp}
                    onChange={(e) => handleInputChange("timestamp", e.target.value)}
                    placeholder="HH:MM"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentTimestamp}
                    className="whitespace-nowrap bg-transparent"
                  >
                    Use Current
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from">Transfer From</Label>
                  <Select value={formData.from} onValueChange={(value) => handleInputChange("from", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select current owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to">Transfer To</Label>
                  <Select value={formData.to} onValueChange={(value) => handleInputChange("to", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || formData.from === formData.to}>
                {isSubmitting ? "Transferring Custody..." : "Transfer Custody"}
              </Button>

              {formData.from === formData.to && formData.from && (
                <p className="text-sm text-red-600 text-center">Cannot transfer to the same role</p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Transfer Visualization */}
        {formData.from && formData.to && formData.from !== formData.to && (
          <Card>
            <CardHeader>
              <CardTitle>Transfer Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-4 py-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-sm font-medium text-blue-800">FROM</span>
                  </div>
                  <p className="text-sm font-medium capitalize">{formData.from}</p>
                </div>

                <ArrowRight className="h-8 w-8 text-gray-400" />

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-sm font-medium text-green-800">TO</span>
                  </div>
                  <p className="text-sm font-medium capitalize">{formData.to}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview of data that will be sent */}
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>This is how your data will be formatted when sent to the backend</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
              {JSON.stringify(
                {
                  tx: "i",
                  ...formData,
                },
                null,
                2,
              )}
            </pre>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

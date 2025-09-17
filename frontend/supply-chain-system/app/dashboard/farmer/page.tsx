"use client"

import type React from "react"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface HerbBatchData {
  batchId: string
  species: string
  collectorId: string
  timestamp: string
  latitude: string
  longitude: string
  initialWeightKg: string
  initialQualityMetrics: string
}

export default function FarmerDashboard() {
  const [formData, setFormData] = useState<HerbBatchData>({
    batchId: "",
    species: "",
    collectorId: "",
    timestamp: "",
    latitude: "",
    longitude: "",
    initialWeightKg: "",
    initialQualityMetrics: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof HerbBatchData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Prepare data in the format shown in the image
    const payload = {
      tx: "i", // Transaction identifier as shown in the image
      ...formData,
    }

    try {
      console.log("Sending to backend:", payload)

      // Send to backend API
      const response = await fetch("/api/createHerbBatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert("Herb batch created successfully!")
        // Reset form
        setFormData({
          batchId: "",
          species: "",
          collectorId: "",
          timestamp: "",
          latitude: "",
          longitude: "",
          initialWeightKg: "",
          initialQualityMetrics: "",
        })
      } else {
        alert("Failed to create herb batch")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error creating herb batch")
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
    <DashboardLayout title="Farmer Dashboard">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Herb Batch</CardTitle>
            <CardDescription>
              Record a new herb batch with collection details and initial quality metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchId">Batch ID</Label>
                  <Input
                    id="batchId"
                    value={formData.batchId}
                    onChange={(e) => handleInputChange("batchId", e.target.value)}
                    placeholder="Enter batch ID"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="species">Species</Label>
                  <Input
                    id="species"
                    value={formData.species}
                    onChange={(e) => handleInputChange("species", e.target.value)}
                    placeholder="Enter species"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collectorId">Collector ID</Label>
                  <Input
                    id="collectorId"
                    value={formData.collectorId}
                    onChange={(e) => handleInputChange("collectorId", e.target.value)}
                    placeholder="Enter collector ID"
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

                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    placeholder="Enter latitude"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    placeholder="Enter longitude"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialWeightKg">Initial Weight (kg)</Label>
                  <Input
                    id="initialWeightKg"
                    type="number"
                    step="0.1"
                    value={formData.initialWeightKg}
                    onChange={(e) => handleInputChange("initialWeightKg", e.target.value)}
                    placeholder="Enter weight in kg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialQualityMetrics">Initial Quality Metrics</Label>
                  <Input
                    id="initialQualityMetrics"
                    value={formData.initialQualityMetrics}
                    onChange={(e) => handleInputChange("initialQualityMetrics", e.target.value)}
                    placeholder="Enter quality metrics"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating Batch..." : "Create Herb Batch"}
              </Button>
            </form>
          </CardContent>
        </Card>

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

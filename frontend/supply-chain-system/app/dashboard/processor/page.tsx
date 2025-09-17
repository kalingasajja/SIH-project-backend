"use client"

import type React from "react"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import BatchHistoryModal from "@/components/batch-history-modal"
import { History, Search } from "lucide-react"

interface ProcessingStepData {
  batchId: string
  stepName: string
  timestamp: string
  equipmentId: string
  parameters: string
}

export default function ProcessorDashboard() {
  const [formData, setFormData] = useState<ProcessingStepData>({
    batchId: "",
    stepName: "",
    timestamp: "",
    equipmentId: "",
    parameters: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof ProcessingStepData, value: string) => {
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
      const response = await fetch("/api/recordProcessingStep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert("Processing step recorded successfully!")
        // Reset form
        setFormData({
          batchId: "",
          stepName: "",
          timestamp: "",
          equipmentId: "",
          parameters: "",
        })
      } else {
        alert("Failed to record processing step")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error recording processing step")
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
    <DashboardLayout title="Processor Dashboard">
      <div className="grid gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-900">Batch Query & History</CardTitle>
            <CardDescription className="text-blue-700">
              Search for any batch history and track supply chain events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/batch-history")}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Search className="h-5 w-5 mr-2" />
              Query Batch History
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Record Processing Step</CardTitle>
            <CardDescription>
              Document a processing step for a batch including equipment and parameters used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchId">Batch ID</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="batchId"
                      value={formData.batchId}
                      onChange={(e) => handleInputChange("batchId", e.target.value)}
                      placeholder="Enter batch ID"
                      required
                    />
                    {formData.batchId && (
                      <BatchHistoryModal batchId={formData.batchId}>
                        <Button type="button" variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
                          <History className="h-4 w-4 mr-1" />
                          History
                        </Button>
                      </BatchHistoryModal>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stepName">Step Name</Label>
                  <Input
                    id="stepName"
                    value={formData.stepName}
                    onChange={(e) => handleInputChange("stepName", e.target.value)}
                    placeholder="e.g., Drying, Grinding, Extraction"
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
                  <Label htmlFor="equipmentId">Equipment ID</Label>
                  <Input
                    id="equipmentId"
                    value={formData.equipmentId}
                    onChange={(e) => handleInputChange("equipmentId", e.target.value)}
                    placeholder="Enter equipment ID"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parameters">Processing Parameters</Label>
                <Textarea
                  id="parameters"
                  value={formData.parameters}
                  onChange={(e) => handleInputChange("parameters", e.target.value)}
                  placeholder="Enter processing parameters (temperature, duration, pressure, etc.)"
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Recording Step..." : "Record Processing Step"}
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

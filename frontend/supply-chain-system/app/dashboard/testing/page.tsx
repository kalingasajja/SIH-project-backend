"use client"

import type React from "react"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BatchHistoryModal from "@/components/batch-history-modal"
import { History, Search } from "lucide-react"

interface QualityTestData {
  batchId: string
  testType: string
  resultsSummary: string
  certificateHash: string
  certificateUrl: string
}

const testTypes = [
  "Purity Test",
  "Contamination Test",
  "Potency Test",
  "Microbiological Test",
  "Heavy Metals Test",
  "Pesticide Residue Test",
  "Moisture Content Test",
  "pH Test",
]

export default function TestingDashboard() {
  const [formData, setFormData] = useState<QualityTestData>({
    batchId: "",
    testType: "",
    resultsSummary: "",
    certificateHash: "",
    certificateUrl: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof QualityTestData, value: string) => {
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
      const response = await fetch("/api/recordQualityTest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert("Quality test recorded successfully!")
        // Reset form
        setFormData({
          batchId: "",
          testType: "",
          resultsSummary: "",
          certificateHash: "",
          certificateUrl: "",
        })
      } else {
        alert("Failed to record quality test")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error recording quality test")
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateCertificateHash = () => {
    // Generate a simple hash for demo purposes
    const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    handleInputChange("certificateHash", hash)
  }

  return (
    <DashboardLayout title="Testing Dashboard">
      <div className="grid gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-900">Batch Query & History</CardTitle>
            <CardDescription className="text-green-700">
              Search for any batch history and track supply chain events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/batch-history")}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Search className="h-5 w-5 mr-2" />
              Query Batch History
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Record Quality Test</CardTitle>
            <CardDescription>Document quality test results for a batch with certificate details</CardDescription>
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
                  <Label htmlFor="testType">Test Type</Label>
                  <Select value={formData.testType} onValueChange={(value) => handleInputChange("testType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificateHash">Certificate Hash</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="certificateHash"
                      value={formData.certificateHash}
                      onChange={(e) => handleInputChange("certificateHash", e.target.value)}
                      placeholder="Enter certificate hash"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateCertificateHash}
                      className="whitespace-nowrap bg-transparent"
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificateUrl">Certificate URL</Label>
                  <Input
                    id="certificateUrl"
                    type="url"
                    value={formData.certificateUrl}
                    onChange={(e) => handleInputChange("certificateUrl", e.target.value)}
                    placeholder="https://example.com/certificate.pdf"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resultsSummary">Results Summary</Label>
                <Textarea
                  id="resultsSummary"
                  value={formData.resultsSummary}
                  onChange={(e) => handleInputChange("resultsSummary", e.target.value)}
                  placeholder="Enter detailed test results and findings..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Recording Test..." : "Record Quality Test"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Test Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Test Status</CardTitle>
            <CardDescription>Current test status and recent activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">Tests Completed Today</p>
                  <p className="text-sm text-green-600">5 batches tested</p>
                </div>
                <div className="text-2xl font-bold text-green-700">5</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-800">Pending Tests</p>
                  <p className="text-sm text-yellow-600">Awaiting results</p>
                </div>
                <div className="text-2xl font-bold text-yellow-700">2</div>
              </div>
            </div>
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

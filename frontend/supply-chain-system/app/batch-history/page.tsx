"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowLeft, Calendar, Package, User, MapPin } from "lucide-react"

interface HistoryEvent {
  event: string
  batchId?: string
  species?: string
  collectorId?: string
  timestamp?: string | number
  latitude?: string
  longitude?: string
  initialWeightKg?: string
  initialQualityMetrics?: string
  stepName?: string
  equipmentId?: string
  parameters?: string
  testType?: string
  resultsSummary?: string
  certificateHash?: string
  certificateUrl?: string
  finalProductId?: string
  productName?: string
  formulationDate?: string
  expiryDate?: string
  ingredientBatchIds?: string[]
  newOwner?: string
  from?: string
  to?: string
}

interface BatchHistoryData {
  id: string
  history: HistoryEvent[]
}

export default function BatchHistoryPage() {
  const [batchId, setBatchId] = useState("")
  const [historyData, setHistoryData] = useState<BatchHistoryData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!batchId.trim()) return

    setIsLoading(true)
    setError("")
    setHistoryData(null)

    try {
      const response = await fetch(`/api/assetHistory/${batchId}`)

      if (response.ok) {
        const data = await response.json()
        setHistoryData(data)
      } else {
        setError("Failed to fetch batch history. Please check the Batch ID and try again.")
      }
    } catch (error) {
      console.error("Error fetching batch history:", error)
      setError("An error occurred while fetching batch history.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string | number) => {
    if (typeof timestamp === "number") {
      return new Date(timestamp).toLocaleString()
    }
    return timestamp
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "CreateHerbBatch":
        return <Package className="h-4 w-4" />
      case "RecordProcessingStep":
        return <Package className="h-4 w-4" />
      case "RecordQualityTest":
        return <Package className="h-4 w-4" />
      case "FormulateProduct":
        return <Package className="h-4 w-4" />
      case "TransferCustody":
        return <User className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "CreateHerbBatch":
        return "bg-green-100 text-green-800 border-green-200"
      case "RecordProcessingStep":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "RecordQualityTest":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "FormulateProduct":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "TransferCustody":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <DashboardLayout title="Batch History Query">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()} className="bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Query Batch History
            </CardTitle>
            <CardDescription>
              Enter a Batch ID to view its complete transaction history and traceability information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuery} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="batchId" className="sr-only">
                  Batch ID
                </Label>
                <Input
                  id="batchId"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="Enter Batch ID (e.g., B001, F01)"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Querying..." : "Query History"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {historyData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Batch History: {historyData.id}
              </CardTitle>
              <CardDescription>Complete transaction history and traceability information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historyData.history.map((event, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.event)}
                        <Badge className={getEventColor(event.event)}>{event.event}</Badge>
                      </div>
                      {event.timestamp && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatTimestamp(event.timestamp)}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      {event.batchId && (
                        <div>
                          <span className="font-medium text-gray-700">Batch ID:</span>
                          <p className="text-gray-900">{event.batchId}</p>
                        </div>
                      )}
                      {event.species && (
                        <div>
                          <span className="font-medium text-gray-700">Species:</span>
                          <p className="text-gray-900">{event.species}</p>
                        </div>
                      )}
                      {event.collectorId && (
                        <div>
                          <span className="font-medium text-gray-700">Collector ID:</span>
                          <p className="text-gray-900">{event.collectorId}</p>
                        </div>
                      )}
                      {event.latitude && event.longitude && (
                        <div>
                          <span className="font-medium text-gray-700 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Location:
                          </span>
                          <p className="text-gray-900">
                            {event.latitude}, {event.longitude}
                          </p>
                        </div>
                      )}
                      {event.initialWeightKg && (
                        <div>
                          <span className="font-medium text-gray-700">Initial Weight:</span>
                          <p className="text-gray-900">{event.initialWeightKg} kg</p>
                        </div>
                      )}
                      {event.initialQualityMetrics && (
                        <div>
                          <span className="font-medium text-gray-700">Quality Metrics:</span>
                          <p className="text-gray-900">{event.initialQualityMetrics}</p>
                        </div>
                      )}
                      {event.stepName && (
                        <div>
                          <span className="font-medium text-gray-700">Step Name:</span>
                          <p className="text-gray-900">{event.stepName}</p>
                        </div>
                      )}
                      {event.equipmentId && (
                        <div>
                          <span className="font-medium text-gray-700">Equipment ID:</span>
                          <p className="text-gray-900">{event.equipmentId}</p>
                        </div>
                      )}
                      {event.parameters && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <span className="font-medium text-gray-700">Parameters:</span>
                          <p className="text-gray-900">{event.parameters}</p>
                        </div>
                      )}
                      {event.testType && (
                        <div>
                          <span className="font-medium text-gray-700">Test Type:</span>
                          <p className="text-gray-900">{event.testType}</p>
                        </div>
                      )}
                      {event.resultsSummary && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">Results:</span>
                          <p className="text-gray-900">{event.resultsSummary}</p>
                        </div>
                      )}
                      {event.certificateUrl && (
                        <div>
                          <span className="font-medium text-gray-700">Certificate:</span>
                          <a
                            href={event.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View Certificate
                          </a>
                        </div>
                      )}
                      {event.productName && (
                        <div>
                          <span className="font-medium text-gray-700">Product Name:</span>
                          <p className="text-gray-900">{event.productName}</p>
                        </div>
                      )}
                      {event.formulationDate && (
                        <div>
                          <span className="font-medium text-gray-700">Formulation Date:</span>
                          <p className="text-gray-900">{event.formulationDate}</p>
                        </div>
                      )}
                      {event.expiryDate && (
                        <div>
                          <span className="font-medium text-gray-700">Expiry Date:</span>
                          <p className="text-gray-900">{event.expiryDate}</p>
                        </div>
                      )}
                      {event.ingredientBatchIds && (
                        <div>
                          <span className="font-medium text-gray-700">Ingredient Batches:</span>
                          <p className="text-gray-900">{event.ingredientBatchIds.join(", ")}</p>
                        </div>
                      )}
                      {event.newOwner && (
                        <div>
                          <span className="font-medium text-gray-700">New Owner:</span>
                          <p className="text-gray-900">{event.newOwner}</p>
                        </div>
                      )}
                      {event.from && event.to && (
                        <div>
                          <span className="font-medium text-gray-700">Transfer:</span>
                          <p className="text-gray-900">
                            {event.from} → {event.to}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

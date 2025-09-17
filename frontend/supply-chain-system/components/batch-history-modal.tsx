"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { History, Calendar, CheckCircle, AlertCircle } from "lucide-react"

interface BatchHistoryModalProps {
  batchId: string
  children: React.ReactNode
}

interface HistoryEvent {
  event: string
  finalProductId?: string
  productName?: string
  formulationDate?: string
  expiryDate?: string
  ingredientBatchIds?: string[]
  timestamp: number
}

interface BatchHistory {
  id: string
  history: HistoryEvent[]
}

export default function BatchHistoryModal({ batchId, children }: BatchHistoryModalProps) {
  const [history, setHistory] = useState<BatchHistory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)

  const fetchHistory = async () => {
    if (!open || history) return // Don't fetch if modal is closed or data already loaded

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/assetHistory/${batchId}`)
      if (!response.ok) {
        throw new Error("History not found")
      }

      const data = await response.json()
      setHistory(data)
    } catch (err) {
      setError("Failed to fetch batch history")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEventBadgeColor = (event: string) => {
    switch (event) {
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
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (newOpen) {
          fetchHistory()
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="h-5 w-5 text-blue-600" />
            <span>Batch History: {batchId}</span>
          </DialogTitle>
          <DialogDescription>Complete transaction history for this batch</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading history...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {history && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Batch ID: {history.id}</span>
                </div>
                <p className="text-sm text-gray-600">{history.history.length} transaction(s) recorded</p>
              </div>

              <div className="space-y-3">
                {history.history.map((event, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={getEventBadgeColor(event.event)}>{event.event}</Badge>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(event.timestamp)}</span>
                          </div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        {Object.entries(event).map(([key, value]) => {
                          if (key === "event" || key === "timestamp") return null
                          return (
                            <div key={key}>
                              <span className="font-medium text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}:
                              </span>
                              <span className="ml-2 text-gray-900">
                                {Array.isArray(value) ? value.join(", ") : String(value)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

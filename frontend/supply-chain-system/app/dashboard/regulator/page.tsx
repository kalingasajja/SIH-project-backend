"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Search } from "lucide-react"

interface BatchItem {
  id: string
  type: "herb" | "processing" | "product" | "test"
  batchId: string
  submittedBy: string
  submittedAt: string
  status: "pending" | "approved" | "disapproved"
  details: any
}

// Mock data for demonstration
const mockBatches: BatchItem[] = [
  {
    id: "1",
    type: "herb",
    batchId: "HB001",
    submittedBy: "farmer@example.com",
    submittedAt: "2024-01-15 10:30",
    status: "pending",
    details: { species: "Lavender", weight: "5.2kg", location: "Farm A" },
  },
  {
    id: "2",
    type: "processing",
    batchId: "HB001",
    submittedBy: "processor@example.com",
    submittedAt: "2024-01-15 14:20",
    status: "pending",
    details: { stepName: "Drying", equipment: "DRY-001" },
  },
  {
    id: "3",
    type: "test",
    batchId: "HB001",
    submittedBy: "testing@example.com",
    submittedAt: "2024-01-15 16:45",
    status: "approved",
    details: { testType: "Purity Test", result: "Passed" },
  },
  {
    id: "4",
    type: "product",
    batchId: "FP001",
    submittedBy: "manufacturer@example.com",
    submittedAt: "2024-01-16 09:15",
    status: "pending",
    details: { productName: "Lavender Oil", expiryDate: "2025-01-16" },
  },
]

export default function RegulatorDashboard() {
  const [batches, setBatches] = useState<BatchItem[]>(mockBatches)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "disapproved">("all")

  const handleApprove = async (batchId: string, itemId: string) => {
    try {
      // Update local state
      setBatches((prev) =>
        prev.map((batch) => (batch.id === itemId ? { ...batch, status: "approved" as const } : batch)),
      )

      // Send to backend
      const response = await fetch("/api/regulatorAction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx: "i",
          action: "approve",
          batchId,
          itemId,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        alert(`Batch ${batchId} approved successfully!`)
      } else {
        alert("Failed to approve batch")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error approving batch")
    }
  }

  const handleDisapprove = async (batchId: string, itemId: string) => {
    const reason = prompt("Please provide a reason for disapproval:")
    if (!reason) return

    try {
      // Update local state
      setBatches((prev) =>
        prev.map((batch) => (batch.id === itemId ? { ...batch, status: "disapproved" as const } : batch)),
      )

      // Send to backend
      const response = await fetch("/api/regulatorAction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx: "i",
          action: "disapprove",
          batchId,
          itemId,
          reason,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        alert(`Batch ${batchId} disapproved successfully!`)
      } else {
        alert("Failed to disapprove batch")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error disapproving batch")
    }
  }

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || batch.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "disapproved":
        return <Badge className="bg-red-100 text-red-800">Disapproved</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "herb":
        return "Herb Batch"
      case "processing":
        return "Processing Step"
      case "product":
        return "Product Formulation"
      case "test":
        return "Quality Test"
      default:
        return type
    }
  }

  return (
    <DashboardLayout title="Regulator Dashboard" showTransferCustody={false}>
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-900">Batch Query & History</CardTitle>
            <CardDescription className="text-red-700">
              Search for any batch history and track supply chain events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/batch-history")}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Search className="h-5 w-5 mr-2" />
              Query Batch History
            </Button>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Pending Review</p>
                  <p className="text-2xl font-bold">{batches.filter((b) => b.status === "pending").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Approved</p>
                  <p className="text-2xl font-bold">{batches.filter((b) => b.status === "approved").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Disapproved</p>
                  <p className="text-2xl font-bold">{batches.filter((b) => b.status === "disapproved").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 bg-blue-600 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Total Items</p>
                  <p className="text-2xl font-bold">{batches.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Review Items</CardTitle>
            <CardDescription>Review and approve/disapprove submitted batches and processes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by batch ID or submitter..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {["all", "pending", "approved", "disapproved"].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status as any)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {filteredBatches.map((batch) => (
                <div key={batch.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{getTypeLabel(batch.type)}</h3>
                        <Badge variant="outline">{batch.batchId}</Badge>
                        {getStatusBadge(batch.status)}
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <strong>Submitted by:</strong> {batch.submittedBy}
                        </p>
                        <p>
                          <strong>Submitted at:</strong> {batch.submittedAt}
                        </p>
                        <p>
                          <strong>Details:</strong> {JSON.stringify(batch.details)}
                        </p>
                      </div>
                    </div>

                    {batch.status === "pending" && (
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(batch.batchId, batch.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDisapprove(batch.batchId, batch.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Disapprove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredBatches.length === 0 && (
                <div className="text-center py-8 text-gray-500">No items found matching your criteria.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

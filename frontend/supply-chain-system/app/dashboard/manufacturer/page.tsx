"use client"

import type React from "react"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import BatchHistoryModal from "@/components/batch-history-modal"
import { X, History, Search } from "lucide-react"

interface ProductData {
  finalProductId: string
  productName: string
  formulationDate: string
  expiryDate: string
  ingredientBatchIds: string[]
}

export default function ManufacturerDashboard() {
  const [formData, setFormData] = useState<ProductData>({
    finalProductId: "",
    productName: "",
    formulationDate: "",
    expiryDate: "",
    ingredientBatchIds: [],
  })
  const [newBatchId, setNewBatchId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof Omit<ProductData, "ingredientBatchIds">, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addBatchId = () => {
    if (newBatchId.trim() && !formData.ingredientBatchIds.includes(newBatchId.trim())) {
      setFormData((prev) => ({
        ...prev,
        ingredientBatchIds: [...prev.ingredientBatchIds, newBatchId.trim()],
      }))
      setNewBatchId("")
    }
  }

  const removeBatchId = (batchId: string) => {
    setFormData((prev) => ({
      ...prev,
      ingredientBatchIds: prev.ingredientBatchIds.filter((id) => id !== batchId),
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
      const response = await fetch("/api/formulateProduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert("Product formulated successfully!")
        // Reset form
        setFormData({
          finalProductId: "",
          productName: "",
          formulationDate: "",
          expiryDate: "",
          ingredientBatchIds: [],
        })
      } else {
        alert("Failed to formulate product")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error formulating product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentDate = () => {
    const now = new Date()
    const dateString = now.toISOString().split("T")[0]
    handleInputChange("formulationDate", dateString)
  }

  return (
    <DashboardLayout title="Manufacturer Dashboard">
      <div className="grid gap-6">
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-orange-900">Batch Query & History</CardTitle>
            <CardDescription className="text-orange-700">
              Search for any batch history and track supply chain events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/batch-history")}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Search className="h-5 w-5 mr-2" />
              Query Batch History
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formulate Product</CardTitle>
            <CardDescription>
              Create a final product by combining ingredient batches with formulation details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="finalProductId">Final Product ID</Label>
                  <Input
                    id="finalProductId"
                    value={formData.finalProductId}
                    onChange={(e) => handleInputChange("finalProductId", e.target.value)}
                    placeholder="Enter final product ID"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => handleInputChange("productName", e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formulationDate">Formulation Date</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="formulationDate"
                      type="date"
                      value={formData.formulationDate}
                      onChange={(e) => handleInputChange("formulationDate", e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentDate}
                      className="whitespace-nowrap bg-transparent"
                    >
                      Use Today
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredientBatchIds">Ingredient Batch IDs</Label>
                <div className="flex space-x-2">
                  <Input
                    id="ingredientBatchIds"
                    value={newBatchId}
                    onChange={(e) => setNewBatchId(e.target.value)}
                    placeholder="Enter batch ID and click Add"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBatchId())}
                  />
                  <Button type="button" variant="outline" onClick={addBatchId} disabled={!newBatchId.trim()}>
                    Add
                  </Button>
                </div>

                {formData.ingredientBatchIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.ingredientBatchIds.map((batchId) => (
                      <div key={batchId} className="flex items-center gap-1">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {batchId}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeBatchId(batchId)} />
                        </Badge>
                        <BatchHistoryModal batchId={batchId}>
                          <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <History className="h-3 w-3" />
                          </Button>
                        </BatchHistoryModal>
                      </div>
                    ))}
                  </div>
                )}

                {formData.ingredientBatchIds.length === 0 && (
                  <p className="text-sm text-gray-500">No ingredient batches added yet</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || formData.ingredientBatchIds.length === 0}
              >
                {isSubmitting ? "Formulating Product..." : "Formulate Product"}
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

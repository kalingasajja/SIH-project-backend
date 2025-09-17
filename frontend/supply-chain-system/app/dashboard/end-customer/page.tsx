"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Package, CheckCircle, AlertCircle } from "lucide-react"

interface ProductDetails {
  finalProductTx: {
    event: string
    finalProductId: string
    productName: string
    formulationDate: string
    expiryDate: string
    ingredientBatchIds: string[]
    timestamp: number
  }
  ingredients: Array<{
    batchId: string
    history: Array<{
      event: string
      [key: string]: any
    }>
  }>
}

export default function EndCustomerDashboard() {
  const [finalProductId, setFinalProductId] = useState("")
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!finalProductId.trim()) {
      setError("Please enter a Final Product ID")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/fullProvenance/${finalProductId}`)
      if (!response.ok) {
        throw new Error("Product not found")
      }

      const data = await response.json()
      setProductDetails(data)
    } catch (err) {
      setError("Failed to fetch product details. Please check the Product ID.")
      setProductDetails(null)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <DashboardLayout title="Product Verification Portal" showTransferCustody={false}>
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-900">Batch Query & History</CardTitle>
            <CardDescription className="text-purple-700">
              Search for any batch history and track supply chain events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/batch-history")}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Search className="h-5 w-5 mr-2" />
              Query Batch History
            </Button>
          </CardContent>
        </Card>

        {/* Government Header */}
        <div className="bg-gradient-to-r from-orange-50 to-green-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-orange-300">
              {/* Ashok Chakra representation */}
              <div className="w-12 h-12 border-4 border-blue-600 rounded-full relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                {/* Spokes */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-4 bg-blue-600 top-1/2 left-1/2 origin-bottom"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Government of India</h1>
              <p className="text-lg text-gray-700">Supply Chain Verification System</p>
              <p className="text-sm text-gray-600">Ensuring Quality & Transparency</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="border-2 border-blue-100">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-blue-600" />
              <span>Product Verification</span>
            </CardTitle>
            <CardDescription>Enter the Final Product ID to view complete ingredient traceability</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="productId" className="text-sm font-medium">
                  Final Product ID
                </Label>
                <Input
                  id="productId"
                  value={finalProductId}
                  onChange={(e) => setFinalProductId(e.target.value)}
                  placeholder="Enter Product ID (e.g., F01)"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading ? "Searching..." : "Verify Product"}
                </Button>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Details */}
        {productDetails && (
          <div className="space-y-6">
            {/* Product Information */}
            <Card className="border-2 border-green-100">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <span>Product Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Product Name</Label>
                    <p className="text-lg font-semibold">{productDetails.finalProductTx.productName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Product ID</Label>
                    <p className="text-lg font-semibold">{productDetails.finalProductTx.finalProductId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Formulation Date</Label>
                    <p className="text-lg font-semibold">{formatDate(productDetails.finalProductTx.formulationDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Expiry Date</Label>
                    <p className="text-lg font-semibold">{formatDate(productDetails.finalProductTx.expiryDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ingredient Details */}
            <Card className="border-2 border-purple-100">
              <CardHeader className="bg-purple-50">
                <CardTitle>Ingredient Traceability</CardTitle>
                <CardDescription>Complete history of all ingredients used in this product</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {productDetails.ingredients.map((ingredient, index) => (
                    <div key={ingredient.batchId} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Ingredient Batch: {ingredient.batchId}</h3>
                        <Badge className="bg-blue-100 text-blue-800">{ingredient.history.length} Events</Badge>
                      </div>

                      <div className="space-y-3">
                        {ingredient.history.map((event, eventIndex) => (
                          <div key={eventIndex} className="bg-white border rounded-md p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge className={getEventBadgeColor(event.event)}>{event.event}</Badge>
                                  {event.timestamp && (
                                    <span className="text-sm text-gray-500">
                                      {new Date(event.timestamp).toLocaleString("en-IN")}
                                    </span>
                                  )}
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
                              </div>
                              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

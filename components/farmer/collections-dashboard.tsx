"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/auth"
import { db, type HerbCollection, type Farmer } from "@/lib/database"
import { Sprout, Search, Filter, Download, Calendar, MapPin, Package, Camera } from "lucide-react"

export function CollectionsDashboard() {
  const [collections, setCollections] = useState<HerbCollection[]>([])
  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadCollectionsData()
  }, [])

  const loadCollectionsData = async () => {
    try {
      const user = AuthService.getCurrentUser()
      if (user) {
        let farmerData = await db.getFarmerByUserId(user.id)

        // If no farmer found, use demo farmer data
        if (!farmerData) {
          farmerData = {
            id: "farmer_raj_001",
            userId: user.id,
            name: "Raj Farmer",
            contactInfo: {
              phone: "+91 98765 43210",
              email: "farmer@ayurtrace.com",
              address: "Village Herbal Gardens, Uttarakhand, India",
            },
            farmLocation: {
              gps: "30.0668° N, 79.0193° E",
              address: "Herbal Valley, Dehradun District, Uttarakhand",
              area: 5.2,
              areaUnit: "acres",
            },
            herbTypes: ["Ashwagandha", "Turmeric", "Brahmi", "Neem", "Tulsi"],
            experience: 12,
            certifications: ["Organic Farming Certificate", "Ayurvedic Herb Cultivation License"],
            registrationDate: "2024-01-15T10:30:00Z",
            status: "approved",
          }
        }

        setFarmer(farmerData)

        // Load demo collections data
        const demoCollections: HerbCollection[] = [
          {
            id: "herb_001",
            farmerId: farmerData.id,
            herbName: "Ashwagandha",
            quantity: 25,
            quantityUnit: "kg",
            harvestDate: "2024-12-01",
            location: "Field A - North Section",
            qualityGrade: "A",
            photos: ["/fresh-ashwagandha-roots.jpg"],
            status: "approved",
            processorId: "proc_001",
            submissionDate: "2024-12-02T08:00:00Z",
            approvalDate: "2024-12-03T14:30:00Z",
          },
          {
            id: "herb_002",
            farmerId: farmerData.id,
            herbName: "Turmeric",
            quantity: 40,
            quantityUnit: "kg",
            harvestDate: "2024-11-28",
            location: "Field B - South Section",
            qualityGrade: "A",
            photos: ["/fresh-turmeric-rhizomes.jpg"],
            status: "pending",
            submissionDate: "2024-11-29T09:15:00Z",
          },
          {
            id: "herb_003",
            farmerId: farmerData.id,
            herbName: "Brahmi",
            quantity: 15,
            quantityUnit: "kg",
            harvestDate: "2024-11-25",
            location: "Field C - East Section",
            qualityGrade: "B",
            photos: ["/fresh-brahmi-leaves.jpg"],
            status: "rejected",
            rejectionReason: "Moisture content too high. Please dry properly before resubmission.",
            submissionDate: "2024-11-26T11:00:00Z",
          },
        ]

        setCollections(demoCollections)
      }
    } catch (error) {
      console.error("Error loading collections data:", error)
      toast({
        title: "Error",
        description: "Failed to load collections data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCollections = collections.filter((collection) => {
    const matchesSearch = collection.herbName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || collection.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: HerbCollection["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getGradeColor = (grade: "A" | "B" | "C") => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800"
      case "B":
        return "bg-blue-100 text-blue-800"
      case "C":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const downloadCollections = () => {
    const csvContent = [
      ["Herb Name", "Quantity", "Unit", "Harvest Date", "Location", "Quality Grade", "Status", "Submission Date"],
      ...filteredCollections.map((collection) => [
        collection.herbName,
        collection.quantity.toString(),
        collection.quantityUnit,
        collection.harvestDate,
        collection.location,
        collection.qualityGrade,
        collection.status,
        new Date(collection.submissionDate).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `herb-collections-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Download Complete",
      description: "Collections data has been downloaded as CSV",
    })
  }

  const stats = {
    totalCollections: collections.length,
    approvedCollections: collections.filter((c) => c.status === "approved").length,
    pendingCollections: collections.filter((c) => c.status === "pending").length,
    rejectedCollections: collections.filter((c) => c.status === "rejected").length,
    totalQuantity: collections.filter((c) => c.status === "approved").reduce((sum, c) => sum + c.quantity, 0),
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading collections data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body font-medium">Total Collections</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-heading font-bold align-numeric">{stats.totalCollections}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body font-medium">Approved</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-heading font-bold text-green-600 align-numeric">{stats.approvedCollections}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-heading font-bold text-yellow-600 align-numeric">{stats.pendingCollections}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body font-medium">Rejected</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-heading font-bold text-red-600 align-numeric">{stats.rejectedCollections}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body font-medium">Total Approved (kg)</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-heading font-bold align-numeric">{stats.totalQuantity.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Collections Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Collections</CardTitle>
              <CardDescription>Track your herb collection submissions and their status</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadCollections} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button asChild>
                <a href="/farmer/collection">Submit New Collection</a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by herb name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredCollections.length === 0 ? (
              <div className="text-center py-8">
                <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-subheading font-medium">No collections found</h3>
                <p className="text-body text-muted-foreground">Submit your first herb collection to get started</p>
              </div>
            ) : (
              filteredCollections.map((collection) => (
                <Card key={collection.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Sprout className="h-5 w-5 text-primary" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-subheading font-medium">{collection.herbName}</h3>
                          <Badge className={getStatusColor(collection.status)}>{collection.status.toUpperCase()}</Badge>
                          <Badge className={getGradeColor(collection.qualityGrade)}>
                            Grade {collection.qualityGrade}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-body text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {collection.quantity} {collection.quantityUnit}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(collection.harvestDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {collection.location}
                          </div>
                          {collection.photos.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Camera className="h-3 w-3" />
                              {collection.photos.length} photo(s)
                            </div>
                          )}
                        </div>
                        <p className="text-caption text-muted-foreground mt-1">
                          Submitted: {new Date(collection.submissionDate).toLocaleDateString()}
                          {collection.approvalDate && (
                            <span> • Processed: {new Date(collection.approvalDate).toLocaleDateString()}</span>
                          )}
                        </p>
                        {collection.rejectionReason && (
                          <p className="text-caption text-red-600 mt-1">
                            Rejection reason: {collection.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/auth"
import { db, type Farmer } from "@/lib/database"
import { Camera, MapPin, Calendar, Package, Sprout } from "lucide-react"
import { useRouter } from "next/navigation"

const herbTypes = [
  "Ashwagandha",
  "Turmeric",
  "Neem",
  "Tulsi",
  "Brahmi",
  "Amla",
  "Ginger",
  "Cardamom",
  "Cinnamon",
  "Fenugreek",
  "Moringa",
  "Guduchi",
  "Shatavari",
  "Arjuna",
  "Triphala",
]

const qualityGrades = [
  { value: "A", label: "Grade A - Premium Quality", description: "Highest quality, perfect condition" },
  { value: "B", label: "Grade B - Good Quality", description: "Good quality with minor imperfections" },
  { value: "C", label: "Grade C - Standard Quality", description: "Standard quality, suitable for processing" },
]

export function HerbCollectionForm() {
  const [formData, setFormData] = useState({
    herbName: "",
    quantity: "",
    quantityUnit: "kg",
    harvestDate: "",
    location: "",
    qualityGrade: "" as "A" | "B" | "C" | "",
    photos: [] as string[],
    notes: "",
  })
  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = AuthService.getCurrentUser()
        if (user) {
          const farmerData = await db.getFarmerByUserId(user.id)
          setFarmer(farmerData)
          if (!farmerData) {
            setLoadingError("Farmer profile not found. Please contact support.")
          }
        } else {
          setLoadingError("User not authenticated. Please log in again.")
        }
      } catch (error) {
        console.error("Error loading farmer data:", error)
        setLoadingError("Failed to load farmer profile. Please try again.")
      } finally {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const photoUrls = Array.from(files).map((file, index) => `/placeholder-photos/herb-${Date.now()}-${index}.jpg`)
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...photoUrls].slice(0, 5),
      }))
      toast({
        title: "Photos Added",
        description: `${files.length} photo(s) added to collection`,
      })
    }
  }

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!farmer) {
        toast({
          title: "Error",
          description: "Farmer registration required. Please complete registration first.",
          variant: "destructive",
        })
        return
      }

      const collectionData = {
        farmerId: farmer.id,
        herbName: formData.herbName,
        quantity: Number.parseFloat(formData.quantity),
        quantityUnit: formData.quantityUnit,
        harvestDate: formData.harvestDate,
        location: formData.location,
        qualityGrade: formData.qualityGrade as "A" | "B" | "C",
        photos: formData.photos,
      }

      const newCollection = await db.saveHerbCollection(collectionData)

      setFormData({
        herbName: "",
        quantity: "",
        quantityUnit: "kg",
        harvestDate: "",
        location: "",
        qualityGrade: "",
        photos: [],
        notes: "",
      })

      toast({
        title: "Collection Submitted",
        description: `Your ${formData.herbName} collection has been submitted for review.`,
      })

      router.push("/farmer/collections")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading collection form...</p>
        </div>
      </div>
    )
  }

  if (loadingError || !farmer) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Unable to Load Form</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {loadingError || "Farmer profile not found. Please contact support."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
              <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" />
          Herb Collection Form
        </CardTitle>
        <CardDescription>Submit your harvested herbs for quality assessment and processing</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="herbName">Herb Name *</Label>
              <Select value={formData.herbName} onValueChange={(value) => handleInputChange("herbName", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select herb type" />
                </SelectTrigger>
                <SelectContent>
                  {herbTypes.map((herb) => (
                    <SelectItem key={herb} value={herb}>
                      {herb}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="harvestDate">Harvest Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="harvestDate"
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => handleInputChange("harvestDate", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    placeholder="Enter quantity"
                    className="pl-10"
                    required
                  />
                </div>
                <Select
                  value={formData.quantityUnit}
                  onValueChange={(value) => handleInputChange("quantityUnit", value)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="grams">g</SelectItem>
                    <SelectItem value="tons">tons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Field location or GPS coordinates"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualityGrade">Quality Grade *</Label>
            <Select value={formData.qualityGrade} onValueChange={(value) => handleInputChange("qualityGrade", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select quality grade" />
              </SelectTrigger>
              <SelectContent>
                {qualityGrades.map((grade) => (
                  <SelectItem key={grade.value} value={grade.value}>
                    <div>
                      <div className="font-medium">{grade.label}</div>
                      <div className="text-xs text-muted-foreground">{grade.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photos">Photos (Optional)</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("photo-upload")?.click()}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Add Photos
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <span className="text-sm text-muted-foreground">{formData.photos.length}/5 photos added</span>
              </div>

              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional information about the harvest..."
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Submitting Collection..." : "Submit Collection"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => router.push("/farmer/collections")}
            >
              View My Collections
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

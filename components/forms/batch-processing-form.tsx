"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/auth"
import { db, type BatchRecord, type Processor } from "@/lib/database"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

const processingMethods = [
  "Steam Distillation",
  "Solvent Extraction",
  "Cold Pressing",
  "Grinding",
  "Drying",
  "Fermentation",
  "Decoction",
  "Infusion",
]

const qualityTestOptions = [
  "Moisture Content",
  "Ash Content",
  "Heavy Metals",
  "Microbial Testing",
  "Pesticide Residue",
  "Active Compound Analysis",
  "pH Testing",
  "Particle Size Analysis",
]

export function BatchProcessingForm() {
  const [formData, setFormData] = useState({
    batchId: "",
    rawMaterialSource: "",
    processingMethod: "",
    temperature: "",
    temperatureUnit: "celsius",
    duration: "",
    durationUnit: "hours",
    outputQuantity: "",
    outputUnit: "kg",
    qualityTests: [] as string[],
    notes: "",
  })
  const [processor, setProcessor] = useState<Processor | null>(null)
  const [recentBatches, setRecentBatches] = useState<BatchRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const user = AuthService.getCurrentUser()
      if (user) {
        const processorData = await db.getProcessorByUserId(user.id)
        setProcessor(processorData)

        if (processorData) {
          const batches = await db.getBatchesByProcessorId(processorData.id)
          setRecentBatches(batches.slice(-5).reverse()) // Last 5 batches
        }
      }
      setIsLoadingData(false)
    }
    loadData()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTestToggle = (test: string) => {
    setFormData((prev) => ({
      ...prev,
      qualityTests: prev.qualityTests.includes(test)
        ? prev.qualityTests.filter((t) => t !== test)
        : [...prev.qualityTests, test],
    }))
  }

  const generateBatchId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `BATCH-${timestamp}-${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!processor) {
        toast({
          title: "Error",
          description: "Processor registration required. Please complete registration first.",
          variant: "destructive",
        })
        return
      }

      const batchData = {
        processorId: processor.id,
        batchId: formData.batchId || generateBatchId(),
        rawMaterialSource: formData.rawMaterialSource,
        processingMethod: formData.processingMethod,
        temperature: Number.parseFloat(formData.temperature),
        temperatureUnit: formData.temperatureUnit,
        duration: Number.parseFloat(formData.duration),
        durationUnit: formData.durationUnit,
        outputQuantity: Number.parseFloat(formData.outputQuantity),
        outputUnit: formData.outputUnit,
        qualityTests: formData.qualityTests,
        status: "processing" as const,
      }

      const newBatch = await db.saveBatch(batchData)

      // Update recent batches
      const updatedBatches = await db.getBatchesByProcessorId(processor.id)
      setRecentBatches(updatedBatches.slice(-5).reverse())

      // Reset form
      setFormData({
        batchId: "",
        rawMaterialSource: "",
        processingMethod: "",
        temperature: "",
        temperatureUnit: "celsius",
        duration: "",
        durationUnit: "hours",
        outputQuantity: "",
        outputUnit: "kg",
        qualityTests: [],
        notes: "",
      })

      toast({
        title: "Batch Recorded",
        description: `Batch ${newBatch.batchId} has been successfully recorded.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record batch. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const hasUnsavedChanges = () => {
    return Object.values(formData).some((value) => (Array.isArray(value) ? value.length > 0 : value !== ""))
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading batch processing data...</p>
        </div>
      </div>
    )
  }

  if (!processor) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Registration Required</CardTitle>
          <CardDescription>You need to complete your profile setup before recording batches.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/profile">Complete Profile Setup</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "quality_check":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Batch Processing</CardTitle>
          <CardDescription>Record a new batch processing operation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="batchId">Batch ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="batchId"
                    value={formData.batchId}
                    onChange={(e) => handleInputChange("batchId", e.target.value)}
                    placeholder="Leave empty to auto-generate"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleInputChange("batchId", generateBatchId())}
                  >
                    Generate
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rawMaterialSource">Raw Material Source *</Label>
                <Input
                  id="rawMaterialSource"
                  value={formData.rawMaterialSource}
                  onChange={(e) => handleInputChange("rawMaterialSource", e.target.value)}
                  placeholder="Enter source/supplier"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="processingMethod">Processing Method *</Label>
              <Select
                value={formData.processingMethod}
                onValueChange={(value) => handleInputChange("processingMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select processing method" />
                </SelectTrigger>
                <SelectContent>
                  {processingMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature *</Label>
                <div className="flex gap-2">
                  <Input
                    id="temperature"
                    type="number"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange("temperature", e.target.value)}
                    placeholder="Enter temperature"
                    required
                  />
                  <Select
                    value={formData.temperatureUnit}
                    onValueChange={(value) => handleInputChange("temperatureUnit", value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celsius">°C</SelectItem>
                      <SelectItem value="fahrenheit">°F</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <div className="flex gap-2">
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="Enter duration"
                    required
                  />
                  <Select
                    value={formData.durationUnit}
                    onValueChange={(value) => handleInputChange("durationUnit", value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="outputQuantity">Output Quantity *</Label>
                <Input
                  id="outputQuantity"
                  type="number"
                  value={formData.outputQuantity}
                  onChange={(e) => handleInputChange("outputQuantity", e.target.value)}
                  placeholder="Enter output quantity"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outputUnit">Output Unit</Label>
                <Select value={formData.outputUnit} onValueChange={(value) => handleInputChange("outputUnit", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="grams">Grams (g)</SelectItem>
                    <SelectItem value="liters">Liters (L)</SelectItem>
                    <SelectItem value="ml">Milliliters (mL)</SelectItem>
                    <SelectItem value="units">Units</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Quality Tests Performed</Label>
              <div className="grid gap-2 md:grid-cols-2">
                {qualityTestOptions.map((test) => (
                  <div key={test} className="flex items-center space-x-2">
                    <Checkbox
                      id={test}
                      checked={formData.qualityTests.includes(test)}
                      onCheckedChange={() => handleTestToggle(test)}
                    />
                    <Label htmlFor={test} className="text-sm font-normal">
                      {test}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Recording Batch..." : "Record Batch"}
              </Button>

              {hasUnsavedChanges() ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" className="flex-1 bg-transparent">
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                      <AlertDialogDescription>
                        You have unsaved batch data. Are you sure you want to leave without saving?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Continue Editing</AlertDialogCancel>
                      <AlertDialogAction onClick={() => router.push("/dashboard")}>
                        Leave Without Saving
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => router.push("/dashboard")}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {recentBatches.length > 0 && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Recent Batches</CardTitle>
            <CardDescription>Your latest batch processing records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBatches.map((batch) => (
                <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{batch.batchId}</span>
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {batch.processingMethod} • {batch.outputQuantity} {batch.outputUnit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(batch.processingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>
                      {batch.temperature}°{batch.temperatureUnit === "celsius" ? "C" : "F"}
                    </p>
                    <p>
                      {batch.duration} {batch.durationUnit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

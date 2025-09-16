"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/auth"
import { db, type QualityTest, type QualityParameter } from "@/lib/database"
import { Plus, Trash2 } from "lucide-react"

interface QualityTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  test?: QualityTest | null
  onSave: (test: QualityTest) => void
}

const testTypes = [
  "Moisture Content",
  "Ash Content",
  "Heavy Metals",
  "Microbial Testing",
  "Pesticide Residue",
  "Active Compound Analysis",
  "pH Testing",
  "Particle Size Analysis",
  "Purity Testing",
  "Stability Testing",
]

const complianceStandards = [
  "ISO 9001",
  "ISO 22000",
  "HACCP",
  "GMP",
  "FDA Guidelines",
  "Ayush Standards",
  "FSSAI Standards",
  "WHO Guidelines",
]

export function QualityTestDialog({ open, onOpenChange, test, onSave }: QualityTestDialogProps) {
  const [formData, setFormData] = useState({
    batchId: "",
    testType: "",
    testDate: "",
    notes: "",
    complianceStandards: [] as string[],
    status: "scheduled" as QualityTest["status"],
    overallResult: "pending" as QualityTest["overallResult"],
    correctiveActions: [] as string[],
  })
  const [parameters, setParameters] = useState<QualityParameter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (test) {
      setFormData({
        batchId: test.batchId,
        testType: test.testType,
        testDate: test.testDate.split("T")[0],
        notes: test.notes,
        complianceStandards: test.complianceStandards,
        status: test.status,
        overallResult: test.overallResult,
        correctiveActions: test.correctiveActions || [],
      })
      setParameters(test.parameters)
    } else {
      // Reset form for new test
      setFormData({
        batchId: "",
        testType: "",
        testDate: new Date().toISOString().split("T")[0],
        notes: "",
        complianceStandards: [],
        status: "scheduled",
        overallResult: "pending",
        correctiveActions: [],
      })
      setParameters([])
    }
  }, [test, open])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleStandardToggle = (standard: string) => {
    setFormData((prev) => ({
      ...prev,
      complianceStandards: prev.complianceStandards.includes(standard)
        ? prev.complianceStandards.filter((s) => s !== standard)
        : [...prev.complianceStandards, standard],
    }))
  }

  const addParameter = () => {
    setParameters((prev) => [
      ...prev,
      {
        name: "",
        expectedValue: "",
        actualValue: "",
        unit: "",
        result: "within_range",
        tolerance: "",
      },
    ])
  }

  const updateParameter = (index: number, field: keyof QualityParameter, value: string) => {
    setParameters((prev) => prev.map((param, i) => (i === index ? { ...param, [field]: value } : param)))
  }

  const removeParameter = (index: number) => {
    setParameters((prev) => prev.filter((_, i) => i !== index))
  }

  const calculateOverallResult = () => {
    if (parameters.length === 0) return "pending"
    const failedParams = parameters.filter((param) => param.result === "fail")
    return failedParams.length > 0 ? "fail" : "pass"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = AuthService.getCurrentUser()
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        })
        return
      }

      const overallResult = formData.status === "completed" ? calculateOverallResult() : formData.overallResult

      const testData: QualityTest = {
        id: test?.id || "",
        batchId: formData.batchId,
        testType: formData.testType,
        testDate: formData.testDate,
        testerId: user.id,
        parameters,
        overallResult,
        notes: formData.notes,
        complianceStandards: formData.complianceStandards,
        correctiveActions: formData.correctiveActions,
        status: formData.status,
      }

      if (test) {
        const updatedTest = await db.updateQualityTest(test.id, testData)
        if (updatedTest) {
          onSave(updatedTest)
        }
      } else {
        const newTest = await db.saveQualityTest(testData)
        onSave(newTest)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save quality test",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{test ? "Edit Quality Test" : "Schedule Quality Test"}</DialogTitle>
          <DialogDescription>
            {test ? "Update quality test details and results" : "Schedule a new quality control test"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="batchId">Batch ID *</Label>
              <Input
                id="batchId"
                value={formData.batchId}
                onChange={(e) => handleInputChange("batchId", e.target.value)}
                placeholder="Enter batch ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testType">Test Type *</Label>
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
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="testDate">Test Date *</Label>
              <Input
                id="testDate"
                type="date"
                value={formData.testDate}
                onChange={(e) => handleInputChange("testDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: QualityTest["status"]) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="overallResult">Overall Result</Label>
              <Select
                value={formData.overallResult}
                onValueChange={(value: QualityTest["overallResult"]) => handleInputChange("overallResult", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Compliance Standards</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {complianceStandards.map((standard) => (
                <div key={standard} className="flex items-center space-x-2">
                  <Checkbox
                    id={standard}
                    checked={formData.complianceStandards.includes(standard)}
                    onCheckedChange={() => handleStandardToggle(standard)}
                  />
                  <Label htmlFor={standard} className="text-sm font-normal">
                    {standard}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Test Parameters</Label>
              <Button type="button" variant="outline" size="sm" onClick={addParameter}>
                <Plus className="h-4 w-4 mr-2" />
                Add Parameter
              </Button>
            </div>
            {parameters.map((param, index) => (
              <div key={index} className="grid gap-4 md:grid-cols-6 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Parameter Name</Label>
                  <Input
                    value={param.name}
                    onChange={(e) => updateParameter(index, "name", e.target.value)}
                    placeholder="e.g., Moisture"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected Value</Label>
                  <Input
                    value={param.expectedValue}
                    onChange={(e) => updateParameter(index, "expectedValue", e.target.value)}
                    placeholder="e.g., <10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Actual Value</Label>
                  <Input
                    value={param.actualValue}
                    onChange={(e) => updateParameter(index, "actualValue", e.target.value)}
                    placeholder="e.g., 8.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    value={param.unit}
                    onChange={(e) => updateParameter(index, "unit", e.target.value)}
                    placeholder="e.g., %"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Result</Label>
                  <Select
                    value={param.result}
                    onValueChange={(value: QualityParameter["result"]) => updateParameter(index, "result", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pass">Pass</SelectItem>
                      <SelectItem value="fail">Fail</SelectItem>
                      <SelectItem value="within_range">Within Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Actions</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeParameter(index)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Enter test notes and observations"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : test ? "Update Test" : "Schedule Test"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

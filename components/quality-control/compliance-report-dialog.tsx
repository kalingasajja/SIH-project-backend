"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/auth"
import { db, type ComplianceReport, type QualityTest } from "@/lib/database"

interface ComplianceReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qualityTests: QualityTest[]
  onGenerate: (report: ComplianceReport) => void
}

const reportTypes = [
  "Monthly Compliance Report",
  "Quarterly Quality Review",
  "Annual Audit Report",
  "Batch Quality Summary",
  "Regulatory Compliance Report",
  "Customer Quality Report",
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

export function ComplianceReportDialog({ open, onOpenChange, qualityTests, onGenerate }: ComplianceReportDialogProps) {
  const [formData, setFormData] = useState({
    reportType: "",
    dateFrom: "",
    dateTo: "",
    complianceStandards: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

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

      // Filter tests by date range
      const fromDate = new Date(formData.dateFrom)
      const toDate = new Date(formData.dateTo)

      const filteredTests = qualityTests.filter((test) => {
        const testDate = new Date(test.testDate)
        return testDate >= fromDate && testDate <= toDate && test.status === "completed"
      })

      const passedTests = filteredTests.filter((test) => test.overallResult === "pass")
      const failedBatches = filteredTests.filter((test) => test.overallResult === "fail").map((test) => test.batchId)

      const passRate = filteredTests.length > 0 ? (passedTests.length / filteredTests.length) * 100 : 0

      const reportData: Omit<ComplianceReport, "id"> = {
        reportDate: new Date().toISOString(),
        reportType: formData.reportType,
        batchesTested: filteredTests.length,
        passRate,
        failedBatches,
        complianceStandards: formData.complianceStandards,
        generatedBy: user.id,
        auditTrail: [], // Will be populated by the database service
      }

      const newReport = await db.saveComplianceReport(reportData)
      onGenerate(newReport)

      // Reset form
      setFormData({
        reportType: "",
        dateFrom: "",
        dateTo: "",
        complianceStandards: [],
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate compliance report",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Compliance Report</DialogTitle>
          <DialogDescription>Create a compliance report based on quality test results</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select value={formData.reportType} onValueChange={(value) => handleInputChange("reportType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date *</Label>
              <Input
                id="dateFrom"
                type="date"
                value={formData.dateFrom}
                onChange={(e) => handleInputChange("dateFrom", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date *</Label>
              <Input
                id="dateTo"
                type="date"
                value={formData.dateTo}
                onChange={(e) => handleInputChange("dateTo", e.target.value)}
                required
              />
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

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

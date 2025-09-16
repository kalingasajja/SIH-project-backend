"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { db, type QualityTest, type BatchRecord, type ComplianceReport, type AuditEntry } from "@/lib/database"
import { Shield, CheckCircle, XCircle, Clock, Plus, FileText, Activity } from "lucide-react"
import { QualityTestDialog } from "./quality-test-dialog"
import { ComplianceReportDialog } from "./compliance-report-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function QualityControlDashboard() {
  const [qualityTests, setQualityTests] = useState<QualityTest[]>([])
  const [batches, setBatches] = useState<BatchRecord[]>([])
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([])
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedTest, setSelectedTest] = useState<QualityTest | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadQualityData()
  }, [])

  const loadQualityData = async () => {
    try {
      const testsData = await db.getAllQualityTests()
      const batchesData = await db.getBatchesByProcessorId("") // Get all batches for QC officer
      const reportsData = await db.getComplianceReports()
      const auditData = await db.getAuditTrail(50) // Last 50 entries

      setQualityTests(testsData)
      setBatches(batchesData)
      setComplianceReports(reportsData)
      setAuditTrail(auditData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quality control data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTest = async (newTest: QualityTest) => {
    setQualityTests((prev) => [...prev, newTest])
    setShowTestDialog(false)
    await loadQualityData() // Refresh audit trail
    toast({
      title: "Test Added",
      description: "Quality test has been scheduled successfully",
    })
  }

  const handleUpdateTest = async (updatedTest: QualityTest) => {
    setQualityTests((prev) => prev.map((test) => (test.id === updatedTest.id ? updatedTest : test)))
    setSelectedTest(null)
    setShowTestDialog(false)
    await loadQualityData() // Refresh audit trail
    toast({
      title: "Test Updated",
      description: "Quality test has been updated successfully",
    })
  }

  const handleGenerateReport = async (newReport: ComplianceReport) => {
    setComplianceReports((prev) => [...prev, newReport])
    setShowReportDialog(false)
    await loadQualityData() // Refresh audit trail
    toast({
      title: "Report Generated",
      description: "Compliance report has been generated successfully",
    })
  }

  const filteredTests = qualityTests.filter((test) => {
    const matchesSearch =
      test.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.testType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || test.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: QualityTest["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getResultColor = (result: QualityTest["overallResult"]) => {
    switch (result) {
      case "pass":
        return "bg-green-100 text-green-800"
      case "fail":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: QualityTest["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "scheduled":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const stats = {
    totalTests: qualityTests.length,
    completedTests: qualityTests.filter((test) => test.status === "completed").length,
    passedTests: qualityTests.filter((test) => test.overallResult === "pass").length,
    failedTests: qualityTests.filter((test) => test.overallResult === "fail").length,
    passRate:
      qualityTests.length > 0
        ? (qualityTests.filter((test) => test.overallResult === "pass").length /
            qualityTests.filter((test) => test.status === "completed").length) *
            100 || 0
        : 0,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading quality control data...</p>
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
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedTests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.passedTests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedTests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.passRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">Quality Tests</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quality Tests</CardTitle>
                  <CardDescription>Manage and track quality control tests</CardDescription>
                </div>
                <Button onClick={() => setShowTestDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search by batch ID or test type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredTests.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No quality tests found</h3>
                    <p className="text-muted-foreground">Schedule your first quality test to get started</p>
                  </div>
                ) : (
                  filteredTests.map((test) => (
                    <Card key={test.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(test.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{test.testType}</h3>
                              <Badge className={getStatusColor(test.status)}>
                                {test.status.replace("_", " ").toUpperCase()}
                              </Badge>
                              <Badge className={getResultColor(test.overallResult)}>
                                {test.overallResult.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Batch: {test.batchId} • Date: {new Date(test.testDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Parameters: {test.parameters.length} • Standards: {test.complianceStandards.join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTest(test)
                              setShowTestDialog(true)
                            }}
                          >
                            {test.status === "completed" ? "View" : "Edit"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compliance Reports</CardTitle>
                  <CardDescription>Generate and view compliance reports</CardDescription>
                </div>
                <Button onClick={() => setShowReportDialog(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceReports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No compliance reports</h3>
                    <p className="text-muted-foreground">Generate your first compliance report</p>
                  </div>
                ) : (
                  complianceReports.map((report) => (
                    <Card key={report.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{report.reportType}</h3>
                          <p className="text-sm text-muted-foreground">
                            Generated: {new Date(report.reportDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Batches Tested: {report.batchesTested} • Pass Rate: {report.passRate.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={report.passRate >= 95 ? "default" : "destructive"}>
                            {report.passRate >= 95 ? "Compliant" : "Non-Compliant"}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Track all quality control activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditTrail.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No audit entries</h3>
                    <p className="text-muted-foreground">Audit trail will appear as activities are performed</p>
                  </div>
                ) : (
                  auditTrail.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Activity className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <p className="font-medium">{entry.action}</p>
                        <p className="text-sm text-muted-foreground">{entry.details}</p>
                        <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <QualityTestDialog
        open={showTestDialog}
        onOpenChange={setShowTestDialog}
        test={selectedTest}
        onSave={selectedTest ? handleUpdateTest : handleAddTest}
      />
      <ComplianceReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        qualityTests={qualityTests}
        onGenerate={handleGenerateReport}
      />
    </div>
  )
}

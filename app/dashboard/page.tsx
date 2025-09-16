"use client"

import { useEffect, useState } from "react"
import { AuthService, type User } from "@/lib/auth"
import { RoleGuard } from "@/components/auth/role-guard"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Activity, CheckCircle, AlertTriangle, Package, Truck } from "lucide-react"

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(AuthService.getCurrentUser())
  }, [])

  if (!user) return null

  const getRoleColor = (role: string) => {
    switch (role) {
      case "processor":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "quality_control":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "distributor":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "farmer":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <BackButton href="/" label="Back to Home" />
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-display text-primary">Welcome back, {user.name}</h1>
          <Badge className={`${getRoleColor(user.role)} px-3 py-1 text-sm font-medium`}>
            {user.role.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
        <p className="text-subheading text-muted-foreground">Manage your AyurTrace operations with ease</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-primary">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                User Profile
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-primary/10">
                <span className="text-sm font-medium text-muted-foreground">Name</span>
                <span className="font-semibold text-primary">{user.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-primary/10">
                <span className="text-sm font-medium text-muted-foreground">Email</span>
                <span className="font-medium text-sm">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-muted-foreground">Company</span>
                <span className="font-medium text-sm">{user.companyName}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {user.role === "processor" && (
          <>
            <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Package className="h-5 w-5" />
                  Processing Overview
                </CardTitle>
                <CardDescription>Your processing statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-body font-medium">Active Batches</span>
                    <span className="text-heading text-blue-700 align-numeric">12</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-body font-medium">Completed Today</span>
                    <span className="text-heading text-green-700 align-numeric">5</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-body font-medium">Quality Score</span>
                    <span className="text-heading text-emerald-700 align-numeric">98.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-body">Batch #1234 completed processing</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-body">Quality test passed for Batch #1233</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-body">New raw materials received</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {user.role === "quality_control" && (
          <>
            <Card className="border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-emerald-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle className="h-5 w-5" />
                  Quality Overview
                </CardTitle>
                <CardDescription>Quality control statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                    <span className="text-body font-medium">Tests Pending</span>
                    <span className="text-heading text-amber-700 align-numeric">8</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-body font-medium">Tests Completed</span>
                    <span className="text-heading text-green-700 align-numeric">45</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-body font-medium">Pass Rate</span>
                    <span className="text-heading text-emerald-700 align-numeric">96.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <AlertTriangle className="h-5 w-5" />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-body">Batch #1235 requires attention</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-body">3 batches passed quality control</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="text-body">Equipment calibration due tomorrow</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {user.role === "distributor" && (
          <>
            <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Truck className="h-5 w-5" />
                  Distribution Overview
                </CardTitle>
                <CardDescription>Your distribution statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-body font-medium">Active Shipments</span>
                    <span className="text-heading text-blue-700 align-numeric">23</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-body font-medium">Delivered Today</span>
                    <span className="text-heading text-green-700 align-numeric">15</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-body font-medium">On-Time Rate</span>
                    <span className="text-heading text-emerald-700 align-numeric">94.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Activity className="h-5 w-5" />
                  Shipment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-body">Shipment #S789 delivered successfully</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-body">Shipment #S790 delayed</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-body">New order received from Client ABC</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={["processor", "quality_control", "distributor", "farmer"]}>
      <DashboardContent />
    </RoleGuard>
  )
}

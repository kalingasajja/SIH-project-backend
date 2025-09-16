import type React from "react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-primary/5">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-primary/5">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  )
}

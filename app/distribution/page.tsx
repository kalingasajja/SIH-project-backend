import { RoleGuard } from "@/components/auth/role-guard"
import { DistributionDashboard } from "@/components/distribution/distribution-dashboard"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { BackButton } from "@/components/ui/back-button"

export default function DistributionPage() {
  return (
    <RoleGuard allowedRoles={["distributor", "processor", "quality_control"]}>
      <div className="p-6">
        <div className="mb-6">
          <BackButton href="/dashboard" />
          <BreadcrumbNav items={[{ label: "Distribution Tracking" }]} />
          <h1 className="text-3xl font-bold text-foreground">Distribution Tracking</h1>
          <p className="text-muted-foreground">
            Track shipments, manage deliveries, and monitor supply chain visibility
          </p>
        </div>
        <DistributionDashboard />
      </div>
    </RoleGuard>
  )
}

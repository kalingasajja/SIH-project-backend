import { RoleGuard } from "@/components/auth/role-guard"
import { QualityControlDashboard } from "@/components/quality-control/quality-control-dashboard"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { BackButton } from "@/components/ui/back-button"

export default function QualityControlPage() {
  return (
    <RoleGuard allowedRoles={["quality_control"]}>
      <div className="p-6">
        <div className="mb-6">
          <BackButton href="/dashboard" />
          <BreadcrumbNav items={[{ label: "Quality Control Dashboard" }]} />
          <h1 className="text-3xl font-bold text-foreground">Quality Control Dashboard</h1>
          <p className="text-muted-foreground">Manage quality tests, compliance reports, and audit trails</p>
        </div>
        <QualityControlDashboard />
      </div>
    </RoleGuard>
  )
}

import { RoleGuard } from "@/components/auth/role-guard"
import { NotificationsDashboard } from "@/components/farmer/notifications-dashboard"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { BackButton } from "@/components/ui/back-button"

export default function NotificationsPage() {
  return (
    <RoleGuard allowedRoles={["farmer"]}>
      <div className="p-6">
        <div className="mb-6">
          <BackButton href="/dashboard" />
          <BreadcrumbNav items={[{ label: "Farmer", href: "/dashboard" }, { label: "Notifications" }]} />
          <h1 className="text-display font-bold text-foreground">Notifications</h1>
          <p className="text-body text-muted-foreground">Updates from processors and quality control team</p>
        </div>
        <NotificationsDashboard />
      </div>
    </RoleGuard>
  )
}

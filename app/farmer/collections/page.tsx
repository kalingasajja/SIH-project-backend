import { RoleGuard } from "@/components/auth/role-guard"
import { CollectionsDashboard } from "@/components/farmer/collections-dashboard"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { BackButton } from "@/components/ui/back-button"

export default function MyCollectionsPage() {
  return (
    <RoleGuard allowedRoles={["farmer"]}>
      <div className="p-6">
        <div className="mb-6">
          <BackButton href="/dashboard" />
          <BreadcrumbNav items={[{ label: "Farmer", href: "/dashboard" }, { label: "My Collections" }]} />
          <h1 className="text-display font-bold text-foreground">My Collections</h1>
          <p className="text-body text-muted-foreground">Track your herb collection submissions and status</p>
        </div>
        <CollectionsDashboard />
      </div>
    </RoleGuard>
  )
}

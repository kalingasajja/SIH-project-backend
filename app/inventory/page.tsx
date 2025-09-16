import { RoleGuard } from "@/components/auth/role-guard"
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { BackButton } from "@/components/ui/back-button"

export default function InventoryPage() {
  return (
    <RoleGuard allowedRoles={["processor", "quality_control", "distributor"]}>
      <div className="p-6">
        <div className="mb-6">
          <BackButton href="/dashboard" />
          <BreadcrumbNav items={[{ label: "Inventory Management" }]} />
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels, expiry dates, and manage your inventory</p>
        </div>
        <InventoryDashboard />
      </div>
    </RoleGuard>
  )
}

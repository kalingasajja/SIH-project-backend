import { RoleGuard } from "@/components/auth/role-guard"
import { HerbCollectionForm } from "@/components/forms/herb-collection-form"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { BackButton } from "@/components/ui/back-button"

export default function HerbCollectionPage() {
  return (
    <RoleGuard allowedRoles={["farmer"]}>
      <div className="p-6">
        <div className="mb-6">
          <BackButton href="/dashboard" />
          <BreadcrumbNav items={[{ label: "Farmer", href: "/dashboard" }, { label: "Herb Collection" }]} />
          <h1 className="text-display font-bold text-foreground">Herb Collection</h1>
          <p className="text-body text-muted-foreground">Submit your harvested herbs for quality assessment</p>
        </div>
        <HerbCollectionForm />
      </div>
    </RoleGuard>
  )
}

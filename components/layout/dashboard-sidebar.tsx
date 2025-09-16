"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AuthService, type UserRole } from "@/lib/auth"
import {
  LayoutDashboard,
  Package,
  Shield,
  Truck,
  LogOut,
  Building2,
  ClipboardList,
  Leaf,
  Bell,
  Sprout,
} from "lucide-react"

const roleMenus: Record<UserRole, Array<{ href: string; label: string; icon: React.ReactNode }>> = {
  quality_control: [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/quality-control", label: "Quality Control", icon: <Shield className="h-4 w-4" /> },
    { href: "/inventory", label: "Inventory", icon: <Package className="h-4 w-4" /> },
    { href: "/profile", label: "Profile", icon: <Building2 className="h-4 w-4" /> },
  ],
  distributor: [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/distribution", label: "Distribution", icon: <Truck className="h-4 w-4" /> },
    { href: "/inventory", label: "Inventory", icon: <Package className="h-4 w-4" /> },
    { href: "/profile", label: "Profile", icon: <Building2 className="h-4 w-4" /> },
  ],
  farmer: [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/farmer/collection", label: "Herb Collection", icon: <Sprout className="h-4 w-4" /> },
    { href: "/farmer/collections", label: "My Collections", icon: <ClipboardList className="h-4 w-4" /> },
    { href: "/farmer/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { href: "/farmer/profile", label: "Profile", icon: <Building2 className="h-4 w-4" /> },
  ],
}

export function DashboardSidebar() {
  const [user, setUser] = useState<any | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    AuthService.logout()
    router.push("/login")
  }

  if (!user) return null

  const menuItems = roleMenus[user.role] || []

  return (
    <div className="flex h-screen w-72 flex-col bg-gradient-to-b from-primary/5 to-primary/10 border-r border-primary/20 backdrop-blur-sm">
      <div className="p-8 border-b border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/20 rounded-xl">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-primary">AyurTrace</h2>
        </div>
        <p className="text-sm text-primary/70 capitalize font-medium">{user.role.replace("_", " ")} Portal</p>
      </div>

      <nav className="flex-1 px-6 py-6 space-y-3">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "default" : "ghost"}
              className={`w-full justify-start gap-3 h-12 text-left font-medium transition-all duration-200 ${
                pathname === item.href
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "hover:bg-primary/10 hover:text-primary hover:translate-x-1"
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-primary/20 bg-primary/5">
        <div className="mb-4 p-4 bg-white/50 rounded-xl border border-primary/10">
          <p className="text-sm font-semibold text-primary">{user.name}</p>
          <p className="text-xs text-primary/70 mt-1">{user.companyName}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-11 bg-white/50 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AuthService, type UserRole } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const user = AuthService.getCurrentUser()

    if (!user) {
      router.push("/login")
      return
    }

    if (AuthService.canAccess(allowedRoles)) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
  }, [allowedRoles, router])

  if (isAuthorized === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAuthorized) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}

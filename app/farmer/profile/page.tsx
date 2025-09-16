"use client"

import { useState, useEffect } from "react"
import { AuthService, type User } from "@/lib/auth"
import { BackButton } from "@/components/ui/back-button"
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav"
import { EditProfileForm } from "@/components/forms/edit-profile-form"
import { ChangePasswordForm } from "@/components/forms/change-password-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserIcon, Mail, Building2 } from "lucide-react"

export default function FarmerProfilePage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <BackButton />
          <BreadcrumbNav
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Profile", href: "/farmer/profile" },
            ]}
          />
        </div>

        <div className="mb-8">
          <h1 className="text-display font-bold text-primary mb-2">Profile Settings</h1>
          <p className="text-body text-muted-foreground">Manage your account information and security settings.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Current Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-heading">Current Profile</CardTitle>
                <CardDescription>Your current account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <UserIcon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-subheading font-medium">{user.name}</p>
                    <p className="text-caption text-muted-foreground capitalize">{user.role.replace("_", " ")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-body font-medium">{user.email}</p>
                    <p className="text-caption text-muted-foreground">Email Address</p>
                  </div>
                </div>

                {user.companyName && (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-body font-medium">{user.companyName}</p>
                      <p className="text-caption text-muted-foreground">Company</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Edit Forms */}
          <div className="lg:col-span-2 space-y-8">
            <EditProfileForm user={user} onUpdate={handleUserUpdate} />
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}

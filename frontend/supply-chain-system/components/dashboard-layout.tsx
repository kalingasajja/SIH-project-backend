"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, ArrowRightLeft } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  showTransferCustody?: boolean
}

export default function DashboardLayout({ children, title, showTransferCustody = true }: DashboardLayoutProps) {
  const [user, setUser] = useState<any | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleTransferCustody = () => {
    router.push("/transfer-custody")
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-orange-300">
                  <div className="w-10 h-10 border-3 border-blue-600 rounded-full relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    </div>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-3 bg-blue-600 top-1/2 left-1/2 origin-bottom"
                        style={{
                          transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Government of India</h1>
                  <p className="text-sm text-gray-600">Supply Chain System</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm font-medium text-blue-600 capitalize bg-blue-50 px-3 py-1 rounded-full">
                {user.role}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {showTransferCustody && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTransferCustody}
                  className="flex items-center space-x-2 bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  <span>Transfer Custody</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        </div>
        {children}
      </main>
    </div>
  )
}

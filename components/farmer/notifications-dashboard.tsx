"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { AuthService } from "@/lib/auth"
import { db, type FarmerNotification, type Farmer } from "@/lib/database"
import { Bell, CheckCircle, XCircle, Info, DollarSign, Clock } from "lucide-react"

export function NotificationsDashboard() {
  const [notifications, setNotifications] = useState<FarmerNotification[]>([])
  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadNotificationsData()
  }, [])

  const loadNotificationsData = async () => {
    try {
      const user = AuthService.getCurrentUser()
      if (user) {
        const farmerData = await db.getFarmerByUserId(user.id)
        setFarmer(farmerData)

        if (farmerData) {
          const notificationsData = await db.getFarmerNotifications(farmerData.id)
          setNotifications(notificationsData)
        } else {
          setLoadingError("Farmer profile not found. Please contact support.")
        }
      } else {
        setLoadingError("User not authenticated. Please log in again.")
      }
    } catch (error) {
      console.error("Error loading notifications data:", error)
      setLoadingError("Failed to load notifications. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await db.markNotificationAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)),
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead)
      for (const notification of unreadNotifications) {
        await db.markNotificationAsRead(notification.id)
      }
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: FarmerNotification["type"]) => {
    switch (type) {
      case "approval":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "rejection":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "payment":
        return <DollarSign className="h-5 w-5 text-blue-600" />
      case "update":
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getNotificationColor = (type: FarmerNotification["type"]) => {
    switch (type) {
      case "approval":
        return "bg-green-100 text-green-800"
      case "rejection":
        return "bg-red-100 text-red-800"
      case "payment":
        return "bg-blue-100 text-blue-800"
      case "update":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    )
  }

  if (loadingError || !farmer) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Unable to Load Notifications</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {loadingError || "Farmer profile not found. Please contact support."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => loadNotificationsData()} variant="outline">
                Retry
              </Button>
              <Button onClick={() => (window.location.href = "/dashboard")}>Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-heading font-bold align-numeric">{notifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body font-medium">Unread</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-heading font-bold text-yellow-600 align-numeric">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-body font-medium">Read</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-heading font-bold text-green-600 align-numeric">
              {notifications.length - unreadCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Updates from processors and quality control team</CardDescription>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline">
                Mark All as Read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-subheading font-medium">No notifications yet</h3>
                <p className="text-body text-muted-foreground">
                  You'll receive updates about your collections and registration here
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-primary/5 border-primary/20" : ""
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-subheading font-medium">{notification.title}</h3>
                        <Badge className={getNotificationColor(notification.type)}>
                          {notification.type.toUpperCase()}
                        </Badge>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="bg-primary text-primary-foreground">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-body text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-caption text-muted-foreground">
                        {new Date(notification.createdDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export type UserRole = "farmer" | "processor" | "quality_control" | "distributor"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  companyName?: string
}

// Mock authentication - in production, this would connect to a real auth service
export class AuthService {
  private static currentUser: User | null = null

  static async login(email: string, password: string): Promise<User | null> {
    // Mock login logic - in production, this would validate against a database
    const mockUsers: Record<string, User> = {
      "farmer@ayurtrace.com": {
        id: "0",
        email: "farmer@ayurtrace.com",
        name: "Raj Farmer",
        role: "farmer",
        companyName: "Green Valley Farm",
      },
      "qc@ayurtrace.com": {
        id: "2",
        email: "qc@ayurtrace.com",
        name: "Sarah Quality",
        role: "quality_control",
        companyName: "AyurTrace Labs",
      },
      "distributor@ayurtrace.com": {
        id: "3",
        email: "distributor@ayurtrace.com",
        name: "Mike Distributor",
        role: "distributor",
        companyName: "Global Herb Distribution",
      },
    }

    const user = mockUsers[email]
    if (user && password === "password123") {
      this.currentUser = user
      localStorage.setItem("ayurtrace_user", JSON.stringify(user))

      if (user.role === "farmer") {
        await this.createDefaultFarmerProfile(user)
      }

      return user
    }
    return null
  }

  static logout(): void {
    this.currentUser = null
    localStorage.removeItem("ayurtrace_user")
  }

  static getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ayurtrace_user")
      if (stored) {
        this.currentUser = JSON.parse(stored)
        return this.currentUser
      }
    }
    return null
  }

  static hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }

  static canAccess(allowedRoles: UserRole[]): boolean {
    const user = this.getCurrentUser()
    return user ? allowedRoles.includes(user.role) : false
  }

  static async updateProfile(updates: Partial<Pick<User, "name" | "email" | "companyName">>): Promise<boolean> {
    const user = this.getCurrentUser()
    if (!user) return false

    // Mock profile update - in production, this would update the database
    const updatedUser = { ...user, ...updates }
    this.currentUser = updatedUser
    localStorage.setItem("ayurtrace_user", JSON.stringify(updatedUser))
    return true
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    const user = this.getCurrentUser()
    if (!user) return false

    // Mock password validation - in production, this would validate against stored hash
    if (currentPassword !== "password123") return false

    // Mock password update - in production, this would hash and store the new password
    // For now, we'll just return success since we're using mock authentication
    return true
  }

  private static async createDefaultFarmerProfile(user: User): Promise<void> {
    // Dynamic import to avoid circular dependency issues
    const { db } = await import("@/lib/database")

    // Check if farmer profile already exists
    const existingFarmer = await db.getFarmerByUserId(user.id)
    if (existingFarmer) return

    // Create default farmer profile
    const defaultFarmer = {
      userId: user.id,
      name: user.name,
      contactInfo: {
        phone: "+91 9876543210",
        email: user.email,
        address: "Default Farm Address, India",
      },
      farmLocation: {
        gps: "12.9716, 77.5946",
        address: "Default Farm Location, Karnataka, India",
        area: 5.0,
        areaUnit: "acres" as const,
      },
      herbTypes: ["Turmeric", "Ashwagandha", "Neem"],
      experience: 5,
      certifications: ["Organic Certification"],
      status: "approved" as const,
    }

    await db.saveFarmer(defaultFarmer)
  }
}

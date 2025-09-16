import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, LogIn } from "lucide-react"

export function AuthenticationSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-6">Join Our Platform</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Create your account or sign in to access your personalized dashboard and start your blockchain traceability
            journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Sign Up Card */}
          <Card className="card-3d border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <p className="text-muted-foreground">Create your new account</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" placeholder="Create a password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-role">Role</Label>
                <select id="signup-role" className="w-full px-3 py-2 border border-input bg-background rounded-md">
                  <option value="">Select your role</option>
                  <option value="farmer">Farmer</option>
                  <option value="processor">Processor</option>
                  <option value="tester">Tester</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="regulator">Regulator</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <Button className="w-full card-3d">Create Account</Button>
            </CardContent>
          </Card>

          {/* Sign In Card */}
          <Card className="card-3d border-0 shadow-lg bg-card/80 backdrop-blur">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <p className="text-muted-foreground">Access your existing account</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input id="signin-email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input id="signin-password" type="password" placeholder="Enter your password" />
              </div>
              <Button className="w-full card-3d" variant="secondary">
                Sign In
              </Button>
              <div className="text-center">
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot your password?
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tractor, Factory, FlaskConical, Building2, Shield, User, Star } from "lucide-react"

export function PortalAccess() {
  const stakeholders = [
    {
      icon: Tractor,
      title: "Farmer",
      description: "Record herb cultivation, harvesting, and initial quality data",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      href: "/farmer",
    },
    {
      icon: Factory,
      title: "Processor",
      description: "Manage processing stages, quality control, and batch tracking",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      href: "/processor",
    },
    {
      icon: FlaskConical,
      title: "Tester",
      description: "Upload lab results, certifications, and quality assessments",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      href: "/tester",
    },
    {
      icon: Building2,
      title: "Manufacturer",
      description: "Track final product creation, packaging, and distribution",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      href: "/manufacturer",
    },
    {
      icon: Shield,
      title: "Regulator",
      description: "Monitor compliance, audit trails, and regulatory oversight",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      href: "/regulator",
    },
  ]

  const customerPortal = {
    icon: User,
    title: "Customer",
    description: "Verify product authenticity and view complete traceability",
    color: "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500",
    href: "/customer",
  }

  return (
    <section id="portal" className="py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 blockchain-grid opacity-30"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-6 floating-animation">Access Your Portal</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Choose your role to access your dedicated portal in the Ayurvedic herb supply chain.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              Most Popular
            </div>
          </div>
          <Card
            className="card-3d border-2 border-primary/20 shadow-2xl bg-card/90 backdrop-blur group cursor-pointer hover:shadow-3xl transition-all duration-500 hover:scale-105 relative overflow-hidden"
            onClick={() => (window.location.href = customerPortal.href)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

            <CardHeader className="text-center pb-4 relative z-10">
              <div
                className={`w-24 h-24 ${customerPortal.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl`}
              >
                <customerPortal.icon className="w-12 h-12 text-white" />
              </div>
              <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                {customerPortal.title} Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center relative z-10">
              <p className="text-muted-foreground text-pretty mb-6 text-lg">{customerPortal.description}</p>
              <Button
                className="w-full card-3d bg-primary hover:bg-primary/90 text-white border-0 shadow-lg group-hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                Access Customer Portal
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl font-semibold text-center mb-8 text-muted-foreground">Industry Portals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {stakeholders.map((stakeholder, index) => (
              <Card
                key={index}
                className="card-3d border-0 shadow-lg bg-card/80 backdrop-blur group cursor-pointer hover:shadow-xl transition-all duration-500 hover:scale-105 relative overflow-hidden"
                onClick={() => (window.location.href = stakeholder.href)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <CardHeader className="text-center pb-3 relative z-10">
                  <div
                    className={`w-16 h-16 ${stakeholder.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}
                  >
                    <stakeholder.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                    {stakeholder.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center relative z-10 px-4">
                  <p className="text-muted-foreground text-pretty mb-4 text-sm">{stakeholder.description}</p>
                  <Button
                    className="w-full card-3d bg-primary/10 hover:bg-primary hover:text-primary-foreground border border-primary/20 group-hover:border-primary transition-all duration-300"
                    variant="outline"
                    size="sm"
                  >
                    Access
                    <span className="ml-1 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle, Heart, TrendingUp } from "lucide-react"

export function BenefitsSection() {
  const benefits = [
    {
      icon: Shield,
      title: "Authenticity you can trust",
      description: "Blockchain-verified provenance ensures every herb is genuine and unaltered from source to shelf.",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: CheckCircle,
      title: "Compliance with sustainability guidelines",
      description: "Automated monitoring ensures adherence to environmental and ethical sourcing standards.",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: Heart,
      title: "Fair trade & ethical sourcing",
      description: "Transparent supply chains ensure fair compensation for farmers and ethical business practices.",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      icon: TrendingUp,
      title: "Consumer confidence & export readiness",
      description: "Build trust with consumers and meet international export requirements with verified quality.",
      gradient: "from-orange-500 to-red-600",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-6">Why Choose Our System?</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Experience the transformative benefits of blockchain-powered traceability for your Ayurvedic herb business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card key={index} className="card-3d border-0 shadow-lg bg-card/80 backdrop-blur overflow-hidden">
              <CardHeader className="pb-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${benefit.gradient} rounded-full flex items-center justify-center mb-4`}
                >
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-balance">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-pretty">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

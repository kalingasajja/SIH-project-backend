import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Network, MapPin, QrCode, Eye, CheckCircle, BarChart3 } from "lucide-react"

export function KeyFeatures() {
  const features = [
    {
      icon: Network,
      title: "Permissioned Blockchain Network",
      description:
        "Secure, scalable blockchain infrastructure designed specifically for supply chain transparency with controlled access for verified stakeholders.",
    },
    {
      icon: MapPin,
      title: "Geo-Tagged Data Capture",
      description:
        "Precise GPS coordinates and environmental data captured at every stage, creating a comprehensive digital map of each herb's journey.",
    },
    {
      icon: QrCode,
      title: "Smart Labeling & QR Codes",
      description:
        "Dynamic QR codes that provide instant access to complete product history, certifications, and authenticity verification.",
    },
    {
      icon: Eye,
      title: "Consumer Transparency Portal",
      description:
        "User-friendly interface allowing consumers to trace their products back to the source with detailed information at every step.",
    },
    {
      icon: CheckCircle,
      title: "Compliance & Sustainability Enforcement",
      description:
        "Automated compliance checking against industry standards and sustainability metrics with real-time alerts and reporting.",
    },
    {
      icon: BarChart3,
      title: "Real-Time Dashboards & Reporting",
      description:
        "Comprehensive analytics and insights for all stakeholders with customizable dashboards and automated reporting capabilities.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-6">Key Features</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Comprehensive blockchain-powered solutions designed to revolutionize the Ayurvedic herb supply chain with
            transparency and trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="card-3d border-0 shadow-lg bg-card/80 backdrop-blur h-full">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-balance">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-pretty">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Beaker, Shield, Package, Smartphone } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Leaf,
      title: "Farmers collect herbs",
      description: "Geo-tagged collection with environmental data capture",
      color: "bg-green-500",
    },
    {
      icon: Beaker,
      title: "Processing & lab tests",
      description: "Quality testing and certification data added to blockchain",
      color: "bg-blue-500",
    },
    {
      icon: Shield,
      title: "Blockchain validates",
      description: "Smart contracts verify and store immutable event records",
      color: "bg-purple-500",
    },
    {
      icon: Package,
      title: "QR code generated",
      description: "Unique identifier created for each product batch",
      color: "bg-orange-500",
    },
    {
      icon: Smartphone,
      title: "Consumers scan QR",
      description: "Full provenance and authenticity verification available",
      color: "bg-pink-500",
    },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-6">How It Works</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            A simple, step-by-step process that ensures complete transparency and traceability from farm to consumer.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center mb-12 last:mb-0">
              <div className="flex-shrink-0 mr-8">
                <Card className="card-3d w-20 h-20 border-2 border-primary/20 shadow-lg">
                  <CardContent className="p-0 flex items-center justify-center h-full">
                    <div className="relative">
                      <step.icon className="w-10 h-10 text-primary" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-pretty">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute left-10 mt-20 w-0.5 h-12 bg-primary/20" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

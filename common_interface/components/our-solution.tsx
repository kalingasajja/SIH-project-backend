import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Leaf, MapPin, Cpu, QrCode, Shield } from "lucide-react"

export function OurSolution() {
  const steps = [
    { icon: Leaf, title: "Farm", description: "Geo-tagged herb collection" },
    { icon: Cpu, title: "Processing", description: "Quality testing & validation" },
    { icon: Shield, title: "Testing", description: "Lab verification & certification" },
    { icon: QrCode, title: "Packaging", description: "Smart labeling with QR codes" },
    { icon: MapPin, title: "Consumer", description: "QR scan for full provenance" },
  ]

  return (
    <section id="solution" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-6">A Transparent, Sustainable Future</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-3xl mx-auto">
            Our blockchain-powered platform combines geo-tagging, IoT sensors, and smart contracts to create an
            immutable record of every herb's journey from farm to consumer.
          </p>
        </div>

        {/* Process Flow */}
        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center relative">
                <Card className="card-3d w-24 h-24 border-2 border-primary/20 shadow-lg">
                  <CardContent className="p-0 flex items-center justify-center h-full">
                    <step.icon className="w-10 h-10 text-primary" />
                  </CardContent>
                </Card>
                <h3 className="text-lg font-semibold mt-4 mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground text-center max-w-32">{step.description}</p>

                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-12 top-10 w-6 h-6 text-primary/60" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="card-3d text-center p-6 bg-primary/5 border-primary/20">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Blockchain Security</h3>
              <p className="text-sm text-muted-foreground">
                Immutable records ensure data integrity and prevent tampering.
              </p>
            </CardContent>
          </Card>

          <Card className="card-3d text-center p-6 bg-secondary/5 border-secondary/20">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Geo-Tagging</h3>
              <p className="text-sm text-muted-foreground">
                Precise location tracking from cultivation to consumption.
              </p>
            </CardContent>
          </Card>

          <Card className="card-3d text-center p-6 bg-accent/5 border-accent/20">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">IoT Integration</h3>
              <p className="text-sm text-muted-foreground">
                Real-time monitoring of environmental conditions and quality.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

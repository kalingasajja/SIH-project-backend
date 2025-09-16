import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Leaf, TrendingUp } from "lucide-react"

export function PilotStory() {
  const stats = [
    { icon: Users, value: "150+", label: "Farmers Onboarded" },
    { icon: Leaf, value: "10K+", label: "Ashwagandha Plants Tracked" },
    { icon: Award, value: "100%", label: "Quality Verification" },
    { icon: TrendingUp, value: "25%", label: "Price Premium Achieved" },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Pilot Success Story</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-balance mb-6">Ashwagandha Pilot Project</h2>
              <p className="text-lg text-muted-foreground text-pretty mb-8">
                Our successful pilot program with Ashwagandha farmers in Karnataka demonstrated the transformative power
                of blockchain traceability. From small-scale farmers to international buyers, every stakeholder
                benefited from complete transparency and verified quality.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Farmer Empowerment:</strong> Direct access to premium markets
                    with fair pricing
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Quality Assurance:</strong> Lab-verified purity and potency at
                    every stage
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Consumer Trust:</strong> Complete visibility from seed to
                    supplement
                  </p>
                </div>
              </div>

              {/* Partner Logos */}
              <div className="flex items-center space-x-6 opacity-60">
                <div className="text-sm font-medium">Certified by:</div>
                <Badge variant="outline">AYUSH Ministry</Badge>
                <Badge variant="outline">ISO 9001</Badge>
                <Badge variant="outline">Organic India</Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="card-3d border-0 shadow-lg bg-card/80 backdrop-blur text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Eye, Users, ShieldX } from "lucide-react"

export function ProblemStatement() {
  const problems = [
    {
      icon: AlertTriangle,
      title: "Fragmented Networks",
      description: "Disconnected supply chain participants lack unified communication and data sharing.",
    },
    {
      icon: ShieldX,
      title: "Risk of Adulteration",
      description: "Contamination and fake products compromise the integrity of Ayurvedic herbs.",
    },
    {
      icon: Eye,
      title: "Opaque Provenance",
      description: "Limited visibility into the origin and journey of herbs from farm to consumer.",
    },
    {
      icon: Users,
      title: "Lack of Consumer Trust",
      description: "Consumers cannot verify the authenticity and quality of Ayurvedic products.",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-6">The Challenge in Herbal Supply Chains</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Traditional Ayurvedic herb supply chains face critical challenges that compromise quality, authenticity, and
            consumer trust in these ancient healing remedies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <Card key={index} className="card-3d border-0 shadow-lg bg-card/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <problem.icon className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{problem.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

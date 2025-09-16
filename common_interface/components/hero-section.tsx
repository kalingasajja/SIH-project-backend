import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Leaf, QrCode } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 blockchain-grid opacity-30" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 floating-animation">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
      </div>
      <div className="absolute top-32 right-20 floating-animation" style={{ animationDelay: "2s" }}>
        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-secondary" />
        </div>
      </div>
      <div className="absolute bottom-20 right-10 floating-animation" style={{ animationDelay: "4s" }}>
        <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center">
          <QrCode className="w-7 h-7 text-accent" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance mb-6">
            <span className="text-foreground">Blockchain-Powered</span>
            <br />
            <span className="text-primary">Traceability</span>
            <br />
            <span className="text-foreground">for Ayurvedic Herbs</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto">
            Ensuring authenticity, sustainability, and trust from farm to consumer through cutting-edge blockchain
            technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="card-3d text-lg px-8 py-6 pulse-green btn-primary-contrast">
              Explore the Solution
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="card-3d text-lg px-8 py-6 bg-background border-primary/30 hover:bg-primary/10 text-foreground"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Traceability</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Verified Farmers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Products Tracked</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

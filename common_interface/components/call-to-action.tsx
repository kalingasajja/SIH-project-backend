import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, FileText } from "lucide-react"

export function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 blockchain-grid opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-balance mb-6">Join the Future of Ethical Herb Sourcing</h2>
          <p className="text-xl text-muted-foreground text-pretty mb-12 max-w-2xl mx-auto">
            Transform your Ayurvedic herb business with blockchain-powered traceability. Build trust, ensure quality,
            and access premium markets.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="card-3d text-lg px-8 py-6 pulse-green">
              <Calendar className="mr-2 h-5 w-5" />
              Schedule a Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="card-3d text-lg px-8 py-6 bg-transparent">
              <FileText className="mr-2 h-5 w-5" />
              Request Collaboration
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>24/7 technical support</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Regulatory compliance</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

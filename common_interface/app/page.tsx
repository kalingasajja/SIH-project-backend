import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProblemStatement } from "@/components/problem-statement"
import { OurSolution } from "@/components/our-solution"
import { KeyFeatures } from "@/components/key-features"
import { HowItWorks } from "@/components/how-it-works"
import { BenefitsSection } from "@/components/benefits-section"
import { PortalAccess } from "@/components/portal-access"
import { PilotStory } from "@/components/pilot-story"
import { CallToAction } from "@/components/call-to-action"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <PortalAccess />
        <ProblemStatement />
        <OurSolution />
        <KeyFeatures />
        <HowItWorks />
        <BenefitsSection />
        <PilotStory />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}

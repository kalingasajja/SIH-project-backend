import { Leaf, Mail, Linkedin, FileText, Shield, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AyurTrace</span>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">
              Revolutionizing Ayurvedic herb traceability through blockchain technology, ensuring authenticity from farm
              to consumer.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#solution" className="text-muted-foreground hover:text-foreground transition-colors">
                  Our Solution
                </a>
              </li>
              <li>
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#portal" className="text-muted-foreground hover:text-foreground transition-colors">
                  Portal Access
                </a>
              </li>
              <li>
                <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Whitepaper
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:info@ayurtrace.com"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  info@ayurtrace.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+911234567890"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  +91 123 456 7890
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; 2024 AyurTrace. All rights reserved. Empowering ethical Ayurvedic herb sourcing through blockchain
            technology.
          </p>
        </div>
      </div>
    </footer>
  )
}

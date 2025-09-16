"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Leaf, Menu, ChevronDown, Tractor, Factory, FlaskConical, Building2, Shield, User } from "lucide-react"

export function Header() {
  const portals = [
    { icon: Tractor, title: "Farmer Portal", href: "/farmer" },
    { icon: Factory, title: "Processor Portal", href: "/processor" },
    { icon: FlaskConical, title: "Tester Portal", href: "/tester" },
    { icon: Building2, title: "Manufacturer Portal", href: "/manufacturer" },
    { icon: Shield, title: "Regulator Portal", href: "/regulator" },
    { icon: User, title: "Customer Portal", href: "/customer" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg pulse-green">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">AyurTrace</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="#solution"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            Solution
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="#portal"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            Portal
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="card-3d bg-primary hover:bg-primary/90 text-white border-0 shadow-md">
                Get Started
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {portals.map((portal, index) => (
                <DropdownMenuItem
                  key={index}
                  className="cursor-pointer"
                  onClick={() => (window.location.href = portal.href)}
                >
                  <portal.icon className="mr-2 h-4 w-4" />
                  {portal.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

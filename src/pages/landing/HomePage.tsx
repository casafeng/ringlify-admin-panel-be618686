import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Phone, 
  Bot, 
  Zap, 
  Brain, 
  BarChart3, 
  Clock,
  CheckCircle2,
  ArrowRight,
  Menu
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ringlifyLogo from "@/assets/ringlify-logo.png";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const features = [
  {
    icon: Bot,
    title: "AI Receptionist",
    description: "Intelligent voice AI that handles calls like a real receptionist, 24/7"
  },
  {
    icon: Phone,
    title: "Handles Calls Automatically",
    description: "Never miss a call again. Our AI answers, routes, and schedules automatically"
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Get started in minutes. No complex integrations or technical knowledge required"
  },
  {
    icon: Brain,
    title: "Custom Knowledge Base",
    description: "Train your AI with your business info, services, and FAQs"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track calls, appointments, and customer insights in real-time"
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    description: "Automatically book appointments and sync with your calendar"
  }
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img src={ringlifyLogo} alt="Ringlify" className="h-7 w-7" />
                <span className="text-xl font-bold">Ringlify AI</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#footer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/business/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/business/signup">Sign Up</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <a 
                    href="#features" 
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a 
                    href="#pricing" 
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing
                  </a>
                  <a 
                    href="#footer" 
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </a>
                  <div className="pt-4 flex flex-col space-y-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/business/login">Login</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/business/signup">Sign Up</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp} className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  Your AI-Powered{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Business Receptionist
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                  Never miss a call again. Ringlify AI handles customer calls, books appointments, 
                  and answers questions 24/7 with natural conversation.
                </p>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button size="lg" asChild className="text-base">
                  <Link to="/business/signup">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base">
                  <Link to="/business/login">
                    Login
                  </Link>
                </Button>
              </motion.div>

              <motion.div 
                variants={fadeInUp}
                className="flex items-center gap-4 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Setup in 5 minutes</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl border bg-card p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl" />
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-3 rounded-full bg-destructive" />
                    <div className="h-3 w-3 rounded-full bg-warning" />
                    <div className="h-3 w-3 rounded-full bg-success" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 bg-muted rounded-lg w-3/4 animate-pulse" />
                    <div className="h-8 bg-muted rounded-lg w-full animate-pulse" />
                    <div className="h-8 bg-muted rounded-lg w-5/6 animate-pulse" />
                    <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-3">
                        <Phone className="h-6 w-6 text-primary" />
                        <div className="flex-1">
                          <div className="h-4 bg-primary/20 rounded w-2/3 mb-2" />
                          <div className="h-3 bg-primary/10 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Everything you need to automate calls
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features that help your business handle every customer interaction
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/50">
                    <CardHeader>
                      <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center space-y-12"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-muted-foreground">
                Start free, scale as you grow
              </p>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="relative overflow-hidden border-2 border-primary shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary to-primary/60 opacity-10 blur-3xl" />
                <CardHeader className="text-center space-y-2 pb-8">
                  <CardTitle className="text-2xl">Professional</CardTitle>
                  <div className="space-y-1">
                    <div className="text-5xl font-bold">$99</div>
                    <p className="text-muted-foreground">per month</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {[
                      "Unlimited incoming calls",
                      "AI-powered conversation",
                      "Automatic appointment booking",
                      "Custom knowledge base",
                      "Analytics & reporting",
                      "24/7 support"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button size="lg" className="w-full" asChild>
                    <Link to="/business/signup">
                      Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    14-day free trial • No credit card required
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <Link to="/" className="flex items-center space-x-2">
                <img src={ringlifyLogo} alt="Ringlify" className="h-7 w-7" />
                <span className="text-xl font-bold">Ringlify AI</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                AI-powered phone receptionist for modern businesses
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link to="/business/signup" className="hover:text-foreground transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Ringlify AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Trophy, Target, Sparkles, Brain, Menu, BookOpen, Users, Star, ChevronRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">Hinura</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium hover:text-blue-600 transition-colors">
                How It Works
              </Link>
              <Link href="#pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <Link href="#about" className="text-sm font-medium hover:text-blue-600 transition-colors">
                About
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="container mx-auto px-4 py-24 lg:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="ml-2">Trusted by 1000+ students</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Learn Smarter, Not Harder
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
                Adaptive learning platform that adjusts to your pace. Personalized education for students aged 7-18.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                size="lg"
                className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-200"
                asChild
              >
                <Link href="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-200"
                asChild
              >
                <Link href="/demo">
                  Watch Demo
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-12 flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>1000+ Active Students</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>95% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium mb-4">
              <Sparkles className="mr-2 h-4 w-4" />
              Features
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">Why Students Love Learning Here</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover the features that make learning engaging and effective
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Adaptive Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Our AI adjusts difficulty based on your performance. Never too easy, never too hard - just right for
                  you.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-yellow-200 dark:hover:border-yellow-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-xl">Gamified Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Earn points, unlock badges, and maintain streaks. Learning becomes an adventure, not a chore.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  See your improvement with detailed progress tracking. Celebrate every milestone along your journey.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium mb-4">
              <Target className="mr-2 h-4 w-4" />
              Process
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Get started in just four simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8 md:gap-12">
              {[
                {
                  step: 1,
                  title: "Take a Quick Assessment",
                  description: "We'll understand your current level and learning style in just a few minutes.",
                },
                {
                  step: 2,
                  title: "Learn at Your Pace",
                  description: "Practice with exercises that adapt to your performance in real-time.",
                },
                {
                  step: 3,
                  title: "Earn Rewards",
                  description: "Collect points, badges, and maintain streaks as you progress through lessons.",
                },
                {
                  step: 4,
                  title: "Track Your Growth",
                  description: "See detailed analytics of your improvement over time with comprehensive reports.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                    {item.step}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-xl">{item.title}</h3>
                    <p className="text-muted-foreground text-base leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {[
              {
                value: "1000+",
                label: "Active Students",
                color: "text-blue-600 dark:text-blue-400",
                bgColor: "bg-blue-100 dark:bg-blue-900/30",
              },
              {
                value: "50+",
                label: "Exercises",
                color: "text-green-600 dark:text-green-400",
                bgColor: "bg-green-100 dark:bg-green-900/30",
              },
              {
                value: "95%",
                label: "Satisfaction",
                color: "text-yellow-600 dark:text-yellow-400",
                bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
              },
              {
                value: "7-18",
                label: "Age Range",
                color: "text-purple-600 dark:text-purple-400",
                bgColor: "bg-purple-100 dark:bg-purple-900/30",
              },
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-4 group">
                <div
                  className={`w-16 h-16 rounded-full ${stat.bgColor} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-200`}
                >
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Ready to Start Your Learning Journey?</h2>
            <p className="text-xl lg:text-2xl opacity-90 text-pretty">
              Join thousands of students already learning smarter.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-base px-8 py-6 bg-white hover:bg-gray-100 text-gray-900"
              asChild
            >
              <Link href="/register">
                Start Learning Now
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-muted/50 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">LearnSmart</span>
              </div>
              <p className="text-sm text-muted-foreground">Adaptive learning platform for students aged 7-18.</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link href="/demo" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Demo
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
                <Link href="/blog" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <div className="space-y-2 text-sm">
                <Link href="/help" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
                <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">© 2024 LearnSmart. Built for thesis project.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

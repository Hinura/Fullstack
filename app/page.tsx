import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-50 w-full border-b border-sage-blue/20 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-coral to-sage-blue flex items-center justify-center shadow-lg">
                <svg className="h-7 w-7 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="font-bold text-2xl text-charcoal">Hinura</span>
            </div>

            <nav className="hidden md:flex items-center space-x-10">
              <Link
                href="#features"
                className="text-base font-medium text-charcoal hover:text-coral transition-colors duration-300 rounded-full px-4 py-2 hover:bg-coral/10"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-base font-medium text-charcoal hover:text-coral transition-colors duration-300 rounded-full px-4 py-2 hover:bg-coral/10"
              >
                How It Works
              </Link>
              <Link
                href="#pricing"
                className="text-base font-medium text-charcoal hover:text-coral transition-colors duration-300 rounded-full px-4 py-2 hover:bg-coral/10"
              >
                Pricing
              </Link>
              <Link
                href="#about"
                className="text-base font-medium text-charcoal hover:text-coral transition-colors duration-300 rounded-full px-4 py-2 hover:bg-coral/10"
              >
                About
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="lg"
                asChild
                className="hidden md:inline-flex rounded-full text-charcoal hover:bg-sage-blue/10 hover:text-sage-blue"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button
                size="lg"
                asChild
                className="rounded-full bg-gradient-to-r from-coral to-warm-green text-cream hover:shadow-lg hover:scale-105 transition-all duration-300 px-8"
              >
                <Link href="/auth/register">Get Started</Link>
              </Button>
              <Button variant="ghost" size="lg" className="md:hidden rounded-full">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative bg-gradient-to-br from-cream via-sage-blue/5 to-warm-green/5 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-64 h-64 bg-coral/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-sage-blue/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-warm-green/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 py-32 lg:py-40 relative">
          <div className="max-w-6xl mx-auto text-center space-y-12">
            <div className="flex items-center justify-center space-x-2 text-base text-charcoal/70 mb-10">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 fill-coral text-coral" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="ml-3 font-medium bg-cream/80 rounded-full px-6 py-2 backdrop-blur-sm">
                Trusted by 1000+ students worldwide
              </span>
            </div>

            <div className="space-y-10">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-balance text-charcoal leading-[1.1] font-rounded">
                Learn Smarter,{" "}
                <span className="block text-transparent bg-gradient-to-r from-coral via-sage-blue to-warm-green bg-clip-text">
                  Not Harder
                </span>
              </h1>
              <p className="text-2xl sm:text-3xl lg:text-4xl text-charcoal/70 max-w-5xl mx-auto text-pretty leading-relaxed font-light">
                Adaptive learning platform that adjusts to your pace. Personalized education for students aged 7-18.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 justify-center pt-16">
              <Button
                size="lg"
                className="text-xl px-12 py-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-r from-coral to-warm-green hover:from-coral/90 hover:to-warm-green/90 text-cream font-medium"
                asChild
              >
                <Link href="/register">
                  Start Free Trial
                  <svg className="ml-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-xl px-12 py-8 rounded-full bg-cream/90 backdrop-blur-sm hover:bg-cream border-2 border-sage-blue/30 hover:border-sage-blue text-charcoal hover:text-sage-blue transition-all duration-500 hover:scale-105 font-medium"
                asChild
              >
                <Link href="/demo">
                  Watch Demo
                  <svg className="ml-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </Link>
              </Button>
            </div>

            <div className="pt-20 flex flex-wrap items-center justify-center gap-10 text-base text-charcoal/60">
              <div className="flex items-center space-x-3 bg-cream/70 rounded-full px-6 py-3 backdrop-blur-sm border border-sage-blue/20">
                <div className="w-3 h-3 bg-warm-green rounded-full animate-pulse"></div>
                <span className="font-medium">1000+ Active Students</span>
              </div>
              <div className="flex items-center space-x-3 bg-cream/70 rounded-full px-6 py-3 backdrop-blur-sm border border-sage-blue/20">
                <svg className="h-5 w-5 text-sage-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
                </svg>
                <span className="font-medium">95% Success Rate</span>
              </div>
              <div className="flex items-center space-x-3 bg-cream/70 rounded-full px-6 py-3 backdrop-blur-sm border border-sage-blue/20">
                <svg className="h-6 w-6 text-coral" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="font-medium">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-32 lg:py-40 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <div className="inline-flex items-center rounded-full border-2 border-sage-blue/30 bg-sage-blue/10 px-8 py-4 text-base font-semibold text-sage-blue mb-8">
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              Features
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-8 text-balance text-charcoal font-rounded">
              Why Students Love Learning Here
            </h2>
            <p className="text-2xl text-charcoal/70 max-w-4xl mx-auto text-pretty leading-relaxed">
              Discover the features that make learning engaging, effective, and enjoyable
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 max-w-7xl mx-auto">
            <Card className="border-2 border-sage-blue/20 hover:border-sage-blue/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 group bg-gradient-to-br from-cream to-sage-blue/5 rounded-3xl overflow-hidden">
              <CardHeader className="pb-8 pt-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sage-blue to-warm-green flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl mx-auto">
                  <svg className="h-10 w-10 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-3xl font-bold text-charcoal text-center font-rounded">
                  Adaptive Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-8 pb-10">
                <CardDescription className="text-lg leading-relaxed text-charcoal/70">
                  Our AI adjusts difficulty based on your performance. Never too easy, never too hard - just right for
                  you.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-coral/20 hover:border-coral/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 group bg-gradient-to-br from-cream to-coral/5 rounded-3xl overflow-hidden">
              <CardHeader className="pb-8 pt-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-coral to-warm-green flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl mx-auto">
                  <svg className="h-10 w-10 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-3xl font-bold text-charcoal text-center font-rounded">
                  Gamified Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-8 pb-10">
                <CardDescription className="text-lg leading-relaxed text-charcoal/70">
                  Earn points, unlock badges, and maintain streaks. Learning becomes an adventure, not a chore.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-warm-green/20 hover:border-warm-green/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 group sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-cream to-warm-green/5 rounded-3xl overflow-hidden">
              <CardHeader className="pb-8 pt-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-warm-green to-sage-blue flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl mx-auto">
                  <svg className="h-10 w-10 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-3xl font-bold text-charcoal text-center font-rounded">
                  Track Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-8 pb-10">
                <CardDescription className="text-lg leading-relaxed text-charcoal/70">
                  See your improvement with detailed progress tracking. Celebrate every milestone along your journey.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-32 lg:py-40 bg-gradient-to-br from-sage-blue/5 to-warm-green/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center rounded-full border-2 border-warm-green/30 bg-warm-green/10 px-8 py-4 text-base font-medium mb-6">
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Process
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance text-charcoal font-rounded">
              How It Works
            </h2>
            <p className="text-xl text-charcoal/70 max-w-3xl mx-auto text-pretty leading-relaxed">
              Get started in just four simple steps
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid gap-12 md:gap-16">
              {[
                {
                  step: 1,
                  title: "Take a Quick Assessment",
                  description: "We'll understand your current level and learning style in just a few minutes.",
                  color: "from-coral to-warm-green",
                },
                {
                  step: 2,
                  title: "Learn at Your Pace",
                  description: "Practice with exercises that adapt to your performance in real-time.",
                  color: "from-sage-blue to-coral",
                },
                {
                  step: 3,
                  title: "Earn Rewards",
                  description: "Collect points, badges, and maintain streaks as you progress through lessons.",
                  color: "from-warm-green to-sage-blue",
                },
                {
                  step: 4,
                  title: "Track Your Growth",
                  description: "See detailed analytics of your improvement over time with comprehensive reports.",
                  color: "from-coral to-sage-blue",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-8 items-start">
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${item.color} text-cream flex items-center justify-center font-bold text-xl shadow-xl`}
                  >
                    {item.step}
                  </div>
                  <div className="space-y-3 pt-2">
                    <h3 className="font-semibold text-2xl text-charcoal font-rounded">{item.title}</h3>
                    <p className="text-charcoal/70 text-lg leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 lg:py-40 bg-gradient-to-r from-coral/10 via-sage-blue/10 to-warm-green/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-20 max-w-6xl mx-auto">
            {[
              {
                value: "1000+",
                label: "Active Students",
                color: "text-sage-blue",
                bgColor: "bg-gradient-to-br from-sage-blue to-warm-green",
                icon: (
                  <svg className="h-8 w-8 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ),
              },
              {
                value: "50+",
                label: "Exercises",
                color: "text-warm-green",
                bgColor: "bg-gradient-to-br from-warm-green to-coral",
                icon: (
                  <svg className="h-8 w-8 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                ),
              },
              {
                value: "95%",
                label: "Satisfaction",
                color: "text-coral",
                bgColor: "bg-gradient-to-br from-coral to-sage-blue",
                icon: (
                  <svg className="h-8 w-8 text-cream" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ),
              },
              {
                value: "7-18",
                label: "Age Range",
                color: "text-warm-green",
                bgColor: "bg-gradient-to-br from-sage-blue to-warm-green",
                icon: (
                  <svg className="h-8 w-8 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ),
              },
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-8 group">
                <div
                  className={`w-24 h-24 rounded-3xl ${stat.bgColor} flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl`}
                >
                  {stat.icon}
                </div>
                <div className="space-y-3">
                  <div className={`text-5xl font-bold ${stat.color} font-rounded`}>{stat.value}</div>
                  <div className="text-charcoal/70 font-semibold text-xl">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 lg:py-40 bg-gradient-to-br from-coral via-sage-blue to-warm-green text-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-80 h-80 bg-cream/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cream/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto space-y-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-balance font-rounded">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-2xl lg:text-3xl opacity-90 text-pretty">
              Join thousands of students already learning smarter.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-10 py-8 bg-cream hover:bg-cream/90 text-charcoal rounded-full font-medium hover:scale-105 transition-all duration-300 shadow-xl"
              asChild
            >
              <Link href="/register">
                Start Learning Now
                <svg className="ml-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-20 bg-charcoal/5 border-t border-sage-blue/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-coral to-sage-blue flex items-center justify-center">
                  <svg className="h-6 w-6 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <span className="font-bold text-2xl text-charcoal font-rounded">Hinura</span>
              </div>
              <p className="text-base text-charcoal/70">Adaptive learning platform for students aged 7-18.</p>
            </div>

            <div className="space-y-6">
              <h4 className="font-semibold text-lg text-charcoal font-rounded">Product</h4>
              <div className="space-y-3 text-base">
                <Link
                  href="#features"
                  className="block text-charcoal/70 hover:text-coral transition-colors duration-300 rounded-lg px-2 py-1 hover:bg-coral/10"
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="block text-charcoal/70 hover:text-coral transition-colors duration-300 rounded-lg px-2 py-1 hover:bg-coral/10"
                >
                  Pricing
                </Link>
                <Link
                  href="/demo"
                  className="block text-charcoal/70 hover:text-coral transition-colors duration-300 rounded-lg px-2 py-1 hover:bg-coral/10"
                >
                  Demo
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-semibold text-lg text-charcoal font-rounded">Company</h4>
              <div className="space-y-3 text-base">
                <Link
                  href="/about"
                  className="block text-charcoal/70 hover:text-coral transition-colors duration-300 rounded-lg px-2 py-1 hover:bg-coral/10"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="block text-charcoal/70 hover:text-coral transition-colors duration-300 rounded-lg px-2 py-1 hover:bg-coral/10"
                >
                  Contact
                </Link>
                <Link
                  href="/blog"
                  className="block text-charcoal/70 hover:text-coral transition-colors duration-300 rounded-lg px-2 py-1 hover:bg-coral/10"
                >
                  Blog
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-semibold text-lg text-charcoal font-rounded">Support</h4>
              <div className="space-y-3 text-base">
                <Link
                  href="/help"
                  className="block text-charcoal/70 hover:text-coral transition-colors duration-300 rounded-lg px-2 py-1 hover:bg-coral/10"
                >
                  Help Center
                </Link>
                <Link
                  href="/privacy"
                  className="block text-charcoal/70 hover:text-coral transition-colors duration-300 rounded-lg px-2 py-1 hover:bg-coral/10"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="block text-charcoal/70 hover:text-coral transition-colors duration-300 rounded-lg px-2 py-1 hover:bg-coral/10"
                >
                  Terms
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-sage-blue/20 pt-10 text-center">
            <p className="text-base text-charcoal/70">© 2024 Hinura. Built for thesis project.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

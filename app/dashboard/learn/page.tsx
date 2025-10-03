"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import DashboardNavigation from "@/components/DashboardNavigation"
import { useBirthdateCheck } from "@/hooks/useBirthdateCheck"

interface UserData {
  id: string
  email: string
  fullName: string
  points: number
  currentLevel: number
  streakDays: number
  birthdate?: string
  age?: number
}

export default function LearnPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showWelcome, setShowWelcome] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)

  // Hook must be called at the top level, before any conditional returns
  const { canAccess } = useBirthdateCheck({ user: userData, redirectTo: "/dashboard/learn" })

  const startPractice = (subject: string, difficulty: string = 'adaptive') => {
    router.push(`/dashboard/practice?subject=${subject}&difficulty=${difficulty}`)
  }

  useEffect(() => {
    if (searchParams.get("welcome") === "true") {
      setShowWelcome(true)
      const timer = setTimeout(() => setShowWelcome(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/dashboard/data")
      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  // If user needs to set birthdate, redirect to dashboard
  if (!canAccess && userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <DashboardNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-4 bg-cream/80 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-soft">
            <Loader2 className="h-8 w-8 animate-spin text-coral" />
            <span className="text-xl font-medium text-charcoal">Redirecting...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
      <DashboardNavigation userData={userData || undefined} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {showWelcome && (
          <Alert className="mb-8 border-2 border-warm-green/30 bg-warm-green/10 backdrop-blur-sm">
            <AlertDescription className="text-warm-green/90">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="text-lg font-bold text-warm-green mb-2">Welcome to your Learning Hub!</h3>
                  <p className="text-base">
                    Your personalized learning journey is ready. Choose a subject below to get started!
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h1 className="text-5xl font-bold text-charcoal mb-3 text-balance">Learning Hub 📚</h1>
          <p className="text-xl text-charcoal/70 leading-relaxed">
            Choose your subject and start practicing with personalized exercises!
          </p>
        </div>

        <div className="mb-8 bg-cream/95 rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-charcoal">Current Session</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-charcoal/60">⏱️ 0 min today</span>
              <Button className="bg-gradient-to-r from-coral to-warm-green text-cream px-4 py-2 rounded-xl font-semibold text-sm">
                Start Timer
              </Button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-sage-blue/5 rounded-xl">
              <span className="text-2xl font-bold text-sage-blue">0</span>
              <p className="text-sm text-charcoal/60">Exercises Today</p>
            </div>
            <div className="text-center p-4 bg-warm-green/5 rounded-xl">
              <span className="text-2xl font-bold text-warm-green">—</span>
              <p className="text-sm text-charcoal/60">Current Accuracy</p>
            </div>
            <div className="text-center p-4 bg-coral/5 rounded-xl">
              <span className="text-2xl font-bold text-coral">0</span>
              <p className="text-sm text-charcoal/60">Points Earned</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-charcoal mb-6">Choose Your Practice</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Mathematics Practice */}
            <div className="bg-cream/95 rounded-3xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 group border-2 border-transparent hover:border-coral/30">
              <div className="w-16 h-16 bg-gradient-to-br from-coral to-coral/70 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <span className="text-3xl">🔢</span>
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-2">Mathematics</h3>
              <p className="text-charcoal/60 mb-4 leading-relaxed">Level 3 • Adaptive Practice</p>

              <div className="space-y-3 mb-4">
                <button
                  onClick={() => startPractice('math', 'adaptive')}
                  className="w-full text-left p-3 bg-coral/10 rounded-xl hover:bg-coral/20 transition-colors"
                >
                  <span className="font-medium text-charcoal">🎯 Quick Practice</span>
                  <p className="text-sm text-charcoal/60">10 adaptive questions</p>
                </button>
                <button
                  onClick={() => startPractice('math', 'medium')}
                  className="w-full text-left p-3 bg-sage-blue/10 rounded-xl hover:bg-sage-blue/20 transition-colors"
                >
                  <span className="font-medium text-charcoal">📊 Focus Session</span>
                  <p className="text-sm text-charcoal/60">Medium difficulty practice</p>
                </button>
                <button
                  onClick={() => startPractice('math', 'hard')}
                  className="w-full text-left p-3 bg-warm-green/10 rounded-xl hover:bg-warm-green/20 transition-colors"
                >
                  <span className="font-medium text-charcoal">🎲 Challenge Mode</span>
                  <p className="text-sm text-charcoal/60">Hard difficulty questions</p>
                </button>
              </div>
            </div>

            {/* Reading Practice */}
            <div className="bg-cream/95 rounded-3xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 group border-2 border-transparent hover:border-sage-blue/30">
              <div className="w-16 h-16 bg-gradient-to-br from-sage-blue to-sage-blue/70 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-2">Reading</h3>
              <p className="text-charcoal/60 mb-4 leading-relaxed">Level 2 • Comprehension Focus</p>

              <div className="space-y-3 mb-4">
                <button
                  onClick={() => startPractice('english', 'adaptive')}
                  className="w-full text-left p-3 bg-sage-blue/10 rounded-xl hover:bg-sage-blue/20 transition-colors"
                >
                  <span className="font-medium text-charcoal">📖 Quick Practice</span>
                  <p className="text-sm text-charcoal/60">10 adaptive questions</p>
                </button>
                <button
                  onClick={() => startPractice('english', 'medium')}
                  className="w-full text-left p-3 bg-coral/10 rounded-xl hover:bg-coral/20 transition-colors"
                >
                  <span className="font-medium text-charcoal">📝 Focus Session</span>
                  <p className="text-sm text-charcoal/60">Medium difficulty practice</p>
                </button>
                <button
                  onClick={() => startPractice('english', 'hard')}
                  className="w-full text-left p-3 bg-warm-green/10 rounded-xl hover:bg-warm-green/20 transition-colors"
                >
                  <span className="font-medium text-charcoal">🧠 Challenge Mode</span>
                  <p className="text-sm text-charcoal/60">Hard difficulty questions</p>
                </button>
              </div>
            </div>

            {/* Science Practice */}
            <div className="bg-cream/95 rounded-3xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 group border-2 border-transparent hover:border-warm-green/30">
              <div className="w-16 h-16 bg-gradient-to-br from-warm-green to-warm-green/70 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <span className="text-3xl">🔬</span>
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-2">Science</h3>
              <p className="text-charcoal/60 mb-4 leading-relaxed">Level 1 • Foundation Building</p>

              <div className="space-y-3 mb-4">
                <button
                  onClick={() => startPractice('science', 'adaptive')}
                  className="w-full text-left p-3 bg-warm-green/10 rounded-xl hover:bg-warm-green/20 transition-colors"
                >
                  <span className="font-medium text-charcoal">🔬 Quick Practice</span>
                  <p className="text-sm text-charcoal/60">10 adaptive questions</p>
                </button>
                <button
                  onClick={() => startPractice('science', 'medium')}
                  className="w-full text-left p-3 bg-sage-blue/10 rounded-xl hover:bg-sage-blue/20 transition-colors"
                >
                  <span className="font-medium text-charcoal">🧪 Focus Session</span>
                  <p className="text-sm text-charcoal/60">Medium difficulty practice</p>
                </button>
                <button
                  onClick={() => startPractice('science', 'hard')}
                  className="w-full text-left p-3 bg-coral/10 rounded-xl hover:bg-coral/20 transition-colors"
                >
                  <span className="font-medium text-charcoal">🌍 Challenge Mode</span>
                  <p className="text-sm text-charcoal/60">Hard difficulty questions</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Practice Preferences */}
          <div className="bg-cream/95 rounded-3xl p-8 shadow-soft border border-sage-blue/10">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-sage-blue to-sage-blue/70 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-charcoal">Practice Preferences</h3>
                <p className="text-charcoal/60 text-sm">Customize your learning experience</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Session Length */}
              <div className="group">
                <label className="flex items-center text-charcoal font-medium mb-3">
                  <span className="w-6 h-6 bg-coral/20 rounded-full flex items-center justify-center mr-3 text-sm">
                    ⏱️
                  </span>
                  Session Length
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["15 min", "30 min", "45 min"].map((time, index) => (
                    <button
                      key={time}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        index === 1
                          ? "border-coral bg-coral/10 text-coral font-semibold"
                          : "border-sage-blue/20 bg-sage-blue/5 text-charcoal hover:border-coral/30 hover:bg-coral/5"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="group">
                <label className="flex items-center text-charcoal font-medium mb-3">
                  <span className="w-6 h-6 bg-warm-green/20 rounded-full flex items-center justify-center mr-3 text-sm">
                    🎯
                  </span>
                  Difficulty Level
                </label>
                <div className="space-y-2">
                  {[
                    { name: "Adaptive", desc: "Adjusts to your performance", recommended: true },
                    { name: "Easy", desc: "Gentle introduction to concepts" },
                    { name: "Medium", desc: "Standard difficulty level" },
                    { name: "Hard", desc: "Challenge yourself" },
                  ].map((level, index) => (
                    <label
                      key={level.name}
                      className="flex items-center p-3 rounded-xl border-2 border-transparent hover:border-warm-green/30 hover:bg-warm-green/5 transition-all duration-300 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="difficulty"
                        defaultChecked={index === 0}
                        className="w-4 h-4 text-warm-green border-2 border-warm-green/30 focus:ring-warm-green/20 focus:ring-2 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-charcoal">{level.name}</span>
                          {level.recommended && (
                            <span className="ml-2 px-2 py-1 bg-warm-green/20 text-warm-green text-xs rounded-full font-medium">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-charcoal/60">{level.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Learning Features */}
              <div className="group">
                <label className="flex items-center text-charcoal font-medium mb-3">
                  <span className="w-6 h-6 bg-sage-blue/20 rounded-full flex items-center justify-center mr-3 text-sm">
                    💡
                  </span>
                  Learning Features
                </label>
                <div className="space-y-3">
                  {[
                    { name: "Show Hints", desc: "Get helpful tips when stuck", icon: "💭", enabled: true },
                    { name: "Instant Feedback", desc: "See results immediately", icon: "⚡", enabled: true },
                    { name: "Progress Tracking", desc: "Monitor your improvement", icon: "📈", enabled: false },
                  ].map((feature) => (
                    <label
                      key={feature.name}
                      className="flex items-center p-3 rounded-xl border-2 border-transparent hover:border-sage-blue/30 hover:bg-sage-blue/5 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center flex-1">
                        <span className="text-lg mr-3">{feature.icon}</span>
                        <div>
                          <span className="font-medium text-charcoal block">{feature.name}</span>
                          <p className="text-sm text-charcoal/60">{feature.desc}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <input type="checkbox" defaultChecked={feature.enabled} className="sr-only peer" />
                        <div className="w-12 h-6 bg-sage-blue/20 rounded-full peer-checked:bg-sage-blue transition-colors duration-300"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-cream rounded-full transition-transform duration-300 peer-checked:translate-x-6 shadow-sm"></div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Practice Recommendations */}
          <div className="bg-cream/95 rounded-3xl p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-charcoal mb-6 flex items-center">
              <span className="mr-3">💡</span>
              Recommended for You
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-coral/10 to-warm-green/10 rounded-xl border-l-4 border-coral">
                <h4 className="font-semibold text-charcoal mb-1">Mathematics Fractions</h4>
                <p className="text-sm text-charcoal/60 mb-2">You&apos;re ready for the next level!</p>
                <Button size="sm" className="bg-coral hover:bg-coral/90 text-cream text-xs px-3 py-1">
                  Start Practice
                </Button>
              </div>
              <div className="p-4 bg-gradient-to-r from-sage-blue/10 to-warm-green/10 rounded-xl border-l-4 border-sage-blue">
                <h4 className="font-semibold text-charcoal mb-1">Reading Comprehension</h4>
                <p className="text-sm text-charcoal/60 mb-2">Strengthen your understanding</p>
                <Button size="sm" className="bg-sage-blue hover:bg-sage-blue/90 text-cream text-xs px-3 py-1">
                  Start Practice
                </Button>
              </div>
              <div className="p-4 bg-gradient-to-r from-warm-green/10 to-coral/10 rounded-xl border-l-4 border-warm-green">
                <h4 className="font-semibold text-charcoal mb-1">Science Basics</h4>
                <p className="text-sm text-charcoal/60 mb-2">Build your foundation</p>
                <Button size="sm" className="bg-warm-green hover:bg-warm-green/90 text-cream text-xs px-3 py-1">
                  Start Practice
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

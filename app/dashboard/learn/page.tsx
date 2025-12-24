"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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

  // === AI Recommendations ===
  const [recs, setRecs] = useState<{ subject: string; difficulty: string; reason: string }[] | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: "learn" })
      });
        const data = await res.json()
        if (res.ok) setRecs(data?.data?.recommendations ?? null)
      } catch (e) {
        console.error("Error fetching recommendations:", e)
      }
    })()
  }, [])

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

        <div className="mb-12">
          <h1 className="text-5xl font-bold text-charcoal mb-3 text-balance">Learning Hub 📚</h1>
          <p className="text-xl text-charcoal/70 leading-relaxed">
            Choose your subject and start practicing with personalized exercises!
          </p>
        </div>

        <div className="mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Mathematics Practice */}
            <div className="bg-cream/95 rounded-3xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 group border-2 border-transparent hover:border-coral/30">
              <div className="w-16 h-16 bg-gradient-to-br from-coral to-coral/70 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <span className="text-3xl">🔢</span>
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-2">Mathematics</h3>
              <p className="text-charcoal/60 mb-4 leading-relaxed">Level 3 • Adaptive Learning</p>

              {/* Primary Action - Adaptive */}
              <button
                onClick={() => startPractice('math', 'adaptive')}
                className="w-full mb-4 p-4 bg-gradient-to-r from-coral to-coral/80 hover:from-coral/90 hover:to-coral/70 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105 group/btn"
              >
                <div className="flex items-center justify-between text-cream">
                  <div className="text-left">
                    <div className="font-bold text-lg mb-1 flex items-center">
                      🎯 Quick Practice
                      <span className="ml-2 text-xs bg-cream/20 px-2 py-1 rounded-full">Recommended</span>
                    </div>
                    <p className="text-sm text-cream/90">AI adapts to your level</p>
                  </div>
                  <span className="text-xl group-hover/btn:translate-x-1 transition-transform">→</span>
                </div>
              </button>

              {/* Secondary Options */}
              <details className="group/details">
                <summary className="cursor-pointer list-none text-sm text-charcoal/60 hover:text-charcoal font-medium text-center py-2 hover:bg-coral/5 rounded-lg transition-colors">
                  <span className="inline-flex items-center">
                    More options
                    <svg className="w-4 h-4 ml-1 group-open/details:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="space-y-2 mt-3">
                  <button
                    onClick={() => startPractice('math', 'medium')}
                    className="w-full text-left p-3 bg-sage-blue/10 rounded-xl hover:bg-sage-blue/20 transition-colors border border-sage-blue/20"
                  >
                    <span className="font-medium text-charcoal text-sm">📊 Medium Difficulty</span>
                    <p className="text-xs text-charcoal/60">Standard practice</p>
                  </button>
                  <button
                    onClick={() => startPractice('math', 'hard')}
                    className="w-full text-left p-3 bg-warm-green/10 rounded-xl hover:bg-warm-green/20 transition-colors border border-warm-green/20"
                  >
                    <span className="font-medium text-charcoal text-sm">🎲 Challenge Mode</span>
                    <p className="text-xs text-charcoal/60">Hard questions</p>
                  </button>
                </div>
              </details>
            </div>

            {/* Reading Practice */}
            <div className="bg-cream/95 rounded-3xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 group border-2 border-transparent hover:border-sage-blue/30">
              <div className="w-16 h-16 bg-gradient-to-br from-sage-blue to-sage-blue/70 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-2">Reading</h3>
              <p className="text-charcoal/60 mb-4 leading-relaxed">Level 2 • Adaptive Learning</p>

              {/* Primary Action - Adaptive */}
              <button
                onClick={() => startPractice('english', 'adaptive')}
                className="w-full mb-4 p-4 bg-gradient-to-r from-sage-blue to-sage-blue/80 hover:from-sage-blue/90 hover:to-sage-blue/70 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105 group/btn"
              >
                <div className="flex items-center justify-between text-cream">
                  <div className="text-left">
                    <div className="font-bold text-lg mb-1 flex items-center">
                      📖 Quick Practice
                      <span className="ml-2 text-xs bg-cream/20 px-2 py-1 rounded-full">Recommended</span>
                    </div>
                    <p className="text-sm text-cream/90">AI adapts to your level</p>
                  </div>
                  <span className="text-xl group-hover/btn:translate-x-1 transition-transform">→</span>
                </div>
              </button>

              {/* Secondary Options */}
              <details className="group/details">
                <summary className="cursor-pointer list-none text-sm text-charcoal/60 hover:text-charcoal font-medium text-center py-2 hover:bg-sage-blue/5 rounded-lg transition-colors">
                  <span className="inline-flex items-center">
                    More options
                    <svg className="w-4 h-4 ml-1 group-open/details:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="space-y-2 mt-3">
                  <button
                    onClick={() => startPractice('english', 'medium')}
                    className="w-full text-left p-3 bg-coral/10 rounded-xl hover:bg-coral/20 transition-colors border border-coral/20"
                  >
                    <span className="font-medium text-charcoal text-sm">📝 Medium Difficulty</span>
                    <p className="text-xs text-charcoal/60">Standard practice</p>
                  </button>
                  <button
                    onClick={() => startPractice('english', 'hard')}
                    className="w-full text-left p-3 bg-warm-green/10 rounded-xl hover:bg-warm-green/20 transition-colors border border-warm-green/20"
                  >
                    <span className="font-medium text-charcoal text-sm">🧠 Challenge Mode</span>
                    <p className="text-xs text-charcoal/60">Hard questions</p>
                  </button>
                </div>
              </details>
            </div>

            {/* Science Practice */}
            <div className="bg-cream/95 rounded-3xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 group border-2 border-transparent hover:border-warm-green/30">
              <div className="w-16 h-16 bg-gradient-to-br from-warm-green to-warm-green/70 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <span className="text-3xl">🔬</span>
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-2">Science</h3>
              <p className="text-charcoal/60 mb-4 leading-relaxed">Level 1 • Adaptive Learning</p>

              {/* Primary Action - Adaptive */}
              <button
                onClick={() => startPractice('science', 'adaptive')}
                className="w-full mb-4 p-4 bg-gradient-to-r from-warm-green to-warm-green/80 hover:from-warm-green/90 hover:to-warm-green/70 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105 group/btn"
              >
                <div className="flex items-center justify-between text-cream">
                  <div className="text-left">
                    <div className="font-bold text-lg mb-1 flex items-center">
                      🔬 Quick Practice
                      <span className="ml-2 text-xs bg-cream/20 px-2 py-1 rounded-full">Recommended</span>
                    </div>
                    <p className="text-sm text-cream/90">AI adapts to your level</p>
                  </div>
                  <span className="text-xl group-hover/btn:translate-x-1 transition-transform">→</span>
                </div>
              </button>

              {/* Secondary Options */}
              <details className="group/details">
                <summary className="cursor-pointer list-none text-sm text-charcoal/60 hover:text-charcoal font-medium text-center py-2 hover:bg-warm-green/5 rounded-lg transition-colors">
                  <span className="inline-flex items-center">
                    More options
                    <svg className="w-4 h-4 ml-1 group-open/details:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="space-y-2 mt-3">
                  <button
                    onClick={() => startPractice('science', 'medium')}
                    className="w-full text-left p-3 bg-sage-blue/10 rounded-xl hover:bg-sage-blue/20 transition-colors border border-sage-blue/20"
                  >
                    <span className="font-medium text-charcoal text-sm">🧪 Medium Difficulty</span>
                    <p className="text-xs text-charcoal/60">Standard practice</p>
                  </button>
                  <button
                    onClick={() => startPractice('science', 'hard')}
                    className="w-full text-left p-3 bg-coral/10 rounded-xl hover:bg-coral/20 transition-colors border border-coral/20"
                  >
                    <span className="font-medium text-charcoal text-sm">🌍 Challenge Mode</span>
                    <p className="text-xs text-charcoal/60">Hard questions</p>
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
        {/* AI-Powered Recommendations */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-sage-blue to-sage-blue/70 rounded-2xl flex items-center justify-center mr-3">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-charcoal">AI-Powered Recommendations</h2>
              <p className="text-sm text-charcoal/60">Personalized based on your learning patterns</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recs
              ? recs.map((r, i) => {
                  const subjectConfig = {
                    math: { color: 'coral', icon: '🔢' },
                    english: { color: 'sage-blue', icon: '📚' },
                    science: { color: 'warm-green', icon: '🔬' }
                  }[r.subject] || { color: 'sage-blue', icon: '📝' }

                  return (
                    <div
                      key={i}
                      className={`bg-cream/95 rounded-3xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 group border-2 border-transparent hover:border-${subjectConfig.color}/30`}
                    >
                      <div className={`w-16 h-16 bg-gradient-to-br from-${subjectConfig.color} to-${subjectConfig.color}/70 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300`}>
                        <span className="text-3xl">{subjectConfig.icon}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-charcoal mb-2 capitalize">{r.subject}</h3>
                      <p className="text-charcoal/60 mb-4 leading-relaxed">
                        {r.difficulty === 'adaptive' ? '✨ Adaptive' : r.difficulty.charAt(0).toUpperCase() + r.difficulty.slice(1)} • AI Recommended
                      </p>

                      <div className="mb-4 p-3 bg-sage-blue/5 rounded-xl border border-sage-blue/20">
                        <p className="text-xs text-charcoal/70 leading-relaxed">
                          💡 {r.reason}
                        </p>
                      </div>

                      <button
                        onClick={() => startPractice(r.subject, r.difficulty)}
                        className={`w-full p-4 bg-gradient-to-r from-${subjectConfig.color} to-${subjectConfig.color}/80 hover:from-${subjectConfig.color}/90 hover:to-${subjectConfig.color}/70 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105 group/btn`}
                      >
                        <div className="flex items-center justify-between text-cream">
                          <div className="text-left">
                            <div className="font-bold text-lg mb-1">
                              Start Practice
                            </div>
                            <p className="text-sm text-cream/90">AI-optimized for you</p>
                          </div>
                          <span className="text-xl group-hover/btn:translate-x-1 transition-transform">→</span>
                        </div>
                      </button>
                    </div>
                  )
                })
              : (
                <div className="col-span-full bg-cream/95 rounded-3xl p-8 shadow-soft">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-sage-blue mr-3" />
                    <p className="text-charcoal/60">Analyzing your learning profile...</p>
                  </div>
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  )
}

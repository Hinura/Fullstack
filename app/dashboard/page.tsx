"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import DashboardNavigation from "@/components/DashboardNavigation"
import { Button } from "@/components/ui/button"
import BirthdateSetup from "@/components/BirthdateSetup"

type Subject = "mathematics" | "reading" | "science"

interface SkillLevel {
  level: number
  percentage: number
}

interface DashboardData {
  user: {
    id: string
    email: string
    fullName: string
    age: number
    points: number
    currentLevel: number
    streakDays: number
  }
  skillLevels: Record<Subject, SkillLevel>
  stats: {
    totalExercises: number
    correctAnswers: number
    accuracyPercentage: number
    streakDays: number
    completedAssessments: number
  }
  hasCompletedAssessment: boolean
  assessmentHistory: unknown[]
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [showWelcome, setShowWelcome] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBirthdateSetup, setShowBirthdateSetup] = useState(false)

  const subjects: Subject[] = ["mathematics", "reading", "science"]
  const subjectNames = {
    mathematics: "Mathematics",
    reading: "Reading",
    science: "Science",
  }
  const subjectEmojis = {
    mathematics: "🔢",
    reading: "📚",
    science: "🔬",
  }

  const getSkillLevelName = (level: number) => {
    switch (level) {
      case 1:
        return "Beginner"
      case 2:
        return "Elementary"
      case 3:
        return "Intermediate"
      case 4:
        return "Advanced"
      case 5:
        return "Expert"
      default:
        return "Unknown"
    }
  }

  const getSkillLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "from-coral/60 to-coral"
      case 2:
        return "from-coral to-warm-green/60"
      case 3:
        return "from-warm-green/60 to-warm-green"
      case 4:
        return "from-warm-green to-sage-blue/60"
      case 5:
        return "from-sage-blue to-sage-blue"
      default:
        return "from-charcoal/30 to-charcoal/50"
    }
  }

  useEffect(() => {
    if (searchParams.get("welcome") === "true") {
      setShowWelcome(true)
      const timer = setTimeout(() => setShowWelcome(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/data")
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)

        // Check if user needs to set birthdate
        if (!data.user.birthdate || !data.user.age) {
          setShowBirthdateSetup(true)
        } else {
          setShowBirthdateSetup(false)
        }
      } else {
        console.error("Failed to fetch dashboard data")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBirthdateSetupComplete = async () => {
    setShowBirthdateSetup(false)
    // Refresh dashboard data to get updated user info
    await fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <DashboardNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-4">
            <Loader2 className="h-8 w-8 animate-spin text-coral" />
            <span className="text-xl font-medium text-charcoal">Loading your dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <DashboardNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-coral">Failed to load dashboard data. Please refresh the page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { user, skillLevels, stats, hasCompletedAssessment } = dashboardData

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
      <DashboardNavigation userData={user} />

      {/* Birthdate Setup Modal */}
      {showBirthdateSetup && (
        <BirthdateSetup onComplete={handleBirthdateSetupComplete} />
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {showWelcome && (
          <Alert className="mb-8 border-2 border-warm-green/30 bg-warm-green/10 backdrop-blur-sm rounded-3xl shadow-soft">
            <AlertDescription className="text-warm-green/90">
              <div className="flex items-start space-x-4 p-6">
                <span className="text-3xl">🎉</span>
                <div>
                  <h3 className="text-2xl font-bold text-warm-green mb-3">
                    Welcome to Hinura!
                  </h3>
                  {hasCompletedAssessment ? (
                    <p className="text-base leading-relaxed">
                      Great job completing your skill assessment! Your personalized learning journey is ready.
                    </p>
                  ) : (
                    <p className="text-base leading-relaxed">
                      Your account has been successfully verified. You can now start your learning journey!
                    </p>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-charcoal mb-4">
            Hey {user.fullName.replace(/\b\w/g, c => c.toUpperCase())} 👋
          </h1>
          <p className="text-xl text-charcoal/70">
            {hasCompletedAssessment
              ? "Ready to continue your personalized learning adventure?"
              : "Let's start by taking your skill assessment to personalize your experience!"
            }
          </p>
        </div>

        {!hasCompletedAssessment && (
          <Alert className="mb-10 border-2 border-coral/30 bg-coral/10 rounded-3xl shadow-soft">
            <AlertDescription className="text-coral/90">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Complete Your Skill Assessment</h3>
                    <p className="text-base leading-relaxed">
                      Take a quick assessment to personalize your learning experience and get the most out of Hinura!
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => (window.location.href = "/dashboard/assessment")}
                  className="bg-coral hover:bg-coral/90 text-cream"
                >
                  Start Assessment
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {hasCompletedAssessment && (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="p-6 bg-gradient-to-br from-coral/10 to-warm-green/10 border-coral/20 hover:scale-[1.1] transition-all duration-300">
                <CardContent className="p-0 text-center">
                  <div className="text-3xl mb-2">📚</div>
                  <div className="text-2xl font-bold text-charcoal">{stats.totalExercises}</div>
                  <div className="text-sm text-charcoal/60">Exercises Completed</div>
                </CardContent>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-warm-green/10 to-sage-blue/10 border-warm-green/20 hover:scale-[1.1] transition-all duration-300">
                <CardContent className="p-0 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-2xl font-bold text-charcoal">{stats.accuracyPercentage}%</div>
                  <div className="text-sm text-charcoal/60">Overall Accuracy</div>
                </CardContent>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-sage-blue/10 to-coral/10 border-sage-blue/20 hover:scale-[1.1] transition-all duration-300">
                <CardContent className="p-0 text-center">
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-2xl font-bold text-charcoal">{stats.streakDays}</div>
                  <div className="text-sm text-charcoal/60">Day Streak</div>
                </CardContent>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-coral/10 to-sage-blue/10 border-coral/20 hover:scale-[1.1] transition-all duration-300">
                <CardContent className="p-0 text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-charcoal">{user.points}</div>
                  <div className="text-sm text-charcoal/60">Total Points</div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-12 bg-cream/95 rounded-3xl p-8 shadow-soft">
              <h2 className="text-3xl font-bold text-charcoal mb-8 flex items-center">
                <span className="mr-4">📊</span>
                Skill Level Overview
              </h2>
              <div className="space-y-6">
                {subjects.map((subject) => {
                  const skill = skillLevels[subject]
                  const hasSkillData = skill && skill.level > 0

                  return (
                    <div
                      key={subject}
                      className="flex items-center justify-between p-6 bg-sage-blue/5 rounded-3xl transition-all duration-300 hover:bg-sage-blue/10 hover:scale-[1.02]"
                    >
                      <div className="flex items-center space-x-6">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${hasSkillData ? getSkillLevelColor(skill.level) : "from-charcoal/20 to-charcoal/30"} rounded-3xl flex items-center justify-center transition-transform duration-300 hover:rotate-6`}
                        >
                          <span className="text-2xl">{subjectEmojis[subject]}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-charcoal text-lg">{subjectNames[subject]}</h3>
                          <p className="text-charcoal/60 font-medium">
                            {hasSkillData
                              ? `Level ${skill.level} • ${getSkillLevelName(skill.level)}`
                              : "Assessment needed"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        {hasSkillData && (
                          <div className="w-32 bg-sage-blue/10 rounded-full h-3 overflow-hidden">
                            <div
                              className={`bg-gradient-to-r ${getSkillLevelColor(skill.level)} h-full rounded-full transition-all duration-700 ease-out`}
                              style={{ width: `${(skill.level / 5) * 100}%` }}
                            ></div>
                          </div>
                        )}
                        <span className="text-lg font-bold text-charcoal min-w-[4rem] text-right">
                          {hasSkillData ? `${Math.round(skill.percentage)}%` : "—"}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Achievement Progress */}
          <div className="bg-cream/95 rounded-3xl p-8 shadow-soft transition-all duration-300 hover:shadow-lg">
            <h3 className="text-2xl font-bold text-charcoal mb-8 flex items-center">
              <span className="mr-4">🏆</span>
              Recent Achievements
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-coral/5 to-warm-green/5 rounded-3xl border border-coral/10 transition-all duration-300 hover:scale-[1.02] hover:border-coral/20">
                <div className="w-12 h-12 bg-coral/20 rounded-2xl flex items-center justify-center">
                  <span className="text-coral text-xl">🎯</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-charcoal">Assessment Completed</p>
                  <p className="text-sm text-charcoal/60 leading-relaxed">
                    Unlocked personalized learning • +100 points
                  </p>
                </div>
              </div>
              {stats.streakDays >= 3 && (
                <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-warm-green/5 to-sage-blue/5 rounded-3xl border border-warm-green/10 transition-all duration-300 hover:scale-[1.02] hover:border-warm-green/20">
                  <div className="w-12 h-12 bg-warm-green/20 rounded-2xl flex items-center justify-center">
                    <span className="text-warm-green text-xl">🔥</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-charcoal">Streak Master</p>
                    <p className="text-sm text-charcoal/60 leading-relaxed">
                      {stats.streakDays} day learning streak • +{stats.streakDays * 10} points
                    </p>
                  </div>
                </div>
              )}
              {stats.accuracyPercentage >= 85 && (
                <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-sage-blue/5 to-coral/5 rounded-3xl border border-sage-blue/10 transition-all duration-300 hover:scale-[1.02] hover:border-sage-blue/20">
                  <div className="w-12 h-12 bg-sage-blue/20 rounded-2xl flex items-center justify-center">
                    <span className="text-sage-blue text-xl">⭐</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-charcoal">High Achiever</p>
                    <p className="text-sm text-charcoal/60 leading-relaxed">Excellent accuracy rate • +50 points</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-cream/95 rounded-3xl p-8 shadow-soft transition-all duration-300 hover:shadow-lg">
            <h3 className="text-2xl font-bold text-charcoal mb-8 flex items-center">
              <span className="mr-4">🎯</span>
              Today&apos;s Goals
            </h3>
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-warm-green/10 to-sage-blue/10 rounded-3xl border border-warm-green/20 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-charcoal text-base">Complete 10 exercises</p>
                  <span className="text-sm font-bold text-warm-green bg-warm-green/10 px-3 py-1 rounded-full">
                    {Math.min(stats.totalExercises * 10, 100)}%
                  </span>
                </div>
                <div className="w-full bg-warm-green/10 rounded-full h-3 overflow-hidden mb-3">
                  <div
                    className="bg-gradient-to-r from-warm-green to-sage-blue h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(stats.totalExercises * 10, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-charcoal/60 leading-relaxed">{stats.totalExercises} out of 10 completed</p>
              </div>

              <div className="p-6 bg-gradient-to-r from-coral/10 to-warm-green/10 rounded-3xl border border-coral/20 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-charcoal text-base">Maintain 85% accuracy</p>
                  <span className="text-sm font-bold text-coral bg-coral/10 px-3 py-1 rounded-full">
                    {stats.accuracyPercentage}%
                  </span>
                </div>
                <div className="w-full bg-coral/10 rounded-full h-3 overflow-hidden mb-3">
                  <div
                    className="bg-gradient-to-r from-coral to-warm-green h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${stats.accuracyPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-charcoal/60 leading-relaxed">
                  {stats.accuracyPercentage >= 85
                    ? "Great job! Above target"
                    : "Keep practicing to improve accuracy"
                  }
                </p>
              </div>

              <div className="p-6 bg-gradient-to-r from-sage-blue/10 to-coral/10 rounded-3xl border border-sage-blue/20 transition-all duration-300 hover:scale-[1.02]">
                <h4 className="font-bold text-charcoal mb-3 flex items-center text-base">
                  <span className="mr-3">💡</span>
                  Learning Tip
                </h4>
                <p className="text-sm text-charcoal/70 leading-relaxed">
                  {hasCompletedAssessment
                    ? "Your adaptive algorithm is working! The difficulty adjusts based on your skill level for optimal learning."
                    : "Complete your skill assessment to unlock personalized learning recommendations!"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {hasCompletedAssessment && (
          <div className="bg-gradient-to-r from-coral/20 via-warm-green/20 to-sage-blue/20 rounded-3xl p-8 text-center border border-warm-green/30 shadow-soft">
            <h3 className="text-3xl font-bold text-charcoal mb-6 text-balance">
              Ready to Start Learning?
            </h3>
            <p className="text-lg text-charcoal/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your adaptive learning algorithm is ready to provide the perfect challenge level. Choose a subject and let&apos;s make today amazing!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                onClick={() => (window.location.href = "/dashboard/learn")}
                className="bg-coral hover:bg-coral/90 text-cream hover:-translate-y-1 transition-all"
              >
                📚 Start Learning
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/dashboard/progress")}
                className="border-sage-blue/20 text-charcoal hover:bg-sage-blue/5 hover:-translate-y-1 transition-all"
              >
                📊 View Progress
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

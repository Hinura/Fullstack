"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import DashboardNavigation from "@/components/DashboardNavigation"
import { Button } from "@/components/ui/button"
import BirthdateSetup from "@/components/BirthdateSetup"
import { SubjectProgressGrid } from "@/components/gamification/SubjectProgressGrid"
import { RecentAchievementsCard } from "@/components/gamification/RecentAchievementsCard"

type Subject = "math" | "english" | "science"

interface SkillLevel {
  level: number
  percentage: number
}

interface DashboardData {
  user: {
    id: string
    email: string
    fullName: string
    birthdate: string | null  // Can be null for Google OAuth users
    age: number | null        // Can be null for Google OAuth users
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
    weeklyExercises: number
    bestAccuracy: number
  }
  hasCompletedAssessment: boolean
  assessmentHistory: unknown[]
  gamification?: {
    totalPoints: number
    overallLevel: number
    streak: {
      currentDays: number
      highestDays: number
      freezeAvailable: boolean
    }
    subjects: {
      math: { level: number; points: number; pointsToNextLevel: number }
      english: { level: number; points: number; pointsToNextLevel: number }
      science: { level: number; points: number; pointsToNextLevel: number }
    }
    achievements: {
      total: number
      unlocked: Array<{
        id: string
        achievement_key: string
        name: string
        description: string
        category: string
        icon_name: string
        points_reward: number
        rarity: string
        unlocked_at: string
      }>
      locked: Array<{
        id: string
        achievement_key: string
        name: string
        description: string
        category: string
        icon_name: string
        points_reward: number
        rarity: string
        unlocked_at: null
      }>
    }
    recentActivity: {
      xpLast7Days: number
    }
  }
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [showWelcome, setShowWelcome] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBirthdateSetup, setShowBirthdateSetup] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")

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

  // Update time remaining countdown
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)

      const diff = midnight.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeRemaining(`${hours}h ${minutes}m`)
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
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

  const { user, stats, hasCompletedAssessment } = dashboardData

  // Calculate XP to next level
  const xpToNextLevel = dashboardData.gamification
    ? (dashboardData.gamification.overallLevel ** 2 * 100) - dashboardData.gamification.totalPoints
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
      <DashboardNavigation userData={user} />

      {/* Birthdate Setup Modal - BLOCKING */}
      {showBirthdateSetup && (
        <BirthdateSetup onComplete={handleBirthdateSetupComplete} />
      )}

      {/* Only show dashboard content if birthdate is set */}
      {!showBirthdateSetup && (
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

        <div className="mb-8">
          <h1 className="text-5xl font-bold text-charcoal mb-3">
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
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="relative bg-cream/95 rounded-3xl p-6 shadow-soft border-2 border-coral/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden cursor-pointer">
                <div className="flex flex-col items-center text-center transition-opacity duration-300 group-hover:opacity-0">
                  <div className="w-12 h-12 bg-coral/20 rounded-2xl flex items-center justify-center mb-3">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="text-3xl font-bold text-charcoal mb-1">{stats.totalExercises}</div>
                  <div className="text-sm text-charcoal/60 font-medium">Exercises</div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-coral/98 to-warm-green/98 backdrop-blur-md rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6">
                  <div className="text-center space-y-3">
                    <div className="flex justify-center">
                      <span className="text-4xl">📅</span>
                    </div>
                    <div className="text-xs font-semibold text-cream/80 uppercase tracking-widest">
                      This Week
                    </div>
                    <div className="text-3xl font-bold text-cream tracking-wide">
                      {stats.weeklyExercises}
                    </div>
                    <div className="text-xs text-cream/70 font-medium">
                      Exercises completed
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative bg-cream/95 rounded-3xl p-6 shadow-soft border-2 border-warm-green/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden cursor-pointer">
                <div className="flex flex-col items-center text-center transition-opacity duration-300 group-hover:opacity-0">
                  <div className="w-12 h-12 bg-warm-green/20 rounded-2xl flex items-center justify-center mb-3">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="text-3xl font-bold text-charcoal mb-1">{stats.accuracyPercentage}%</div>
                  <div className="text-sm text-charcoal/60 font-medium">Accuracy</div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-warm-green/98 to-sage-blue/98 backdrop-blur-md rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6">
                  <div className="text-center space-y-3">
                    <div className="flex justify-center">
                      <span className="text-4xl">🏆</span>
                    </div>
                    <div className="text-xs font-semibold text-cream/80 uppercase tracking-widest">
                      Best Score
                    </div>
                    <div className="text-3xl font-bold text-cream tracking-wide">
                      {stats.bestAccuracy}%
                    </div>
                    <div className="text-xs text-cream/70 font-medium">
                      Your highest accuracy
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative bg-cream/95 rounded-3xl p-6 shadow-soft border-2 border-sage-blue/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden cursor-pointer">
                <div className="flex flex-col items-center text-center transition-opacity duration-300 group-hover:opacity-0">
                  <div className="w-12 h-12 bg-sage-blue/20 rounded-2xl flex items-center justify-center mb-3">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div className="text-3xl font-bold text-charcoal mb-1">{stats.streakDays}</div>
                  <div className="text-sm text-charcoal/60 font-medium">Day Streak</div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-sage-blue/98 to-warm-green/98 backdrop-blur-md rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6">
                  <div className="text-center space-y-3">
                    {/* Icon */}
                    <div className="flex justify-center">
                      <span className="text-4xl">⏰</span>
                    </div>

                    {/* Label */}
                    <div className="text-xs font-semibold text-cream/80 uppercase tracking-widest">
                      Time Remaining
                    </div>

                    {/* Time Display */}
                    <div className="text-3xl font-bold text-cream tracking-wide">
                      {timeRemaining}
                    </div>

                    {/* Subtitle */}
                    <div className="text-xs text-cream/70 font-medium">
                      Until streak resets
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative bg-cream/95 rounded-3xl p-6 shadow-soft border-2 border-coral/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden cursor-pointer">
                <div className="flex flex-col items-center text-center transition-opacity duration-300 group-hover:opacity-0">
                  <div className="w-12 h-12 bg-coral/20 rounded-2xl flex items-center justify-center mb-3">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="text-3xl font-bold text-charcoal mb-1">{user.points}</div>
                  <div className="text-sm text-charcoal/60 font-medium">Total XP</div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-coral/98 to-sage-blue/98 backdrop-blur-md rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6">
                  <div className="text-center space-y-3">
                    <div className="flex justify-center">
                      <span className="text-4xl">⬆️</span>
                    </div>
                    <div className="text-xs font-semibold text-cream/80 uppercase tracking-widest">
                      To Next Level
                    </div>
                    <div className="text-3xl font-bold text-cream tracking-wide">
                      {xpToNextLevel}
                    </div>
                    <div className="text-xs text-cream/70 font-medium">
                      XP needed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gamification Section */}
            {dashboardData.gamification && (
              <div className="space-y-8 mb-8">
                {/* Section Header */}
                <div>
                  <h2 className="text-3xl font-bold text-charcoal mb-2">Your Progress</h2>
                  <p className="text-charcoal/60">Track your learning journey and achievements</p>
                </div>

                {/* Achievements */}
                <RecentAchievementsCard
                  unlockedAchievements={dashboardData.gamification.achievements.unlocked}
                  lockedAchievements={dashboardData.gamification.achievements.locked}
                  totalCount={dashboardData.gamification.achievements.total}
                />

                {/* Subject Levels */}
                <div>
                  <h3 className="text-3xl font-bold text-charcoal mb-6">Subject Levels</h3>
                  <div className="grid md:grid-cols-3 gap-5">
                    <SubjectProgressGrid
                      subjects={[
                        {
                          subject: 'math',
                          level: dashboardData.gamification.subjects.math.level,
                          currentPoints: dashboardData.gamification.subjects.math.points,
                          pointsToNextLevel: dashboardData.gamification.subjects.math.pointsToNextLevel
                        },
                        {
                          subject: 'english',
                          level: dashboardData.gamification.subjects.english.level,
                          currentPoints: dashboardData.gamification.subjects.english.points,
                          pointsToNextLevel: dashboardData.gamification.subjects.english.pointsToNextLevel
                        },
                        {
                          subject: 'science',
                          level: dashboardData.gamification.subjects.science.level,
                          currentPoints: dashboardData.gamification.subjects.science.points,
                          pointsToNextLevel: dashboardData.gamification.subjects.science.pointsToNextLevel
                        }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        {hasCompletedAssessment && (
          <div className="bg-cream/95 rounded-3xl p-8 text-center shadow-soft border border-sage-blue/10">
            <h3 className="text-3xl font-bold text-charcoal mb-3">Ready to Continue Learning?</h3>
            <p className="text-base text-charcoal/60 mb-6 max-w-2xl mx-auto">
              Your personalized learning path is ready. Pick up where you left off!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => (window.location.href = "/dashboard/learn")}
                className="bg-gradient-to-r from-coral to-warm-green hover:opacity-90 text-cream transition-all shadow-soft hover:shadow-lg rounded-2xl px-8 py-3 font-semibold hover:scale-[1.02] duration-300"
              >
                📚 Start Learning
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/dashboard/progress")}
                className="border-2 border-charcoal/20 text-charcoal hover:bg-charcoal/5 transition-all rounded-2xl px-8 py-3 font-semibold hover:scale-[1.02] duration-300"
              >
                📊 View Details
              </Button>
            </div>
          </div>
        )}
        </main>
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Loader2, TrendingUp, Award, Target, Calendar, BarChart3 } from "lucide-react"
import DashboardNavigation from "@/components/DashboardNavigation"
import { useBirthdateCheck } from "@/hooks/useBirthdateCheck"
import { EDLStatusCard } from "@/components/EDLStatusCard"
import type { EDLStatus, PerformanceAdjustment } from "@/lib/edl/types"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface UserData {
  id: string
  email: string
  fullName: string
  birthdate?: string
  age?: number
  points: number
  currentLevel: number
  streakDays: number
}

interface QuizAttempt {
  id: string
  subject: string
  difficulty: string
  total_questions: number
  correct_answers: number
  score_percentage: number
  points_earned: number
  time_spent_seconds: number
  completed_at: string
}

export default function ProgressPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)

  // === AI-Generated Insights ===
  const [insights, setInsights] = useState<{ summary: string; goals: string[] } | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightDots, setInsightDots] = useState(".")

  useEffect(() => {
    if (!insightsLoading) return
    const t = setInterval(() => {
      setInsightDots((d) => (d.length < 3 ? d + "." : "."))
    }, 500)
    return () => clearInterval(t)
  }, [insightsLoading])

  const [edlStatus, setEdlStatus] = useState<{
    subjects: Record<string, {
      chronological_age: number
      performance_adjustment: PerformanceAdjustment
      effective_age: number
      recent_accuracy: number | null
      total_quizzes: number
      has_completed_assessment: boolean
      last_quiz_at: string | null
      status: EDLStatus
      next_adjustment_in: number
    }>
    overall_status: {
      average_accuracy: number
      subjects_in_flow_zone: number
      subjects_advanced: number
      subjects_needing_support: number
    }
  } | null>(null)

  const { canAccess } = useBirthdateCheck({ user: userData, redirectTo: "/dashboard/progress" })

  const subjectNames = {
    math: "Mathematics",
    english: "Reading",
    science: "Science",
  }
  const subjectEmojis = {
    math: "🔢",
    english: "📚",
    science: "🔬",
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userResponse, attemptsResponse] = await Promise.all([
        fetch("/api/dashboard/data"),
        fetch("/api/quiz-attempts")
      ])

      if (userResponse.ok) {
        const data = await userResponse.json()
        setUserData(data.user)

        // Fetch EDL status if assessment completed
        if (data.hasCompletedAssessment) {
          fetchEDLStatus()
        }
      }

      if (attemptsResponse.ok) {
        const data = await attemptsResponse.json()
        setAttempts(data.attempts || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEDLStatus = async () => {
    try {
      const response = await fetch("/api/edl/status")
      if (response.ok) {
        const data = await response.json()
        setEdlStatus(data.data)
      }
    } catch (error) {
      console.error("Error fetching EDL status:", error)
    }
  }

  const getRecentActivity = () => {
    return attempts.slice(0, 10)
  }

  const getChartData = () => {
    // Sort attempts by date (oldest first)
    const sortedAttempts = [...attempts].sort((a, b) =>
      new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
    )

    // Group attempts by date and subject
    const dataByDate = sortedAttempts.reduce((acc, attempt) => {
      const date = new Date(attempt.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!acc[date]) {
        acc[date] = { date, math: [], english: [], science: [] }
      }
      acc[date][attempt.subject as 'math' | 'english' | 'science'].push(attempt.score_percentage)
      return acc
    }, {} as Record<string, { date: string; math: number[]; english: number[]; science: number[] }>)

    // Calculate averages per subject and format for chart (all data from beginning)
    return Object.values(dataByDate)
      .map(({ date, math, english, science }) => ({
        date,
        math: math.length > 0 ? Math.round(math.reduce((sum, s) => sum + s, 0) / math.length) : null,
        english: english.length > 0 ? Math.round(english.reduce((sum, s) => sum + s, 0) / english.length) : null,
        science: science.length > 0 ? Math.round(science.reduce((sum, s) => sum + s, 0) / science.length) : null,
      }))
  }

  const chartConfig = {
    math: {
      label: "Math",
      color: "#ff6b6b", // coral
    },
    english: {
      label: "English",
      color: "#4ecdc4", // sage-blue
    },
    science: {
      label: "Science",
      color: "#45b7d1", // warm-green
    },
  } satisfies ChartConfig

  const getTotalStats = () => {
    return {
      totalQuizzes: attempts.length,
      totalQuestions: attempts.reduce((sum, a) => sum + a.total_questions, 0),
      correctAnswers: attempts.reduce((sum, a) => sum + a.correct_answers, 0),
      averageScore: attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.score_percentage, 0) / attempts.length
        : 0,
      totalPoints: attempts.reduce((sum, a) => sum + a.points_earned, 0)
    }
  }

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'math': return { bg: 'coral', light: 'coral/10', border: 'coral/30', icon: '🔢' }
      case 'english': return { bg: 'sage-blue', light: 'sage-blue/10', border: 'sage-blue/30', icon: '📚' }
      case 'science': return { bg: 'warm-green', light: 'warm-green/10', border: 'warm-green/30', icon: '🔬' }
      default: return { bg: 'coral', light: 'coral/10', border: 'coral/30', icon: '📝' }
    }
  }

  async function generateInsights() {
    // Build a short summary of latest results
    const trendText = chartData.length > 1
      ? `Latest scores: ${chartData
          .slice(-3)
          .map(
            (d) =>
              `${d.date} (M:${d.math ?? "-"} E:${d.english ?? "-"} S:${d.science ?? "-"})`
          )
          .join(", ")}`
      : "Not enough data"

    const bySubject = {
      math: Math.round(
        stats.totalQuizzes
          ? attempts
              .filter((a) => a.subject === "math")
              .reduce((s, a) => s + a.score_percentage, 0) /
              Math.max(1, attempts.filter((a) => a.subject === "math").length)
          : 0
      ),
      english: Math.round(
        stats.totalQuizzes
          ? attempts
              .filter((a) => a.subject === "english")
              .reduce((s, a) => s + a.score_percentage, 0) /
              Math.max(1, attempts.filter((a) => a.subject === "english").length)
          : 0
      ),
      science: Math.round(
        stats.totalQuizzes
          ? attempts
              .filter((a) => a.subject === "science")
              .reduce((s, a) => s + a.score_percentage, 0) /
              Math.max(1, attempts.filter((a) => a.subject === "science").length)
          : 0
      ),
    }

    try {
      setInsightsLoading(true)
      setInsights(null)

      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: userData?.age ?? null,
          aggregates: {
            avgScore: Math.round(stats.averageScore),
            quizzes: stats.totalQuizzes,
            bySubject,
          },
          trendText,
        }),
      })
      const data = await res.json()
      if (res.ok) setInsights(data?.data ?? null)
    } catch (e) {
      console.error("Error generating insights:", e)
    } finally {
      setInsightsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <DashboardNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-4 bg-cream/80 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-soft">
            <Loader2 className="h-8 w-8 animate-spin text-coral" />
            <span className="text-xl font-medium text-charcoal">Loading progress...</span>
          </div>
        </div>
      </div>
    )
  }

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

  const stats = getTotalStats()
  const recentActivity = getRecentActivity()
  const chartData = getChartData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
      <DashboardNavigation userData={userData || undefined} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-charcoal mb-3">Your Progress 📊</h1>
          <p className="text-xl text-charcoal/70">Track your learning journey and achievements</p>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-cream/95 rounded-3xl p-6 shadow-soft border-2 border-coral/20">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-coral/20 rounded-2xl flex items-center justify-center mr-3">
                <BarChart3 className="h-6 w-6 text-coral" />
              </div>
              <div>
                <p className="text-sm text-charcoal/60">Total Quizzes</p>
                <p className="text-3xl font-bold text-charcoal">{stats.totalQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-cream/95 rounded-3xl p-6 shadow-soft border-2 border-warm-green/20">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-warm-green/20 rounded-2xl flex items-center justify-center mr-3">
                <Target className="h-6 w-6 text-warm-green" />
              </div>
              <div>
                <p className="text-sm text-charcoal/60">Avg Score</p>
                <p className="text-3xl font-bold text-charcoal">{Math.round(stats.averageScore)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-cream/95 rounded-3xl p-6 shadow-soft border-2 border-sage-blue/20">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-sage-blue/20 rounded-2xl flex items-center justify-center mr-3">
                <Award className="h-6 w-6 text-sage-blue" />
              </div>
              <div>
                <p className="text-sm text-charcoal/60">Total Points</p>
                <p className="text-3xl font-bold text-charcoal">{userData?.points || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-cream/95 rounded-3xl p-6 shadow-soft border-2 border-coral/20">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-coral/20 rounded-2xl flex items-center justify-center mr-3">
                <TrendingUp className="h-6 w-6 text-coral" />
              </div>
              <div>
                <p className="text-sm text-charcoal/60">Questions Answered</p>
                <p className="text-3xl font-bold text-charcoal">{stats.totalQuestions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="mb-8 bg-cream/95 rounded-3xl p-8 shadow-soft border border-sage-blue/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-charcoal flex items-center">
              <span className="mr-3">🤖</span> AI Learning Insights
            </h2>
            <Button
              onClick={generateInsights}
              disabled={insightsLoading}
              className="bg-gradient-to-r from-sage-blue to-warm-green text-cream font-semibold px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
            >
              {insightsLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-cream" />
                  {`Generating${insightDots}`}
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2 text-cream" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>

          {insights ? (
            <div className="mt-6 space-y-6">
              {/* Summary Section */}
              <div className="bg-gradient-to-br from-sage-blue/10 to-warm-green/10 rounded-2xl p-6 border-2 border-sage-blue/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-sage-blue/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg">💡</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-charcoal mb-2">Summary</h3>
                    <p className="text-base text-charcoal leading-relaxed">{insights.summary}</p>
                  </div>
                </div>
              </div>

              {/* Goals Section */}
              <div className="bg-gradient-to-br from-warm-green/10 to-coral/10 rounded-2xl p-6 border-2 border-warm-green/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-warm-green/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-charcoal mb-3">Recommended Goals</h3>
                    <div className="space-y-3">
                      {insights.goals.map((goal, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-warm-green/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-warm-green">{i + 1}</span>
                          </div>
                          <p className="text-base text-charcoal leading-relaxed flex-1">{goal}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center py-8">
              <div className="w-16 h-16 bg-sage-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-sage-blue" />
              </div>
              <p className="text-charcoal/60 text-base">Click &quot;Generate Insights&quot; to view your personalized AI summary and goals.</p>
            </div>
          )}
        </div>

        {/* Adaptive Learning Levels (EDL Status) */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-charcoal mb-6 flex items-center">
            <span className="mr-4">📊</span>
            Adaptive Learning Levels
          </h2>
          {edlStatus ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {Object.entries(edlStatus.subjects).map(([subject, status]) => (
                  <EDLStatusCard
                    key={subject}
                    subject={subject}
                    status={status}
                    subjectNames={subjectNames}
                    subjectEmojis={subjectEmojis}
                  />
                ))}
              </div>

              {/* Overall EDL Stats */}
              {edlStatus.overall_status && (
                <div className="bg-gradient-to-br from-coral/10 via-warm-green/10 to-sage-blue/10 rounded-3xl p-8 shadow-soft">
                  <h3 className="text-2xl font-bold text-charcoal mb-6">Overall Progress</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-coral mb-2">
                        {edlStatus.overall_status.average_accuracy}%
                      </p>
                      <p className="text-sm text-charcoal/70">Average Accuracy</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-warm-green mb-2">
                        {edlStatus.overall_status.subjects_in_flow_zone}
                      </p>
                      <p className="text-sm text-charcoal/70">In Flow Zone</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-sage-blue mb-2">
                        {edlStatus.overall_status.subjects_advanced}
                      </p>
                      <p className="text-sm text-charcoal/70">Advanced Subjects</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-coral mb-2">
                        {edlStatus.overall_status.subjects_needing_support}
                      </p>
                      <p className="text-sm text-charcoal/70">Need Support</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-cream/95 rounded-3xl p-8 shadow-soft text-center">
              <p className="text-charcoal/60">Complete your assessment to unlock adaptive learning levels...</p>
            </div>
          )}
        </div>

        {/* Growth Chart */}
        {chartData.length > 0 && (
          <div className="mb-8">
            <Card className="bg-cream/95 dark:bg-dark-surface border-2 border-sage-blue/20 shadow-soft rounded-3xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-charcoal dark:text-charcoal flex items-center">
                      <TrendingUp className="h-8 w-8 text-coral mr-3" />
                      Performance Growth
                    </CardTitle>
                    <CardDescription className="text-charcoal/70 dark:text-charcoal/70 text-base mt-2">
                      Track your scores per subject over time
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 12,
                      bottom: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--sage-blue) / 0.2)" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fill: 'hsl(var(--charcoal))', fontSize: 12 }}
                      className="dark:[&_text]:fill-white"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fill: 'hsl(var(--charcoal))', fontSize: 12 }}
                      className="dark:[&_text]:fill-white"
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line
                      dataKey="math"
                      type="monotone"
                      stroke="var(--color-math)"
                      strokeWidth={3}
                      dot={{
                        fill: "var(--color-math)",
                        className: "dark:fill-white",
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                      connectNulls
                    />
                    <Line
                      dataKey="english"
                      type="monotone"
                      stroke="var(--color-english)"
                      strokeWidth={3}
                      dot={{
                        fill: "var(--color-english)",
                        className: "dark:fill-white",
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                      connectNulls
                    />
                    <Line
                      dataKey="science"
                      type="monotone"
                      stroke="var(--color-science)"
                      strokeWidth={3}
                      dot={{
                        fill: "var(--color-science)",
                        className: "dark:fill-white",
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                      connectNulls
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-cream/95 rounded-3xl p-8 shadow-soft">
          <div className="flex items-center mb-6">
            <Calendar className="h-6 w-6 text-coral mr-3" />
            <h2 className="text-3xl font-bold text-charcoal">Recent Activity</h2>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-charcoal/60 mb-4">No quiz attempts yet</p>
              <p className="text-charcoal/50">Start practicing to see your progress here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((attempt) => {
                const colors = getSubjectColor(attempt.subject)
                return (
                  <div
                    key={attempt.id}
                    className={`p-4 rounded-xl border-2 border-${colors.border} bg-${colors.light} hover:scale-102 transition-transform`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-${colors.bg}/20 rounded-xl flex items-center justify-center`}>
                          <span className="text-2xl">{colors.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-charcoal capitalize">{attempt.subject}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full bg-${colors.bg}/20 text-${colors.bg} font-medium capitalize`}>
                              {attempt.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-charcoal/60">
                            {attempt.correct_answers}/{attempt.total_questions} correct • {formatDate(attempt.completed_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold text-${colors.bg}`}>
                          {Math.round(attempt.score_percentage)}%
                        </div>
                        <div className="text-sm text-charcoal/60">+{attempt.points_earned} pts</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

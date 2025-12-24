import { redirect } from 'next/navigation'
import { TrendingUp, Award, Target, Calendar, BarChart3 } from 'lucide-react'
import DashboardNavigation from '@/components/DashboardNavigation'
import { EDLStatusCard } from '@/components/EDLStatusCard'
import AIInsightsSection from '@/components/progress/AIInsightsSection'
import ProgressChart from '@/components/progress/ProgressChart'
import { getProgressData } from '@/lib/data/progress-data'

const subjectNames = {
  math: 'Mathematics',
  english: 'Reading',
  science: 'Science',
}

const subjectEmojis = {
  math: '🔢',
  english: '📚',
  science: '🔬',
}

function getSubjectColor(subject: string) {
  switch (subject) {
    case 'math':
      return { bg: 'coral', light: 'coral/10', border: 'coral/30', icon: '🔢' }
    case 'english':
      return { bg: 'sage-blue', light: 'sage-blue/10', border: 'sage-blue/30', icon: '📚' }
    case 'science':
      return { bg: 'warm-green', light: 'warm-green/10', border: 'warm-green/30', icon: '🔬' }
    default:
      return { bg: 'coral', light: 'coral/10', border: 'coral/30', icon: '📝' }
  }
}

function formatDate(dateString: string) {
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

export default async function ProgressPage() {
  // Server-side data fetch
  const data = await getProgressData()

  // Server-side birthdate check
  if (!data.user.birthdate) {
    redirect('/dashboard')
  }

  const { user, attempts, edlStatus, chartData, stats } = data
  const recentActivity = attempts.slice(0, 10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
      <DashboardNavigation userData={user} />

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
                <p className="text-3xl font-bold text-charcoal">{user.points || 0}</p>
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

        {/* AI Insights Section - Client Component */}
        <AIInsightsSection userAge={user.age} stats={stats} attempts={attempts} chartData={chartData} />

        {/* Adaptive Learning Levels (EDL Status) */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-charcoal mb-6 flex items-center">
            <span className="mr-4">📊</span>
            Adaptive Learning Levels
          </h2>
          {edlStatus && edlStatus.subjects ? (
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

        {/* Growth Chart - Client Component */}
        <ProgressChart chartData={chartData} />

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
                        <div
                          className={`w-12 h-12 bg-${colors.bg}/20 rounded-xl flex items-center justify-center`}
                        >
                          <span className="text-2xl">{colors.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-charcoal capitalize">{attempt.subject}</h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full bg-${colors.bg}/20 text-${colors.bg} font-medium capitalize`}
                            >
                              {attempt.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-charcoal/60">
                            {attempt.correct_answers}/{attempt.total_questions} correct •{' '}
                            {formatDate(attempt.completed_at)}
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

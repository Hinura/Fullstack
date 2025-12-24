import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import type { EDLStatus, PerformanceAdjustment } from '@/lib/edl/types'

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

interface ChartDataPoint {
  date: string
  math: number | null
  english: number | null
  science: number | null
}

interface Stats {
  totalQuizzes: number
  totalQuestions: number
  correctAnswers: number
  averageScore: number
  totalPoints: number
}

interface EDLStatusData {
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
}

interface ProgressData {
  user: UserData
  attempts: QuizAttempt[]
  hasCompletedAssessment: boolean
  edlStatus: EDLStatusData | null
  chartData: ChartDataPoint[]
  stats: Stats
}

// Process chart data on the server
function processChartData(attempts: QuizAttempt[]): ChartDataPoint[] {
  // Sort attempts by date (oldest first)
  const sortedAttempts = [...attempts].sort((a, b) =>
    new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  )

  // Group attempts by date and subject
  const dataByDate = sortedAttempts.reduce((acc, attempt) => {
    const date = new Date(attempt.completed_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
    if (!acc[date]) {
      acc[date] = { date, math: [], english: [], science: [] }
    }
    acc[date][attempt.subject as 'math' | 'english' | 'science'].push(attempt.score_percentage)
    return acc
  }, {} as Record<string, { date: string; math: number[]; english: number[]; science: number[] }>)

  // Calculate averages per subject
  return Object.values(dataByDate).map(({ date, math, english, science }) => ({
    date,
    math: math.length > 0 ? Math.round(math.reduce((sum, s) => sum + s, 0) / math.length) : null,
    english: english.length > 0 ? Math.round(english.reduce((sum, s) => sum + s, 0) / english.length) : null,
    science: science.length > 0 ? Math.round(science.reduce((sum, s) => sum + s, 0) / science.length) : null,
  }))
}

// Calculate stats from attempts
function calculateStats(attempts: QuizAttempt[]): Stats {
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

// Cache prevents duplicate fetches during render
export const getProgressData = cache(async (): Promise<ProgressData> => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, birthdate, age, points, current_level, streak_days')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new Error('Failed to fetch profile')
  }

  // Check if assessment is completed
  const { data: assessmentAttempts } = await supabase
    .from('quiz_attempts')
    .select('subject')
    .eq('user_id', user.id)
    .eq('attempt_type', 'assessment')

  const hasCompletedAssessment = (assessmentAttempts || []).length >= 3

  // Fetch quiz attempts and EDL status in parallel
  const [attemptsResult, edlResult] = await Promise.all([
    supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false }),
    hasCompletedAssessment
      ? supabase.rpc('get_edl_status', { p_user_id: user.id })
      : Promise.resolve({ data: null, error: null })
  ])

  const attempts = attemptsResult.data || []
  const edlStatus = edlResult.data || null

  // Pre-compute chart data and stats on server
  const chartData = processChartData(attempts)
  const stats = calculateStats(attempts)

  return {
    user: {
      id: user.id,
      email: user.email!,
      fullName: profile.full_name,
      birthdate: profile.birthdate,
      age: profile.age,
      points: profile.points || 0,
      currentLevel: profile.current_level || 1,
      streakDays: profile.streak_days || 0
    },
    attempts,
    hasCompletedAssessment,
    edlStatus,
    chartData,
    stats
  }
})
